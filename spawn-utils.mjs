// Pure geographic collision helpers, usable in browsers and Node tests.
// A small clearance ring prevents the player's body from intersecting walls.
import { pointInPolygon, WORLD_BOUND } from './geo-utils.mjs';

export function canStandAt(x, z, footprints = [], clearance = 2.5) {
  if (!Number.isFinite(x) || !Number.isFinite(z) || Math.abs(x) > WORLD_BOUND || Math.abs(z) > WORLD_BOUND) return false;
  const offsets = [[0, 0]];
  for (let i = 0; i < 12; i++) {
    const theta = 2 * Math.PI * i / 12;
    offsets.push([Math.cos(theta) * clearance, Math.sin(theta) * clearance]);
  }
  for (const poly of footprints) {
    const b = poly.bounds;
    if (!b || x < b.minx - clearance || x > b.maxx + clearance || z < b.minz - clearance || z > b.maxz + clearance) continue;
    for (const [dx, dz] of offsets) {
      if (pointInPolygon(x + dx, z + dz, poly.rings)) return false;
    }
  }
  return true;
}

// Deterministically search concentric rings for a safe outdoor patch. This
// avoids assuming that an approximate landmark coordinate is a valid entrance.
export function findSafePosition(x, z, footprints = [], opts = {}) {
  const clearance = opts.clearance ?? 3.5;
  const maxRadius = opts.maxRadius ?? 220;
  const spacing = opts.spacing ?? 4;
  if (canStandAt(x, z, footprints, clearance)) return { x, z, moved: false, found: true };
  for (let radius = spacing; radius <= maxRadius; radius += spacing) {
    const samples = Math.max(16, Math.ceil(2 * Math.PI * radius / spacing));
    for (let i = 0; i < samples; i++) {
      const angle = (2 * Math.PI * i / samples) + Math.PI / 4;
      const px = x + radius * Math.cos(angle);
      const pz = z + radius * Math.sin(angle);
      if (canStandAt(px, pz, footprints, clearance)) return { x: px, z: pz, moved: true, found: true };
    }
  }
  return { x, z, moved: false, found: false };
}
