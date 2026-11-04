import { resources } from './resources.data';

describe('resources catalog', () => {
  it('gives every resource a unique id', () => {
    const ids = resources.map((r) => r.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
