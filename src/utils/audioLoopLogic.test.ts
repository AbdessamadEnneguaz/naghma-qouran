import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceAyahLoop,
  createAyahLoopState,
  formatAyahLoopProgress,
} from './audioLoopLogic';

test('Hifz loop handles 1x, 3x, 5x and infinite counts accurately', () => {
  // 1x: finishes immediately on first completion
  const s1 = createAyahLoopState(2, 255, 1);
  const r1 = advanceAyahLoop(s1);
  assert.equal(r1.shouldRepeat, false);
  assert.equal(r1.nextState.completedLoops, 1);

  // 3x: repeats twice after initial play (pass 1 -> repeat -> pass 2 -> repeat -> pass 3 -> done)
  let state = createAyahLoopState(18, 10, 3);
  assert.equal(formatAyahLoopProgress(state.completedLoops, state.target), '1/3');

  let step = advanceAyahLoop(state);
  assert.equal(step.shouldRepeat, true);
  state = step.nextState;
  assert.equal(formatAyahLoopProgress(state.completedLoops, state.target), '2/3');

  step = advanceAyahLoop(state);
  assert.equal(step.shouldRepeat, true);
  state = step.nextState;
  assert.equal(formatAyahLoopProgress(state.completedLoops, state.target), '3/3');

  step = advanceAyahLoop(state);
  assert.equal(step.shouldRepeat, false);

  // inf: always repeats
  let infState = createAyahLoopState(1, 1, 'inf');
  for (let i = 0; i < 6; i++) {
    const res = advanceAyahLoop(infState);
    assert.equal(res.shouldRepeat, true);
    infState = res.nextState;
  }
  assert.equal(formatAyahLoopProgress(infState.completedLoops, infState.target), '∞');
});
