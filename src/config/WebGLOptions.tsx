
export const DEFAULT_WEBGL_ATTRIBUTES: WebGLContextAttributes = {
    alpha: true,
    antialias: false,
    depth: true,
    desynchronized: true,
    failIfMajorPerformanceCaveat: undefined,
    powerPreference: "default",
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
};

interface configObj {
  [key: string] : boolean | Object | string;
  showDebugInfo : boolean;
  glConfig: Object;
  activeProgram: string;
  programs: { 
    [key: string] : {shaderConfig: {vertex:string, fragment:string}}
  }
}
export const webglconfig : configObj = {
    showDebugInfo: true,
    glConfig: {
        backgroundColor: { r: 0, g: 0.1, b: 0, a: 1 },
    },
    activeProgram: "sample-multicolor",
    programs: {
      sample_multicolor : {
        shaderConfig: {
            vertex:
                `#version 300 es

                precision highp float;
                in vec4 position;
                in vec3 color;
                
                out vec3 vColor;

                void main() {
                    vColor = color;
                    gl_Position = position;
                }
              `,
            fragment:
                `#version 300 es

                precision highp float;
                in vec3 vColor;
                out vec4 fragColor;

                void main() {
                    fragColor = vec4(vColor, 1.0);
                }
              `
        }
      },
      three_lights: {
        shaderConfig: {
              vertex:
                  `#version 300 es
          in vec4 aPosition;

          uniform mat4 CTM;
          uniform mat4 perspective;
          uniform mat4 view;
          
          in vec4 aColor;
          out vec4 vColor;
          in vec3 aNormal;
          out vec3 N, L, E;

          in vec2 aTexCoord;
          out vec2 vTexCoord;

          uniform vec4 uLightPosition1;
          uniform vec4 uLightPosition2;
          uniform vec4 uLightPosition3;
          uniform mat3 uNormalMatrix;
          uniform vec4 uAmbientProduct1, uDiffuseProduct1, uSpecularProduct1;
          uniform vec4 uAmbientProduct2, uDiffuseProduct2, uSpecularProduct2;
          uniform vec4 uAmbientProduct3, uDiffuseProduct3, uSpecularProduct3;
          uniform float uShininess;

          vec4 calcLights(vec4 lightPos, vec3 pos, vec3 N, vec4 AmbientProduct, vec4 DiffuseProduct, vec4 SpecularProduct, float Shininess);
          void main()
          {
            gl_Position = aPosition;
            //gl_Position = (aPosition + vec4(aNormal.xyz * 0.1, 0)); // moves vertices in the direction of the normals
            gl_Position = perspective * view * CTM * gl_Position; 
            vec3 pos = uNormalMatrix * aPosition.xyz;
            
            // transform normals
            vec3 NN = uNormalMatrix * aNormal;
            // Transform vertex normal into eye coordinates

            vec3 N = normalize(NN);

            vec4 result1 = calcLights(uLightPosition1, pos, N, uAmbientProduct1, uDiffuseProduct1, uSpecularProduct1, uShininess);
            vec4 result2 = calcLights(uLightPosition2, pos, N, uAmbientProduct2, uDiffuseProduct2, uSpecularProduct2, uShininess);
            vec4 result3 = calcLights(uLightPosition3, pos, N, uAmbientProduct3, uDiffuseProduct3, uSpecularProduct3, uShininess);

            vColor = (result1) * (result2) * (result3) * (aColor);
            vColor.a = 1.0;
            vTexCoord = aTexCoord;    
          }
          vec4 calcLights(vec4 lightPos, vec3 pos, vec3 N, vec4 AmbientProduct, vec4 DiffuseProduct, vec4 SpecularProduct, float Shininess) {
            // repeat for other lights
            vec3 light = lightPos.xyz;
            vec3 L = normalize(light - pos);

            vec3 E = normalize(-pos);

            vec3 H = normalize(L + E);

            // Compute terms in the illumination equation
            vec4 ambient = AmbientProduct;
            
            float Kd = max(dot(L, N), 0.0);
            vec4 diffuse = Kd * DiffuseProduct;
            
            float Ks = pow( max(dot(N, H), 0.0), Shininess );
            vec4 specular = Ks * SpecularProduct;
            
            if( dot(L, N) < 0.0 ) {
            specular = vec4(0.0, 0.0, 0.0, 1.0);
            }
            
            return (ambient + diffuse + specular);
          }
                `,
              fragment:
                  `
          #version 300 es
          precision mediump float;
          in vec4 vColor;
          out vec4 FragColor;

          in vec2 vTexCoord;
          uniform sampler2D uTextureMap;
          uniform float transparency;
          void main()
          {
            vec4 texelColor = texture(uTextureMap, vTexCoord);
            FragColor = texelColor * vColor;
            FragColor.a = texelColor.a * transparency;
          }
                `
        },
      },
      one_light : {
        shaderConfig: {
              vertex:
                  `#version 300 es
          in vec4 aPosition;

          uniform mat4 CTM;
          uniform mat4 perspective;
          uniform mat4 view;
          
          in vec4 aColor;
          out vec4 vColor;
          in vec3 aNormal;
          out vec3 N, L, E;

          in vec2 aTexCoord;
          out vec2 vTexCoord;

          uniform vec4 uLightPosition1;
          uniform mat3 uNormalMatrix;
          uniform vec4 uAmbientProduct1, uDiffuseProduct1, uSpecularProduct1;
          uniform float uShininess;

          vec4 calcLights(vec4 lightPos, vec3 pos, vec3 N, vec4 AmbientProduct, vec4 DiffuseProduct, vec4 SpecularProduct, float Shininess);
          void main()
          {
            gl_Position = aPosition;
            //gl_Position = (aPosition + vec4(aNormal.xyz * 0.1, 0)); // moves vertices in the direction of the normals
            gl_Position = perspective * view * CTM * gl_Position; 
            vec3 pos = uNormalMatrix * aPosition.xyz;
            
            // transform normals
            vec3 NN = uNormalMatrix * aNormal;
            // Transform vertex normal into eye coordinates

            vec3 N = normalize(NN);

            vec4 result1 = calcLights(uLightPosition1, pos, N, uAmbientProduct1, uDiffuseProduct1, uSpecularProduct1, uShininess);
            
            vColor = (result1) * (aColor);
            vColor.a = 1.0;
            vTexCoord = aTexCoord;    
          }
          vec4 calcLights(vec4 lightPos, vec3 pos, vec3 N, vec4 AmbientProduct, vec4 DiffuseProduct, vec4 SpecularProduct, float Shininess) {
            // repeat for other lights
            vec3 light = lightPos.xyz;
            vec3 L = normalize(light - pos);

            vec3 E = normalize(-pos);

            vec3 H = normalize(L + E);

            // Compute terms in the illumination equation
            vec4 ambient = AmbientProduct;
            
            float Kd = max(dot(L, N), 0.0);
            vec4 diffuse = Kd * DiffuseProduct;
            
            float Ks = pow( max(dot(N, H), 0.0), Shininess );
            vec4 specular = Ks * SpecularProduct;
            
            if( dot(L, N) < 0.0 ) {
            specular = vec4(0.0, 0.0, 0.0, 1.0);
            }
            
            return (ambient + diffuse + specular);
          }
                `,
              fragment:
                  `
          #version 300 es
          precision mediump float;
          in vec4 vColor;
          out vec4 FragColor;

          in vec2 vTexCoord;
          uniform sampler2D uTextureMap;
          uniform float transparency;
          void main()
          {
            vec4 texelColor = texture(uTextureMap, vTexCoord);
            FragColor = texelColor * vColor;
            FragColor.a = texelColor.a * transparency;
          }
                `
        },
      },
      unshaded_untextured : {
        shaderConfig: {
              vertex:
`#version 300 es
in vec4 aPosition;

uniform mat4 CTM;
uniform mat4 perspective;
uniform mat4 view;
in vec4 aColor;
out vec4 vColor;
void main()
{
  gl_Position = aPosition;
  gl_Position = perspective * view * CTM * gl_Position;
  vColor = aColor;
}`,
              fragment:
`#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 FragColor;
uniform float transparency;
void main()
{
  FragColor = vColor;
  FragColor.a = FragColor.a * transparency;
}`
        },
      },
      unshaded_textured : {
        shaderConfig: {
              vertex:
                  `#version 300 es
  
            in vec4 aPosition;

            uniform mat4 CTM;
            uniform mat4 perspective;
            uniform mat4 view;
            

            in vec2 aTexCoord;
            out vec2 vTexCoord;

            void main()
            {
              gl_Position = aPosition;
              gl_Position = perspective * view * CTM * gl_Position;
              vTexCoord = aTexCoord;
            }
                `,
              fragment:
                  `#version 300 es
          precision mediump float;
          out vec4 FragColor;

          in vec2 vTexCoord;
          uniform sampler2D uTextureMap;

          uniform float transparency;
          void main()
          {
            FragColor = texture(uTextureMap, vTexCoord);
            FragColor.a = FragColor.a * transparency;
          }
                `
        },
      },
      basic : {
        shaderConfig : {
          vertex : 
`#version 300 es
in vec4 aPosition;
uniform mat4 CTM;
uniform mat4 perspective;
uniform mat4 view;
in vec4 aColor;
out vec4 vColor;
void main()
{
  gl_Position = perspective * view * CTM * aPosition ;
  vColor = aColor;
}`,
              fragment:
`#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 FragColor;
uniform float transparency;
void main()
{
  FragColor = vColor;
  FragColor.a = FragColor.a * transparency;
}`
        }
      }
    }
};