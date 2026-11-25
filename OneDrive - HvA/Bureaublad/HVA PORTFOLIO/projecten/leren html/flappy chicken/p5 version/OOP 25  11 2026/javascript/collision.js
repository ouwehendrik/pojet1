"use strict";

const Collision = {
  // circle vs axis-aligned rectangle overlap
  circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
    const closestX = constrain(cx, rx, rx + rw);
    const closestY = constrain(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= r * r;
  },
};