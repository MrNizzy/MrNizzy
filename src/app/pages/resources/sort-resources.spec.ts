import type { Resource } from './resource.model';
import { SORT_ORDERS, sortResources } from './sort-resources';

function make(id: string, name: string, added: string): Resource {
  return {
    id,
    name,
    url: `https://example.com/${id}`,
    description: `About ${name}.`,
    type: 'tool',
    category: 'frontend',
    added,
  };
}

const names = (items: readonly Resource[]) => items.map((r) => r.name);

describe('sortResources', () => {
  const alpha = make('a', 'Alpha', '2026-03-01');
  const bravo = make('b', 'bravo', '2026-01-01');
  const charlie = make('c', 'Charlie', '2026-02-01');
  const items = [charlie, alpha, bravo];

  it('lists A–Z as the default order', () => {
    expect(SORT_ORDERS[0]).toBe('A–Z');
    expect(SORT_ORDERS).toEqual(['A–Z', 'Z–A', 'Newest', 'Oldest']);
  });

  it('sorts A–Z by name', () => {
    expect(names(sortResources(items, 'A–Z'))).toEqual([
      'Alpha',
      'bravo',
      'Charlie',
    ]);
  });

  it('sorts Z–A by name', () => {
    expect(names(sortResources(items, 'Z–A'))).toEqual([
      'Charlie',
      'bravo',
      'Alpha',
    ]);
  });

  it('ignores case when sorting names', () => {
    const sorted = sortResources(
      [make('x', 'Zed', '2026-01-01'), make('d', 'daisyUI', '2026-01-01'), make('c', 'Can I use', '2026-01-01')],
      'A–Z'
    );

    expect(names(sorted)).toEqual(['Can I use', 'daisyUI', 'Zed']);
  });

  it('compares numbers inside names by value', () => {
    const sorted = sortResources(
      [make('a', 'Item 10', '2026-01-01'), make('b', 'Item 2', '2026-01-01')],
      'A–Z'
    );

    expect(names(sorted)).toEqual(['Item 2', 'Item 10']);
  });

  it('keeps catalog order for equal names', () => {
    const first = make('1', 'Same', '2026-01-01');
    const second = make('2', 'same', '2026-01-01');

    expect(sortResources([first, second], 'A–Z')).toEqual([first, second]);
    expect(sortResources([first, second], 'Z–A')).toEqual([first, second]);
  });

  it('puts the most recently added first for Newest', () => {
    expect(names(sortResources(items, 'Newest'))).toEqual([
      'Alpha',
      'Charlie',
      'bravo',
    ]);
  });

  it('puts the earliest added first for Oldest', () => {
    expect(names(sortResources(items, 'Oldest'))).toEqual([
      'bravo',
      'Charlie',
      'Alpha',
    ]);
  });

  it('counts the later catalog entry as newer on equal dates', () => {
    const early = make('1', 'Early', '2026-05-05');
    const late = make('2', 'Late', '2026-05-05');
    const catalog = [early, late];

    expect(sortResources(catalog, 'Newest')).toEqual([late, early]);
    expect(sortResources(catalog, 'Oldest')).toEqual([early, late]);
  });

  it('does not mutate the input', () => {
    const input = [...items];

    sortResources(input, 'A–Z');
    sortResources(input, 'Newest');

    expect(input).toEqual(items);
  });

  it('returns a new array', () => {
    expect(sortResources(items, 'A–Z')).not.toBe(items);
  });
});
