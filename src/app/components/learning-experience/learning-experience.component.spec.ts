import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceItem } from '../../pages/home/data';
import { LearningExperienceComponent } from './learning-experience.component';

const ITEMS: ExperienceItem[] = [
  { icon: './icons/Nerd Face.png', text: 'Love the science' },
  {
    icon: './icons/Face with Monocle.png',
    text: 'This web is built with',
    link: { text: 'Angular', url: 'https://angular.dev' },
  },
];

describe('LearningExperienceComponent', () => {
  let fixture: ComponentFixture<LearningExperienceComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningExperienceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LearningExperienceComponent);
    fixture.componentRef.setInput('learningExperiences', ITEMS);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('titles the section with a level-2 heading', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Fun facts');
  });

  it('renders each fact as a glass card in a list', () => {
    const items = root.querySelectorAll('ul > li');

    expect(items.length).toBe(2);
    items.forEach((item) => {
      expect(item.classList).toContain('rounded-card');
      expect(item.classList).toContain('bg-surface/60');
    });
  });

  it('treats the emoji as decoration and keeps the text muted', () => {
    const item = root.querySelector('ul > li')!;

    expect(item.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(item.querySelector('p')?.classList).toContain('text-fg-muted');
  });

  it('renders facts without a link as plain text', () => {
    const first = root.querySelector('ul > li')!;

    expect(first.querySelector('a')).toBeNull();
    expect(first.textContent).toContain('Love the science');
  });

  it('renders links as external UI links with an accessible hint', () => {
    const link = root.querySelectorAll('ul > li')[1].querySelector('a')!;

    expect(link.getAttribute('href')).toBe('https://angular.dev');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.classList).toContain('text-accent');
    expect(link.textContent).toContain('Angular');
    expect(link.querySelector('.sr-only')?.textContent).toContain(
      'opens in a new tab'
    );
  });

  it('renders no items while the input is unset', () => {
    fixture.componentRef.setInput('learningExperiences', undefined);
    fixture.detectChanges();

    expect(root.querySelectorAll('ul > li').length).toBe(0);
  });
});
