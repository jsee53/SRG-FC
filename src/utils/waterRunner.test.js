import test from 'node:test'
import assert from 'node:assert/strict'
import { pickWaterRunner } from './waterRunner.js'

test('pickWaterRunner prefers the least-recently chosen member', () => {
  const members = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }]

  const first = pickWaterRunner(members, [], () => 0)
  assert.equal(first?.id, 1)

  const second = pickWaterRunner(members, [1], () => 0)
  assert.equal(second?.id, 2)

  const third = pickWaterRunner(members, [1, 2], () => 0)
  assert.equal(third?.id, 3)
})

test('pickWaterRunner returns null when no candidates are available', () => {
  assert.equal(pickWaterRunner([], []), null)
})
