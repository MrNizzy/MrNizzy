import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
  let fixture: ComponentFixture<ProjectsComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has exactly one level-1 heading with a short description', () => {
    const headings = root.querySelectorAll('h1');

    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Projects');
    expect(
      root.querySelector('app-ui-section-heading p')?.textContent
    ).toContain('built for clients, courses and fun');
  });

  it('does not wrap the page title in a card', () => {
    const heading = root.querySelector('h1') as HTMLElement;

    expect(heading.closest('[class*="rounded-card"]')).toBeNull();
    expect(heading.className).not.toMatch(/\b(?:border|backdrop-blur|shadow)/);
  });

  it('renders the project showcase below the title with the heading rhythm', () => {
    const stack = root.firstElementChild as HTMLElement;

    expect(stack.classList).toContain('gap-6');
    expect(stack.classList).toContain('md:gap-8');
    expect(
      Array.from(stack.children).map((child) => child.tagName.toLowerCase())
    ).toEqual(['app-ui-section-heading', 'app-project-showcase']);
  });

  it('does not add a container or horizontal padding of its own', () => {
    const showcase = root.querySelector('app-project-showcase') as HTMLElement;
    const wrappers = [root.firstElementChild, showcase.firstElementChild];

    wrappers.forEach((wrapper) => {
      expect(wrapper?.className).not.toMatch(/\b(?:container|px-\d+|mx-auto)\b/);
    });
  });
});
