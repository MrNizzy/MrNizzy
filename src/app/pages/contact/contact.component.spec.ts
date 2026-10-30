import { Clipboard } from '@angular/cdk/clipboard';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { ContactComponent } from './contact.component';

const EMAIL = 'mr.nizzy@proton.me';

const EXPECTED_CHANNELS = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mrnizzy/',
    purpose: 'Experience and proposals',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/MrNizzy',
    purpose: 'Code and open source',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@MrNizzy',
    purpose: 'Tutorials and videos',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/mr.nizzy',
    purpose: 'Direct messages',
  },
];

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let compiled: HTMLElement;
  let clipboard: jasmine.SpyObj<Clipboard>;

  const copyButton = () =>
    compiled.querySelector('button') as HTMLButtonElement;
  const liveRegion = () =>
    compiled.querySelector('[aria-live="polite"]') as HTMLElement;

  beforeEach(async () => {
    clipboard = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);
    clipboard.copy.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [{ provide: Clipboard, useValue: clipboard }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the contact heading and the intro line', () => {
    expect(compiled.querySelector('h1')?.textContent).toContain('Contact');
    expect(compiled.textContent).toContain(
      'Have a project in mind or a question about Angular or NestJS? Pick the channel that works best for you.'
    );
  });

  it('should have exactly one h1, with no heading levels below it', () => {
    expect(compiled.querySelectorAll('h1').length).toBe(1);
    expect(compiled.querySelectorAll('h2, h3, h4, h5, h6').length).toBe(0);
  });

  it('should not wrap the page title in a card', () => {
    const heading = compiled.querySelector('h1') as HTMLElement;

    expect(heading.closest('[class*="rounded-card"]')).toBeNull();
  });

  it('should render the email address in the primary card', () => {
    const emailLine = Array.from(compiled.querySelectorAll('p')).find(
      (line) => line.textContent?.trim() === EMAIL
    );

    expect(compiled.textContent).toContain('Email is the fastest way to reach me');
    expect(emailLine).toBeDefined();
    expect(emailLine?.closest('[class*="rounded-card"]')).not.toBeNull();
  });

  it('should render one external link per channel with the correct href and rel', () => {
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')
    );

    expect(links.length).toBe(EXPECTED_CHANNELS.length);

    EXPECTED_CHANNELS.forEach((channel, index) => {
      const link = links[index];
      expect(link.getAttribute('href')).toBe(channel.href);
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  it('should include the platform and its purpose in each channel link name', () => {
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')
    );

    EXPECTED_CHANNELS.forEach((channel, index) => {
      expect(links[index].textContent).toContain(channel.name);
      expect(links[index].textContent).toContain(channel.purpose);
    });
  });

  it('should announce that each channel link opens in a new tab', () => {
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')
    );

    links.forEach((link) => {
      expect(link.querySelector('.sr-only')?.textContent).toContain(
        '(opens in a new tab)'
      );
    });
  });

  it('should render a decorative brand icon for every channel', () => {
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')
    );

    links.forEach((link) => {
      const image = link.querySelector('img');
      const glyph = link.querySelector('app-ui-icon svg[aria-hidden="true"]');

      // A channel draws either its SVG asset or a registry glyph, never both.
      expect(image !== null || glyph !== null).toBeTrue();
      if (image) expect(image.getAttribute('alt')).toBe('');
    });
  });

  it('should draw the GitHub mark with the icon registry so it follows the theme', () => {
    const github = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')
    ).find((link) => link.textContent?.includes('GitHub'));

    expect(github?.querySelector('img')).toBeNull();
    expect(github?.querySelector('app-ui-icon svg')).not.toBeNull();
  });

  it('should render a mailto link with the encoded subject', () => {
    const mailto = compiled.querySelector<HTMLAnchorElement>(
      'a[href^="mailto:"]'
    );

    expect(mailto).not.toBeNull();
    expect(mailto?.getAttribute('href')).toBe(
      `mailto:${EMAIL}?subject=${encodeURIComponent('Hello Brallan')}`
    );
    expect(mailto?.getAttribute('href')).toContain('subject=Hello%20Brallan');
  });

  it('should render the location line', () => {
    expect(compiled.textContent).toContain('Based in Colombia (UTC−5)');
  });

  describe('copy email', () => {
    it('should start with the idle label and an empty live region', () => {
      expect(copyButton().textContent).toContain('Copy email');
      expect(liveRegion().textContent?.trim()).toBe('');
    });

    it('should copy the email, show "Copied" and revert after 2 seconds', fakeAsync(() => {
      copyButton().click();
      fixture.detectChanges();

      expect(clipboard.copy).toHaveBeenCalledOnceWith(EMAIL);
      expect(copyButton().textContent).toContain('Copied');
      expect(liveRegion().textContent?.trim()).not.toBe('');

      tick(1999);
      fixture.detectChanges();
      expect(copyButton().textContent).toContain('Copied');

      tick(1);
      fixture.detectChanges();
      expect(copyButton().textContent).toContain('Copy email');
      expect(copyButton().textContent).not.toContain('Copied');
      expect(liveRegion().textContent?.trim()).toBe('');
    }));

    it('should show "Copy failed" when the clipboard rejects the copy', fakeAsync(() => {
      clipboard.copy.and.returnValue(false);

      copyButton().click();
      fixture.detectChanges();

      expect(copyButton().textContent).toContain('Copy failed');
      expect(liveRegion().textContent).toContain('Copy failed');

      tick(2000);
      fixture.detectChanges();
      expect(copyButton().textContent).toContain('Copy email');
    }));

    it('should restart the revert timer when clicked again', fakeAsync(() => {
      copyButton().click();
      tick(1500);
      copyButton().click();
      fixture.detectChanges();

      tick(1500);
      fixture.detectChanges();
      expect(copyButton().textContent).toContain('Copied');

      tick(500);
      fixture.detectChanges();
      expect(copyButton().textContent).toContain('Copy email');
    }));

    it('should clear the revert timer when destroyed', fakeAsync(() => {
      copyButton().click();
      fixture.destroy();

      // flush() returns the virtual time it had to advance: 0 means no pending timers.
      expect(flush()).toBe(0);
    }));
  });
});
