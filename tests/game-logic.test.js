'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { intersect, advance } = require('../game-logic.js');
test('perfect placement snaps to target without cutting', () => { assert.deepEqual(intersect(2, 2.05, 5, 0.1), { kind: 'perfect', center: 2, size: 5, offcut: 0 }); });
test('placement finds intersection and offcut on both sides', () => { for (const sign of [-1, 1]) { const r = intersect(2, 2 + sign, 5, 0.1); assert.equal(r.kind, 'placed'); assert.equal(r.size, 4); assert.equal(r.center, 2 + sign * 0.5); assert.equal(r.offcutCenter, 2 + sign * 3); } });
test('touching edges or missing do not make a block', () => { assert.equal(intersect(0, 5, 5, 0.1).kind, 'miss'); assert.equal(intersect(0, -6, 5, 0.1).kind, 'miss'); });
test('motion reflects at either edge and preserves long steps', () => { assert.deepEqual(advance(9, 1, 2, 1, -10, 10), { position: 9, direction: -1 }); assert.deepEqual(advance(-9, -1, 2, 1, -10, 10), { position: -9, direction: 1 }); assert.deepEqual(advance(0, 1, 3, 20, -10, 10), { position: 0, direction: -1 }); });
test('motion is stable across frame rates', () => { let a = {position: 0, direction: 1}; for (let i = 0; i < 60; i++) a = advance(a.position, a.direction, 5, 1 / 60, -9, 9); const b = advance(0, 1, 5, 1, -9, 9); assert.ok(Math.abs(a.position - b.position) < 1e-10); assert.equal(a.direction, b.direction); });
