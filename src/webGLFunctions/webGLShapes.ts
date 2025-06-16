import { vec2, vec3, clamp, mat4, Camera, roundTo, vec4} from "./webGLutils";
import { useRef } from "react";

// base class for all other shapes
export abstract class glBase {
    gl : WebGL2RenderingContext;
    program : WebGLProgram;
    _position : vec2 | vec3 | vec4;
    _rotation : vec3;
    _scale : vec3;
    _transparency : number;
    CTM : mat4; // current transformation matrix
    #perspectiveMatrix : mat4 = new mat4();
    #cameraRef : React.MutableRefObject<Camera> | null = null;
    // todo: change this to a point
    points= new Float32Array([
        //bottom face
        -1.0, -1.0, 1.0,
        0.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        //front face
        1.0, -1.0, 1.0,
        0.0, 1.0, 0.0,
        -1.0, -1.0, 1.0,
        //left face
        -1.0, -1.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, -1.0, -1.0,
        //right face
        1.0, -1.0, 1.0,
        0.0, -1.0, -1.0,
        0.0, 1.0, 0.0,
    ]);

    
    colors : number[] = [];
    //WebGL stuff
        //buffers
    vertexBuffer : WebGLBuffer | null;
    fragmentBuffer : WebGLBuffer | null;
    //attribute locations
    positionLoc : number | null = null;
    colorLoc : number | null = null;
        //uniforms
    CTMUniform : WebGLUniformLocation | null | undefined;
    transparencyUniform : WebGLUniformLocation | null | undefined;
    viewUniform : WebGLUniformLocation | null | undefined;
    persUniform : WebGLUniformLocation | null | undefined;


    constructor(gl: WebGL2RenderingContext, shaderProgram : WebGLProgram, position : vec3, rotation : vec3, scale : vec3, transparency : number = 1.0) {  
        this.gl=gl;
        this.program = shaderProgram;
        this._position = position;
        this._rotation = rotation;
        this._scale = scale;
        //clamp transparency between 1 and 0
        this._transparency = clamp(transparency, 0, 1);
        //buffers
        this.vertexBuffer = this.gl?.createBuffer(); //vertex buffer
        this.fragmentBuffer = this.gl?.createBuffer();
        //uniforms
        this.CTMUniform = this.gl?.getUniformLocation(this.program, "CTM");
        this.transparencyUniform = gl?.getUniformLocation(this.program, "transparency");
        this.viewUniform = gl?.getUniformLocation(this.program, "view");
        this.persUniform = gl?.getUniformLocation(this.program, "perspective");

        this.CTM = new mat4();
    }
    get perspectiveMatrix() {
        return this.#perspectiveMatrix;
    }
    set perspectiveMatrix(pers : mat4) {
        this.#perspectiveMatrix = pers;
    }

    //typescript thinks this is still nullable even though we specifically say that it is not
    get cameraRef() : React.MutableRefObject<Camera> {
        if (this.#cameraRef==null) {
            return useRef(new Camera(new vec3(0,0,0))) //fallback to 0,0,0 camera
        }
        else {
            return this.#cameraRef;
        }
    }
    set cameraRef(ref : React.MutableRefObject<Camera> | null) {
        this.#cameraRef = ref;
    }

    get position() : vec2 | vec3 | vec4 {
        return this._position;
    }
    set position(position : vec2 | vec3 | vec4) {
        this._position = position;
    }
    get rotation() : vec3 {
        return this._rotation;
    }
    set rotation(rotation : vec3) {
        this._rotation = rotation;
    }
    get scale() : vec3 {
        return this._scale;
    }
    set scale(scale : vec3) {
        this._scale = scale;
    }
    // call after initializing the object
    // you can just put this in the constructor if it does not require any extra math
    // or you can extend the method further using super.initBuffers()
    initBuffers() {
        this.gl.useProgram(this.program);
        if (this.vertexBuffer== null || this.fragmentBuffer ==null) {alert("Failed to allocate buffer for WebGL");} 
        else {
            // vertex shader
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.points, this.gl.STATIC_DRAW);
            this.positionLoc = this.gl.getAttribLocation(this.program, "aPosition");
            this.gl.vertexAttribPointer(this.positionLoc, 3, this.gl.FLOAT, false, 0, 0);  
            this.gl.enableVertexAttribArray(this.positionLoc);

            // fragment shader
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fragmentBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);
            this.colorLoc = this.gl.getAttribLocation(this.program, "aColor");
            this.gl.vertexAttribPointer(this.colorLoc, 4, this.gl.FLOAT, false, 0, 0)
            this.gl.enableVertexAttribArray(this.colorLoc);
        }
    }

    // similar to initbuffers() except we do not bufferData again since it is already in the WebGL buffer
    bindBuffers() {
        this.gl.useProgram(this.program);

        // enable the attribs
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.positionLoc!, 3, this.gl.FLOAT, false, 0, 0);  
        this.gl.enableVertexAttribArray(this.positionLoc!);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fragmentBuffer);
        this.gl.vertexAttribPointer(this.colorLoc!, 4, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.colorLoc!);
        
    }
    
    // set all the uniforms
    setUniforms() {
        this.gl.useProgram(this.program);
        this.gl.uniformMatrix4fv(this.CTMUniform!, false, new Float32Array(this.CTM.flatten()));
        this.gl.uniformMatrix4fv(this.persUniform!, false, new Float32Array(this.perspectiveMatrix.flatten()));
        this.gl.uniformMatrix4fv(this.viewUniform!, false, new Float32Array(this.cameraRef.current.view.flatten()));
        this.gl.uniform1f(this.transparencyUniform!, 1.0);
    }

    draw() {
        // basic draw call
        this.gl.useProgram(this.program);
        this.bindBuffers();
        this.setUniforms();
        
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.points.length / 3);
    }
    
    
}

export class trianglePyramid extends glBase {
    points= new Float32Array([
        //bottom face
        -1.0, -1.0, 1.0,
        0.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        //front face
        1.0, -1.0, 1.0,
        0.0, 1.0, 0.0,
        -1.0, -1.0, 1.0,
        //left face
        -1.0, -1.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, -1.0, -1.0,
        //right face
        1.0, -1.0, 1.0,
        0.0, -1.0, -1.0,
        0.0, 1.0, 0.0,
    ]);

    
    constructor(gl: WebGL2RenderingContext, shaderProgram : WebGLProgram, position : vec3, rotation : vec3, scale : vec3, 
                transparency : number = 1.0, faceColors : number[][] | undefined | null) {
        if (faceColors == undefined) {
            faceColors = [
                [1.0, 0.1, 0.1, 1.0], // red on all sides
                [1.0, 0.1, 0.1, 1.0],
                [1.0, 0.1, 0.1, 1.0],
                [1.0, 0.1, 0.1, 1.0]
            ];
        }
        
        // call parent constructor
        super(gl, shaderProgram, position, rotation, scale, transparency);
        
        // now we override the parent's colors since it is wrong
        for (let i=0;i<faceColors.length;i++) {
            const c = faceColors[i];
            this.colors=this.colors.concat(c, c, c);
        }  

        // now that we have all the necessary info, we can initBuffers
        this.initBuffers();
    }
    
}

enum sphereModes {
    WIREFRAME=0,
    SOLID=1,
    TEXTURED=2
}

export class sphere extends glBase {
    indexBuffer: WebGLBuffer | null;
    wireframeIndexBuffer: WebGLBuffer | null;
    wireframeColorBuffer : WebGLBuffer | null;
    indices : number[];
    lineIndices : number[];
    lineColor : vec4; // singleton of the color of the lines (i.e. all the lines have this color)
    lineColors : number[]; // lineColor concatenated by however many points we have
    faceColor: vec4; // singleton of the color of the faces
    _mode! : sphereModes;
    constructor(gl: WebGL2RenderingContext, shaderProgram : WebGLProgram, sectorCount : number = 5, stackCount : number = 5, radius :number = 3, 
        position : vec3, rotation : vec3, scale : vec3, transparency : number = 1.0, faceColors? : vec4 | undefined | null, lineColor? : vec4 | undefined | null) {
                
        
        super(gl, shaderProgram, position, rotation, scale, transparency);  
        
        if (!lineColor) {
            this.lineColor = new vec4(1.0, 0.1, 0.1, 1.0);
        }
        else {
            this.lineColor = lineColor;
            this._mode = sphereModes.WIREFRAME; // Automatically set mode. Cascading priority: texture > solid > wireframe
        }
        
        if (faceColors == undefined) {
            this.faceColor = new vec4(1.0, 0.1, 0.1, 1.0);
        }
        else {
            this.faceColor = faceColors;
            this._mode = sphereModes.SOLID;
        }
        
        // Yes, typescript, I know that this may not be assigned, which is why I am manually checking it and assigning it dumbass
        // according to the internet, the proper way is to declare mode as sphereModes|undefined, but that is stupid because it ISN'T supposed to be undefined, and declaring it
        // undefined guarantees that I will be set up for errors down the road
        // this is why mode has a !
        if (typeof this.mode === undefined || this.mode  === null) {
            this._mode=sphereModes.SOLID
        }

        this.indexBuffer = gl.createBuffer();
        this.wireframeIndexBuffer = gl.createBuffer();
        this.wireframeColorBuffer = gl.createBuffer();
        if (this.indexBuffer == null || this.wireframeIndexBuffer == null|| this.wireframeColorBuffer == null) {
            alert("Failed to allocate index buffer");
        }
    
        let points = [];
        let lineColors : number[] = [];
        let texCoords = [];
        let normals = [];

        let sectorStep = 2 * Math.PI / sectorCount;
        let stackStep = Math.PI / stackCount;
        let stackAngle, sectorAngle;

        let x, y, z; // coords for vertices
        let s, t; // texture coords
        let lengthInverse = 1.0 / radius;

        // math to calculate the points based on sector and stack count, and radius
        for (let i = 0; i <= stackCount; ++i) {
            stackAngle = Math.PI / 2 - i * stackStep;
            //floating point error rounding, to 3 decimal places
            y = radius * roundTo(Math.sin(stackAngle), 3);

            for (let j = 0; j <= sectorCount; ++j) {
                sectorAngle = j * sectorStep;
                z = radius * roundTo(Math.cos(stackAngle), 3) * roundTo(Math.cos(sectorAngle), 3);
                x = radius * roundTo(Math.cos(stackAngle), 3) * roundTo(Math.sin(sectorAngle), 3);

                points.push(x);
                points.push(y);
                points.push(z);
                
                this.colors = this.colors.concat(this.faceColor.array(), this.faceColor.array(), this.faceColor.array());
                
                s = j / sectorCount;
                t = i / stackCount;
                texCoords.push(s);
                texCoords.push(t);

                normals.push(x * lengthInverse, y * lengthInverse, z * lengthInverse);
            }
        }

        //convert to float 32
        this.points = new Float32Array(points);

        let indices = [];
        let lineIndices = []; // for wireframe
        let k1, k2;
        for (let i = 0; i <= stackCount; ++i) {
            k1 = i * (sectorCount + 1);
            k2 = k1 + sectorCount + 1;
            for (let j = 0; j <= sectorCount; ++j, ++k1, ++k2) {
                if (i != 0) {
                    indices.push(k1);
                    indices.push(k2);
                    indices.push(k1 + 1);
                }
                if (i != (stackCount - 1)) {
                    indices.push(k1 + 1);
                    indices.push(k2);
                    indices.push(k2 + 1);
                }

                lineIndices.push(k1);
                lineIndices.push(k2);
                lineColors = lineColors.concat(this.lineColor.array(), this.lineColor.array());
                if (i != 0) {
                    lineIndices.push(k1);
                    lineIndices.push(k1 + 1);
                    lineColors = lineColors.concat(this.lineColor.array(), this.lineColor.array());
                }
            }
        }
        this.indices = indices;
        this.lineIndices = lineIndices;
        this.lineColors = lineColors
        this.initBuffers();
    }
    
    get mode() : string {
        return sphereModes[this._mode]
    }

    set mode(str : keyof typeof sphereModes) {
        if (str in sphereModes) {
            this._mode = sphereModes[str]
        }
    }
    initBuffers() {
        //we have to extend the parent method since this uses an index buffer
        super.initBuffers();

        //load index
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);  
        //load line indices
        // wireframe, color, and textures are all loaded in the same function
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.lineIndices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.positionLoc!, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.positionLoc!);
        
        //load line colors
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wireframeColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.lineColors), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.colorLoc!, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.colorLoc!);
        
    }
    bindBuffers() {
        super.bindBuffers()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }
    // set buffers for wiremesh lines only
    bindLineBuffers() {
        // load points
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.positionLoc!, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.positionLoc!);

        //load line indices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer!);
        this.gl.vertexAttribPointer(this.positionLoc!, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.positionLoc!);

        //load line colors
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wireframeColorBuffer);
        this.gl.vertexAttribPointer(this.colorLoc!, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.colorLoc!);

    }
    drawWireFrame(color : vec4) {
        if (!this.lineColor.equals(color)) {
            this.lineColor = color;
            this.initBuffers();
        }
        // only load the lines in
        this.gl?.useProgram(this.program);
        this.bindLineBuffers();
        this.gl.drawElements(this.gl.LINES, this.lineIndices.length, this.gl.UNSIGNED_SHORT, 0);
    }
    drawColor(color: vec4) {
        if (!this.faceColor.equals(color)) {
            this.faceColor = color;
            this.initBuffers();
        }
        this.gl?.useProgram(this.program);
        this.bindBuffers();
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
    draw() {
        if (this._mode === sphereModes.WIREFRAME) {
            this.drawWireFrame(this.lineColor);
        }
        else if (this._mode === sphereModes.SOLID) {
            this.drawColor(this.faceColor);
        }
        else {
            //to do: add textured draw mode
            
        }
    }
}
            