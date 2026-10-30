import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CONTACT_EMAIL } from '@models/contact.model';
import { PrivacyComponent } from './privacy.component';

describe('PrivacyComponent', () => {
  let fixture: ComponentFixture<PrivacyComponent>;
  let root: HTMLElement;

  const headingLevels = () =>
    Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) =>
      Number(heading.tagName.charAt(1))
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('declares Spanish on the root element so screen readers pronounce it correctly', () => {
    const rootElement = root.firstElementChild as HTMLElement;

    expect(rootElement.getAttribute('lang')).toBe('es');
    expect(rootElement.contains(root.querySelector('h1'))).toBeTrue();
  });

  it('has exactly one h1', () => {
    const headings = root.querySelectorAll('h1');

    expect(headings.length).toBe(1);
    expect(headings[0].textContent).toContain(
      'Nuestro Compromiso con Tu Privacidad en MrNizzy y en App Colombia'
    );
  });

  it('never skips a heading level', () => {
    const levels = headingLevels();

    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });
  });

  it('structures the policy in four h2 sections', () => {
    // The title text is the last child; the leading child is the decorative emoji.
    const titles = Array.from(root.querySelectorAll('h2')).map((heading) =>
      heading.lastElementChild?.textContent?.trim()
    );

    expect(titles).toEqual([
      'Qué información recogemos y por qué',
      'Próximas funcionalidades y tu privacidad',
      'Nuestras medidas de seguridad',
      'Ejercicio de derechos y contacto',
    ]);
  });

  it('hides the decorative emoji from assistive technology', () => {
    const icons = root.querySelectorAll('h2 [icon]');

    expect(icons.length).toBe(4);
    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('keeps the legal text', () => {
    const text = root.textContent ?? '';

    expect(text).toContain('De acuerdo con la Ley 1581 de 2012 de Colombia');
    expect(text).toContain('Solicitar eliminación de datos personales');
    expect(text).toContain('Nunca compartiremos tu dirección de email');
    expect(text).toContain(
      'Esta política aplica para todas las versiones disponibles en Google Play Store y futuras actualizaciones.'
    );
    expect(text).toContain('Tiempo de lectura: 8 minutos');
  });

  it('shows the last update date in Spanish, with a machine-readable value', () => {
    const time = root.querySelector('time');

    expect(time?.getAttribute('datetime')).toBe('2025-04-05');
    expect(time?.textContent?.trim()).toBe('5 de abril de 2025');
  });

  it('takes the contact email from the shared contact model', () => {
    const mailto = root.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');

    expect(mailto?.getAttribute('href')).toBe(`mailto:${CONTACT_EMAIL}`);
    expect(mailto?.textContent).toContain(CONTACT_EMAIL);
    expect(mailto?.querySelector('app-ui-icon svg')).not.toBeNull();
    expect(mailto?.classList).toContain('text-accent');
  });

  it('does not link to a terms of service page, which does not exist', () => {
    const terms = Array.from(root.querySelectorAll('a')).find(
      (link) =>
        link.getAttribute('href') === '/terms' ||
        link.textContent?.trim() === 'Términos de Servicio'
    );

    expect(terms).toBeUndefined();
  });

  it('renders the body copy muted, with comfortable line height and line length', () => {
    const article = root.firstElementChild as HTMLElement;
    const paragraph = root.querySelector('header p.max-w-prose') as HTMLElement;

    expect(article.classList).toContain('text-fg-muted');
    expect(article.classList).toContain('leading-relaxed');
    expect(paragraph).not.toBeNull();
  });

  it('shows the update date and reading time as subtle meta text', () => {
    const meta = root.querySelector('time')?.closest('p') as HTMLElement;

    expect(meta.classList).toContain('text-fg-subtle');
    expect(meta.textContent).toContain('Actualizado el:');
    expect(meta.textContent).toContain('Tiempo de lectura: 8 minutos');
  });

  it('uses no italics', () => {
    expect(root.querySelector('em, i, cite, address')).toBeNull();
    expect(root.innerHTML).not.toContain('italic');

    Array.from(root.querySelectorAll<HTMLElement>('*')).forEach((element) => {
      expect(getComputedStyle(element).fontStyle).not.toBe('italic');
    });
  });

  it('groups the content in glass cards without wrapping the page title', () => {
    const heading = root.querySelector('h1') as HTMLElement;

    expect(heading.closest('[class*="rounded-card"]')).toBeNull();
    expect(
      root.querySelectorAll('[class*="rounded-card"][class*="backdrop-blur"]')
        .length
    ).toBeGreaterThanOrEqual(6);
  });

  it('uses no legacy decorations or undefined variables', () => {
    const html = root.innerHTML;

    expect(html).not.toContain('mat-sys');
    expect(html).not.toContain('bg-gradient');
    expect(html).not.toMatch(/\b(?:text|bg|border)-pink|\b(?:white|black)\/\d/);
  });
});
