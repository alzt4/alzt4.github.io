import * as matrixFunctions from "matrixFunctions";



//perspective matrix 
export function perspective(fov, aspect, near, far) {
  fov = fov * Math.PI / 180.0; //to radians
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
  var rangeInv = 1.0 / (near - far);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, 2 * near * far * rangeInv, 0
  ];
}

function lookAt( eye, at, up )
{
    if ( equal(eye, at) ) {
        return mat4();
    }

    let v = normalize( subtract(at, eye) );  // view direction vector
    let n = normalize( cross(v, up) ); // perpendicular vector
    let u = normalize( cross(n, v) );        // "new" up vector
    v = negate( v );

    let result = mat4(
        n[0], n[1], n[2], -dot(n, eye),
        u[0], u[1], u[2], -dot(u, eye),
        v[0], v[1], v[2], -dot(v, eye),
        0.0,  0.0,  0.0,  1.0
    );

    return result;
}


export class Camera {
  constructor(cameraPosition) {
    this.cameraPosition = cameraPosition;
    this.viewMatrix = matrixFunctions.identityMatrix();
  }
  RotateAround(angle_x, angle_y, point, radius) {
    //rotates the camera by radian angle, around a point, by moving along an axis
    this.cameraPosition[0] = point[0] + Math.cos(angle_y) * -Math.sin(angle_x) * radius;
    this.cameraPosition[1] = point[1] + Math.sin(angle_y) * radius;
    this.cameraPosition[2] = point[2] + Math.cos(angle_x) * Math.cos(angle_y) * radius;

    this.LookAt(undefined, point, undefined);
  }

  LookAt(eye = undefined, at, up = undefined) {

    if (eye == undefined) {
      eye = vec3(this.cameraPosition[0], this.cameraPosition[1], this.cameraPosition[2]);
    }
    else {
      eye = vec3(eye[0], eye[1], eye[2]);
    }
    if (up == undefined) {
      up = vec3(worldUp[0], worldUp[1], worldUp[2]);
    }
    else {
      up = vec3(up[0], up[1], up[2]);
    }
    at = vec3(at[0], at[1], at[2]);
    let result = lookAt(eye, at, up); //this one is from MVNew.js
    this.viewMatrix = flatten(result);
    return this.viewMatrix;
  }
}