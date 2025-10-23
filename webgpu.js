// Loads an image and creates a WebGPU texture
export async function loadTexture(device, url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load texture: ${url}`);
    }
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    const texture = device.createTexture({
        size: [imageBitmap.width, imageBitmap.height, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    device.queue.copyExternalImageToTexture(
        { source: imageBitmap },
        { texture: texture },
        [imageBitmap.width, imageBitmap.height, 1]
    );
    return texture;
}
// Initializes WebGPU and returns device, context, format
export async function createWebGPU(canvas, errorDiv) {
    if (!navigator.gpu) {
        errorDiv.textContent = 'WebGPU is not supported in this browser.';
        return null;
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        errorDiv.textContent = 'Failed to get GPU adapter.';
        return null;
    }
    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format,
        alphaMode: 'opaque',
    });
    return { device, context, format };
}

// Creates a vertex buffer for a triangle
export function createVertexBuffer(device) {
    const vertexData = new Float32Array([
        -0.3,  0.2,
         0.3,  0.2,
        -0.3, -0.2,
         0.3, -0.2,
    ]);
    const vertexBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(vertexData);
    vertexBuffer.unmap();
    return vertexBuffer;
}

// Loads WGSL shader and creates a pipeline
export async function createPipeline(device, format) {
    const shaderCode = await fetch('dvd.wgsl').then(res => res.text());
    const shaderModule = device.createShaderModule({ code: shaderCode });
    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x2',
                }],
            }],
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{ format }],
        },
        primitive: {
            topology: 'triangle-strip',
        },
    });
    // Create bind group layout and bind group for locationBuffer
    const bindGroupLayout = pipeline.getBindGroupLayout(0);
    return { pipeline, bindGroupLayout };
}

export function createLocationBuffer(device) {
    return device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false,
    });
}

export function updateLocationBuffer(device, buffer, data) {
    device.queue.writeBuffer(buffer, 0, data.buffer, data.byteOffset, data.byteLength);
}
// Renders a square using locationBuffer
export function render(device, context, pipelineObj, vertexBuffer, locationBuffer) {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
        }],
    });
    pass.setPipeline(pipelineObj.pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    const bindGroup = device.createBindGroup({
        layout: pipelineObj.bindGroupLayout,
        entries: [{ binding: 0, resource: { buffer: locationBuffer } }],
    });
    pass.setBindGroup(0, bindGroup);
    pass.draw(4);
    pass.end();
    device.queue.submit([encoder.finish()]);
}