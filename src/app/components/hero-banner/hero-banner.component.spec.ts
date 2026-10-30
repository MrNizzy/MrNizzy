import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeroBannerComponent } from './hero-banner.component';

describe('HeroBannerComponent', () => {
  let fixture: ComponentFixture<HeroBannerComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBannerComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders exactly one level-1 heading with the display type', () => {
    const headings = root.querySelectorAll('h1');

    expect(headings.length).toBe(1);
    expect(headings[0].classList).toContain('text-display');
    expect(headings[0].textContent).toContain("System's Engineer");
  });

  it('highlights the role with the accent colour and keeps the copy muted', () => {
    expect(root.querySelector('h1 span')?.classList).toContain('text-accent');
    expect(root.querySelector('p')?.classList).toContain('text-fg-muted');
  });

  it('offers the projects and contact pages as actions', () => {
    const primary = root.querySelector<HTMLAnchorElement>(
      'a[href="/projects"]'
    );
    const secondary = root.querySelector<HTMLAnchorElement>(
      'a[href="/contact"]'
    );

    expect(primary?.textContent?.trim()).toBe('View projects');
    expect(primary?.classList).toContain('bg-accent-fill');
    expect(secondary?.textContent?.trim()).toBe('Contact me');
    expect(secondary?.classList).toContain('border-line-strong');
  });

  it('keeps the portrait, linking to GitHub with an accessible name', () => {
    const link = root.querySelector<HTMLAnchorElement>(
      'a[href="https://github.com/MrNizzy"]'
    );

    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.querySelector('img')?.getAttribute('alt')).toBe('MrNizzy');
    expect(link?.textContent).toContain('(opens in a new tab)');
  });

  it('uses no legacy decorations', () => {
    const html = root.innerHTML;

    expect(html).not.toContain('bg-gradient');
    expect(html).not.toContain('scale-');
    expect(html).not.toMatch(/\b(?:text|bg|border)-pink|\b(?:white|black)\/\d/);
  });
});
