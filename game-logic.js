(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TowerLogic = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // Blocks use centre coordinates; the intersection is independent of direction.
  function intersect(targetCenter, movingCenter, size, tolerance) {
    const delta = movingCenter - targetCenter;
    if (Math.abs(delta) <= tolerance) return { kind: 'perfect', center: targetCenter, size: size, offcut: 0 };
    const overlap = size - Math.abs(delta);
    if (overlap <= 0) return { kind: 'miss', center: movingCenter, size: 0, offcut: size };
    return { kind: 'placed', center: (targetCenter + movingCenter) / 2, size: overlap, offcut: size - overlap, offcutCenter: movingCenter + Math.sign(delta) * overlap / 2 };
  }
  function advance(position, direction, speed, dt, min, max) {
    // Reflect at boundaries; handles a frame crossing an edge without escaping it.
    const width = max - min;
    if (!(width > 0)) return { position: min, direction: 1 };
    let travel = direction > 0 ? position - min : 2 * width - (position - min);
    travel = ((travel + speed * dt) % (2 * width) + 2 * width) % (2 * width);
    return travel < width ? { position: min + travel, direction: 1 } : { position: max - (travel - width), direction: -1 };
  }
  return { intersect, advance };
});
