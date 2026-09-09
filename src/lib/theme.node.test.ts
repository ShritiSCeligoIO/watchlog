/**
 * @jest-environment node
 */
import { systemTheme } from './theme.js';

it('uses light when no browser window exists', () => {
  expect(systemTheme()).toBe('light');
});
