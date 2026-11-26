import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePageSwipeDrag,
  computeSheetDragOffset,
  evaluatePageSwipeTurn,
  evaluateSwipeDismiss,
} from './swipeSheetLogic';

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

test('computePageSwipeDrag applies rubber-band resistance at boundary pages 1 and 604', () => {
  const normalNext = computePageSwipeDrag(100, 10);
  const clampedMax = computePageSwipeDrag(100, 604);
  const clampedMin = computePageSwipeDrag(-100, 1);
  assert.equal(normalNext, 72);
  assert.equal(clampedMax, 22);
  assert.equal(clampedMin, -22);
});

test('evaluatePageSwipeTurn flips on sufficient drag distance or quick finger flick', () => {
  assert.deepEqual(evaluatePageSwipeTurn(64, 300, 5), {
    direction: 'next',
    targetPage: 6,
  });
  assert.deepEqual(evaluatePageSwipeTurn(-30, 50, 5), {
    direction: 'prev',
    targetPage: 4,
  });
  assert.deepEqual(evaluatePageSwipeTurn(20, 300, 5), {
    direction: null,
    targetPage: 5,
  });
  assert.deepEqual(evaluatePageSwipeTurn(-90, 200, 1), {
    direction: null,
    targetPage: 1,
  });
});

