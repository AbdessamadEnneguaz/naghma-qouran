import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTRO_SAMPLE_VERSES,
  INTRO_SEEN_KEY,
  readIntroSeen,
  shouldShowWebIntroLanding,
  writeIntroSeen,
} from './introFlowLogic';

test('shouldShowWebIntroLanding displays intro on fresh web root visits and hides for returning or deep-linked sessions', () => {
  // Fresh web browser at / -> show Intro Landing Page first
  assert.equal(
    shouldShowWebIntroLanding({
      pathname: '/',
      search: '',
      hash: '',
      introSeen: false,
      isNativeOrStandalone: false,
    }),
    true
  );

  // Returning web visitor who already clicked Enter App -> Home directly
  assert.equal(
    shouldShowWebIntroLanding({
      pathname: '/',
      search: '',
      hash: '',
      introSeen: true,
      isNativeOrStandalone: false,
    }),
    false
  );

  // Explicit /intro or ?intro=1 always shows intro page even if already seen
  assert.equal(
    shouldShowWebIntroLanding({
      pathname: '/intro',
      search: '',
      hash: '',
      introSeen: true,
      isNativeOrStandalone: true,
    }),
    true
  );
  assert.equal(
    shouldShowWebIntroLanding({
      pathname: '/',
      search: '?intro=1',
      hash: '',
      introSeen: true,
      isNativeOrStandalone: false,
    }),
    true
  );

  // ?autostart=1 or deep links bypass intro cleanly
  assert.equal(
    shouldShowWebIntroLanding({
      pathname: '/',
      search: '?autostart=1',
      hash: '',
      introSeen: false,
      isNativeOrStandalone: false,
    }),
    false
  );
  assert.equal(
    shouldShowWebIntroLanding({
      pathname: '/mushaf',
      search: '',
      hash: '',
      introSeen: false,
      isNativeOrStandalone: false,
    }),
    false
  );

  // Native APK / standalone PWA goes straight into app after quick Splash
  assert.equal(
    shouldShowWebIntroLanding({
      pathname: '/',
      search: '',
      hash: '',
      introSeen: false,
      isNativeOrStandalone: true,
    }),
    false
  );
});

test('readIntroSeen and writeIntroSeen persist safely', () => {
  const map = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
  assert.equal(readIntroSeen(mockStorage), false);
  writeIntroSeen(mockStorage, true);
  assert.equal(map.get(INTRO_SEEN_KEY), '1');
  assert.equal(readIntroSeen(mockStorage), true);
  assert.ok(INTRO_SAMPLE_VERSES.length >= 3);
});
