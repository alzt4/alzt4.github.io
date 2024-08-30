import { useRef, useEffect, useLayoutEffect } from "react";
import useWindowDimensions from "./windowDimensions";
import { DEFAULT_WEBGL_ATTRIBUTES } from "../config/WebGLOptions";
import { initShaders, Camera, vec3, vec4 } from "../webGLFunctions/webGLutils"
import { useWebGLRenderer } from "../webGLFunctions/webGLRenderer";
import { trianglePyramid , sphere } from "../webGLFunctions/webGLShapes";
import { useWebGLContext } from "../webGLFunctions/webGLContext";

// provides a blank webgl canvas
// todo: hoise object creation to Space component, for now they are created here

export default function WebGL2Canvas({children} : { children : React.ReactNode }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // width and height of the canvas
    const { width, height } = useWindowDimensions();
    
    const cameraRef = useRef<Camera>(new Camera(new vec3(0, 0, 5))) ;

    const { gl, setGL, program, setProgram, setCanvasRef, setObjects, setActiveCamera, perspectiveController, setContextReady} = useWebGLContext()

    // hook to activate the webGLRenderer
    useWebGLRenderer();

    // layout effect to ensure that the values are set before anything else is rendered
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const attribs: WebGLContextAttributes = {
            ...DEFAULT_WEBGL_ATTRIBUTES,
        }
        setGL(canvas?.getContext?.("webgl2", attribs) ?? undefined);
    }, []);

    // initial load
    useEffect(() => {
        // standard webgl startup
        gl?.clearColor(1.0, 1.0, 1.0, 1.0);
        gl?.viewport(0, 0, width, height);
        gl?.enable(gl.DEPTH_TEST);
        gl?.clear(gl.DEPTH_BUFFER_BIT);
        gl?.clear(gl.COLOR_BUFFER_BIT);
        if (gl) setProgram(initShaders(gl!, "basic")); // todo: switch this to a variable so that shaders can be swapped on the fly
        if (program) gl?.useProgram(program);
        setCanvasRef(canvasRef);
        cameraRef.current.LookAt(undefined, new vec3(0, 0, 0), undefined);
    },[gl]);

    // after the canvas setup is done, we load the objects
    // todo: hoist this to space component
    useEffect(() => {
        if (program) {
            gl?.useProgram(program!);
            const triPyramid = new trianglePyramid(gl!, program!, new vec3(0,0,0), new vec3(0,0,0), new vec3(1,1,1), 1.0, undefined)
            const sphereObj = new sphere(gl!, program!, 50, 50, 2, new vec3(0, 0, 0), new vec3(0, 0, 0), new vec3(1, 1, 1), 1.0, new vec4(1.0, 0.0, 0.0, 1.0))
            sphereObj.mode="WIREFRAME"
            let objects = [triPyramid, sphereObj];
            setObjects(objects);
            setActiveCamera(cameraRef)
            setContextReady(true);
        }
    }, [program, setObjects]);

    // refresh the camera if it changes
    useEffect(() => {
        setActiveCamera(cameraRef)
    },[cameraRef, setActiveCamera])

    //on resize
    useEffect(() => {
        gl?.viewport(0, 0, width, height);
        perspectiveController.aspect = width/height;
    },[width, height]);


    return (
        <>
            <canvas ref={canvasRef}
                width={width}
                height={height}
                style={{
                    //...props?.style,
                    width: "100%",
                    height: "100%",
                }}>
                    {children}
                </canvas>
        </>
    );
}