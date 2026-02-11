import { BitmapLayer } from '@deck.gl/layers';


// Fragment Shader: Visualizes the 1-byte visibility mask
// Data comes in as Red channel (R8) if using single channel texture,
// or we just pack it. 
// For simplicity with standard BitmapLayer, we might need to rely on the texture being loaded as Luminance if strictly 1-byte.
// But BitmapLayer usually expects RGBA or Image.
// We'll try to treat it as a texture where value > 0 is visible.

const fs = `\
#version 300 es
precision highp float;

uniform sampler2D bitmapTexture;
uniform vec4 bounds;
uniform float opacity;
uniform float uShowShadows;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    vec4 texColor = texture(bitmapTexture, vTexCoord);
    
    float visible = texColor.r;
    
    if (visible > 0.0) {
        // Visible: Brand Purple (#a855f7 = RGB 168,85,247 / 255 = 0.659, 0.333, 0.969)
        fragColor = vec4(0.659, 0.333, 0.969, 0.5);
    } else {
        // Obstructed: Brand Purple (#a855f7)
        // uShowShadows > 0.5 means enabled
        float shadowAlpha = (uShowShadows > 0.5) ? 0.4 : 0.0;
        fragColor = vec4(0.66, 0.33, 0.97, shadowAlpha);
    }
}
`;

export default class WasmViewshedLayer extends BitmapLayer {
  getShaders() {
    return {
      ...super.getShaders(),
      fs
    };
  }

  draw(opts) {
    const { bounds } = this.props;
    const uniforms = {
        bounds: bounds || [0, 0, 0, 0],
        opacity: this.props.opacity !== undefined ? this.props.opacity : 1.0,
        uShowShadows: this.props.showShadows ? 1.0 : 0.0
    };
    if (this.state.model && this.state.model.shaderInputs) {
      this.state.model.shaderInputs.setProps({ uniforms });
    }
    super.draw(opts); // Pass opts as is
  }
}

WasmViewshedLayer.layerName = 'WasmViewshedLayer';
WasmViewshedLayer.defaultProps = {
    ...BitmapLayer.defaultProps,
    showShadows: { type: 'boolean', value: false }
};
