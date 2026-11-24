import test from 'node:test';
import assert from 'node:assert/strict';
import {computeSheetDragOffset, evaluateSwipeDismiss} from './swipeSheetLogic';

test('computeSheetDragOffset tracks downward drag 1:1 and dampens upward drag', () => {
  assert.equal(computeSheetDragOffset(0), 0);
  assert.equal(computeSheetDragOffset(120), 120);
  assert.equal(computeSheetDragOffset(900), 640);
  const up = computeSheetDragOffset(-100);
  assert.ok(up < 0 && up >= -14);
});

test('evaluateSwipeDismiss dismisses on sufficient downward distance or fast downward flick', () => {
  assert.equal(evaluateSwipeDismiss(95, 400).shouldDismiss, true);
  assert.equal(evaluateSwipeDismiss(45, 70).shouldDismiss, true);
  assert.equal(evaluateSwipeDismiss(40, 400).shouldDismiss, false);
  assert.equal(evaluateSwipeDismiss(-20, 100).shouldDismiss, false);
});
