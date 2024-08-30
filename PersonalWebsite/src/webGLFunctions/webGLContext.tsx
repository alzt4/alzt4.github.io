import React, { useState, createContext, useContext } from "react";
import { perspective, Camera, mat4 } from "./webGLutils";
import { glBase } from "./webGLShapes";


export const WebGLContext = createContext(null as any);

// controller used to control the perspective matrix
// todo: rename to projection matrix controller, add orthagonal mode
class perspectiveMatrixController {
    _fov : number
    _aspect : number
    _zNear : number
    _zFar : number
    _matrix! : mat4 //! because typescript can't tell that the class method initiates this
    constructor(fov : number, aspect : number, zNear : number, zFar : number) {
        this._fov = fov;
        this._aspect = aspect;
        this._zNear = zNear;
        this._zFar = zFar;
        this.refreshMatrix();
    }
    refreshMatrix() {
        this._matrix = perspective(this._fov, this._aspect, this._zNear, this.zFar);
    }
    get fov() : number {
        return this._fov;
    }
    get aspect() : number {
        return this._aspect;
    }
    get zNear() : number {
        return this._zNear;
    }
    get zFar() : number {
        return this._zFar;
    }
    set fov(value : number) {
        this._fov = value;
        this.refreshMatrix();
    }
    set aspect(value : number) {
        this._aspect = value;
        this.refreshMatrix();
    } 
    set zNear(value : number) {
        this._zNear = value;
        this.refreshMatrix();
    } 
    set zFar(value : number) {
        this._zFar = value;
        this.refreshMatrix();
    }  
    get matrix() : mat4 {
        return this._matrix
    }

    reset() {
        this._fov = 90.0;
        this._aspect = 1.7777777777;
        this._zNear = 0.001;
        this._zFar = 300.0;
    }
}


// keeps track of webGL state machine
export function WebGLContextProvider({children} : { children : React.ReactNode }) {
    const [gl, setGL] = useState<WebGL2RenderingContext | null>(null);
    const [program, setProgram] = useState<WebGLProgram | null>(null);
    const [canvasRef, setCanvasRef] = useState<React.MutableRefObject<HTMLCanvasElement> | null>(null);
    const [perspectiveController] = useState<perspectiveMatrixController>(new perspectiveMatrixController(90.0, 1.7777777777, 0.001, 300.0))
    const [objects, setObjects] = useState<glBase[]>([]); //list of objects
    const [activeCamera, setActiveCamera] = useState<React.MutableRefObject<Camera>| null>(null);
    const [activeObject, setActiveObject] = useState<number>(0)
    const [contextReady, setContextReady] = useState<boolean>(false);

    //reset the context
    function resetContext() {
        setGL(null);
        setProgram(null);
        setCanvasRef(null);
        setObjects([]);
        setActiveCamera(null)
        setActiveObject(0);

        //reset perspective matrix to default
        perspectiveController.reset();
    }
   
    return (
        <WebGLContext.Provider value={{
            gl, setGL,
            program, setProgram,
            canvasRef, setCanvasRef,
            perspectiveController,
            objects, setObjects,
            activeCamera, setActiveCamera,
            activeObject, setActiveObject,
            contextReady, setContextReady,
            resetContext
        }}>
            {children}
        </WebGLContext.Provider>
    )
}

export function useWebGLContext() {
    // hook that returns all the values
    return useContext(WebGLContext);

    /*

    for convenience: 
    =======================================

     const { 
        gl, setGL,
        program, setProgram,
        canvasRef, setCanvasRef,
        perspectiveController,
        objects, setObjects,
        activeCamera, setActiveCamera,
        activeCamera, setActiveCamera,
        resetContext} = useWebGLContext()
        
    */ 
}