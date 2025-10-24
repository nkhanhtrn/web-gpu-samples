// Creates a bind group and layout for location, sampler, and texture
export function createBindGroupsAndLayouts(device, locationBuffer, sampler, texture, colorBuffer) {
    // Group 0: location buffer and color buffer
    const locationBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        ],
    });
    const locationBindGroup = device.createBindGroup({
        layout: locationBindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: locationBuffer } },
            { binding: 1, resource: { buffer: colorBuffer } },
        ],
    });

    // Group 1: sampler and texture
    const textureBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
        ],
    });
    const textureBindGroup = device.createBindGroup({
        layout: textureBindGroupLayout,
        entries: [
            { binding: 0, resource: sampler },
            { binding: 1, resource: texture.createView() },
        ],
    });

    return {
        bindGroups: [locationBindGroup, textureBindGroup],
        bindGroupLayouts: [locationBindGroupLayout, textureBindGroupLayout]
    };
}

// Creates a color uniform buffer
export function createColorBuffer(device) {
    return device.createBuffer({
        size: 16, // 4 * 4 bytes for vec4<f32>
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false,
    });
}

export function updateColorBuffer(device, buffer, colorArr) {
    // Always send 4 floats
    const arr = colorArr.length === 4 ? colorArr : [...colorArr, 1.0];
    device.queue.writeBuffer(buffer, 0, new Float32Array(arr).buffer);
}

// Loads an image and creates a WebGPU texture
export async function createTexture(device, url) {
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

export async function createSampler(device) {
    return device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        addressModeU: 'repeat',
        addressModeV: 'repeat'
    });
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
export function getSizeInPixels(x, y, screenWidth, screenHeight) {
    let pixelX = x / 2 * screenWidth;
    let pixelY = y / 2 * screenHeight;
    return { pixelX, pixelY };
}

export function getLocationInPixels(x, y, screenWidth, screenHeight) {
    let pixelX = ((x + 1) / 2) * screenWidth;
    let pixelY = ((1 - y) / 2) * screenHeight;
    return { pixelX, pixelY };
}
// Creates a vertex buffer for a triangle
export function createVertexBuffer(device, startX, startY, width, height) {
    const vertexData = new Float32Array([
           startX,         startY,          0.0, 0.0,
           startX + width, startY,          1.0, 0.0,
           startX,         startY - height, 0.0, 1.0,
           startX + width, startY - height, 1.0, 1.0
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
export async function createPipeline(device, format, bindGroupLayouts) {
    const shaderCode = await fetch('dvd.wgsl').then(res => res.text());
    const shaderModule = device.createShaderModule({ code: shaderCode });
    const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts });
    const pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: Float32Array.BYTES_PER_ELEMENT * 4, // 2 for position, 2 for uv
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x2', // position
                    },
                    {
                        shaderLocation: 1,
                        offset: Float32Array.BYTES_PER_ELEMENT * 2,
                        format: 'float32x2', // uv
                    }
                ],
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
    return pipeline;
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
export function render(device, context, pipeline, vertexBuffer, bindGroups) {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
        }],
    });
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setBindGroup(0, bindGroups[0]);
    pass.setBindGroup(1, bindGroups[1]);
    pass.draw(4, 1, 0, 0);
    pass.end();
    device.queue.submit([encoder.finish()]);
}