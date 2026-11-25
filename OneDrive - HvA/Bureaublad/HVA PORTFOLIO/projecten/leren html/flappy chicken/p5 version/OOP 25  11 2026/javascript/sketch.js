"use strict";

let game;

function setup() {
  createCanvas(CONFIG.width, CONFIG.height);
  noStroke();
  textAlign(CENTER, CENTER);
  document.addEventListener("contextmenu", e => e.preventDefault());

  game = new Game();
}

function draw() {
  game.update();
  game.draw();
}

function mousePressed() {
  game.handleInput(mouseButton);
}