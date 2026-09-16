```javascript
const video = document.getElementById("video");
const canvas = document.getElementById("flowerCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");

let width;
let height;

let targetBloom = 0;
let bloom = 0;

let handX = 0.5;
let handY = 0.5;

let targetHandX = 0.5;
let targetHandY = 0.5;

const petals = 12;

function resizeCanvas() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// -----------------------------
// FLOWER DRAWING
// -----------------------------

function drawFlower() {

    ctx.clearRect(0, 0, width, height);

    // Smooth animation
    bloom += (targetBloom - bloom) * 0.08;

    handX += (targetHandX - handX) * 0.08;
    handY += (targetHandY - handY) * 0.08;

    const centerX =
        width * 0.5 + (handX - 0.5) * 250;

    const centerY =
        height * 0.70 + (handY - 0.5) * 100;

    drawStem(centerX, centerY);

    drawLeaves(centerX, centerY);

    drawPetals(centerX, centerY);

    requestAnimationFrame(drawFlower);
}


// -----------------------------
// STEM
// -----------------------------

function drawStem(x, y) {

    ctx.beginPath();

    ctx.moveTo(x, y);

    ctx.quadraticCurveTo(
        x - 30,
        y - 180,
        x,
        y - 330
    );

    ctx.lineWidth = 12;
    ctx.strokeStyle = "#3fa653";
    ctx.stroke();
}


// -----------------------------
// LEAVES
// -----------------------------

function drawLeaves(x, y) {

    ctx.save();

    ctx.translate(x, y - 170);

    ctx.fillStyle = "#43a85a";

    // Left leaf
    ctx.beginPath();

    ctx.ellipse(
        -45,
        20,
        60,
        25,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Right leaf
    ctx.beginPath();

    ctx.ellipse(
        45,
        55,
        60,
        25,
        0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


// -----------------------------
// PETALS
// -----------------------------

function drawPetals(x, y) {

    const flowerX = x;
    const flowerY = y - 330;

    const radius = 55 + bloom * 120;

    ctx.save();

    ctx.translate(flowerX, flowerY);

    const time = Date.now() * 0.001;

    for (let i = 0; i < petals; i++) {

        const angle =
            (Math.PI * 2 / petals) * i;

        const sway =
            Math.sin(time + i) * 0.04;

        ctx.save();

        ctx.rotate(angle + sway);

        ctx.translate(0, -radius * 0.55);

        const petalLength =
            45 + bloom * 75;

        const petalWidth =
            25 + bloom * 20;

        const gradient =
            ctx.createRadialGradient(
                0,
                0,
                5,
                0,
                0,
                petalLength
            );

        gradient.addColorStop(0, "#fff4a3");
        gradient.addColorStop(0.3, "#ffcf4a");
        gradient.addColorStop(1, "#ff6b9a");

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            petalWidth,
            petalLength,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    // Flower center

    const centerRadius =
        25 + bloom * 20;

    const centerGradient =
        ctx.createRadialGradient(
            0,
            0,
            3,
            0,
            0,
            centerRadius
        );

    centerGradient.addColorStop(0, "#fff59d");
    centerGradient.addColorStop(1, "#e58b19");

    ctx.fillStyle = centerGradient;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        centerRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


// -----------------------------
// MEDIAPIPE HANDS
// -----------------------------

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});


// -----------------------------
// HAND DETECTION
// -----------------------------

hands.onResults((results) => {

    if (
        !results.multiHandLandmarks ||
        results.multiHandLandmarks.length === 0
    ) {

        statusText.textContent =
            "✋ Show your hand to the camera";

        targetBloom = 0;

        return;
    }

    const landmarks =
        results.multiHandLandmarks[0];


    // Thumb tip = 4
    // Index finger tip = 8

    const thumb = landmarks[4];
    const index = landmarks[8];


    // Distance between thumb and index finger

    const dx = thumb.x - index.x;
    const dy = thumb.y - index.y;

    const distance =
        Math.sqrt(dx * dx + dy * dy);


    // Convert distance into bloom amount

    targetBloom =
        Math.max(
            0,
            Math.min(
                1,
                (distance - 0.025) / 0.20
            )
        );


    // Hand position

    targetHandX = index.x;
    targetHandY = index.y;


    if (distance < 0.07) {

        statusText.textContent =
            "🤏 Pinching — Flower is closing";

    } else {

        statusText.textContent =
            "🌸 Flower is blooming!";
    }
});


// -----------------------------
// CAMERA
// -----------------------------

const camera = new Camera(video, {

    onFrame: async () => {
        await hands.send({
            image: video
        });
    },

    width: 640,
    height: 480

});

camera.start();


// Start animation

drawFlower();
```

