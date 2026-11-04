import type { Resource } from './resource.model';

/** The default order comes first. */
export const SORT_ORDERS = ['A–Z', 'Z–A', 'Newest', 'Oldest'] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];

const collator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
});

/**
 * Returns a sorted copy of the resources; the input is never mutated.
 * Ties keep catalog order, except for dates: on equal `added` dates the entry
 * later in the catalog counts as newer.
 */
export function sortResources(
  items: readonly Resource[],
  order: SortOrder
): Resource[] {
  const indexed = items.map((resource, index) => ({ resource, index }));

  indexed.sort((a, b) => {
    switch (order) {
      case 'A–Z':
        return collator.compare(a.resource.name, b.resource.name) || a.index - b.index;
      case 'Z–A':
        return collator.compare(b.resource.name, a.resource.name) || a.index - b.index;
      case 'Newest':
        return (
          compareDates(b.resource.added, a.resource.added) || b.index - a.index
        );
      case 'Oldest':
        return (
          compareDates(a.resource.added, b.resource.added) || a.index - b.index
        );
      default: {
        const unreachable: never = order;
        return unreachable;
      }
    }
  });

  return indexed.map(({ resource }) => resource);
}

/** ISO `YYYY-MM-DD` dates order correctly as plain strings. */
function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
