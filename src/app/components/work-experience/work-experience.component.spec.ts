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
      expect(item.classList).toContain('bg-surface/60');
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

  it('uses no legacy decorations', () => {
    const html = root.innerHTML;

    expect(html).not.toContain('bg-gradient');
    expect(html).not.toContain('shadow-[inset');
    expect(html).not.toMatch(/\b(?:text|bg|border)-pink|\b(?:white|black)\/\d/);
  });
});
