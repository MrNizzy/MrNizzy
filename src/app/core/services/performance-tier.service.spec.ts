import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import {
  LOW_CORES_MAX,
  LOW_MEMORY_MAX_GB,
  LowPerformanceReason,
  PERFORMANCE_ATTRIBUTE,
  PERFORMANCE_SIGNALS,
  PERFORMANCE_STORAGE_KEY,
  PerformanceSignals,
  PerformanceTierService,
  detectLowPerformance,
} from './performance-tier.service';

/** A comfortable desktop: nothing in it hints at a weak device. */
const CAPABLE: PerformanceSignals = {
  deviceMemory: 8,
  hardwareConcurrency: 8,
  connection: { saveData: false },
};

describe('detectLowPerformance', () => {
  it('treats a device without any hints as normal', () => {
    expect(detectLowPerformance(null)).toBeNull();
    expect(detectLowPerformance(undefined)).toBeNull();
    // Safari and Firefox expose neither deviceMemory nor connection.
    expect(detectLowPerformance({})).toBeNull();
    expect(detectLowPerformance({ hardwareConcurrency: undefined })).toBeNull();
  });

  it('treats capable hardware as normal', () => {
    expect(detectLowPerformance(CAPABLE)).toBeNull();
    expect(
      detectLowPerformance({ deviceMemory: 8, hardwareConcurrency: 12 })
    ).toBeNull();
  });

  describe('memory', () => {
    it(`flags ${LOW_MEMORY_MAX_GB} GB and below`, () => {
      for (const deviceMemory of [LOW_MEMORY_MAX_GB, 2, 1, 0.5, 0.25]) {
        expect(detectLowPerformance({ ...CAPABLE, deviceMemory }))
          .withContext(`${deviceMemory} GB`)
          .toBe('low-memory');
      }
    });

    it('does not flag more than the limit', () => {
      expect(detectLowPerformance({ ...CAPABLE, deviceMemory: 8 })).toBeNull();
      expect(
        detectLowPerformance({ ...CAPABLE, deviceMemory: LOW_MEMORY_MAX_GB + 0.5 })
      ).toBeNull();
    });
  });

  describe('cores', () => {
    it(`flags ${LOW_CORES_MAX} logical cores and fewer`, () => {
      for (const hardwareConcurrency of [LOW_CORES_MAX, 1]) {
        expect(detectLowPerformance({ ...CAPABLE, hardwareConcurrency }))
          .withContext(`${hardwareConcurrency} cores`)
          .toBe('few-cores');
      }
    });

    it('does not flag more than the limit', () => {
      expect(
        detectLowPerformance({
          ...CAPABLE,
          hardwareConcurrency: LOW_CORES_MAX + 1,
        })
      ).toBeNull();
    });

    it("does not flag WebKit's clamped value, which every iPhone reports", () => {
      // WebKit answers 4 for any device with fewer than 8 cores.
      expect(detectLowPerformance({ hardwareConcurrency: 4 })).toBeNull();
    });
  });

  describe('data saver', () => {
    it('flags saveData', () => {
      expect(
        detectLowPerformance({ ...CAPABLE, connection: { saveData: true } })
      ).toBe('save-data');
    });

    it('ignores saveData when it is off or missing', () => {
      expect(
        detectLowPerformance({ ...CAPABLE, connection: { saveData: false } })
      ).toBeNull();
      expect(detectLowPerformance({ ...CAPABLE, connection: {} })).toBeNull();
    });

    it('wins over the hardware hints', () => {
      expect(
        detectLowPerformance({
          deviceMemory: 2,
          hardwareConcurrency: 2,
          connection: { saveData: true },
        })
      ).toBe('save-data');
    });
  });

  it('does not take meaningless readings for a weak device', () => {
    // Some browsers answer 0, or something that is not a number, when they
    // hide the value on purpose.
    expect(
      detectLowPerformance({ deviceMemory: 0, hardwareConcurrency: 0 })
    ).toBeNull();
    expect(
      detectLowPerformance({
        deviceMemory: NaN,
        hardwareConcurrency: NaN,
      })
    ).toBeNull();
    expect(
      detectLowPerformance({
        deviceMemory: '2' as unknown as number,
        hardwareConcurrency: '2' as unknown as number,
      })
    ).toBeNull();
  });

});

describe('PerformanceTierService', () => {
  const html = document.documentElement;

  function reset(): void {
    html.removeAttribute(PERFORMANCE_ATTRIBUTE);
    sessionStorage.removeItem(PERFORMANCE_STORAGE_KEY);
  }

  function create(signals: PerformanceSignals | null = CAPABLE) {
    TestBed.configureTestingModule({
      providers: [{ provide: PERFORMANCE_SIGNALS, useValue: signals }],
    });
    return TestBed.inject(PerformanceTierService);
  }

  beforeEach(reset);
  afterEach(reset);

  it('reads the real navigator by default', () => {
    expect(TestBed.inject(PERFORMANCE_SIGNALS)).toBe(window.navigator);
  });

  it('ignores touch input and screen size: a high-end phone keeps the glass', () => {
    const matchMedia = spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);

    const service = create({ deviceMemory: 8, hardwareConcurrency: 8 });

    expect(service.isLow()).toBeFalse();
    expect(matchMedia).not.toHaveBeenCalled();
  });

  describe('on capable hardware', () => {
    it('stays normal and leaves the document alone', () => {
      const service = create();

      expect(service.isLow()).toBeFalse();
      expect(service.reason()).toBeNull();
      expect(html.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBeFalse();
      expect(sessionStorage.getItem(PERFORMANCE_STORAGE_KEY)).toBeNull();
    });

    it('stays normal without a navigator', () => {
      const service = create(null);

      expect(service.isLow()).toBeFalse();
      expect(html.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBeFalse();
    });
  });

  describe('hardware hints', () => {
    const cases: [string, PerformanceSignals, LowPerformanceReason][] = [
      ['low memory', { ...CAPABLE, deviceMemory: 4 }, 'low-memory'],
      ['few cores', { ...CAPABLE, hardwareConcurrency: 2 }, 'few-cores'],
      ['data saver', { ...CAPABLE, connection: { saveData: true } }, 'save-data'],
    ];

    for (const [name, signals, reason] of cases) {
      it(`switches to low mode on ${name}, before anything renders`, () => {
        const service = create(signals);

        expect(service.isLow()).toBeTrue();
        expect(service.reason()).toBe(reason);
        expect(html.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe('low');
      });
    }

    it('remembers the decision for the rest of the session', () => {
      create({ ...CAPABLE, deviceMemory: 2 });

      expect(sessionStorage.getItem(PERFORMANCE_STORAGE_KEY)).toBe('low');
    });
  });

  describe('runtime signals', () => {
    it('switches to low mode when the tide reports slow frames', () => {
      const service = create();

      service.markLow('slow-frames');

      expect(service.isLow()).toBeTrue();
      expect(service.reason()).toBe('slow-frames');
      expect(html.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe('low');
    });

    it('switches to low mode when WebGL only runs in software', () => {
      const service = create();

      service.markLow('no-hardware-webgl');

      expect(service.reason()).toBe('no-hardware-webgl');
      expect(html.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe('low');
    });

    it('keeps the decision in sessionStorage', () => {
      const service = create();

      service.markLow('slow-frames');

      expect(sessionStorage.getItem(PERFORMANCE_STORAGE_KEY)).toBe('low');
    });
  });

  describe('once low, always low', () => {
    it('keeps the first reason when several signals arrive', () => {
      const service = create();

      service.markLow('slow-frames');
      service.markLow('no-hardware-webgl');

      expect(service.reason()).toBe('slow-frames');
    });

    it('starts low on the next page load of the session', () => {
      sessionStorage.setItem(PERFORMANCE_STORAGE_KEY, 'low');

      const service = create();

      expect(service.isLow()).toBeTrue();
      expect(service.reason()).toBe('stored');
      expect(html.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe('low');
    });

    it('ignores a stored value it does not know', () => {
      sessionStorage.setItem(PERFORMANCE_STORAGE_KEY, 'whatever');

      expect(create().isLow()).toBeFalse();
    });
  });

  describe('when it cannot rely on the browser', () => {
    it('still switches when sessionStorage throws', () => {
      spyOn(Storage.prototype, 'getItem').and.throwError('blocked');
      spyOn(Storage.prototype, 'setItem').and.throwError('blocked');
      const service = create({ ...CAPABLE, deviceMemory: 2 });

      expect(service.isLow()).toBeTrue();
      expect(html.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe('low');
    });

    it('does not touch window or document members that are absent (no DOM)', () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: DOCUMENT,
            useValue: { defaultView: null, documentElement: null },
          },
        ],
      });

      const service = TestBed.inject(PerformanceTierService);
      expect(service.isLow()).toBeFalse();
      expect(() => service.markLow('slow-frames')).not.toThrow();
      expect(service.isLow()).toBeTrue();
    });
  });
});
