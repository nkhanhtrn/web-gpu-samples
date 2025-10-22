// triangle.wgsl - WGSL shader for drawing a triangle

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv1 : vec2<f32>,
  @location(1) color : vec3<f32>,
};

@vertex
fn vs_main(
  @location(0) position: vec2<f32>,      // from posBuffer
  @location(1) uv1: vec2<f32>,           // from uvBuffer
  @location(2) color: vec3<f32>,         // from colorBuffer
  @builtin(instance_index) InstanceIndex : u32
) -> VertexOutput {
  let offset = f32(InstanceIndex) * 0.2;
  var out : VertexOutput;
  out.position = vec4<f32>(position.x + offset, position.y + offset, 0.0, 1.0);
  out.uv1 = uv1;
  out.color = color;
  return out;
}


@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture1: texture_2d<f32>;
@group(0) @binding(2) var myTexture2: texture_2d<f32>;

@fragment
fn fs_main(@location(0) uv1: vec2<f32>, @location(1) color: vec3<f32>) -> @location(0) vec4<f32> {
  let textureColor = textureSample(myTexture1, mySampler, uv1);
  let outColor = vec4<f32>(textureColor.rgb + color, textureColor.a);
  return outColor;
}