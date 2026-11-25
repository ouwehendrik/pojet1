"use strict";

// background and canvas
const widthvar  = 400;
const heightvar = 600;
const SKY = "#87CEEB";

// score
let score = 0;
let bestScore = 0;

// timmy
const timmyskincolor = "#b3a57f";
const timmy_size     = 10;
const newtons_will   = 0.5;
const antifallspeed  = -8;
const maxfallspeed   = 12;   // terminal velocity

// the singing pipes
const pipthick      = 60;    // column width
const pipgap        = 130;   // total gap size
const pipvel        = 2.5;   // px per frame velocity
const pipvoid       = 220;   // space between pipes
const piptolerance  = 80;    // min distance from floor/ceiling to the gap
const PIPE_COLOR    = "#5aa02c";

// timmy's habits
let timmyx    = widthvar / 2;
let timmyy    = heightvar / 2;
let timmyVely = 0;

// state machine
let state = "will_game";

// pipes
let pipes = [];


// setup — p5 calls this automatically
function setup() {
  createCanvas(widthvar, heightvar);
  noStroke();
  textAlign(CENTER, CENTER);
  document.addEventListener("contextmenu", e => e.preventDefault());
}


// reset the game
function resethegame() {
  timmyx    = widthvar / 2;
  timmyy    = heightvar / 2;
  timmyVely = 0;
  pipes     = [];   // <- clear all pipes on restart
  score     = 0;
}


// if the last pipe is far enough left, make a new one on the right
function letspawnapip() {
  let shouldSpawn =
    pipes.length === 0 ||
    pipes[pipes.length - 1].x < widthvar - pipvoid;

  if (!shouldSpawn) return;

  // gapTop = where the gap vertically begins (kept away from top/bottom)
  let gapTop = random(piptolerance, heightvar - pipgap - piptolerance);
  pipes.push({ x: widthvar, gapTop: gapTop, scored: false });
}


// mathematics: circle vs rectangle overlap
function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
  let closestX = constrain(cx, rx, rx + rw);
  let closestY = constrain(cy, ry, ry + rh);
  let dx = cx - closestX;
  let dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}


// game loop
function draw() {
  background(SKY);

  // FIX: this if-block now has real braces, so only the gameplay lives inside it
  if (state === "gaming") {

    // jiggle physics
    timmyVely += newtons_will;
    timmyVely  = constrain(timmyVely, -20, maxfallspeed);
    timmyy    += timmyVely;

    // ceiling (non-lethal)
    if (timmyy - timmy_size <= 0) {
      timmyy    = timmy_size;
      timmyVely = 0;
    }

    // pipes do a bunch of things
    letspawnapip();
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= pipvel;

      // did Timmy just cross this pipe's right edge, and haven't we counted it?
      if (!pipes[i].scored && timmyx > pipes[i].x + pipthick) {
        pipes[i].scored = true;
        score++;
      }

      if (pipes[i].x + pipthick < 0) {
        pipes.splice(i, 1);
      }
    }

    // pipe collision system
    for (let p of pipes) {
      let topHit = circleRectOverlap(
        timmyx, timmyy, timmy_size,
        p.x, 0, pipthick, p.gapTop
      );

      let botY   = p.gapTop + pipgap;
      let botHit = circleRectOverlap(
        timmyx, timmyy, timmy_size,
        p.x, botY, pipthick, heightvar - botY
      );

      if (topHit || botHit) {
        state = "gamed";
        break;   // no reason to keep checking other pipes
      }
    }

    // floor leads to death
    if (timmyy + timmy_size >= heightvar) {
      timmyy = heightvar - timmy_size;
      state = "gamed";
    }
  }   // <-- end of gameplay block


  drawthemPipes();

  // timmy draw
  fill(timmyskincolor);
  circle(timmyx, timmyy, timmy_size * 2);

  // HUD
  fill(0, 150);
  textSize(20);
  text("Score: " + score, widthvar / 2, 40);
  textSize(14);
  text("Best: " + bestScore, widthvar / 2, 65);
  textSize(20);

  if (state === "will_game") {
    text("Right-click to start", widthvar / 2, heightvar / 2 - 100);
  } else if (state === "gamed") {
    if (score > bestScore) bestScore = score;
    text("it's joever", widthvar / 2, heightvar / 2 - 100);
    textSize(14);
    text("Right-click to start again", widthvar / 2, heightvar / 2 - 70);
    textSize(20);
  }
}


// separate function, but it must live OUTSIDE draw()
function drawthemPipes() {
  for (let p of pipes) {
    let botY = p.gapTop + pipgap;
    let botH = heightvar - botY;

    // green bodies
    fill(PIPE_COLOR);
    rect(p.x, 0,    pipthick, p.gapTop);
    rect(p.x, botY, pipthick, botH);
  }
}


// input handler
function mousePressed() {
  if (state === "will_game") {
    if (mouseButton === RIGHT) state = "gaming";

  } else if (state === "gaming") {
    if (mouseButton === LEFT) timmyVely = antifallspeed;

  } else if (state === "gamed") {
    if (mouseButton === RIGHT) {
      resethegame();
      state = "will_game";
    }
  }
}