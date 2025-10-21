// Utility: Load an image and create a GPUTexture
async function loadTexture(device, url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const imageBitmap = await createImageBitmap(img);
  const texture = device.createTexture({
    size: [img.width, img.height, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: texture },
    [img.width, img.height]
  );
  return texture;
}
// main.js - WebGPU Boilerplate

async function initWebGPU() {
  if (!navigator.gpu) {
    alert('WebGPU is not supported in this browser.');
    return null;
  }
  const adapter = await navigator.gpu.requestAdapter(); // physicalDevice
  if (!adapter) {
    alert('No GPU adapter found.');
    return null;
  }
  const device = await adapter.requestDevice();
  const format = navigator.gpu.getPreferredCanvasFormat();
  return { device, format };
}

async function getCanvas(device, format) {
  const canvas = document.getElementById('webgpu-canvas');
  const context = canvas.getContext('webgpu');
  context.configure({ device, format });
  return context;
}

async function clearColor(device, context) {
  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: textureView,
      clearValue: { r: 0.2, g: 0.4, b: 0.6, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
}

// Draw a colored triangle using WebGPU
// Draw a colored square using WebGPU
// Draw a textured square using WebGPU
async function drawTexturedSquare(device, context, format) {
  // Load WGSL shader code from external file
  const response = await fetch('triangle.wgsl');
  const shaderCode = await response.text();
  const module = device.createShaderModule({ code: shaderCode });

  // Create sampler
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  // Load texture (wall.jpg)
  const texture1 = await loadTexture(device, 'wall.jpg');
  const texture2 = await loadTexture(device, 'wall.jpg'); // second texture
  // Create bind group layout and pipeline layout
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // second texture
    ],
  });
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  // Create pipeline (no multisampling)
  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: { module, entryPoint: 'vs_main' },
    fragment: { module, entryPoint: 'fs_main', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  });

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: sampler },
      { binding: 1, resource: texture1.createView() },
      { binding: 2, resource: texture2.createView() },
    ],
  });

  // Render pass (single-sample)
  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: textureView,
      clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.draw(3, 1, 0, 0);
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
}

// Main logic
window.addEventListener('DOMContentLoaded', async () => {
  const webgpu = await initWebGPU();
  if (!webgpu) return;
  const { device, format } = webgpu;
  const context = await getCanvas(device, format);

  document.getElementById('clear-btn').onclick = () => clearColor(device, context);
  document.getElementById('triangle-btn').onclick = () => drawTexturedSquare(device, context, format);
  // Draw clear color by default
  clearColor(device, context);
});

// More advanced concepts can be added as new functions and buttons.
// For example: vertex buffers, compute shaders, textures, etc.
