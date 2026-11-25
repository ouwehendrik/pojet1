"use strict";

class PipeManager {
  constructor() {
    this.pipes = [];
  }

  reset() {
    this.pipes = [];
  }

  spawnIfNeeded() {
    const last = this.pipes[this.pipes.length - 1];
    const shouldSpawn =
      !last || last.x < CONFIG.width - CONFIG.pipe.spacing;

    if (!shouldSpawn) return;

    const gapTop = random(
      CONFIG.pipe.tolerance,
      CONFIG.height - CONFIG.pipe.gap - CONFIG.pipe.tolerance
    );
    this.pipes.push(new Pipe(CONFIG.width, gapTop));
  }

  /**
   * Advances all pipes, culls off-screen ones, and returns
   * the number of newly cleared pipes (points gained this frame).
   */
  update(timmy) {
    this.spawnIfNeeded();

    let gained = 0;

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.update();

      if (!p.scored && p.hasPassed(timmy.x)) {
        p.scored = true;
        gained++;
      }

      if (p.isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }

    return gained;
  }

  collidesWith(timmy) {
    for (const p of this.pipes) {
      if (p.collidesWith(timmy)) return true;
    }
    return false;
  }

  draw() {
    for (const p of this.pipes) p.draw();
  }
}