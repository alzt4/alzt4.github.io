import {useEffect, useRef} from "react";
import { vectorLength, subtract } from "./webGLutils";
import { useWebGLContext } from "./webGLContext";

export type OrbitControlsProps = {
    distance?:number,
    minDistance?:number, 
    maxDistance?:number
}

// this is a decorator to be applied to the WebGLCanvas component
// just nest this component inside
export function OrbitControls({ distance = 5, minDistance = 0, maxDistance = 25} : OrbitControlsProps) {
   const drag = useRef<boolean>(false); // controls whether moving the mouse changes the camera
   const hasDragged = useRef<boolean>(false); // records down if the user clicked or actually dragged
   const oldX = useRef<number>(0); // records down the last time the mouse was captured, used to keep track of how far the mouse moves in between frames
   const oldY = useRef<number>(0);
   const mouseDownX = useRef<number>(0); // records down the initial click location
   const mouseDownY= useRef<number>(0);
   const lastMouseMove = useRef<number>(Date.now()); // records down the last time the mouse was moved, i forgot what this was originally for but I might remember it someday, so it stays
   const theta = useRef<number>(0); // horizontal angle
   const phi = useRef<number>(0); // vertical angle
   const dX = useRef<number>(0); // difference in mouse positions between the last frame and this one
   const dY = useRef<number>(0);

   
   //check if distance is within min and max, if it isn't we just defalt to somewhere in between the two
   const orbitRadius = useRef<number>((maxDistance - minDistance) / 4);
   if (distance > minDistance && distance < maxDistance) {
    orbitRadius.current = distance; // how far the camera should orbit around the object
   }

    const { 
        canvasRef,
        objects, 
        activeCamera, 
        activeObject, 
        contextReady} = useWebGLContext()

    function mouseDown(e : MouseEvent) {
        // if the user clicks, we enable 'drag', which enables the camera to move around
       drag.current = true;
       hasDragged.current=false; // we resett the value, in case the user lets go without dragging (which would be a click)
       oldX.current=e.pageX; // we record down the last location of the mouse
       oldY.current=e.pageY;
       mouseDownX.current=e.pageX; // record down the initial location of the mouse
       mouseDownY.current=e.pageY;
        e.preventDefault();
        return false;
    };
    
    function mouseUp() {
        // reset both drag values
        drag.current = false;
        hasDragged.current=false;
    };
    /*
    function mouseOut(e : MouseEvent) {
        drag.current=false;
    };
    */
    function mouseMove(e : MouseEvent) {
        if (!drag.current) return false;
        else {
            lastMouseMove.current = Date.now();

            // calculate how far the mouse moves
            dX.current = (e.pageX - oldX.current) * 2 * Math.PI / canvasRef.current.width;
            dY.current = (e.pageY - oldY.current) * 2 * Math.PI / canvasRef.current.height;
        
            // if the user moved more than 1% of the screen, that is a drag
            if (Math.abs(mouseDownX.current - e.pageX) / canvasRef.current.width > 0.01 || Math.abs(mouseDownY.current - e.pageY) / canvasRef.current.height > 0.01) {
                hasDragged.current = true;
            }
        
            // this variable is a function of the distance of the camera from the surface of the sphere
            // the closer that the user zooms in to the surface, the slower the camera should move 
            // we know that the furthest the camera can move from the sphere is 20, so we set that as the maximum speed we can go
            // first, we subtract the position of the camera from the thing it is orbiting to get the vector between them
            // then we get the length of the vector, and divide that by 20 to get a number from 0 - 1 (or in this case, the closest
            // we can get to the sphere is 4.1, so 0.205 would be the minimum)
            
            translateMouseMove(dX.current, dY.current);
            
            // record down the location of the mouse at the end of this frame
            oldX.current = e.pageX;
            oldY.current = e.pageY;
        }
        e.preventDefault();
    };
    
    function translateMouseMove(dX : number, dY : number) {
        // we limit the amount that the camera moves based on how zoomed in the camera is
        let cameraZoomFactor = vectorLength( subtract(activeCamera.current.position, objects[activeObject].position)) / (maxDistance / 4);
      

        theta.current += dX * cameraZoomFactor; 

        // this is the same math as in the mouseMove event listener
        // we apply some math to limit the user from being able to go up or down past the poles
        // essentially, the closer to the poles the user gets, the more we apply a reverse force to stop them. 
        // if we are on the bottom of the sphere, and moving our mouse down, and that movement does not exceed the pole
        if (phi.current <= 0 && dY < 0 && phi.current + dY - (dY * (phi.current / (Math.PI / 2))) > -(Math.PI / 2)) {
          // this math makes the drag less effective the closer you get to the pole
          // phi/(pi/2) gives you a percentage of how close you are to the pole, with 1 at the pole and 0 at the equator
          // essentially, as you get closer to the pole, that fraction gets bigger and your movement gets smaller
          phi.current += (dY + (dY * (phi.current / (Math.PI / 2)))) * cameraZoomFactor;
        }
        // top of the sphere and moving up
        else if (phi.current >= 0 && dY > 0 && phi.current + dY - (dY * (phi.current / (Math.PI / 2))) < (Math.PI / 2)) {
            // the inverse of the above equation
            phi.current += (dY - (dY * (phi.current / (Math.PI / 2)))) * cameraZoomFactor;
        }
        // every other situation that does not involve moving past poles
        else if (phi.current + dY - (dY * (phi.current / (Math.PI / 2))) > -(Math.PI / 2) && phi.current + dY - (dY * (phi.current / (Math.PI / 2))) < (Math.PI / 2)) {
            phi.current += dY;
        }

        // we use the values to move the camera
        activeCamera.current.RotateAround(theta.current, phi.current, objects[activeObject].position, orbitRadius.current)
    }

    function ZoomCamera(e : WheelEvent) {
        if (e.deltaY < 0) {
            if (orbitRadius.current * 0.95 > minDistance) {
                orbitRadius.current *= 0.95; 
            }
        }
        // all other scenarios are e.deltaY > 0, so no need to check that
        else if ((orbitRadius.current * 100/95) < (maxDistance)) {
            orbitRadius.current *= 100 / 95;
        }
        // move the camera
        activeCamera.current.RotateAround(theta.current, phi.current, objects[activeObject].position, orbitRadius.current)
    }

    useEffect(() => {
        // once every thing is ready, we attach the event listeners
        if (canvasRef && canvasRef.current && contextReady) {
            canvasRef.current.addEventListener("mousedown", mouseDown);
            canvasRef.current.addEventListener("mouseup", mouseUp, false);
            //canvasRef.current.addEventListener("mouseleave", mouseOut, false);
            canvasRef.current.addEventListener("mousemove", mouseMove, false);
            canvasRef.current.addEventListener("wheel", ZoomCamera, false);

            // cleanup
            return () => {
                canvasRef.current.removeEventListener("mousedown", mouseDown);
                canvasRef.current.removeEventListener("mouseup", mouseUp, false);
                //canvasRef.current.removeEventListener("mouseleave", mouseOut, false);
                canvasRef.current.removeEventListener("mousemove", mouseMove, false);
                canvasRef.current.addEventListener("wheel", ZoomCamera, false);
                
            }

        }
    }, [canvasRef, contextReady])
    return null;
}