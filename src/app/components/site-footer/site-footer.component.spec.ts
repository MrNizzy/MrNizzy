import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SiteFooterComponent } from './site-footer.component';

describe('SiteFooterComponent', () => {
  let component: SiteFooterComponent;
  let fixture: ComponentFixture<SiteFooterComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a footer with the author and the current year', () => {
    const footer = root.querySelector('footer');
    expect(footer).not.toBeNull();

    const text = footer!.textContent ?? '';
    expect(text).toContain(component.author());
    expect(text).toContain(String(component.currentYear()));
  });

  it('is a full-width glass band like the navbar, over the background', () => {
    const footer = root.querySelector('footer');

    expect(footer?.classList).toContain('w-full');
    expect(footer?.classList).toContain('border-t');
    expect(footer?.classList).toContain('border-line');
    expect(footer?.classList).toContain('bg-canvas/80');
    expect(footer?.classList).toContain('backdrop-blur-md');
  });

  it('keeps its content in the page column inside the band', () => {
    const column = root.querySelector('footer > div');

    expect(column?.classList).toContain('max-w-5xl');
    expect(column?.classList).toContain('mx-auto');
    expect(column?.querySelector('nav')).not.toBeNull();
  });

  it('links to the about page and the app privacy policy', () => {
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('nav a'));

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/about',
      '/privacy',
    ]);
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'About',
      'App privacy policy',
    ]);
  });

  it('names the navigation landmark and styles the links with the link primitive', () => {
    const nav = root.querySelector('nav');

    expect(nav?.getAttribute('aria-label')).toBe('Footer');
    root.querySelectorAll('nav a').forEach((link) => {
      expect(link.classList).toContain('text-accent');
      expect(link.classList).toContain('underline');
    });
  });

  it('keeps the links on same-tab navigation', () => {
    root.querySelectorAll('nav a').forEach((link) => {
      expect(link.hasAttribute('target')).toBeFalse();
    });
  });
});
