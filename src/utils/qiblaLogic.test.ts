import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeQiblaBearing,
  computeQiblaDelta,
  getRotationGuidance,
} from './qiblaLogic';

test('computeQiblaBearing returns accurate bearings for Makkah, Casablanca, London, and Sylhet', () => {
  const casa = computeQiblaBearing(33.5731, -7.5898);
  assert.ok(casa >= 92 && casa <= 98, `Expected Casablanca ~95°, got ${casa}`);

  const london = computeQiblaBearing(51.5074, -0.1278);
  assert.ok(london >= 117 && london <= 121, `Expected London ~119°, got ${london}`);

  const sylhet = computeQiblaBearing(24.8949, 91.8687);
  assert.ok(sylhet >= 274 && sylhet <= 280, `Expected Sylhet ~277°, got ${sylhet}`);

  const nyc = computeQiblaBearing(40.7128, -74.006);
  assert.ok(nyc >= 56 && nyc <= 61, `Expected New York ~58°, got ${nyc}`);
});

test('computeQiblaDelta and getRotationGuidance identify left, right, and aligned states', () => {
  assert.equal(computeQiblaDelta(257, 32), -135);
  const left = getRotationGuidance(257, 32);
  assert.equal(left.direction, 'left');
  assert.equal(left.labelEn, 'Rotate the phone 135° to the left');

  const right = getRotationGuidance(120, 45);
  assert.equal(right.direction, 'right');
  assert.equal(right.labelEn, 'Rotate the phone 75° to the right');

  const aligned = getRotationGuidance(95, 93);
  assert.equal(aligned.isAligned, true);
  assert.equal(aligned.direction, 'aligned');
});
