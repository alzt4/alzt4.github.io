declare module "webGLutils" {
    type perspectiveMatrix = [number, number, number, number,
        number, number, number, number,
        number, number, number, number,
        number, number, number, number
    ]

    declare function perspective(fov: number, aspect: number, near: number, far: number): perspectiveMatrix;

    declare function lookAt(eye: number[], at: number[]): number[];  //fix this
}