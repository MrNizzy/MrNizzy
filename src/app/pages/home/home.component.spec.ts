import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('stacks the sections in one column with the section rhythm', () => {
    const stack = root.firstElementChild as HTMLElement;

    expect(stack.classList).toContain('grid');
    expect(stack.classList).toContain('gap-16');
    expect(stack.classList).toContain('md:gap-24');
    expect(
      Array.from(stack.children).map((child) => child.tagName.toLowerCase())
    ).toEqual([
      'app-hero-banner',
      'app-work-experience',
      'app-tech-stack',
      'app-learning-experience',
      'app-social-network',
    ]);
  });

  it('leaves the page column to the shell', () => {
    expect(root.querySelector('.container')).toBeNull();
    expect(root.querySelector('[class*="mx-auto"]')).toBeNull();
  });

  it('has one h1, h2 section titles and h3 only under the experience section', () => {
    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(
      Array.from(root.querySelectorAll('h2')).map((h) => h.textContent?.trim())
    ).toEqual(['Experience', 'Tech Stack & Tools', 'Fun facts', 'Connect']);

    const subheadings = root.querySelectorAll('h3');
    expect(subheadings.length).toBe(4);
    subheadings.forEach((h) => {
      expect(h.closest('app-work-experience')).not.toBeNull();
    });
  });
});
