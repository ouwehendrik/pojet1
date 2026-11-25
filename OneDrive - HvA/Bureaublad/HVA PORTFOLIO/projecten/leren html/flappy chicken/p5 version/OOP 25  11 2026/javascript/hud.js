"use strict";

class Hud {
  constructor(scoreboard) {
    this.scoreboard = scoreboard;
  }

  draw(state) {
    const cx = CONFIG.width / 2;

    fill(0, 150);
    textAlign(CENTER, CENTER);

    textSize(20);
    text("Score: " + this.scoreboard.score, cx, 40);

    textSize(14);
    text("Best: " + this.scoreboard.best, cx, 65);

    textSize(20);

    if (state === STATE.READY) {
      text("Right-click to start", cx, CONFIG.height / 2 - 100);

    } else if (state === STATE.OVER) {
      text("it's joever", cx, CONFIG.height / 2 - 100);

      textSize(14);
      text("Right-click to start again", cx, CONFIG.height / 2 - 70);
      textSize(20);
    }
  }
}