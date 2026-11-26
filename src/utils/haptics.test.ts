import test from 'node:test';
import assert from 'node:assert/strict';
import {getHapticPattern, shouldTriggerHaptics} from './haptics';

test('getHapticPattern returns distinct crisp patterns for light, medium, and success', () => {
  assert.equal(getHapticPattern('light'), 8);
  assert.equal(getHapticPattern('medium'), 16);
  assert.deepEqual(getHapticPattern('success'), [10, 26, 12]);
});

test('shouldTriggerHaptics respects reduced motion and navigator.vibrate availability', () => {
  assert.equal(shouldTriggerHaptics(undefined, undefined), false);
  assert.equal(
    shouldTriggerHaptics(
      {vibrate: () => true},
      {matchMedia: () => ({matches: true}) as MediaQueryList}
    ),
    false
  );
  assert.equal(
    shouldTriggerHaptics(
      {vibrate: () => true},
      {matchMedia: () => ({matches: false}) as MediaQueryList}
    ),
    true
  );
});
