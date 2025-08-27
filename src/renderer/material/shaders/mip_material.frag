uniform vec3 cameraPosition;
uniform sampler3D tex;
uniform vec3 size;

in vec3 pos;

layout (location = 0) out vec4 outColor;

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

        rayPos += step;
    }

    outColor = vec4(vec3(max_val), 1.0);

}
