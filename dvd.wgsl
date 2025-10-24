struct LocUniform {
    offset: vec2<f32>
};
struct ColorUniform {
    color: vec4<f32>
};
@group(0) @binding(0) var<uniform> loc: LocUniform;
@group(0) @binding(1) var<uniform> colorUni: ColorUniform;

struct VertexOut {
    @builtin(position)position: vec4<f32>,
    @location(0) uv: vec2<f32>
};

@vertex
fn vs_main(@location(0) position : vec2<f32>, @location(1) uv : vec2<f32>) ->  VertexOut {
    var out: VertexOut;
    out.position = vec4<f32>(position + loc.offset, 0.0, 1.0);
    out.uv = uv;
    return out;
}

@group(1) @binding(0) var dvdSampler: sampler;
@group(1) @binding(1) var dvdTexture: texture_2d<f32>;
// Fragment shader
@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    var texColor = textureSample(dvdTexture, dvdSampler, uv);
    // Modulate texture color with uniform color
    let outColor = colorUni.color * texColor;
    return outColor;
}
