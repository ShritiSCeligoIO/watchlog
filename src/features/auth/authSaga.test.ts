import { expectSaga } from 'redux-saga-test-plan';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  persistLogin,
  persistLogout,
  watchAuth,
} from './authSaga';
import { AUTH_SESSION_KEY, loggedIn, loggedOut } from './authSlice';

const setItem = vi.fn();
const removeItem = vi.fn();

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function stubSessionStorage() {
  vi.stubGlobal('window', {
    sessionStorage: { setItem, removeItem },
  });
}

describe('auth saga', () => {
  it('persists login and logout actions outside the reducer', async () => {
    stubSessionStorage();

    await expectSaga(watchAuth)
      .dispatch(loggedIn())
      .dispatch(loggedOut())
      .silentRun(20);

    expect(setItem).toHaveBeenCalledWith(AUTH_SESSION_KEY, 'true');
    expect(removeItem).toHaveBeenCalledWith(AUTH_SESSION_KEY);
  });

  it('runs the login persistence worker', async () => {
    stubSessionStorage();

    await expectSaga(persistLogin).run();

    expect(setItem).toHaveBeenCalledOnce();
  });

  it('runs the logout persistence worker', async () => {
    stubSessionStorage();

    await expectSaga(persistLogout).run();

    expect(removeItem).toHaveBeenCalledOnce();
  });
});
