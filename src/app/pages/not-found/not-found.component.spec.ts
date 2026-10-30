import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;
  let root: HTMLElement;

  const action = (label: string) =>
    Array.from(root.querySelectorAll<HTMLAnchorElement>('a')).find(
      (link) => link.textContent?.trim() === label
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has exactly one level-1 heading and no other headings', () => {
    const headings = root.querySelectorAll('h1');

    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Page not found');
    expect(root.querySelectorAll('h2, h3, h4, h5, h6').length).toBe(0);
  });

  it('explains what happened in a short description', () => {
    expect(
      root.querySelector('app-ui-section-heading p')?.textContent
    ).toContain('does not exist');
  });

  it('does not wrap the page title in a card', () => {
    const heading = root.querySelector('h1') as HTMLElement;

    expect(heading.closest('[class*="rounded-card"]')).toBeNull();
    expect(heading.className).not.toMatch(/\b(?:border|backdrop-blur|shadow)/);
  });

  it('hides the decorative 404 from assistive technology', () => {
    const numeral = Array.from(root.querySelectorAll('p')).find(
      (line) => line.textContent?.trim() === '404'
    );

    expect(numeral).toBeDefined();
    expect(numeral?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('h1')?.textContent).not.toContain('404');
  });

  it('offers "Go home" as the primary action, routed to the root', () => {
    const goHome = action('Go home');

    expect(goHome).toBeDefined();
    expect(goHome?.getAttribute('href')).toBe('/');
    expect(goHome?.className).toContain('bg-accent-fill');
  });

  it('offers "See projects" as a secondary action, routed to /projects', () => {
    const seeProjects = action('See projects');

    expect(seeProjects).toBeDefined();
    expect(seeProjects?.getAttribute('href')).toBe('/projects');
    expect(seeProjects?.className).toContain('border-line-strong');
  });

  it('navigates through the router instead of reloading the page', () => {
    // routerLink renders a real href but intercepts the click.
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    action('Go home')?.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
  });
});
