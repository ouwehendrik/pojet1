"use strict";

class Timmy {
  constructor(x, y) {
    this.size = CONFIG.timmy.size;
    this.reset(x, y);
  }

  reset(x = CONFIG.timmy.startX, y = CONFIG.timmy.startY) {
    this.x    = x;
    this.y    = y;
    this.velY = 0;
  }

  flap() {
    this.velY = CONFIG.timmy.flapSpeed;
  }

  update() {
    // gravity
    this.velY += CONFIG.timmy.gravity;
    this.velY  = constrain(this.velY, -20, CONFIG.timmy.maxFallSpeed);
    this.y    += this.velY;

    // ceiling is non-lethal
    if (this.y - this.size <= 0) {
      this.y    = this.size;
      this.velY = 0;
    }
  }

  hitFloor() {
    return this.y + this.size >= CONFIG.height;
  }

  clampToFloor() {
    this.y = CONFIG.height - this.size;
  }

  draw() {
    noStroke();
    fill(CONFIG.timmy.skinColor);
    circle(this.x, this.y, this.size * 2);
  }
}