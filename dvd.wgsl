struct LocUniform {
    offset: vec2<f32>
};
@group(0) @binding(0) var<uniform> loc: LocUniform;

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
    var color = textureSample(dvdTexture, dvdSampler, uv);
    //return vec4<f32>(0.2, 0.3, 0.4, 1.0);
    return color;
}
