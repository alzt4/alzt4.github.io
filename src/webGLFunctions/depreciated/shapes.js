//
//
// There are extra functions and parameters because I copied this file from my final project files,
// and I don't have time to clean this up. I apologise for the bad commenting, some of them are either old or copy pasted from somewhere else
// 
//

//for resetting textures
var whiteTexture;
var whitePixel = new Uint8Array([255, 255, 255, 255]);


class glBase {
    constructor(shaderProgram, transparency = 1.0, translation = [0, 0, 0], rotation = [0, 0, 0], scale = [0.75, 0.75, 0.75], visible = true, shaded=true) {
        this.programInfo = shaderProgram;
        this.transparency = transparency;

        gl.useProgram(this.programInfo);

        // Load the data into the GPU
        let bufferId = gl.createBuffer();

        // Associate out shader variables with our data buffer
        let aPosition = gl.getAttribLocation(this.programInfo, "aPosition");

        //Load color data into another buffer
        let colorBuffer = gl.createBuffer();

        //Associate our color buffer with the shader
        let aColor = gl.getAttribLocation(this.programInfo, "aColor");
        
        // index buffer
        let indexBuffer = gl.createBuffer();
        
        // texture buffer
        let tBuffer = gl.createBuffer();
        let texCoordLoc = gl.getAttribLocation(this.programInfo, "aTexCoord");

        //normal buffer
        var nBuffer = gl.createBuffer();
        var normalLoc = gl.getAttribLocation(this.programInfo, "aNormal");

        //normal buffer
        //let nBuffer = gl.createBuffer();
        //let normalLoc = gl.getAttribLocation(program, "aNormal");
        //empty as this is just the base class
        this.points = [];
        this.colors = [];
        let CTMLoc = gl.getUniformLocation(this.programInfo, "CTM");
        let persLoc = gl.getUniformLocation(this.programInfo, "perspective");
        let viewLoc = gl.getUniformLocation(this.programInfo, "view");
        let normalMatrixLoc = gl.getUniformLocation(this.programInfo, "uNormalMatrix");
        let transparencyLoc = gl.getUniformLocation(this.programInfo, "transparency");
        // rotation values for each axis as a single matrix
        this.rotation = rotation;
        // same, but for scale
        this.scale = scale;
        this.translation= translation;
        this.CTM= identityMatrix(); //initialize as empty
        this.perspectiveMatrix = identityMatrix();
        this.viewMatrix = identityMatrix();
        this.normalMatrix = identityMatrix();
        this.numComponents = 0;
        this.bufferInfo = {
            vertexBuffer: bufferId, 
            positionLoc: aPosition, 
            colorBuffer: colorBuffer, 
            colorLoc: aColor, 
            indexBuffer: indexBuffer,
            textureBuffer: tBuffer, 
            texCoordLoc: texCoordLoc, 
            normalBuffer: nBuffer, 
            normalLoc: normalLoc,
        };
        this.material = {
            // we just make everything perfectly reflective by default
            ambient: [1.0, 1.0, 1.0, 1.0],
            diffuse: [1.0, 1.0, 1.0, 1.0],
            specular: [1.0, 1.0, 1.0, 1.0],
            shininess: 100.0
        };
        this.CTMLoc = CTMLoc;
        this.persLoc = persLoc;
        this.viewLoc = viewLoc;
        this.transparencyLoc= transparencyLoc;
        this.normalMatrixLoc = normalMatrixLoc;
        this.visible = visible;
        this.shaded = shaded; // controls if this object is affected by lighting
        this.indicies = []; // empty index array
        this.texCoords = []; //texture coords array
        this.texture = whiteTexture; //all objects default to no textures
        this.normals = []; //normal array
    }
    //function to set uniform values
    setUniforms() {
        
        gl.uniformMatrix4fv(this.CTMLoc, false, this.CTM);
        gl.uniformMatrix4fv(this.persLoc, false, this.perspectiveMatrix);
        gl.uniformMatrix4fv(this.viewLoc, false, this.viewMatrix);
        gl.uniform1f(this.transparencyLoc, this.transparency);


        //only set if this object has a normal
        if (this.normals.length>0) {
            gl.uniformMatrix3fv(this.normalMatrixLoc, false, new Float32Array(this.normalMatrix));
            // Lighting
            // some of this is assignment 3 stuff, gonna keep it here in case I need to reuse it
            

            // if this object is supposed to be shaded
            if (this.shaded) {
                let products1 = light1.calculateProducts(this.material);
                /*
                let products2 = light2.calculateProducts(this.material);
                gl.uniform4fv(gl.getUniformLocation(this.programInfo,"uAmbientProduct2"), new Float32Array(products2.ambientProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uDiffuseProduct2"), new Float32Array(products2.diffuseProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uSpecularProduct2"), new Float32Array(products2.specularProduct));

                let products3 = light3.calculateProducts(this.material);
                gl.uniform4fv(gl.getUniformLocation(this.programInfo,"uAmbientProduct3"), new Float32Array(products3.ambientProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uDiffuseProduct3"), new Float32Array(products3.diffuseProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uSpecularProduct3"), new Float32Array(products3.specularProduct));
                
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uLightPosition2"), new Float32Array(light2.position));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uLightPosition3"), new Float32Array(light3.position));
                
                */
                gl.uniform4fv(gl.getUniformLocation(this.programInfo,"uAmbientProduct1"), new Float32Array(products1.ambientProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uDiffuseProduct1"), new Float32Array(products1.diffuseProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uSpecularProduct1"), new Float32Array(products1.specularProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uLightPosition1"), new Float32Array(light1.position));
                
                gl.uniform1f(gl.getUniformLocation(this.programInfo, "uShininess"),this.material.shininess);
            }
            else {
                // To make something "unlit", we simply make everything 1, 1, 1, 1 (i.e. perfectly reflective, and there is a perfect light hitting it)
                gl.uniform4fv(gl.getUniformLocation(this.programInfo,"uAmbientProduct1"), new Float32Array([1.0, 1.0, 1.0, 1.0,]));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uDiffuseProduct1"), new Float32Array([1.0, 1.0, 1.0, 1.0,]));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uSpecularProduct1"), new Float32Array([1.0, 1.0, 1.0, 1.0,]));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uLightPosition1"), new Float32Array(light1.position));
                
                /*
                gl.uniform4fv(gl.getUniformLocation(this.programInfo,"uAmbientProduct2"), new Float32Array(products2.ambientProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uDiffuseProduct2"), new Float32Array(products2.diffuseProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uSpecularProduct2"), new Float32Array(products2.specularProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo,"uAmbientProduct3"), new Float32Array(products3.ambientProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uDiffuseProduct3"), new Float32Array(products3.diffuseProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uSpecularProduct3"), new Float32Array(products3.specularProduct));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uLightPosition2"), new Float32Array(light2.position));
                gl.uniform4fv(gl.getUniformLocation(this.programInfo, "uLightPosition3"), new Float32Array(light3.position));
                */
                gl.uniform1f(gl.getUniformLocation(this.programInfo, "uShininess"), 100);
            }
        }
    }
    
    initBuffers() {
        gl.useProgram(this.programInfo);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.colorLoc);
        if (this.normals.length!=0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.bufferInfo.normalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.bufferInfo.normalLoc);
        }
        if (this.indicies.length!=0) {
            //load index
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);  
        }
        if (this.texCoords.length!=0) {
            //load textures
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.bufferInfo.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.bufferInfo.texCoordLoc);

        }
        gl.bindTexture(gl.TEXTURE_2D, this.texture); // by default, all child classes have white textures
    }

    //function to load buffers
    setBuffers() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.colorBuffer);
        gl.vertexAttribPointer(this.bufferInfo.colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.colorLoc);
        if (this.normals.length>0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.normalBuffer);
            gl.vertexAttribPointer(this.bufferInfo.normalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.bufferInfo.normalLoc);
        }
        if (this.indicies.length!=0) {
            //load index
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indexBuffer);
        }
        if (this.texCoords.length!=0) {
            //load textures
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.textureBuffer);
            gl.vertexAttribPointer(this.bufferInfo.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.bufferInfo.texCoordLoc);
        }
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    //function to calculate CTM with values
    calculateCTM() {
        let scaleM = scaleMatrix(this.scale[0], this.scale[1], this.scale[2]);
        let rotationX = rotateXMatrix(this.rotation[0]);
        let rotationY = rotateYMatrix(this.rotation[1]);
        let rotationZ = rotateZMatrix(this.rotation[2]);
        let translationM = translateMatrix(this.translation[0], this.translation[1], this.translation[2]);
        
        //condense CTM
        this.CTM = MultiplyArrayOfMatrices([translationM, rotationX, rotationY, rotationZ, scaleM]);

        //also calculate normals while we are at it
        if (this.normals.length > 0) {
            //MultiplyMatrices(this.viewMatrix, this.CTM)
            this.normalMatrix = normalMatrix(this.CTM);
        }
    }

    prepare() {
        gl.useProgram(this.programInfo);
        this.setBuffers();
        this.setUniforms();
    }
    
    configureTexture(image) {
        this.image = image;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        //let wrapS = gl.REPEAT;
        let wrapS = gl.CLAMP_TO_EDGE;
        //let wrapS = gl.MIRRORED_REPEAT;
        
        //let wrapT = gl.REPEAT;
        let wrapT = gl.CLAMP_TO_EDGE;
        //let wrapT = gl.MIRRORED_REPEAT;
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    
    draw() {
        if (this.visible){    
            this.calculateCTM();
            this.prepare();
            gl.drawArrays(gl.TRIANGLES, 0, this.numComponents);
        }
    }

    // this one skips calculating the CTM so you can input your custom matrices
    drawWithoutCalculation() {
        if (this.visible) {
            this.prepare();
            gl.drawArrays(gl.TRIANGLES, 0, this.numComponents);
        }
    }
    
    // function to point an arbitary "face" of an object towards a location
    pointAt(at, forwardVec) {

        // the math for figuring out Euler angles is too difficult,
        // so I just ripped apart a view matrix and used that
        let eye = vec3(this.translation[0], this.translation[1], this.translation[2]);
        at = vec3(at[0], at[1], at[2]);
        let up = vec3(0, 1, 0);
        let result = invertMatrix(flatten(lookAt(eye, at, up)));

        // inverting a view matrix gives us the "camera" transform matrix
        // we reset the translation parts to ensure that it does not get doubled
        result[12] = 0;
        result[13] = 0;
        result[14] = 0;

        // we manually rotate the pyramid upside down, since it typically points straight up
        // and lookAt assumes the "forward" direction is the internal positive Z axis of the object
        // but the pyramid's  forward direction is in the positive Y axis
        // but I made this code generic, in case I need to reuse it in the future

        // we calculate rotations to apply based on what the facing direction is
        let ExtraRotationX = forwardVec[1] * Math.PI / 2;
        let ExtraRotationY = forwardVec[0] * -Math.PI / 2;
        let ExtraRotationZ = forwardVec[2] * -Math.PI; // lookAt defaults to [0, 0, 1], so at [0, 0, 1] rotation Z should be 0, and at [0, 0, -1] rotation Z should be -Math.PI

        result = MultiplyArrayOfMatrices([result, rotateZMatrix(ExtraRotationZ), rotateYMatrix(ExtraRotationY), rotateXMatrix(ExtraRotationX)]);

        // now we decompose back to Euler angles for saving
        let rotationX = Math.atan2(result[9], result[10]);
        let rotationY = Math.atan2(-result[8], Math.sqrt((Math.pow(result[9], 2) + Math.pow(result[10], 2))));
        let rotationZ = Math.atan2(result[4], result[0]);

        // Roast my math I guess, I don't know why I could not wrap my head around this, but if it works it works
        this.rotation = [rotationX, rotationY, rotationZ];
    }

}

class trianglePyramid extends glBase {
    constructor(program, faceColors, transparency = 1.0, translation = [0, 0, 0], rotation = [0, 0, 0], scale = [0.75, 0.75, 0.75], visible = true, shaded=true){
        super(program, transparency, translation, rotation, scale, visible, shaded);
        this.numComponents = 12;
        //colors array
        let colors = [];
        //concat into one array
        for (let j = 0; j < faceColors.length; j++) {
            const c = faceColors[j];
            colors = colors.concat(c, c, c);
        }

        this.points= [
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
        ];
        this.normals = findNormals(this.points);
        this.colors = colors;
        this.animationBounceRate = 0.0005,
        this.animationRotationRate = 0.001;
        this.animationBeginTime = Date.now();
    }

    beginAnimation() {
        this.animationBeginTime = Date.now();
        this.original_translation = this.translation.slice(); // I love Javascript
    }

    animate() {

        //this controls how fast the pointer bounces up and down
        let speed = 0.005;
        // vector to center
        let direction = mySubtract(this.translation, sphereObject.translation);
        let bounceDirection = ((Math.sin((Date.now() - this.animationBeginTime) * speed ) > 0) ? 1.0 : -1.0);
        
        // distance based on time, and rounded off to 3 decimal places
        let distance = this.animationBounceRate * bounceDirection;
        let maxDistance = this.animationBounceRate * Math.PI / speed;
        
        this.translation[0] += direction[0] * distance;
        this.translation[1] += direction[1] * distance;
        this.translation[2] += direction[2] * distance;
        // clamp in between the original value and the theoretical max distance based on speed
        // this is to fix floating point and rounding errors
        this.translation[0] = clamp(this.translation[0], this.original_translation[0] + maxDistance, this.original_translation[0]);
        this.translation[1] = clamp(this.translation[1], this.original_translation[1] + maxDistance, this.original_translation[1]);
        this.translation[2] = clamp(this.translation[2], this.original_translation[2] + maxDistance, this.original_translation[2]);
        
    }
}

class trianglePyramidIndexed extends trianglePyramid {
    constructor(program, faceColors, translation = [0, 0, 0], rotation = [0, 0, 0], scale = [0.75, 0.75, 0.75], visible = true, shaded=true){
        super(program, faceColors, translation, rotation, scale, visible, shaded=true);
        
        this.points= [
            -1.0, -1.0, 1.0, 
            1.0, -1.0, 1.0, 
            0.0, -1.0, -1.0, 
            0.0, 1.0, 0.0
        ];

        //indices
        this.indices = [
            0, 2, 1,
            0, 1, 3,
            1, 2, 3,
            2, 0, 3
        ];

        this.lineIndices = [
            0, 1, 
            1, 3, 
            3, 0, 
            1, 2, 
            2, 3, 
            2, 0, 
            0, 3
        ];
        
        //colors array
        let colors = [];
        // because we are doing this indexed, we can only set one color
        // concat into one array
        for (let j = 0; j < this.indices.length; j++) {
            colors = colors.concat(faceColors);
        }

        this.colors = colors;
        let lineColors = [];
        for (let i=0; i<this.lineIndices.length; i++) {
            lineColors = lineColors.concat(0.0, 0.0, 0.0, 1.0);
        }
        this.lineColors = lineColors;
        this.numComponents = this.indices.length;
        

        let linePointBuffer = gl.createBuffer();
        let lineColorBuffer = gl.createBuffer();
        let linePointLoc = gl.getAttribLocation(program, "aPosition");
        let lineColorLoc = gl.getAttribLocation(program, "aColor");
        
        this.bufferInfo.linePointBuffer = linePointBuffer;
        this.bufferInfo.linePointLoc = linePointLoc; 
        this.bufferInfo.lineColorBuffer = lineColorBuffer ; 
        this.bufferInfo.lineColorLoc = lineColorLoc; //add to the end of the bufferInfo array created in the super constructor
    }
    //override parent methods for the line indices
    initBuffers() {
        gl.useProgram(this.programInfo);
        // load positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);

        //load colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.colorLoc);

        //load textures
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.texCoordLoc);

        //load index
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        
        //load line indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.linePointBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.lineIndices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.linePointLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.linePointLoc);
        
        //load line colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.lineColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.lineColors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.lineColorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.lineColorLoc);

        gl.bindTexture(gl.TEXTURE_2D, this.texture); // bind textures
}
    //function to load buffers
    setBuffers() {
        gl.useProgram(this.programInfo);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.colorBuffer);
        gl.vertexAttribPointer(this.bufferInfo.colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.colorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.textureBuffer);
        gl.vertexAttribPointer(this.bufferInfo.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.texCoordLoc);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indexBuffer);
    }
    // set buffers for wiremesh lines
    setLineBuffer() {
        gl.useProgram(this.programInfo);
        // load points
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);

        //load line indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.linePointBuffer);
        gl.vertexAttribPointer(this.bufferInfo.linePointLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.linePointBuffer);

        //load line colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.lineColorBuffer);
        gl.vertexAttribPointer(this.bufferInfo.lineColorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.lineColorLoc);
        gl.bindTexture(gl.TEXTURE_2D, this.texture); 
    }

    prepareLines() {
        this.calculateCTM();
        this.setLineBuffer();
        this.setUniforms();
    }

    draw() {
        this.prepare();
        gl.drawElements(gl.TRIANGLES, this.numComponents, gl.UNSIGNED_SHORT, 0);
    }

    drawWithLines() {
        gl.depthFunc(gl.LESS);
        this.draw();
        gl.depthFunc(gl.LEQUAL);
        this.drawJustLines();
        gl.depthFunc(gl.LESS);
    }

    drawJustLines() {
        this.prepareLines();
        gl.drawElements(gl.LINES, this.lineIndices.length, gl.UNSIGNED_SHORT, 0);
    }
}

class squarePyramid extends glBase {
    constructor(program, faceColors, translation = [0, 0, 0], rotation = [0.0, 0.0, 0.0], scale = [0.75, 0.75, 0.75], visible = true, shaded=true) {
        super(program, translation, rotation, scale, visible, shaded=true);
        let colors = [];
        //concat into one array
        for (var j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            colors = colors.concat(c, c, c);
        }
        this.points = [
            //bottom face 1
            -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            //bottom face 2
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            //front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            0.0, 1.0, 0.0,
            //right face
            1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            0.0, 1.0, 0.0,
            //back face
            1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,
            0.0, 1.0, 0.0,
            //left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            0.0, 1.0, 0.0
        ];
        this.colors = colors;
        this.numComponents = 18;
        this.normals = findNormals(this.points);
    }
}

class cube extends glBase {
    constructor(program, faceColors, translation = [0, 0, 0], rotation = [0.0, 0.0, 0.0], scale = [0.75, 0.75, 0.75], visible = true) {
        super(program, translation, rotation, scale, visible);
        let colors = [];
        //concat into one array
        for (var j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            colors = colors.concat(c, c, c, c, c, c);
        }

        this.points = [
            //bottom
            -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,

            1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            
            //front
            -1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,

            1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,

            //left
            -1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, 1.0,
            
            -1.0, 1.0, 1.0, 
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,

            //back
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            
            -1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,
            
            //right
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, -1.0,

            1.0, 1.0, -1.0,
            1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,

            //top
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,

            -1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0

        ];
        this.numComponents = this.points.length/3;
        this.colors = colors;
        this.normals=findNormals(this.points);
    }
}

class teapot extends glBase {
    constructor(program, faceColors = null, translation = [0, 0, 0], rotation = [0.0, 0.0, 0.0], scale = [0.75, 0.75, 0.75], visible = true, shaded=true) {
        super(program, translation, rotation, scale, visible, shaded);
        let colors = [];
        this.numComponents = 306;
        //just some random colors is fine
        if (faceColors == null) {    
            for (var j = 0; j < this.numComponents / 3; ++j) {
                let rand = [Math.random(), Math.random(), Math.random(), 1.0];
                colors = colors.concat(rand, rand, rand);
            }
        }
        else {
            //concat into one array
            for (var j = 0; j < this.numComponents; ++j) {
                colors = colors.concat(faceColors);
            }
            
        }

        this.points= [1.4, 0.0, 2.4,
            1.4, -0.784, 2.4,
            0.784, -1.4, 2.4,
            0.0, -1.4, 2.4,
            1.3375, 0.0, 2.53125,
            1.3375, -0.749, 2.53125,
            0.749, -1.3375, 2.53125,
            0.0, -1.3375, 2.53125,
            1.4375, 0.0, 2.53125,
            1.4375, -0.805, 2.53125,
            0.805, -1.4375, 2.53125,
            0.0, -1.4375, 2.53125,
            1.5, 0.0, 2.4,
            1.5, -0.84, 2.4,
            0.84, -1.5, 2.4,
            0.0, -1.5, 2.4,
            -0.784, -1.4, 2.4,
            -1.4, -0.784, 2.4,
            -1.4, 0.0, 2.4,
            -0.749, -1.3375, 2.53125,
            -1.3375, -0.749, 2.53125,
            -1.3375, 0.0, 2.53125,
            -0.805, -1.4375, 2.53125,
            -1.4375, -0.805, 2.53125,
            -1.4375, 0.0, 2.53125,
            -0.84, -1.5, 2.4,
            -1.5, -0.84, 2.4,
            -1.5, 0.0, 2.4,
            -1.4, 0.784, 2.4,
            -0.784, 1.4, 2.4,
            0.0, 1.4, 2.4,
            -1.3375, 0.749, 2.53125,
            -0.749, 1.3375, 2.53125,
            0.0, 1.3375, 2.53125,
            -1.4375, 0.805, 2.53125,
            -0.805, 1.4375, 2.53125,
            0.0, 1.4375, 2.53125,
            -1.5, 0.84, 2.4,
            -0.84, 1.5, 2.4,
            0.0, 1.5, 2.4,
            0.784, 1.4, 2.4,
            1.4, 0.784, 2.4,
            0.749, 1.3375, 2.53125,
            1.3375, 0.749, 2.53125,
            0.805, 1.4375, 2.53125,
            1.4375, 0.805, 2.53125,
            0.84, 1.5, 2.4,
            1.5, 0.84, 2.4,
            1.75, 0.0, 1.875,
            1.75, -0.98, 1.875,
            0.98, -1.75, 1.875,
            0.0, -1.75, 1.875,
            2.0, 0.0, 1.35,
            2.0, -1.12, 1.35,
            1.12, -2.0, 1.35,
            0.0, -2.0, 1.35,
            2.0, 0.0, 0.9,
            2.0, -1.12, 0.9,
            1.12, -2.0, 0.9,
            0.0, -2.0, 0.9,
            -0.98, -1.75, 1.875,
            -1.75, -0.98, 1.875,
            -1.75, 0.0, 1.875,
            -1.12, -2.0, 1.35,
            -2.0, -1.12, 1.35,
            -2.0, 0.0, 1.35,
            -1.12, -2.0, 0.9,
            -2.0, -1.12, 0.9,
            -2.0, 0.0, 0.9,
            -1.75, 0.98, 1.875,
            -0.98, 1.75, 1.875,
            0.0, 1.75, 1.875,
            -2.0, 1.12, 1.35,
            -1.12, 2.0, 1.35,
            0.0, 2.0, 1.35,
            -2.0, 1.12, 0.9,
            -1.12, 2.0, 0.9,
            0.0, 2.0, 0.9,
            0.98, 1.75, 1.875,
            1.75, 0.98, 1.875,
            1.12, 2.0, 1.35,
            2.0, 1.12, 1.35,
            1.12, 2.0, 0.9,
            2.0, 1.12, 0.9,
            2.0, 0.0, 0.45,
            2.0, -1.12, 0.45,
            1.12, -2.0, 0.45,
            0.0, -2.0, 0.45,
            1.5, 0.0, 0.225,
            1.5, -0.84, 0.225,
            0.84, -1.5, 0.225,
            0.0, -1.5, 0.225,
            1.5, 0.0, 0.15,
            1.5, -0.84, 0.15,
            0.84, -1.5, 0.15,
            0.0, -1.5, 0.15,
            -1.12, -2.0, 0.45,
            -2.0, -1.12, 0.45,
            -2.0, 0.0, 0.45,
            -0.84, -1.5, 0.225,
            -1.5, -0.84, 0.225,
            -1.5, 0.0, 0.225,
            -0.84, -1.5, 0.15,
            -1.5, -0.84, 0.15,
            -1.5, 0.0, 0.15,
            -2.0, 1.12, 0.45,
            -1.12, 2.0, 0.45,
            0.0, 2.0, 0.45,
            -1.5, 0.84, 0.225,
            -0.84, 1.5, 0.225,
            0.0, 1.5, 0.225,
            -1.5, 0.84, 0.15,
            -0.84, 1.5, 0.15,
            0.0, 1.5, 0.15,
            1.12, 2.0, 0.45,
            2.0, 1.12, 0.45,
            0.84, 1.5, 0.225,
            1.5, 0.84, 0.225,
            0.84, 1.5, 0.15,
            1.5, 0.84, 0.15,
            -1.6, 0.0, 2.025,
            -1.6, -0.3, 2.025,
            -1.5, -0.3, 2.25,
            -1.5, 0.0, 2.25,
            -2.3, 0.0, 2.025,
            -2.3, -0.3, 2.025,
            -2.5, -0.3, 2.25,
            -2.5, 0.0, 2.25,
            -2.7, 0.0, 2.025,
            -2.7, -0.3, 2.025,
            -3.0, -0.3, 2.25,
            -3.0, 0.0, 2.25,
            -2.7, 0.0, 1.8,
            -2.7, -0.3, 1.8,
            -3.0, -0.3, 1.8,
            -3.0, 0.0, 1.8,
            -1.5, 0.3, 2.25,
            -1.6, 0.3, 2.025,
            -2.5, 0.3, 2.25,
            -2.3, 0.3, 2.025,
            -3.0, 0.3, 2.25,
            -2.7, 0.3, 2.025,
            -3.0, 0.3, 1.8,
            -2.7, 0.3, 1.8,
            -2.7, 0.0, 1.575,
            -2.7, -0.3, 1.575,
            -3.0, -0.3, 1.35,
            -3.0, 0.0, 1.35,
            -2.5, 0.0, 1.125,
            -2.5, -0.3, 1.125,
            -2.65, -0.3, 0.9375,
            -2.65, 0.0, 0.9375,
            -2.0, -0.3, 0.9,
            -1.9, -0.3, 0.6,
            -1.9, 0.0, 0.6,
            -3.0, 0.3, 1.35,
            -2.7, 0.3, 1.575,
            -2.65, 0.3, 0.9375,
            -2.5, 0.3, 1.125,
            -1.9, 0.3, 0.6,
            -2.0, 0.3, 0.9,
            1.7, 0.0, 1.425,
            1.7, -0.66, 1.425,
            1.7, -0.66, 0.6,
            1.7, 0.0, 0.6,
            2.6, 0.0, 1.425,
            2.6, -0.66, 1.425,
            3.1, -0.66, 0.825,
            3.1, 0.0, 0.825,
            2.3, 0.0, 2.1,
            2.3, -0.25, 2.1,
            2.4, -0.25, 2.025,
            2.4, 0.0, 2.025,
            2.7, 0.0, 2.4,
            2.7, -0.25, 2.4,
            3.3, -0.25, 2.4,
            3.3, 0.0, 2.4,
            1.7, 0.66, 0.6,
            1.7, 0.66, 1.425,
            3.1, 0.66, 0.825,
            2.6, 0.66, 1.425,
            2.4, 0.25, 2.025,
            2.3, 0.25, 2.1,
            3.3, 0.25, 2.4,
            2.7, 0.25, 2.4,
            2.8, 0.0, 2.475,
            2.8, -0.25, 2.475,
            3.525, -0.25, 2.49375,
            3.525, 0.0, 2.49375,
            2.9, 0.0, 2.475,
            2.9, -0.15, 2.475,
            3.45, -0.15, 2.5125,
            3.45, 0.0, 2.5125,
            2.8, 0.0, 2.4,
            2.8, -0.15, 2.4,
            3.2, -0.15, 2.4,
            3.2, 0.0, 2.4,
            3.525, 0.25, 2.49375,
            2.8, 0.25, 2.475,
            3.45, 0.15, 2.5125,
            2.9, 0.15, 2.475,
            3.2, 0.15, 2.4,
            2.8, 0.15, 2.4,
            0.0, 0.0, 3.15,
            0.0, -0.002, 3.15,
            0.002, 0.0, 3.15,
            0.8, 0.0, 3.15,
            0.8, -0.45, 3.15,
            0.45, -0.8, 3.15,
            0.0, -0.8, 3.15,
            0.0, 0.0, 2.85,
            0.2, 0.0, 2.7,
            0.2, -0.112, 2.7,
            0.112, -0.2, 2.7,
            0.0, -0.2, 2.7,
            -0.002, 0.0, 3.15,
            -0.45, -0.8, 3.15,
            -0.8, -0.45, 3.15,
            -0.8, 0.0, 3.15,
            -0.112, -0.2, 2.7,
            -0.2, -0.112, 2.7,
            -0.2, 0.0, 2.7,
            0.0, 0.002, 3.15,
            -0.8, 0.45, 3.15,
            -0.45, 0.8, 3.15,
            0.0, 0.8, 3.15,
            -0.2, 0.112, 2.7,
            -0.112, 0.2, 2.7,
            0.0, 0.2, 2.7,
            0.45, 0.8, 3.15,
            0.8, 0.45, 3.15,
            0.112, 0.2, 2.7,
            0.2, 0.112, 2.7,
            0.4, 0.0, 2.55,
            0.4, -0.224, 2.55,
            0.224, -0.4, 2.55,
            0.0, -0.4, 2.55,
            1.3, 0.0, 2.55,
            1.3, -0.728, 2.55,
            0.728, -1.3, 2.55,
            0.0, -1.3, 2.55,
            1.3, 0.0, 2.4,
            1.3, -0.728, 2.4,
            0.728, -1.3, 2.4,
            0.0, -1.3, 2.4,
            -0.224, -0.4, 2.55,
            -0.4, -0.224, 2.55,
            -0.4, 0.0, 2.55,
            -0.728, -1.3, 2.55,
            -1.3, -0.728, 2.55,
            -1.3, 0.0, 2.55,
            -0.728, -1.3, 2.4,
            -1.3, -0.728, 2.4,
            -1.3, 0.0, 2.4,
            -0.4, 0.224, 2.55,
            -0.224, 0.4, 2.55,
            0.0, 0.4, 2.55,
            -1.3, 0.728, 2.55,
            -0.728, 1.3, 2.55,
            0.0, 1.3, 2.55,
            -1.3, 0.728, 2.4,
            -0.728, 1.3, 2.4,
            0.0, 1.3, 2.4,
            0.224, 0.4, 2.55,
            0.4, 0.224, 2.55,
            0.728, 1.3, 2.55,
            1.3, 0.728, 2.55,
            0.728, 1.3, 2.4,
            1.3, 0.728, 2.4,
            0.0, 0.0, 0.0,
            1.5, 0.0, 0.15,
            1.5, 0.84, 0.15,
            0.84, 1.5, 0.15,
            0.0, 1.5, 0.15,
            1.5, 0.0, 0.075,
            1.5, 0.84, 0.075,
            0.84, 1.5, 0.075,
            0.0, 1.5, 0.075,
            1.425, 0.0, 0.0,
            1.425, 0.798, 0.0,
            0.798, 1.425, 0.0,
            0.0, 1.425, 0.0,
            -0.84, 1.5, 0.15,
            -1.5, 0.84, 0.15,
            -1.5, 0.0, 0.15,
            -0.84, 1.5, 0.075,
            -1.5, 0.84, 0.075,
            -1.5, 0.0, 0.075,
            -0.798, 1.425, 0.0,
            -1.425, 0.798, 0.0,
            -1.425, 0.0, 0.0,
            -1.5, -0.84, 0.15,
            -0.84, -1.5, 0.15,
            0.0, -1.5, 0.15,
            -1.5, -0.84, 0.075,
            -0.84, -1.5, 0.075,
            0.0, -1.5, 0.075,
            -1.425, -0.798, 0.0,
            -0.798, -1.425, 0.0,
            0.0, -1.425, 0.0,
            0.84, -1.5, 0.15,
            1.5, -0.84, 0.15,
            0.84, -1.5, 0.075,
            1.5, -0.84, 0.075,
            0.798, -1.425, 0.0,
            1.425, -0.798, 0.0
        ];
        this.colors = colors;
    }
}



class WorldAxis extends glBase {
    constructor(program, size = 100, indicator_size = 0.1, indicator_step = 1, alternating = true, translation = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], visible = true, shaded=false) {
        super(program, translation, rotation, scale, visible, shaded);  
         // axis colors
        let xColor = [1.0, 0.0, 0.0, 1.0]; // red
        let yColor = [0.0, 1.0, 0.0, 1.0]; // green
        let zColor = [0.0, 0.0, 1.0, 1.0]; // blue 
        
        // generating points
        let points = [];
        for (let k = 0; k < size; k++) {

            // indicator step means how often the little marker comes up, e.g. if you have a axis of size 1,000 
            // it would be pretty ridiculous to draw the little distance marker every single unit
            let start = k * indicator_step;
            let end = (k + 1) * indicator_step;

            points = points.concat(
                // the two points on the X axis,
                [start, 0, 0], [end, 0, 0],
                // a short line indicator for every indicator_step units
                // the if else statement decoded:
                // if alternating is true, we multiply indicator size by 2 every odd number, and by 1 every even number
                // e.g. (1 % 2) + 1 = 2, (2 % 2) + 1 = 1
                // this is literally just for convenience
                [end, 0, 0], [end, (alternating) ? indicator_size * ((k % 2) + 1) : indicator_size, 0],
                // now repeat for y and z axis  
                [0, start, 0], [0, end, 0],
                [0, end, 0], [(alternating) ? indicator_size * ((k % 2) + 1) : indicator_size, end, 0],
                [0, 0, start], [0, 0, end],
                [0, 0, end], [0, (alternating) ? indicator_size * ((k % 2) + 1) : indicator_size, end]
            );
        }
        let colors = [];
        //concat into one array
        // divide by 12 as we will be inserting 12 colors of each axis, all at once
        for (let j = 0; j < points.length / 12; ++j) {
            colors = colors.concat(
                xColor, xColor,
                xColor, xColor,
                yColor, yColor,
                yColor, yColor,
                zColor, zColor,
                zColor, zColor
            );
        }
        this.points = points;
        this.colors = colors;
        this.numComponents = points.length/3;
        
    }
    draw() {
        this.prepare();
        gl.drawArrays(gl.LINES, 0, this.numComponents);
    }
}

class sphere extends glBase {
    constructor(program, stackCount = 5, sectorCount = 5, radius = 3, color = [0.75, 0.75, 0.75, 1.0], transparency = 1.0, translation = [0, 0, -10], rotation = [0, 0, 0], scale = [1, 1, 1], visible=true, shaded=true) {
        super(program, transparency, translation, rotation, scale, visible, shaded);
        //stack is the number of latitudes (horizontal cuts), sector is longitude (vertical cuts)
        
        //points array
        let points = [];
        let colors = [];
        let lineColors = [];
        let texCoords = [];
        let normals = [];

        let sectorStep = 2 * Math.PI / sectorCount;
        let stackStep = Math.PI / stackCount;
        let stackAngle, sectorAngle;

        let x, y, z; // coords for vertices
        let s, t; // texture coords
        let lengthInverse = 1.0 / radius;

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
                
                colors = colors.concat(color, color, color);
                
                s = j / sectorCount;
                t = i / stackCount;
                texCoords.push(s);
                texCoords.push(t);

                normals.push(x * lengthInverse, y * lengthInverse, z * lengthInverse);
            }
        }

        let indices = [];
        let lineIndices = [];
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
                lineColors = lineColors.concat([0.0, 0.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0]);
                if (i != 0) {
                    lineIndices.push(k1);
                    lineIndices.push(k1 + 1);
                    lineColors = lineColors.concat([0.0, 0.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0]);
                }
            }
        }
        
        let linePointBuffer = gl.createBuffer();
        let lineColorBuffer = gl.createBuffer();
        let linePointLoc = gl.getAttribLocation(program, "aPosition");
        let lineColorLoc = gl.getAttribLocation(program, "aColor");
        this.radius = radius;
        this.points = points;
        this.colors = colors;
        this.lineColors = lineColors;
        this.indices = indices;
        this.lineIndices = lineIndices;
        this.texCoords = texCoords;
        this.numComponents = this.indices.length;
        this.normals = normals;

        this.bufferInfo.linePointBuffer = linePointBuffer;
        this.bufferInfo.lineColorLoc = linePointLoc;
        this.bufferInfo.lineColorBuffer = lineColorBuffer
        this.bufferInfo.lineColorLoc = lineColorLoc; 
    }

    //override parent methods for the line indices
    initBuffers() {
        gl.useProgram(this.programInfo);
        // load positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);

        //load colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.colorLoc);

        
        //load textures
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.texCoordLoc);

        //load index
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        
        // load normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.normalLoc);

        //load line indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.linePointBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.lineIndices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.linePointLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.linePointLoc);
        
        //load line colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.lineColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.lineColors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.bufferInfo.lineColorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.lineColorLoc);
        
    }   

    //function to load buffers
    setBuffers() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.colorBuffer);
        gl.vertexAttribPointer(this.bufferInfo.colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.colorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.textureBuffer);
        gl.vertexAttribPointer(this.bufferInfo.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.texCoordLoc);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.normalBuffer);
        gl.vertexAttribPointer(this.bufferInfo.normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.normalLoc);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    // set buffers for wiremesh lines
    setLineBuffer() {
        // load points
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.vertexBuffer);
        gl.vertexAttribPointer(this.bufferInfo.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.positionLoc);

        //load line indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.linePointBuffer);
        gl.vertexAttribPointer(this.bufferInfo.linePointLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.linePointLoc);

        //load line colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.lineColorBuffer);
        gl.vertexAttribPointer(this.bufferInfo.lineColorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bufferInfo.lineColorLoc);
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture); // by default, all child classes have disabled textures
    }
    
    prepareSphere() {
        gl.useProgram(this.programInfo);
        this.calculateCTM();
        this.setBuffers();
        this.setUniforms();
    }

    prepareSphereLines() {
        gl.useProgram(this.programInfo);
        this.calculateCTM();
        this.setLineBuffer();
        this.setUniforms();
    }

    draw() {
        this.prepareSphere();
        gl.drawElements(gl.TRIANGLES, this.numComponents, gl.UNSIGNED_SHORT, 0);
    }

    drawWithLines() {
        // depth func to correctly draw out outlines on surface
        // essentially the lines are prioritised
        gl.depthFunc(gl.LESS)
        this.draw();
        gl.depthFunc(gl.LEQUAL)
        this.drawJustLines();
        gl.depthFunc(gl.LESS);
    }

    drawJustLines() {
        this.prepareSphereLines();
        gl.drawElements(gl.LINES, this.lineIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    calculateIntersection(ray) {
        // we use the ray to calculate intersections, then cameraPosition to choose whichever intersection point is closer to the camera
        // ray is in the form [[cameraPosition], [point on line]]
        // since ray itself contains cameraPositon, we can skip one step

        // From wikipedia: the formula for intersection of line and sphere is:
        // delta = (u . (o - c))^2 - ((o - c)^2 - r^2)
        // d = -(u . (o - c)) +/- sqrt(delta)
        // where d = distance from origin of ray
        // u = direction of ray (unit vector)
        // o = origin of ray
        // c = center of sphere
        // r = radius of sphere

        // method is not 100% accurate as the sphere is not an actual sphere, but a bunch of triangles pretending to be a sphere
        let c = this.translation;
        let r = this.radius;
        let o = ray[0];
        // unit vector
        let u = myNormalize(ray[1]);
        let oc = mySubtract(o, c);
        let uoc = myDot(u, oc);
        let delta = Math.pow(uoc, 2) - (Math.pow(vectorLength(oc), 2) - Math.pow(r, 2));

        let d;

        //no intersection
        if (delta < 0) {
            return null;
        }
        else if (delta == 0) {
            //one intersection
            d = -uoc;
        }
        else {
            let d1 = -uoc + Math.sqrt(delta);
            let d2 = -uoc - Math.sqrt(delta);
            if (d2 < 0) {
                // all points are behind the camera, since d1 is "further" from the origin of the camera
                // this probably would not happen since we have a minimum radius for the camera
                return null;
            }
            //we check d2 first as it is minus the delta, aka it would be closer everytime pretty much
            d = d2 >= 0 ? d2 : d1;
        }
        let intersection = [o[0] + d * u[0], o[1] + d * u[1], o[2] + d * u[2]];
        return intersection;
    }
}

class person {

    /*
    Here's art of the dimensions (standard thickness of 3)
                 6
             __________
            |          |
         4  |          |
            |__________|
(neck gap 0.25)

      2  0.25    6     0.25  2
     _____   __________   _____
    |     | |          | |     |
    |     | |          | |     |
  6 |     | |          | |     | 6
    |     | |          | |     |
    |_____| |__________| |_____|
      2  0.25    6     0.25  2
                  ^
                  |
            origin here, 
            middle of the body
            at the bottom
    */ 
    constructor(shaderProgram, translation = [0, 0, 0], rotation = [0, 0, 0], scale = [0.75, 0.75, 0.75], visible = true, shaded=true) {
        this.programInfo = shaderProgram;
        this.translation = translation;
        this.scale = scale;
        this.visible = visible;
        this.shaded=shaded;
        this.defaultColor = [
            [1.0, 1.0, 1.0, 1.0], // white
            [1.0, 1.0, 1.0, 1.0], // white
            [1.0, 1.0, 1.0, 1.0], // white
            [1.0, 1.0, 1.0, 1.0], // white
            [1.0, 1.0, 1.0, 1.0], // white
            [1.0, 1.0, 1.0, 1.0], // white
        ];
        this.defaultCoords = {
            face: [0, 5.25, -0.75],
            body: [0, 0, -0.75],
            leftArm: [4.25, 0, -0.75],
            rightArm: [-4.25, 0, -0.75]
        }
        this.defaultScale = {
            face:[3, 2, 1.5],
            body: [3, 3, 1.5],
            leftArm: [1, 3, 1.5],
            rightArm: [1, 3, 1.5]
        }
        // the default cube has sides length 2, and we have to scale according to that
        // we also need to change the translation amounts depending on scale
        this.face = new cube(
            this.programInfo, 
            this.defaultColor, 
            this.calculateTranslation(this.defaultCoords.face, this.translation, this.scale),
            this.rotation, 
            this.calculateScale(this.scale, this.defaultScale.face)
        );

        this.body = new cube(
            this.programInfo, 
            this.defaultColor, 
            this.calculateTranslation(this.defaultCoords.body, this.translation, this.scale), 
            this.rotation, 
            this.calculateScale(this.scale, this.defaultScale.body)
        );
        this.leftArm = new cube(
            this.programInfo, 
            this.defaultColor, 
            this.calculateTranslation(this.defaultCoords.leftArm, this.translation, this.scale), 
            this.rotation, 
            this.calculateScale(this.scale, this.defaultScale.leftArm)
        );
        this.rightArm = new cube(
            this.programInfo, 
            this.defaultColor, 
            this.calculateTranslation(this.defaultCoords.rightArm, this.translation, this.scale), 
            this.rotation, 
            this.calculateScale(this.scale, this.defaultScale.rightArm)
        );
        this.parts = [this.face, this.body, this.leftArm, this.rightArm];

        //we make the various parts save their own default object space translations for later use
        this.face.defaultCoords = this.defaultCoords.face;
        this.body.defaultCoords = this.defaultCoords.body;
        this.leftArm.defaultCoords = this.defaultCoords.leftArm;
        this.rightArm.defaultCoords = this.defaultCoords.rightArm;

        // we are overriding the model matrix calculations, since this class will take care of it
        // but we still need to initialize it once
        for (let i = 0; i < this.parts.length; i++) {
            this.parts[i].calculateCTM();
        }
        this.leftPhi = 0; //controls up-down (like doing jumping jacks)
        this.leftTheta = 0; //controls forward backward (like swinging your arms while walking)
        this.rightPhi = 0;
        this.rightTheta = 0;

        // we are no longer automatically calculating the model matrix with draw(), so we have to initialize some values here
        this.RotateEntireObject(rotation);
    }
    
    draw() {
        for (let i = 0; i < this.parts.length; i++) {
            this.parts[i].perspectiveMatrix = this.perspectiveMatrix;
            this.parts[i].viewMatrix = this.viewMatrix;
            this.parts[i].drawWithoutCalculation();
        }
    }

    initBuffers() {
        for (let i = 0; i < this.parts.length; i++) {
            this.parts[i].initBuffers();
        }
    }
    calculateTranslation(coordinate, translation, scale) {
        //calculates translation while accounting for scale
        return [translation[0] + (scale[0] * coordinate[0]), 
        translation[1] + ( scale[1] * coordinate[1]), 
        translation[2] + (scale[2] * coordinate[2])]
    }
    
    calculateScale(outerScale, innerScale) {
        return[outerScale[0] * innerScale[0], outerScale[1] * innerScale[1], outerScale[2] * innerScale[2]]
    }

    RotateEntireObject(rotation) {
        // look I understand the theory I just don't have time to find the rotation points for all of these
        // but let's give it our best I guess, if I get it done you won't read this comment anyway

        this.rotation = rotation;
        
        //bunch of boring math, essentially scale is half of the length of any side
        let faceRotationPoint = [0, -(this.face.scale[1] + this.body.scale[1] + 0.25), 0];
        let bodyRotationPoint = [0, -this.body.scale[1], 0]
        let leftArmRotationPoint = [-(this.leftArm.scale[0] + this.body.scale[0] + 0.25), -this.leftArm.scale[1], 0];
        let rightArmRotationPoint = [(this.rightArm.scale[0] + this.body.scale[0] + 0.25), -this.rightArm.scale[1], 0];
        this.rotationAroundPoint(this.face, faceRotationPoint, rotation);
        this.rotationAroundPoint(this.body, bodyRotationPoint, rotation);
        
        this.rotationAroundPoint(this.leftArm, leftArmRotationPoint, rotation);
        this.rotationAroundPoint(this.rightArm, rightArmRotationPoint, rotation);
        // then, we apply the specialized rotation for the arms
    }

    rotationAroundPoint(object,  point, rotation) {
        let op = [object.translation[0] + point[0], object.translation[1] + point[1], object.translation[2] + point[2]];
        
        let translation = translateMatrix(-op[0], -op[1], -op[2]);
        let rotationX = rotateXMatrix(rotation[0]);
        let rotationY = rotateYMatrix(rotation[1]);
        let rotationZ = rotateZMatrix(rotation[2]);
        let rotationM = MultiplyArrayOfMatrices([rotationX, rotationY, rotationZ]);
        let revTranslation = translateMatrix(op[0], op[1], op[2]);
        //but since we are calculating the CTM ourselves, we need to complete the entire equation of SRT
        let result = MultiplyArrayOfMatrices([revTranslation, rotationM, translation]);
        object.CTM = MultiplyMatrices(result, object.CTM);
    }

    rotateLeftPhi() {
        let leftArmNewOrigin = [
            -this.leftArm.scale[0], this.leftArm.scale[1], -this.leftArm.scale[2]
            ];
        this.rotationAroundPoint(this.leftArm, leftArmNewOrigin, [0, 0, this.leftPhi]);
    }

    rotateLeftTheta() {
        let leftArmNewOrigin = [
            -this.leftArm.scale[0], this.leftArm.scale[1], -this.leftArm.scale[2]
            ];
        this.rotationAroundPoint(this.leftArm, leftArmNewOrigin, [this.leftTheta, 0, 0]);
    }

    rotateRightPhi() {
        let rightArmNewOrigin = [
            -this.rightArm.scale[0], this.rightArm.scale[1], -this.rightArm.scale[2]
        ];
        this.rotationAroundPoint(this.rightArm, rightArmNewOrigin, [0, 0, this.rightPhi]);
    }
    rotateRightTheta() {
        let rightArmNewOrigin = [
            -this.rightArm.scale[0], this.rightArm.scale[1], -this.rightArm.scale[2]
        ];
        this.rotationAroundPoint(this.rightArm, rightArmNewOrigin, [this.rightTheta, 0, 0]);
    }

}