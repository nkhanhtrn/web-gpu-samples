// triangle.wgsl - WGSL shader for drawing a triangle

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv1 : vec2<f32>,
  @location(1) uv2 : vec2<f32>
};

@vertex
fn vs_main(
  @builtin(vertex_index) VertexIndex : u32,
  @builtin(instance_index) InstanceIndex : u32
) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 0.5),   // top left
    vec2<f32>(-0.8, -0.5),  // bottom left
    vec2<f32>(0.8, -0.5),    // top right
  );
  var uv1 = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 0.0), // top left
    vec2<f32>(0.0, 1.0), // bottom left
    vec2<f32>(1.0, 0.0), // top right
  );
  var uv2 = array<vec2<f32>, 3>(
    vec2<f32>(0.5, 0.5),
    vec2<f32>(0.0, 1.0),
    vec2<f32>(0.5, 0.0),
  );

  let offset = f32(InstanceIndex) * 0.2;
  var out : VertexOutput;
  out.position = vec4<f32>(pos[VertexIndex].x + offset, pos[VertexIndex].y + offset, 0.0, 1.0);
  out.uv1 = uv1[VertexIndex];
  out.uv2 = uv2[VertexIndex];
  return out;
}


@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture1: texture_2d<f32>;
@group(0) @binding(2) var myTexture2: texture_2d<f32>;

@fragment
fn fs_main(@location(0) uv1: vec2<f32>, @location(1) uv2: vec2<f32>) -> @location(0) vec4<f32> {
  // Example: use vertex_index for color tint
  let color1 = textureSample(myTexture1, mySampler, uv1);
  let color2 = textureSample(myTexture2, mySampler, uv2);
  let blendFactor = 0.5;
  let blended = mix(color1, color2, blendFactor);
  return blended;
}