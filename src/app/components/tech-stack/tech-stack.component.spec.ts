import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tool } from '../../pages/home/data';
import { TechStackComponent } from './tech-stack.component';

const TOOLS: Tool[][] = [
  [
    { name: 'Angular', icon: './icons/angular.svg', url: 'https://angular.dev' },
    {
      name: 'Three.js',
      icon: './icons/threejs.svg',
      url: 'https://threejs.org',
      monochrome: true,
    },
  ],
];

describe('TechStackComponent', () => {
  let fixture: ComponentFixture<TechStackComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechStackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TechStackComponent);
    fixture.componentRef.setInput('tools', TOOLS);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders nothing but the heading when there are no tools', () => {
    fixture.componentRef.setInput('tools', []);
    fixture.detectChanges();

    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      'Tech Stack & Tools'
    );
    expect(root.querySelector('ul')).toBeNull();
  });

  it('lists every tool as an interactive glass tile', () => {
    const tiles = root.querySelectorAll<HTMLAnchorElement>('ul > li > a');

    expect(tiles.length).toBe(2);
    tiles.forEach((tile) => {
      expect(tile.classList).toContain('bg-surface/60');
      expect(tile.classList).toContain('p-4');
      expect(tile.classList).toContain('hover:border-line-strong');
    });
  });

  it('opens each tool in a new tab and announces it', () => {
    const tile = root.querySelector<HTMLAnchorElement>('ul > li > a')!;

    expect(tile.getAttribute('href')).toBe('https://angular.dev');
    expect(tile.getAttribute('target')).toBe('_blank');
    expect(tile.getAttribute('rel')).toBe('noopener noreferrer');
    expect(tile.textContent).toContain('Angular');
    expect(tile.querySelector('.sr-only')?.textContent).toContain(
      'opens in a new tab'
    );
  });

  it('keeps coloured icons as decorative images', () => {
    const img = root.querySelector<HTMLImageElement>('ul > li > a img')!;

    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('src')).toBe('./icons/angular.svg');
  });

  it('draws white glyphs as a text-colour mask so they work on light surfaces', () => {
    const tiles = root.querySelectorAll('ul > li > a');
    const glyph = tiles[1].querySelector<HTMLElement>('span[aria-hidden]')!;

    expect(tiles[1].querySelector('img')).toBeNull();
    expect(glyph.classList).toContain('bg-fg');
    expect(glyph.style.maskImage || glyph.style.webkitMaskImage).toContain(
      'threejs.svg'
    );
  });

  it('does not scale the tiles on hover', () => {
    expect(root.innerHTML).not.toContain('scale-');
  });
});
