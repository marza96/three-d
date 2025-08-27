uniform vec3 cameraPosition;
uniform vec4 surfaceColor;
uniform float metallic;
uniform float roughness;
uniform sampler3D tex;
uniform vec3 size;
uniform float threshold;
uniform vec3 h;

in vec3 pos;

layout (location = 0) out vec4 outColor;

// Also not needed
vec3 estimate_normal(vec3 uvw) {
    float x = texture(tex, uvw + vec3(h.x, 0.0, 0.0)).r - texture(tex, uvw - vec3(h.x, 0.0, 0.0)).r;
    float y = texture(tex, uvw + vec3(0.0, h.y, 0.0)).r - texture(tex, uvw - vec3(0.0, h.y, 0.0)).r;
    float z = texture(tex, uvw + vec3(0.0, 0.0, h.z)).r - texture(tex, uvw - vec3(0.0, 0.0, h.z)).r;
    return -normalize(vec3(x, y, z) / (2.0 * h));
}

void main() {
    // Maybe parametrize number of steps along the ray 
    int steps = 200;
    vec3 rayDir = normalize(pos - cameraPosition);
    vec3 rayPos = pos;
    
    float stepSize = length(size) / float(steps);

    vec3 step = rayDir * stepSize;
    
    float max_val = 0.0; // Default value along the ray
    vec3 max_uvw = (rayPos / size) + 0.5;
    
    for (int i = 0; i < steps; i++) {
        if (rayPos.x < -0.501*size.x || rayPos.y < -0.501*size.y || rayPos.z < -0.501*size.z ||
        rayPos.x > 0.501*size.x || rayPos.y > 0.501*size.y || rayPos.z > 0.501*size.z) {
            // Out of bounds
            outColor = vec4(0.0, 0.0, 0.0, 0.0);
            break;
        }

        vec3 uvw = (rayPos / size) + 0.5;

        float val = texture(tex, uvw).r;

        if (val > max_val){
            max_val = val;
        }

        // Also do not need this (IsoSurface rendering quantity)
        float surfaceDensity = texture(tex, uvw).r - threshold;

        rayPos += step;
    }
    
    // Free to remove this, we do not need ani lightning for xray stuff
    vec3 normal = estimate_normal(max_uvw);
    outColor.rgb = calculate_lighting(cameraPosition, surfaceColor.rgb, rayPos, normal, metallic, roughness, 1.0);
    outColor.rgb = tone_mapping(outColor.rgb);
    outColor.rgb = color_mapping(outColor.rgb);
    outColor.a = surfaceColor.a;

    outColor = vec4(vec3(max_val), 1.0);

}
