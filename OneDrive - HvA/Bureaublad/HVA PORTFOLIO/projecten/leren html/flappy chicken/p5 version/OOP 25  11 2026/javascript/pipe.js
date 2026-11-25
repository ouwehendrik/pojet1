"use strict";

class Pipe {
  constructor(x, gapTop) {
    this.x      = x;
    this.gapTop = gapTop;
    this.scored = false;
  }

  get gapBottom() {
    return this.gapTop + CONFIG.pipe.gap;
  }

  get rightEdge() {
    return this.x + CONFIG.pipe.thickness;
  }

  update() {
    this.x -= CONFIG.pipe.speed;
  }

  isOffScreen() {
    return this.rightEdge < 0;
  }

  hasPassed(timmyX) {
    return timmyX > this.rightEdge;
  }

  collidesWith(timmy) {
    const topHit = Collision.circleRectOverlap(
      timmy.x, timmy.y, timmy.size,
      this.x, 0, CONFIG.pipe.thickness, this.gapTop
    );

    const botY = this.gapBottom;
    const botHit = Collision.circleRectOverlap(
      timmy.x, timmy.y, timmy.size,
      this.x, botY, CONFIG.pipe.thickness, CONFIG.height - botY
    );

    return topHit || botHit;
  }

  draw() {
    const botY = this.gapBottom;
    const botH = CONFIG.height - botY;

    noStroke();
    fill(CONFIG.pipe.color);
    rect(this.x, 0,    CONFIG.pipe.thickness, this.gapTop);
    rect(this.x, botY, CONFIG.pipe.thickness, botH);
  }
}