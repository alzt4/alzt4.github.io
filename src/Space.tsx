import WebGL2Canvas from "./components/WebGLCanvas"
import { OrbitControls } from "./webGLFunctions/OrbitControls"

export default function Space(props: any) {
  return ( 
    <div><WebGL2Canvas>
      <OrbitControls ></OrbitControls>
      </WebGL2Canvas></div>
  )
}

