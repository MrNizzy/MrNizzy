import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkExperienceComponent } from './work-experience.component';

describe('WorkExperienceComponent', () => {
  let component: WorkExperienceComponent;
  let fixture: ComponentFixture<WorkExperienceComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkExperienceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('titles the section with a level-2 heading and does not render a page container', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Experience');
    expect(root.querySelector('section')?.classList).not.toContain('container');
  });

  it('lists every job as a glass card in an ordered list', () => {
    const items = root.querySelectorAll('ol > li');

    expect(items.length).toBe(component.works().length);
    items.forEach((item) => {
      expect(item.classList).toContain('rounded-card');
      expect(item.classList).toContain('glass-panel');
    });
  });

  it('shows the company as a level-3 heading and the role in the accent colour', () => {
    const first = root.querySelector('ol > li') as HTMLElement;

    expect(first.querySelector('h3')?.textContent?.trim()).toBe('WittyPlus');
    expect(first.querySelector('h3')?.classList).toContain('text-heading');
    expect(first.querySelector('p.text-accent')?.textContent).toContain(
      'Frontend Developer - Angular'
    );
  });

  it('marks the dates up with machine-readable time elements', () => {
    const items = root.querySelectorAll('ol > li');
    const current = items[0].querySelectorAll('time');
    const past = items[2].querySelectorAll('time');

    expect(current.length).toBe(1);
    expect(current[0].getAttribute('datetime')).toBe('2025-07');
    expect(current[0].textContent?.trim()).toBe('July 2025');
    expect(items[0].textContent).toContain('Present');

    expect(past.length).toBe(2);
    expect(past[0].getAttribute('datetime')).toBe('2023-03');
    expect(past[1].getAttribute('datetime')).toBe('2024-08');
    expect(past[1].textContent?.trim()).toBe('August 2024');
    expect(items[2].textContent).toContain('(17 months)');
  });

  it('renders the dates as subtle meta text', () => {
    const meta = root.querySelector('ol > li time')?.parentElement;

    expect(meta?.classList).toContain('text-fg-subtle');
    expect(meta?.classList).toContain('text-sm');
  });

  it('shows an empty state without a heading when there are no jobs', () => {
    component.works.set([]);
    fixture.detectChanges();

    expect(root.querySelectorAll('ol > li').length).toBe(1);
    expect(root.querySelector('ol h3')).toBeNull();
    expect(root.querySelector('ol')?.textContent).toContain(
      'No work experience found'
    );
  });

  describe('highlights', () => {
    const cardAt = (index: number) =>
      root.querySelectorAll('ol > li')[index] as HTMLElement;
    const lines = (card: Element) =>
      Array.from(card.querySelectorAll('ul:not([aria-label]) > li'));
    const text = (el: Element) => el.textContent?.replace(/\s+/g, ' ').trim();

    it('renders one list item per highlight, in order', () => {
      component.works().forEach((work, index) => {
        expect(lines(cardAt(index)).map(text)).toEqual(work.highlights);
      });
      expect(lines(cardAt(0)).length).toBe(4);
      expect(lines(cardAt(2)).length).toBe(6);
    });

    it('renders no paragraphs next to the highlights', () => {
      const column = cardAt(0).querySelector('ul:not([aria-label])')!
        .parentElement!;

      expect(column.querySelectorAll(':scope > p').length).toBe(0);
    });

    it('keeps list semantics and forced-colors dots', () => {
      const list = cardAt(0).querySelector('ul:not([aria-label])')!;

      expect(list.getAttribute('role')).toBe('list');
      lines(cardAt(0)).forEach((item) => {
        expect(item.className).toContain('forced-colors:before:bg-[CanvasText]');
        expect(item.className).toContain('forced-colors:before:opacity-100');
      });
    });

    it('lays the list out muted, relaxed and spaced, with an accent dot per item', () => {
      const list = cardAt(0).querySelector('ul:not([aria-label])')!;
      const item = lines(cardAt(0))[0] as HTMLElement;
      const dot = getComputedStyle(item, '::before');

      expect(list.classList).toContain('text-fg-muted');
      expect(list.classList).toContain('leading-relaxed');
      expect(item.textContent).not.toContain('•');
      expect(dot.width).toBe('6px');
      expect(dot.height).toBe('6px');
      expect(dot.borderRadius).not.toBe('0px');
      expect(dot.opacity).toBe('0.7');
    });

    it('emphasises every metric as bold foreground text and nothing else', () => {
      const metrics = (index: number) =>
        Array.from(cardAt(index).querySelectorAll('strong')).map(text);

      expect(metrics(0)).toEqual([]);
      expect(metrics(1)).toEqual([]);
      expect(metrics(2)).toEqual(['~50%', '>40%', '>65%', '>40%']);
      expect(metrics(3)).toEqual(['~80%', '~35%']);

      root.querySelectorAll('strong').forEach((strong) => {
        expect(strong.classList).toContain('text-fg');
        expect(strong.classList).toContain('font-bold');
        expect(strong.classList).toContain('whitespace-nowrap');
        expect(strong.className).not.toContain('accent');
      });
    });

    it('keeps the surrounding text of a highlight with metrics', () => {
      expect(text(lines(cardAt(3))[1])).toBe(
        'Modernized HTML5/CSS3, replacing deprecated elements (~35%).'
      );
    });
  });

  describe('stack', () => {
    it('omits the stack block when a job has no technologies', () => {
      component.works.update((works) => [{ ...works[0], stack: [] }]);
      fixture.detectChanges();

      expect(root.querySelector('app-ui-stack-list')).toBeNull();
    });

    it('shows each role stack under a divider, after the highlights', () => {
      const cards = Array.from(root.querySelectorAll('ol > li'));

      cards.forEach((card, index) => {
        const stack = card.querySelector('app-ui-stack-list') as HTMLElement;
        const items = Array.from(stack.querySelectorAll('li')).map((li) =>
          li.textContent?.trim()
        );

        expect(items).toEqual(component.works()[index].stack);
        expect(stack.classList).toContain('border-t');
        expect(stack.classList).toContain('border-line');
        expect(stack.classList).toContain('pt-4');
        expect(stack.previousElementSibling?.tagName).toBe('UL');
      });
      expect(
        Array.from(
          cards[3].querySelectorAll('app-ui-stack-list li')
        ).map((li) => li.textContent?.trim())
      ).toEqual(['HTML5', 'CSS3']);
    });
  });

  it('uses no legacy decorations', () => {
    const html = root.innerHTML;

    expect(html).not.toContain('bg-gradient');
    expect(html).not.toContain('shadow-[inset');
    expect(html).not.toMatch(/\b(?:text|bg|border)-pink|\b(?:white|black)\/\d/);
  });
});
