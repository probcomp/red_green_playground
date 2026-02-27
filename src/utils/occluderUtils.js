import { ENTITY_TYPES } from '../constants';

const { OCCLUDER, WINDOW } = ENTITY_TYPES;

/**
 * Compute axis-aligned intersection between two rectangles.
 * Rects are in world coordinates with bottom-left origin ({ x, y, width, height }).
 */
const rectIntersection = (a, b) => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const top = Math.min(a.y + a.height, b.y + b.height);
  const width = right - x;
  const height = top - y;
  if (width <= 0 || height <= 0) {
    return null;
  }
  return { x, y, width, height };
};

/**
 * Subtract a single window rectangle from a single occluder rectangle.
 * Returns an array of 0–4 occluder rectangles that cover occluder \ window.
 */
const subtractWindowFromOccluder = (occluder, windowRect) => {
  const inter = rectIntersection(occluder, windowRect);
  if (!inter) {
    return [occluder];
  }

  const pieces = [];

  const ox = occluder.x;
  const oy = occluder.y;
  const oright = occluder.x + occluder.width;
  const otop = occluder.y + occluder.height;

  const ix = inter.x;
  const iy = inter.y;
  const iright = inter.x + inter.width;
  const itop = inter.y + inter.height;

  // Top strip (above intersection)
  if (itop < otop) {
    pieces.push({
      ...occluder,
      x: ox,
      y: itop,
      width: oright - ox,
      height: otop - itop,
    });
  }

  // Bottom strip (below intersection)
  if (iy > oy) {
    pieces.push({
      ...occluder,
      x: ox,
      y: oy,
      width: oright - ox,
      height: iy - oy,
    });
  }

  const midHeight = itop - iy;

  // Left strip (left of intersection, in its vertical span)
  if (ix > ox) {
    pieces.push({
      ...occluder,
      x: ox,
      y: iy,
      width: ix - ox,
      height: midHeight,
    });
  }

  // Right strip (right of intersection, in its vertical span)
  if (iright < oright) {
    pieces.push({
      ...occluder,
      x: iright,
      y: iy,
      width: oright - iright,
      height: midHeight,
    });
  }

  return pieces;
};

/**
 * Given all entities, derive a version where occluders have had all windows
 * subtracted out, returning:
 * - entitiesForSimulation: entities with occluders replaced by split pieces, windows kept
 * - occluderPieces: the split occluder rectangles only (for rendering)
 */
export const getEntitiesWithWindowsApplied = (entities) => {
  const occluders = entities.filter(e => e.type === OCCLUDER);
  const windows = entities.filter(e => e.type === WINDOW);
  const others = entities.filter(e => e.type !== OCCLUDER && e.type !== WINDOW);

  if (occluders.length === 0 || windows.length === 0) {
    // Nothing to subtract; return original entities
    return {
      entitiesForSimulation: entities,
      occluderPieces: occluders,
    };
  }

  const occluderPieces = [];

  occluders.forEach((occ, occIndex) => {
    let currentPieces = [occ];
    windows.forEach((win) => {
      const winRect = { x: win.x, y: win.y, width: win.width, height: win.height };
      const nextPieces = [];
      currentPieces.forEach(piece => {
        nextPieces.push(...subtractWindowFromOccluder(piece, winRect));
      });
      currentPieces = nextPieces;
    });

    currentPieces.forEach((piece, pieceIndex) => {
      occluderPieces.push({
        ...piece,
        id: `${occ.id}-piece-${pieceIndex}`,
      });
    });
  });

  const entitiesForSimulation = [
    ...others,
    ...occluderPieces,
    ...windows,
  ];

  return {
    entitiesForSimulation,
    occluderPieces,
  };
};

