struct LocUniform {
    offset: vec2<f32>
};
@group(0) @binding(0) var<uniform> loc: LocUniform;

@vertex
fn vs_main(@location(0) position : vec2<f32>) -> @builtin(position) vec4<f32> {
    
    return vec4<f32>(position + loc.offset, 0.0, 1.0);
}

// Fragment shader
@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(0.8, 0.2, 0.2, 1.0);
}
