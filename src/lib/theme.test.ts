import { applyTheme, systemTheme } from './theme.js';

describe('theme helpers', () => {
  it('reads dark and light system preferences', () => {
    const matchMedia = jest.spyOn(window, 'matchMedia');
    matchMedia.mockReturnValueOnce({ matches: true } as MediaQueryList);
    matchMedia.mockReturnValueOnce({ matches: false } as MediaQueryList);

    expect(systemTheme()).toBe('dark');
    expect(systemTheme()).toBe('light');
  });

  it('applies and removes the dark class', () => {
    applyTheme('dark');
    expect(document.documentElement).toHaveClass('dark');
    applyTheme('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
