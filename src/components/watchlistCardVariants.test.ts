import { describe, expect, it } from 'vitest';
import { watchlistCardVariants } from './watchlistCardVariants';

describe('watchlistCardVariants', () => {
  it('always applies the shared card shell classes', () => {
    expect(watchlistCardVariants({ status: 'want' })).toContain('rounded-xl');
    expect(watchlistCardVariants({ status: 'done' })).toContain('bg-card');
  });

  it('gives each status its own accent border', () => {
    expect(watchlistCardVariants({ status: 'want' })).toContain('border-l-status-want');
    expect(watchlistCardVariants({ status: 'watching' })).toContain(
      'border-l-status-watching'
    );
    expect(watchlistCardVariants({ status: 'done' })).toContain('border-l-status-done');
  });

  it('adds a focus ring only for the selected card', () => {
    expect(watchlistCardVariants({ status: 'want', selected: true })).toContain('ring-2');
    expect(watchlistCardVariants({ status: 'want', selected: false })).not.toContain(
      'ring-2'
    );
  });

  it('defaults to an unselected "want" card', () => {
    const result = watchlistCardVariants({});
    expect(result).toContain('border-l-status-want');
    expect(result).not.toContain('ring-2');
  });
});
