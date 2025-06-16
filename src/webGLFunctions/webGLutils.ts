import { webglconfig } from "../config/WebGLOptions";

/*

A collection of useful, miscellaneous functions for WebGL

*/

export function initShaders(gl : WebGL2RenderingContext, shaderName : string) {
    const vertexShader : WebGLShader | null = gl.createShader( gl.VERTEX_SHADER );
    const fragmentShader : WebGLShader | null = gl.createShader( gl.FRAGMENT_SHADER );

    if (vertexShader == null || fragmentShader == null) {
        alert( "Unable to load vertex shader");
    }
    else {
        if (shaderName in webglconfig.programs) {
            gl.shaderSource(vertexShader, webglconfig.programs[shaderName].shaderConfig.vertex)
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                alert("Error compiling vertex shader " + shaderName + ", the error log is: \n\n" +
                    gl.getShaderInfoLog(vertexShader)
                );
            }
            gl.shaderSource(fragmentShader, webglconfig.programs[shaderName].shaderConfig.fragment)
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                alert("Error compiling fragment shader " + shaderName + ", the error log is: \n\n" + 
                    gl.getShaderInfoLog(fragmentShader)
                )
            }
        }

        const program : WebGLProgram | null = gl.createProgram();
        if (program != null) {
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS) ) {
                alert("The program failed to link. The error log is: \n\n" + 
                    gl.getProgramInfoLog(program)
                );
            } else {
                return program;
            }
        }
        else {
            alert("Failed to create webGL program");
        }
    }
}
export function clamp(number : number, limit1 : number, limit2 : number) {
    // I let you throw in any two numbers in the back, and this functiin will automatically select min and max
    // for times when you don't know which variable will be min or max
    let min;
    let max;
    if (limit1 < limit2) {
      min = limit1;
      max = limit2;
    }
    else {
      min = limit2; 
      max = limit1;
    }
    return Math.min(Math.max(number, min), max);
}

export class vec2 {
    _x : number;
    _y : number;
    constructor(value1 : number, value2 : number) {
        this._x = value1;
        this._y = value2;
    }
    get x() : number {
        return this._x;
    }
    get y() : number {
        return this._y;
    }
    set x(value : number) {
        this._x = value;
    } 
    set y(value : number) {
        this._y= value;
    } 
    equals(vecB : vec2) : boolean {
        if (this.x == vecB.x &&
            this.y == vecB.y
        ) { 
            return true;
        } 
        else return false;
    }
    array() : number[] {
        return [this._x, this._y]
    }
}

export class vec3 extends vec2 {
    _z : number;
    constructor(value1 : number, value2: number, value3: number) {
        super(value1, value2);
        this._z = value3;
    }
    get z() : number {
        return this._z;
    }
    set z(value : number) {
        this._z = value;
    } 
    equals(vecB : vec3) : boolean {
        if (this.x == vecB.x &&
            this.y == vecB.y &&
            this.z == vecB.z
        ) { 
            return true;
        } 
        else return false;
    }
    array() : number[] {
        return [this._x, this._y, this._z]
    }
}
export class vec4 extends vec3{
    _w : number;
    constructor(value1 : number, value2 : number, value3 : number, value4 : number) {
        super(value1, value2, value3);
        this._w = value4;
    }
    get w() : number {
        return this._w;
    }
    set w(value : number) {
        this._w = value
    }
    equals(vecB : vec4) : boolean {
        if (this.x == vecB.x &&
            this.y == vecB.y &&
            this.z == vecB.z &&
            this.w == vecB.w
        ) { 
            return true;
        } 
        else return false;
    }
    array() : number[] {
        return [this._x, this._y, this._z, this._w]
    }
}

export class mat {
    values : number[][];
    constructor(size : number, value? : number[][]) {
        if (value) {
            this.values = value;
        }
        else {
            this.values=identityMatrix(size);
        }
    }
    flatten() : number[] {
        /*
        let result :number[] = [];
        for (let row = 0; row < this.values.length; row++) {
            for (let column = 0; column < this.values[0].length; column++) {
               
                result.push(this.values[column][row]);
            }
        }
        return result;
        */
       return this.values.flat();
    }

}
export class mat2 extends mat {
    constructor(row1? : number[], row2? : number[]) {
        let values : number[][] | undefined;
        if (row1 && row2) {
            values = [row1, row2];
        }
        else {
            values = undefined;
        }
        super(2, values);
    }
}

export class mat3 extends mat {
    constructor(row1? : number[], row2? : number[], row3? : number[]) {
        let values : number[][] | undefined;
        if (row1 && row2 && row3) {
            values = [row1, row2, row3];
        }
        else {
            values = undefined;
        }
        super(3, values);
    }
}

export class mat4 extends mat {
    constructor(row1? : number[], row2? : number[], row3? : number[], row4? : number[]) {
        let values : number[][] | undefined;
        if (row1 && row2 && row3 && row4) {
            values = [row1, row2, row3, row4];
        }
        else {
            values = undefined;
        }
        super(4, values);
    }
}

export function vectorLength(a : vec4 | vec3 | vec2) : number {
    return Math.sqrt(
        a.x * a.x + 
        a.y * a.y + 
        (("z" in a) ? a.z * a.z: 0) + 
        (("w" in a) ? a.w * a.w: 0) ) //last 2: if z is a property of a (i.e. vec3 or 4), then w (vec4)
}


export function normalize(vector : vec4, excludeLastComponent : boolean) : vec4;
export function normalize(vector : vec3, excludeLastComponent : boolean) : vec3;
export function normalize(vector : vec2, excludeLastComponent : boolean) : vec2;
export function normalize(vector : vec2 | vec3 | vec4, excludeLastComponent : boolean = false) : vec2 | vec3 | vec4 {
    if (vector instanceof vec4) {
        if (excludeLastComponent) {
            let len = Math.sqrt(vector.x*vector.x+vector.y*vector.y+vector.z*vector.z);
            let result = new vec4(vector.x/len, vector.y/len, vector.z/len, vector.w);
            return result; 
        }
        else {
            let len = Math.sqrt(vector.x*vector.x+vector.y*vector.y+vector.z*vector.z+vector.w*vector.w);
            let result = new vec4(vector.x/len, vector.y/len, vector.z/len, vector.w/len);
            return result;
        }
    }
    else if (vector instanceof vec3) {
        if (excludeLastComponent) {
            let len = Math.sqrt(vector.x*vector.x+vector.y*vector.y);
            let result = new vec3(vector.x/len, vector.y/len, vector.z);
            return result;
        }
        else {
            let len = Math.sqrt(vector.x*vector.x+vector.y*vector.y+vector.z*vector.z);
            let result = new vec3(vector.x/len, vector.y/len, vector.z/len);
            return result;
        }
    }
    else {
        let len = Math.sqrt(vector.x*vector.x+vector.y*vector.y);
        let result = new vec2(vector.x/len, vector.y/len);
        return result;
    }
    
}
export function normalizeRange(startingMin : number, startingMax : number, value : number, endingMin : number, endingMax : number){
    return ((endingMin + (value - startingMin) * (endingMax - endingMin) / (startingMax - startingMin)))
}
//perspective matrix 
export function perspective(fov : number, aspect : number, near : number, far : number) : mat4{
  fov = fov * Math.PI / 180.0; //to radians
  let f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
  let rangeInv = 1.0 / (near - far);
  return new mat4(
    /*
    [f / aspect, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, (near + far) * rangeInv, -1],
    [0, 0, 2 * near * far * rangeInv, 0]
    */
    [f / aspect, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, (near + far) * rangeInv, -1],
    [0, 0, 2 * near * far * rangeInv, 0]
    );
}

export function subtract(u : vec4, v : vec4) : vec4;
export function subtract(u : vec3, v : vec3) : vec3;
export function subtract(u : vec2, v : vec2) : vec2;
export function subtract(u : vec2 | vec3 | vec4, v : vec2 | vec3 | vec4) : vec2 | vec3 | vec4;
export function subtract(u : vec2 | vec3 | vec4, v : vec2 | vec3 | vec4) : vec2 | vec3 | vec4 {
    if (v instanceof vec4) {
        let z;
        if ("z" in u) {
            z = u.z;
        }
        else {
            z = 0;
        }
        let w;
        if ("w" in u) {
            w = u.w;
        }
        else {
            w = 0;
        }

        //isn't typescript great? this is way better than
        // return new vec4([u.x - v.x, u.y - v.y, (u.z) ? 0 : u.z - v.z, (u.w) ? 0: u.w - v.w])
        //yeah for whatever reason 
        return new vec4(u.x - v.x, u.y - v.y, z- v.z, w - v.w)
    
        
    }
    else if (v instanceof vec3) {
        let z;
        if ("z" in u) {
            z = u.z;
        }
        else {
            z = 0;
        }
        return new vec3(u.x - v.x, u.y - v.y, z - v.z)
    }
    else {
        return new vec2(u.x - v.x, u.y - v.y);
       }
}

export function cross(u : vec4, v: vec4) : vec4;
export function cross(u : vec3, v: vec3) : vec3;
export function cross(u : vec3 | vec4, v: vec3 | vec4) : vec3 | vec4 { 
    return new vec3(
        u.y*v.z - u.z*v.y,
        u.z*v.x - u.x*v.z,
        u.x*v.y - u.y*v.x
    );
}

export function negate(u:vec4) : vec4;
export function negate(u:vec3) : vec3;
export function negate(u:vec2) : vec2;
export function negate(u: vec2 | vec3 | vec4) : vec2 | vec3 | vec4 {
    if ("x" in u) u.x = -u.x;
    if ("y" in u) u.y = -u.y;
    if ("z" in u) u.z = -u.z;
    if ("w" in u) u.w = -u.w;
    return u;
}



export function identityMatrix(size : number) : number[][] {
    let result : number[][] = [];
    for (let i = 0; i < size; i++) {
        let row : number[] = [];
        for(let j = 0; j < size; j++) {
            if (j!=i) row.push(0)
            else row.push(1);
        }
        result.push(row)
    } 
    return result;
}
function dot(u : vec4, v : vec4) : number;
function dot(u : vec3, v : vec3) : number;
function dot(u : vec2, v : vec2) : number;
function dot(u : vec2 | vec3 | vec4, v : vec2 | vec3 | vec4) : number {
    let sum = 0.0;
    if ("x" in u) sum += u.x * v.x;
    if ("y" in u) sum += u.y * v.y;
    if ("z" in u && "z" in v) sum += u.z * v.z;
    if ("w" in u && "w" in v) sum += u.w * v.w;
    return sum;
}




export function scaleMatrix(w : number, h : number, d : number) : mat4 {
    return new mat4(
        [w, 0, 0, 0],
        [0, h, 0, 0],
        [0, 0, d, 0],
        [0, 0, 0, 1]
    )
}
export function rotateXMatrix(a : number) : mat4 {

    var cos = Math.cos;
    var sin = Math.sin;

    return new mat4(
        [1, 0, 0, 0],
        [0, cos(a), -sin(a), 0],
        [0, sin(a), cos(a), 0],
        [0, 0, 0, 1]
    )
}


export function rotateYMatrix(a : number) : mat4 {

    var cos = Math.cos;
    var sin = Math.sin;

    return new mat4(
        [cos(a), 0, sin(a), 0],
        [0, 1, 0, 0],
        [-sin(a), 0, cos(a), 0],
        [0, 0, 0, 1]
    )
}

export function rotateZMatrix(a : number) : mat4 {

    var cos = Math.cos;
    var sin = Math.sin;

    return new mat4(
        [cos(a), -sin(a), 0, 0],
        [sin(a), cos(a), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    )
}

export function translateMatrix(x : number, y : number, z : number) {
    return new mat4(
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1]
    )
}

export function lookAt( eye : vec3, at : vec3, up : vec3 ) : mat4 {
    // generic lookat function
    // can be used for pointing objects at things
    if ( eye.equals(at) ) {
        return new mat4();
    }

    let v : vec3= normalize( subtract(at, eye), false);  // view direction vector
    let n = normalize( cross(v, up), false); // perpendicular vector
    let u = normalize( cross(n, v), false);        // "new" up vector
    v = negate( v );

    let result = new mat4(
        [n.x, u.x, v.x, 0.0],
        [n.y, u.y, v.y, 0.0],
        [n.z, u.z, v.z, 0.0],
        [-dot(n, eye),  -dot(u, eye),  -dot(v, eye),  1.0]
    );
    return result;
}


export class Camera {
    cameraPosition : vec3;
    viewMatrix : mat4;
  constructor(cameraPosition : vec3) {
    this.cameraPosition = cameraPosition;
    this.viewMatrix = new mat4();
  }
  get position() {
    return this.cameraPosition
  }
  set position(newPos : vec3) {
    this.cameraPosition = newPos;
  }
  get view() {
    return this.viewMatrix;
  }
  set view(viewM : mat4) {
    this.viewMatrix = viewM;
  }
  RotateAround(angle_x : number, angle_y : number, point : vec3, radius : number) {
    //rotates the camera by radian angle, around a point, by moving along an axis
    this.cameraPosition.x = point.x + Math.cos(angle_y) * -Math.sin(angle_x) * radius;
    this.cameraPosition.y = point.y + Math.sin(angle_y) * radius;
    this.cameraPosition.z = point.z + Math.cos(angle_x) * Math.cos(angle_y) * radius;
    
    this.LookAt(undefined, point, undefined);
  }

  LookAt(eye : vec3 | undefined = undefined, at : vec3, up : vec3 | undefined = undefined) {

    if (eye == undefined) {
      eye = new vec3(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
    }
    if (up == undefined) {
      up = new vec3(0, 1, 0);
    }
    let result = lookAt(eye, at, up); 
    this.viewMatrix = result;
    return this.viewMatrix;
  }
}

export function roundTo(number : number, places : number) {
    return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
  }