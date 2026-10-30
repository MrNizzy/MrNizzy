import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CONTACT_CHANNELS,
  CONTACT_EMAIL,
} from '../../core/models/contact.model';
import { SocialNetworkComponent } from './social-network.component';

describe('SocialNetworkComponent', () => {
  let fixture: ComponentFixture<SocialNetworkComponent>;
  let root: HTMLElement;

  const externalLinks = () =>
    Array.from(root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialNetworkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialNetworkComponent);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sits on a glass card so its text never lies on the animated background', () => {
    const section = root.querySelector('section') as HTMLElement;

    expect(section.classList).toContain('bg-surface/60');
    expect(section.classList).toContain('backdrop-blur-md');
    expect(section.classList).toContain('rounded-card');
  });

  it('titles the section with a level-2 heading', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Connect');
  });

  it('renders one link per contact channel, taken from the shared model', () => {
    expect(externalLinks().map((link) => link.getAttribute('href'))).toEqual(
      CONTACT_CHANNELS.map((channel) => channel.url)
    );
  });

  it('gives every channel an accessible name and opens it safely', () => {
    externalLinks().forEach((link, index) => {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.textContent).toContain(CONTACT_CHANNELS[index].name);
      expect(link.querySelector('.sr-only')?.textContent).toContain(
        'opens in a new tab'
      );
    });
  });

  it('offers the email address as the primary action', () => {
    const mail = root.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')!;

    expect(mail.getAttribute('href')).toContain(CONTACT_EMAIL);
    expect(mail.textContent).toContain('Email me');
    expect(mail.classList).toContain('bg-accent-fill');
  });

  it('draws GitHub with the currentColor icon and the other brands as decorative images', () => {
    const github = externalLinks().find((link) =>
      link.textContent?.includes('GitHub')
    )!;
    const linkedIn = externalLinks().find((link) =>
      link.textContent?.includes('LinkedIn')
    )!;

    expect(github.querySelector('app-ui-icon')).not.toBeNull();
    expect(github.querySelector('img')).toBeNull();
    expect(linkedIn.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('uses no legacy decorations', () => {
    const html = root.innerHTML;

    expect(html).not.toContain('scale-');
    expect(html).not.toContain('bg-gradient');
    expect(html).not.toMatch(/\b(?:text|bg|border)-pink|\b(?:white|black)\/\d/);
  });
});
