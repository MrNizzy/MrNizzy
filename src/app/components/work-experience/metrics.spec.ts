import { splitMetrics } from './metrics';

describe('splitMetrics', () => {
  it('returns a single text segment when there are no metrics', () => {
    expect(splitMetrics('Created Caffy (Android, Ionic).')).toEqual([
      { text: 'Created Caffy (Android, Ionic).', metric: false },
    ]);
  });

  it('returns nothing for an empty string', () => {
    expect(splitMetrics('')).toEqual([]);
  });

  ['~', '>', '<', '+'].forEach((sign) => {
    it(`detects a metric prefixed with ${sign}`, () => {
      expect(splitMetrics(`Grew ${sign}40% fast`)).toEqual([
        { text: 'Grew ', metric: false },
        { text: `${sign}40%`, metric: true },
        { text: ' fast', metric: false },
      ]);
    });
  });

  it('detects a percentage without a prefix', () => {
    expect(splitMetrics('Reached 90% coverage')).toEqual([
      { text: 'Reached ', metric: false },
      { text: '90%', metric: true },
      { text: ' coverage', metric: false },
    ]);
  });

  it('detects decimal metrics', () => {
    expect(splitMetrics('Up ~2.5%')).toEqual([
      { text: 'Up ', metric: false },
      { text: '~2.5%', metric: true },
    ]);
  });

  it('splits several metrics and keeps the text between them', () => {
    expect(
      splitMetrics('cutting load times ~50% and improving quality >40%.')
    ).toEqual([
      { text: 'cutting load times ', metric: false },
      { text: '~50%', metric: true },
      { text: ' and improving quality ', metric: false },
      { text: '>40%', metric: true },
      { text: '.', metric: false },
    ]);
  });

  it('handles a metric at the start and one wrapped in parentheses', () => {
    expect(splitMetrics('~35% less (~10%)')).toEqual([
      { text: '~35%', metric: true },
      { text: ' less (', metric: false },
      { text: '~10%', metric: true },
      { text: ')', metric: false },
    ]);
  });

  it('keeps numbers that are not percentages as text', () => {
    expect(splitMetrics('Supported MySQL 8 and 2 apps in 2024')).toEqual([
      { text: 'Supported MySQL 8 and 2 apps in 2024', metric: false },
    ]);
  });

  it('does not treat a lone percent sign as a metric', () => {
    expect(splitMetrics('100 % sure, ~ 5 %')).toEqual([
      { text: '100 % sure, ~ 5 %', metric: false },
    ]);
  });

  it('splits adjacent metrics separated by a single character', () => {
    expect(splitMetrics('from 50%-60% overall')).toEqual([
      { text: 'from ', metric: false },
      { text: '50%', metric: true },
      { text: '-', metric: false },
      { text: '60%', metric: true },
      { text: ' overall', metric: false },
    ]);
  });
});
