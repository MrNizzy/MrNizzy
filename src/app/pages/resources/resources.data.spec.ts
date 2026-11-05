import { resources } from './resources.data';

const MAX_DESCRIPTION = 130;

function isHttps(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

describe('resources catalog', () => {
  it('gives every resource a unique id', () => {
    const ids = resources.map((r) => r.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  resources.forEach((r) => {
    describe(r.id, () => {
      it('has a name, a type and a category', () => {
        expect(r.name.trim()).not.toBe('');
        expect(r.type.trim()).not.toBe('');
        expect(r.category.trim()).not.toBe('');
      });

      it(`has a description of at most ${MAX_DESCRIPTION} characters`, () => {
        expect(r.description.trim()).not.toBe('');
        expect(r.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
      });

      it('links to an https website', () => {
        expect(isHttps(r.url), r.url).toBe(true);
      });

      it('links to an https repository when it has one', () => {
        expect(
          r.repository === undefined || isHttps(r.repository),
          String(r.repository)
        ).toBe(true);
      });

      it('has a real ISO date for when it was added', () => {
        expect(r.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(Date.parse(r.added))).toBe(false);
      });
    });
  });
});
