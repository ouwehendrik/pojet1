"use strict";

const CONFIG = {
  width:  400,
  height: 600,
  sky:    "#87CEEB",

  timmy: {
    skinColor:    "#b3a57f",
    size:         10,      // radius
    gravity:      0.5,     // newtons_will
    flapSpeed:    -8,      // antifallspeed
    maxFallSpeed: 12,
    startX:       200,
    startY:       300,
  },

  pipe: {
    thickness:  60,        // pipthick
    gap:        130,       // pipgap
    speed:      2.5,       // pipvel
    spacing:    220,       // pipvoid
    tolerance:  80,        // piptolerance
    color:      "#5aa02c",
  },
};

const STATE = {
  READY:   "will_game",
  PLAYING: "gaming",
  OVER:    "gamed",
};