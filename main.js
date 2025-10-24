// main.js
import { createWebGPU, getSizeInPixels, getLocationInPixels, createVertexBuffer, createPipeline, render, createLocationBuffer, updateLocationBuffer, createTexture, createBindGroupsAndLayouts, createSampler } from './webgpu.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const DVD_WIDTH = 0.5;
const DVD_HEIGHT = 0.4;
const START_X = -0.3;
const START_Y = 0.2;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gpu-canvas');
    const errorDiv = document.getElementById('error');
    (async () => {
            const webgpu = await createWebGPU(canvas, errorDiv);
            if (!webgpu) return;
            const { device, context, format } = webgpu;
            const vertexBuffer = createVertexBuffer(device, START_X, START_Y, DVD_WIDTH, DVD_HEIGHT);
            const texture = await createTexture(device, "assets/dvd.png");
            const sampler = await createSampler(device);
            const locationBuffer = createLocationBuffer(device);
            // Create bind groups and layouts using helper
            const bindGroupsObj = createBindGroupsAndLayouts(device, locationBuffer, sampler, texture);
            const pipeline = await createPipeline(device, format, bindGroupsObj.bindGroupLayouts);

            let location = [0.00, 0.00];
            let collidedX = Math.random() < 0.5;
            let collidedY = Math.random() < 0.5;
            let { pixelX: dvdWidth, pixelY: dvdHeight } = getSizeInPixels(DVD_WIDTH , DVD_HEIGHT , SCREEN_WIDTH, SCREEN_HEIGHT);
            console.log(dvdWidth, dvdHeight);
            let detectCollision = function(x, y) {
                let collided = false;
                let { pixelX: objectX, pixelY: objectY } = getLocationInPixels(x, y, SCREEN_WIDTH, SCREEN_HEIGHT);
                //console.log(objectX, objectY);
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

            let draw = function() {
                let isCollided = detectCollision(location[0], location[1]);
                if (collidedX) {
                    location[0] -= 0.01;
                } else {
                    location[0] += 0.01;
                }
                if (collidedY) {
                    location[1] -= 0.01;
                } else {
                    location[1] += 0.01;
                }
                //console.log(location[0], location[1]);
                updateLocationBuffer(device, locationBuffer, new Float32Array(location));
                render(device, context, pipeline, vertexBuffer, bindGroupsObj.bindGroups);
                requestAnimationFrame(draw);
            };
            draw();
    })();
});

