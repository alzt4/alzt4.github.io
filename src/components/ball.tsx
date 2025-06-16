import {useRef, useState} from "react";


export function Ball(props : any) {
    const ref=useRef();
    const [hovered, hover] = useState(false)
    return (
        <mesh
          {...props}
          ref={ref}
          scale={hovered ? 1.5 : 1}
          onPointerOver={(event) => hover(true)}
          onPointerOut={(event) => hover(false)}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color={hovered ? '#50b31d' : '#0b25bf'} />
        </mesh>
      )
}

