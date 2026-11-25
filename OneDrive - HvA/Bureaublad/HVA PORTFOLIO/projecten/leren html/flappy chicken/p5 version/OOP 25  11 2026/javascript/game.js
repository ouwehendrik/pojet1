"use strict";

class Game {
  constructor() {
    this.timmy      = new Timmy();
    this.pipes      = new PipeManager();
    this.scoreboard = new Scoreboard();
    this.hud        = new Hud(this.scoreboard);
    this.state      = STATE.READY;
  }

  reset() {
    this.timmy.reset();
    this.pipes.reset();
    this.scoreboard.reset();
  }

  start() {
    this.state = STATE.PLAYING;
  }

  update() {
    if (this.state !== STATE.PLAYING) return;

    this.timmy.update();

    const gained = this.pipes.update(this.timmy);
    if (gained > 0) this.scoreboard.add(gained);

    if (this.pipes.collidesWith(this.timmy) || this.timmy.hitFloor()) {
      this.timmy.clampToFloor();
      this.state = STATE.OVER;
      this.scoreboard.commitBest();
    }
  }

  draw() {
    background(CONFIG.sky);

    this.pipes.draw();
    this.timmy.draw();
    this.hud.draw(this.state);
  }

  handleInput(button) {
    if (this.state === STATE.READY) {
      if (button === RIGHT) this.start();

    } else if (this.state === STATE.PLAYING) {
      if (button === LEFT) this.timmy.flap();

    } else if (this.state === STATE.OVER) {
      if (button === RIGHT) {
        this.reset();
        this.state = STATE.READY;
      }
    }
  }
}