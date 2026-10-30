import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about.component';

const SKILLS = [
  'Angular',
  'TypeScript',
  'NestJS',
  'SQL',
  'Python',
  'HTML/CSS',
  'SASS',
  'Git',
  'Linux',
  'Docker',
];

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;
  let root: HTMLElement;

  const headingLevels = () =>
    Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) =>
      Number(heading.tagName.charAt(1))
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has exactly one h1 with the page title and its description', () => {
    const headings = root.querySelectorAll('h1');

    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('About me');
    expect(headings[0].classList).toContain('text-display');
    expect(
      root.querySelector('app-ui-section-heading p')?.textContent?.trim()
    ).toBe('Systems engineer, digital creator, frontend developer and writer.');
  });

  it('does not wrap the page title in a card', () => {
    const heading = root.querySelector('h1') as HTMLElement;

    expect(heading.closest('[class*="rounded-card"]')).toBeNull();
  });

  it('never skips a heading level', () => {
    const levels = headingLevels();

    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });
  });

  it('structures the page with one h2 per section', () => {
    const titles = Array.from(root.querySelectorAll('h2')).map((heading) =>
      heading.textContent?.trim()
    );

    expect(titles).toEqual([
      'Professional experience',
      'Technical skills',
      'Passions and hobbies',
      'Find me online',
    ]);
  });

  it('keeps the page in a reading column and lets the text fill its cards', () => {
    const page = root.firstElementChild as HTMLElement;

    expect(page.classList).toContain('max-w-3xl');
    expect(root.querySelector('.rounded-card .max-w-prose')).toBeNull();
  });

  it('is written in English', () => {
    const text = root.textContent ?? '';

    expect(text).toContain('Fullstack developer with 3+ years of experience');
    expect(text).not.toContain('Acerca de');
    expect(text).not.toContain('Experiencia profesional');
  });

  it('lists the skills as chips', () => {
    const chips = Array.from(root.querySelectorAll('li')).filter((item) =>
      item.classList.contains('rounded-chip')
    );

    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(SKILLS);
  });

  it('shows the portrait with a text alternative', () => {
    const image = root.querySelector('picture img');

    expect(image?.getAttribute('alt')).toBe('MrNizzy profile picture');
    expect(image?.getAttribute('src')).toBe('mrnizzy.png');
  });

  it('embeds no third-party images', () => {
    const remote = Array.from(root.querySelectorAll('img')).filter((image) =>
      /^https?:/.test(image.getAttribute('src') ?? '')
    );

    expect(remote.length).toBe(0);
  });

  it('opens every external link in a new tab, announced to screen readers', () => {
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')
    );

    // Four profile cards plus the YouTube channel link in the text.
    expect(links.length).toBe(5);
    links.forEach((link) => {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.querySelector('.sr-only')?.textContent).toContain(
        '(opens in a new tab)'
      );
    });
  });

  it('keeps the profile links of the old badges', () => {
    const hrefs = Array.from(root.querySelectorAll('a')).map((link) =>
      link.getAttribute('href')
    );

    expect(hrefs).toEqual(
      jasmine.arrayContaining([
        'https://www.youtube.com/@MrNizzy',
        'https://github.com/MrNizzy?tab=repositories&sort=stargazers',
        'https://github.com/MrNizzy?tab=followers',
        'https://www.youtube.com/channel/UCFjfIk29NqqPGmrCfCV14Yg?sub_confirmation=1',
        'https://app.daily.dev/mrnizzy',
      ])
    );
  });

  it('points to the home and projects pages instead of repeating them', () => {
    const internal = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('a:not([target])')
    ).map((link) => link.getAttribute('href'));

    expect(internal).toContain('/');
    expect(internal).toContain('/projects');
  });

  it('uses no legacy decorations or undefined variables', () => {
    const html = root.innerHTML;

    expect(html).not.toContain('mat-sys');
    expect(html).not.toContain('bg-gradient');
    expect(html).not.toContain('scale-');
    expect(html).not.toMatch(/\b(?:text|bg|border)-pink|\b(?:white|black)\/\d/);
  });
});
