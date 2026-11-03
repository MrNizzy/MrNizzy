import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';

/** Why the page switched to low-performance mode. */
export type LowPerformanceReason =
  /** The user asked the browser to save data. */
  | 'save-data'
  /** `navigator.deviceMemory` is at or below {@link LOW_MEMORY_MAX_GB}. */
  | 'low-memory'
  /** `navigator.hardwareConcurrency` is at or below {@link LOW_CORES_MAX}. */
  | 'few-cores'
  /** The animated background stepped its quality down: frames run slow. */
  | 'slow-frames'
  /** WebGL is missing, or only available through a software renderer. */
  | 'no-hardware-webgl'
  /** An earlier page of this session already decided it. */
  | 'stored';

/** Devices with this much memory (GB) or less are treated as low-end. */
export const LOW_MEMORY_MAX_GB = 4;
/**
 * Devices with this many logical cores or fewer are treated as low-end. It
 * cannot be 4: WebKit reports exactly 4 for every device with fewer than 8
 * cores, which includes every iPhone, and 4-core desktops with a dedicated
 * GPU draw the glass without trouble. Weaker 4-core machines are caught at
 * runtime instead, when the animated background steps its quality down.
 */
export const LOW_CORES_MAX = 2;

/** Attribute set on `<html>`; styles.scss switches the glass surfaces on it. */
export const PERFORMANCE_ATTRIBUTE = 'data-perf';
export const PERFORMANCE_LOW = 'low';
/** sessionStorage key that keeps the decision across reloads of the session. */
export const PERFORMANCE_STORAGE_KEY = 'perf-tier';

/**
 * The slice of `navigator` that hints at how powerful the device is. Every
 * member is optional: Safari and Firefox expose few of them, and the values
 * are hints, not measurements.
 */
export interface PerformanceSignals {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connection?: { readonly saveData?: boolean };
}

/** The browser's `navigator`, or null where there is none. Overridable. */
export const PERFORMANCE_SIGNALS = new InjectionToken<PerformanceSignals | null>(
  'PERFORMANCE_SIGNALS',
  {
    providedIn: 'root',
    factory: () => inject(DOCUMENT).defaultView?.navigator ?? null,
  }
);

/** A usable reading: a positive number at or below the limit. */
function isAtMost(value: number | undefined, limit: number): boolean {
  return typeof value === 'number' && value > 0 && value <= limit;
}

/**
 * Whether the hardware hints say the device is probably low-end. Pure, so it
 * can be tested with any navigator values. Missing or meaningless readings
 * (undefined, 0, NaN) count as "unknown", never as "low".
 *
 * Touch input and a small screen are deliberately not signals: a flagship
 * phone has both and handles blurred surfaces without trouble.
 */
export function detectLowPerformance(
  signals: PerformanceSignals | null | undefined
): LowPerformanceReason | null {
  if (!signals) return null;
  if (signals.connection?.saveData === true) return 'save-data';
  if (isAtMost(signals.deviceMemory, LOW_MEMORY_MAX_GB)) return 'low-memory';
  if (isAtMost(signals.hardwareConcurrency, LOW_CORES_MAX)) return 'few-cores';
  return null;
}

/**
 * Decides whether this is a low-end device and, if so, sets `data-perf="low"`
 * on `<html>`, which turns the translucent "glass" surfaces into near-opaque
 * ones without backdrop blur (the blur has to be recomputed every frame over
 * the animated background, which is what stutters on weak GPUs).
 *
 * Hardware hints are read once, synchronously, when the service is created
 * (an app initializer creates it before the first render). Two runtime
 * signals report in through {@link markLow}: the tide stepping its quality
 * down, and WebGL failing to start on hardware. The decision only ever goes
 * one way: once low, the page stays low for the session, so surfaces never
 * flap between glass and solid. It is kept in sessionStorage so a reload does
 * not flash the glass again before the slow frames are noticed once more.
 */
@Injectable({ providedIn: 'root' })
export class PerformanceTierService {
  private readonly document = inject(DOCUMENT);
  private readonly reasonState = signal<LowPerformanceReason | null>(null);

  /** Why the page is in low-performance mode; null while it is normal. */
  readonly reason = this.reasonState.asReadonly();
  readonly isLow = computed(() => this.reasonState() !== null);

  constructor() {
    const reason = this.readStored()
      ? 'stored'
      : detectLowPerformance(inject(PERFORMANCE_SIGNALS));
    if (reason) this.markLow(reason);
  }

  /** Switches to low-performance mode. Safe to call again: the first reason wins. */
  markLow(reason: LowPerformanceReason): void {
    if (this.reasonState() !== null) return;

    this.reasonState.set(reason);
    this.document.documentElement?.setAttribute(
      PERFORMANCE_ATTRIBUTE,
      PERFORMANCE_LOW
    );
    if (reason !== 'stored') this.persist();
  }

  private readStored(): boolean {
    try {
      return (
        this.document.defaultView?.sessionStorage.getItem(
          PERFORMANCE_STORAGE_KEY
        ) === PERFORMANCE_LOW
      );
    } catch {
      // Storage can be unavailable (privacy mode, blocked cookies).
      return false;
    }
  }

  private persist(): void {
    try {
      this.document.defaultView?.sessionStorage.setItem(
        PERFORMANCE_STORAGE_KEY,
        PERFORMANCE_LOW
      );
    } catch {
      // Ignore: the mode still applies until the page is reloaded.
    }
  }
}
