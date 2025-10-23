// main.js
import { createWebGPU, createVertexBuffer, createPipeline, render, createLocationBuffer, updateLocationBuffer } from './webgpu.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gpu-canvas');
    const errorDiv = document.getElementById('error');
    (async () => {
        const webgpu = await createWebGPU(canvas, errorDiv);
        if (!webgpu) return;
        const { device, context, format } = webgpu;
        const vertexBuffer = createVertexBuffer(device);
        const locationBuffer = createLocationBuffer(device);
        const pipeline = await createPipeline(device, format);

        let location = new Float32Array([0.0, 0.0]);
        let draw = function() {
            location[0] += 0.01;
            location[1] += 0.01;
            updateLocationBuffer(device, locationBuffer, location);
            render(device, context, pipeline, vertexBuffer, locationBuffer);
            requestAnimationFrame(draw);
        };
        draw();
    })();
});
