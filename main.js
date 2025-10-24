// main.js
import { createWebGPU, getSizeInPixels, getLocationInPixels, createVertexBuffer, createPipeline, render, createLocationBuffer, updateLocationBuffer, createTexture, createBindGroupsAndLayouts, createSampler, createColorBuffer, updateColorBuffer } from './webgpu.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const DVD_WIDTH = 0.5;
const DVD_HEIGHT = 0.4;
const START_X = -0.3;
const START_Y = 0.2;

document.addEventListener('DOMContentLoaded', () => {
    // Palette of 10 bright colors (RGB)
    const COLOR_PALETTE = [
        [1.0, 0.2, 0.2],   // Red
        [0.2, 1.0, 0.2],   // Green
        [0.2, 0.2, 1.0],   // Blue
        [1.0, 1.0, 0.2],   // Yellow
        [1.2, 0.2, 1.0],   // Magenta
        [0.2, 1.0, 1.0],   // Cyan
        [1.0, 1.0, 1.0],   // White
        [1.2, 0.5, 0.2],   // Orange
        [0.5, 0.2, 1.0],   // Violet
        [0.2, 1.0, 0.5],   // Aqua
    ];
    let colorIndex = 0;
    const canvas = document.getElementById('gpu-canvas');
    const errorDiv = document.getElementById('error');
    const speedUpBtn = document.getElementById('speed-up-btn');
    const speedDownBtn = document.getElementById('speed-down-btn');
    const toggleAnimBtn = document.getElementById('toggle-anim-btn');
    (async () => {
            const webgpu = await createWebGPU(canvas, errorDiv);
            if (!webgpu) return;
            const { device, context, format } = webgpu;
            const vertexBuffer = createVertexBuffer(device, START_X, START_Y, DVD_WIDTH, DVD_HEIGHT);
            const texture = await createTexture(device, "assets/dvd.png");
            const sampler = await createSampler(device);
            const locationBuffer = createLocationBuffer(device);
            const colorBuffer = createColorBuffer(device);
            // Initial color
            let currentColor = COLOR_PALETTE[colorIndex];
            updateColorBuffer(device, colorBuffer, currentColor);
            // Create bind groups and layouts using helper
            const bindGroupsObj = createBindGroupsAndLayouts(device, locationBuffer, sampler, texture, colorBuffer);
            const pipeline = await createPipeline(device, format, bindGroupsObj.bindGroupLayouts);

            let location = [0.00, 0.00];
            let collidedX = Math.random() < 0.5;
            let collidedY = Math.random() < 0.5;
            let { pixelX: dvdWidth, pixelY: dvdHeight } = getSizeInPixels(DVD_WIDTH , DVD_HEIGHT , SCREEN_WIDTH, SCREEN_HEIGHT);
            console.log(dvdWidth, dvdHeight);
            function randomColor() {
                // Generate a bright color by ensuring each channel is between 0.7 and 1.0
                return [
                    0.3 + Math.random() * 0.7,
                    0.3 + Math.random() * 0.4,
                    0.3 + Math.random() * 0.7,
                ];
            }
            let detectCollision = function(x, y) {
                let collided = false;
                let { pixelX: objectX, pixelY: objectY } = getLocationInPixels(x, y, SCREEN_WIDTH, SCREEN_HEIGHT);
                if (objectX - dvdWidth / 2 <= 0 || objectX + dvdWidth / 2 >= SCREEN_WIDTH) {
                    collidedX = !collidedX;
                    collided = true;
                }
                if (objectY - dvdHeight / 2 <= 0 || objectY + dvdHeight / 2 >= SCREEN_HEIGHT) {
                    collidedY = !collidedY;
                    collided = true;
                }
                return collided;
            }

            let speed = 0.02;
            if (speedUpBtn) speedUpBtn.onclick = () => { speed = Math.min(speed + 0.005, 0.1); };
            if (speedDownBtn) speedDownBtn.onclick = () => { speed = Math.max(speed - 0.005, 0.001); };

            let animating = true;
            let animFrameId = null;
            if (toggleAnimBtn) {
                toggleAnimBtn.onclick = () => {
                    animating = !animating;
                    toggleAnimBtn.textContent = animating ? "Stop Animation" : "Start Animation";
                    if (animating) {
                        animFrameId = requestAnimationFrame(draw);
                    } else if (animFrameId) {
                        cancelAnimationFrame(animFrameId);
                    }
                };
            }

            let draw = function() {
                let isCollided = detectCollision(location[0], location[1]);
                if (isCollided) {
                    colorIndex = (colorIndex + 1) % COLOR_PALETTE.length;
                    currentColor = COLOR_PALETTE[colorIndex];
                    updateColorBuffer(device, colorBuffer, currentColor);
                }
                if (collidedX) {
                    location[0] -= speed;
                } else {
                    location[0] += speed;
                }
                if (collidedY) {
                    location[1] -= speed;
                } else {
                    location[1] += speed;
                }
                updateLocationBuffer(device, locationBuffer, new Float32Array(location));
                render(device, context, pipeline, vertexBuffer, bindGroupsObj.bindGroups);
                if (animating) {
                    animFrameId = requestAnimationFrame(draw);
                }
            };
            draw();
    })();
});

