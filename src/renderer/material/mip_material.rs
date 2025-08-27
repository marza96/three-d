use crate::core::*;
use crate::renderer::*;

///
/// TODO: Describe
/// 
/// 
///
#[derive(Clone)]
pub struct MIPMaterial {
    /// The voxel data that defines the isosurface.
    pub voxels: std::sync::Arc<Texture3D>,
    /// Threshold (in the range [0..1]) that defines the surface in the voxel data.
    pub threshold: f32,
    /// Base surface color.
    pub color: Srgba,
    /// A value in the range `[0..1]` specifying how metallic the surface is.
    pub metallic: f32,
    /// A value in the range `[0..1]` specifying how rough the surface is.
    pub roughness: f32,
    /// The size of the cube that is used to render the voxel data. The texture is scaled to fill the entire cube.
    pub size: Vec3,
    /// The lighting model used when rendering this material
    pub lighting_model: LightingModel,
}

impl Material for MIPMaterial {
    fn id(&self) -> EffectMaterialId {
        EffectMaterialId::MIPMaterial
    }

    fn fragment_shader_source(&self, lights: &[&dyn Light]) -> String {
        let mut source = lights_shader_source(lights);
        source.push_str(ToneMapping::fragment_shader_source());
        source.push_str(ColorMapping::fragment_shader_source());
        source.push_str(include_str!("shaders/mip_material.frag"));
        source
    }

    fn use_uniforms(&self, program: &Program, viewer: &dyn Viewer, lights: &[&dyn Light]) {
        program.use_uniform("cameraPosition", viewer.position());
        program.use_uniform("size", self.size);
        program.use_texture_3d("tex", &self.voxels);
    }
    fn render_states(&self) -> RenderStates {
        RenderStates {
            blend: Blend::TRANSPARENCY,
            ..Default::default()
        }
    }
    fn material_type(&self) -> MaterialType {
        MaterialType::Transparent
    }
}

impl FromCpuVoxelGrid for MIPMaterial {
    fn from_cpu_voxel_grid(context: &Context, cpu_voxel_grid: &CpuVoxelGrid) -> Self {
        Self {
            voxels: std::sync::Arc::new(Texture3D::new(context, &cpu_voxel_grid.voxels)),
            lighting_model: LightingModel::Blinn,
            size: cpu_voxel_grid.size,
            threshold: 0.15,
            color: Srgba::WHITE,
            roughness: 1.0,
            metallic: 0.0,
        }
    }
}
