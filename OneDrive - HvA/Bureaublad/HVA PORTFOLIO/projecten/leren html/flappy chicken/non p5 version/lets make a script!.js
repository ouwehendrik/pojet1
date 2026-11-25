// images by jelly and me
const IMAGE_SOURCES = {
    bg:          "assets/background.png",
    chickenIdle: "assets/chicken_idle.png",
    chickenUp:   "assets/chicken_up.png",
    chickenDown: "assets/chicken_down.png",
	pillarTip: "assets/pillar_tip.png",
	pillarChunk: "assets/pillar_chunk.png",
	pillarTip2: "assets/pillar_tip_2.png",
	
};
// sounds by me
const SOUND_SOURCES = {
    jump: "assets/jump.wav",
    bgm:  "assets/basicloop.mp3",
};
// calibrate a canvas
const canvas = document.getElementById("canvassy")

const ctx = canvas.getContext("2d")

// ===== Game state =====
let assets = {};           // loaded images, keyed by name (bg, chickenIdle, ...)
let sounds = {};           // loaded audio, keyed by name (jump, bgm)
let assetsReady = false;   // flipped to true once everything is loaded

let gameState = "ready";   // "ready" | "playing" | "dead"
let score = 0;

// raw chicken stats
const bird = {
    x: 80,                        // pixels from the left
    y: 300,                       // pixels from the top
    width: 100,                    // chicken size
    height: 100,                   // chicken size
    velocityY: 0,                 // this will manage the gravity
    frames: [],                   // the two flap frames, filled after load
    idleFrame: null,              // the idle sprite
    currentFrame: 0,              // 0 or 1, animation manager
    lastFrameTime: 0,             // timestamp of the last frame switch
    frameDuration: 120,           // ms each flap frame is shown
};

// pillar stats
const PILLAR_WIDTH = 64;          // width times 2
const PILLAR_GAP   = 160;         // vertical gap the bird flies through
const PILLAR_SPEED = 150;         // pixels per second, scroll speed
const PILLAR_SPAWN_MS = 1800;     // how often a new pillar pair appears

let pillars = [];                 // array of pillar objects
let lastPillarSpawn = 0;          // timestamp of the last spawn

const PILLAR_TIP_HEIGHT = 32;   // <-- set to your pillarTip.png real height
const PILLAR_MIN_TOP    = 60;   // smallest gapY (gap can't be too close to the top)
const PILLAR_MAX_BOTTOM = 60;   // smallest distance from bottom of screen to bottom of gap

// mmm Physics
const GRAVITY        = 1800;   // pixels per second², pulls the bird down
const JUMP_VELOCITY  = -450;   // pixels per second, instantaneous on flap (negative = up)
const MAX_FALL_SPEED = 700;    // terminal velocity, so it can't accelerate forever

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

function loadSound(src) { 
    return new Promise((resolve, reject) => {
        const sound = new Audio();
        sound.preload = "auto";

        let settled = false;

        const finish = () => {
            if (settled) return;
            settled = true;
            resolve(sound);
        };

        sound.addEventListener("canplaythrough", finish);
        sound.addEventListener("loadeddata", finish);
        sound.addEventListener("error", () =>
            reject(new Error(`Failed to load sound: ${src}`))
        );

        sound.src = src;
    });
}

// ===== Loader maps =====

// Given { key: "path" }, load every path and return { key: Image }.
function loadImageMap(sources) {
    const entries = Object.entries(sources);
    const promises = entries.map(([key, src]) =>
        loadImage(src).then(img => [key, img])
    );
    return Promise.all(promises).then(pairs => Object.fromEntries(pairs));
}

// Same, but for audio.
function loadSoundMap(sources) {
    const entries = Object.entries(sources);
    const promises = entries.map(([key, src]) =>
        loadSound(src).then(snd => [key, snd])
    );
    return Promise.all(promises).then(pairs => Object.fromEntries(pairs));
}

// Load every image AND every sound, then resolve with both.
async function loadAll() {
    const [images, loadedSounds] = await Promise.all([
        loadImageMap(IMAGE_SOURCES),
        loadSoundMap(SOUND_SOURCES),
    ]);
    return { images, sounds: loadedSounds };
}
// ===== Rendering =====
function draw() {
    if (!assetsReady) return;

    // Background, scaled to fill the whole canvas.
    ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);
	drawPillars();          

    // Bird — pick the right sprite for the current state.
    let frame;
    if (bird.state === "idle") {
        frame = bird.idleFrame;
    } else {
        frame = bird.frames[bird.currentFrame];
    }
    if (frame) {
        ctx.drawImage(frame, bird.x, bird.y, bird.width, bird.height);
    }
}

function drawPillars() {
    for (const p of pillars) {
        // ----- Top pillar -----
        // Tip: sits at the bottom of the top pillar, right above the gap.
        const topTipY = p.gapY - PILLAR_TIP_HEIGHT;
        ctx.drawImage(
            assets.pillarTip2,
            p.x, topTipY, PILLAR_WIDTH, PILLAR_TIP_HEIGHT
        );

        // Chunk: fills from the top of the screen down to the top tip.
        const topChunkHeight = topTipY;   // how much vertical space is left
        if (topChunkHeight > 0) {
            ctx.drawImage(
                assets.pillarChunk,
                p.x, 0, PILLAR_WIDTH, topChunkHeight
            );
        }

        // ----- Bottom pillar -----
        // Tip: sits at the top of the bottom pillar, right below the gap.
        const botTipY = p.gapY + PILLAR_GAP;
        ctx.drawImage(
            assets.pillarTip,
            p.x, botTipY, PILLAR_WIDTH, PILLAR_TIP_HEIGHT
        );

        // Chunk: fills from below the bottom tip down to the canvas bottom.
        const botChunkY = botTipY + PILLAR_TIP_HEIGHT;
        const botChunkHeight = canvas.height - botChunkY;
        if (botChunkHeight > 0) {
            ctx.drawImage(
                assets.pillarChunk,
                p.x, botChunkY, PILLAR_WIDTH, botChunkHeight
            );
        }
    }
}

// Called when the player flaps (space, click, tap).
function flap() {
    // Only respond when the game is actually running.
    if (gameState !== "playing") return;

    bird.velocityY = JUMP_VELOCITY;
    bird.state = "flapping";

    // Play the jump sound. It's short, so it's fine to restart it
    // even if it's already playing.
    sounds.jump.currentTime = 0;
    sounds.jump.play().catch(() => {});
}

// Advance the bird's physics one frame.
function updateBird(dt) {
    if (gameState !== "playing") return;

    // Apply gravity: velocity increases by GRAVITY * dt every frame.
    bird.velocityY += GRAVITY * dt;

    // Clamp to terminal velocity.
    if (bird.velocityY > MAX_FALL_SPEED) bird.velocityY = MAX_FALL_SPEED;

    // Move the bird by its velocity.
    bird.y += bird.velocityY * dt;
}

// Create a new pillar pair at the right edge of the canvas.
function spawnPillar() {
    // Pick a random gapY (top of the gap) within safe bounds.
    const minGapY = PILLAR_MIN_TOP;
    const maxGapY = canvas.height - PILLAR_GAP - PILLAR_MAX_BOTTOM;
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);

    pillars.push({
        x: canvas.width,
        gapY: gapY,
        passed: false,   // used later for scoring
    });
}

// Move pillars left, spawn new ones, remove off-screen ones.
function updatePillars(dt, timestamp) {
    if (gameState !== "playing") return;

    // Scroll everything left.
    for (const p of pillars) {
        p.x -= PILLAR_SPEED * dt;
    }

    // Remove pillars fully off the left edge.
    pillars = pillars.filter(p => p.x + PILLAR_WIDTH > 0);

    // Spawn a new one on a timer.
    if (timestamp - lastPillarSpawn >= PILLAR_SPAWN_MS) {
        spawnPillar();
        lastPillarSpawn = timestamp;
    }
}

// ===== Main loop =====
let lastTimestamp = 0;

function loop(timestamp) {
    let dt = (timestamp - lastTimestamp) / 1000;
    if (dt > 0.05) dt = 0.05;
    lastTimestamp = timestamp;

    updateAnimation(timestamp);
    updateBird(dt);
    updatePillars(dt, timestamp);   // <-- new line
    draw();

    requestAnimationFrame(loop);
}

// Advances the wing-flap animation based on elapsed time.
function updateAnimation(timestamp) {
    // Skip if we have no frames yet, or if the bird isn't animating.
    if (bird.frames.length === 0) return;
    if (bird.state === "idle") return;

    if (timestamp - bird.lastFrameTime >= bird.frameDuration) {
        bird.currentFrame = (bird.currentFrame + 1) % bird.frames.length;
        bird.lastFrameTime = timestamp;
    }
}

// ===== Kick everything off =====
loadAll()
    .then(({ images, sounds: loadedSounds }) => {
        assets = images;
        sounds = loadedSounds;

        // Wire up the bird's sprites.
        bird.frames = [assets.chickenUp, assets.chickenDown];
        bird.idleFrame = assets.chickenIdle;
        bird.state = "idle";

        // Background music should loop forever.
        sounds.bgm.loop = true;

        // Now we're safe to start drawing.
        assetsReady = true;
        loop(0);
    })
    .catch(err => console.error("Asset loading failed:", err));

// ===== Input =====
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();   // stop page scroll on space
        handleInput();
    }
});

document.addEventListener("pointerdown", () => {
    handleInput();
});

// Starts the game on first input, then flaps on subsequent inputs.
function handleInput() {
    if (gameState === "ready") {
        // First input: start the game.
        gameState = "playing";
        bird.state = "flapping";
        sounds.bgm.play().catch(() => {});
        flap();
    } else if (gameState === "playing") {
        flap();
    } else if (gameState === "dead") {
        // Restart logic — we'll fill this in later.
    }
}