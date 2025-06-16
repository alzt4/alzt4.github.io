import { useEffect, useRef } from "react";
import { useWebGLContext } from "./webGLContext";


export function useWebGLRenderer()  {
    // Renderer
    // this code works for any number of objects
    // ideally nothing should change about this, since all this does is copy the relevant matrices over and then draw
    const {
        perspectiveController,
        objects, 
        activeCamera,
    } = useWebGLContext();
    const animationID = useRef<number>();
    

    function render() {
        for (let i = 0; i < objects.length; i++) {
            objects[i].perspectiveMatrix = perspectiveController.matrix;
            objects[i].cameraRef= activeCamera;
            objects[i].draw();
        }
        requestAnimationFrame(render)
    }
    useEffect(() => {
        animationID.current = requestAnimationFrame(render)
        return () => cancelAnimationFrame(animationID.current!);
    }, [render])
    

        

}
    
    
