"use strict";

class Scoreboard {
  constructor() {
    this.score = 0;
    this.best  = 0;
  }

  reset() {
    this.score = 0;
  }

  add(points) {
    this.score += points;
  }

  commitBest() {
    if (this.score > this.best) this.best = this.score;
  }
}