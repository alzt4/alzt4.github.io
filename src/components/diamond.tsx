import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import diamondGLB from "../assets/diamond2.glb";
import * as THREE from "three";


function computeNormal(va : THREE.Vector3, vb : THREE.Vector3, vc : THREE.Vector3, target :THREE.Vector3 ){
    const cb = new THREE.Vector3()
    const ab = new THREE.Vector3()
    ab.subVectors(vb, va)
    cb.subVectors(vc, vb)
    target.crossVectors(cb, ab)
    
    target.normalize()
    target.negate();
    if (target.dot(va) < 0) {
        return false;
    }
    else {
        return true;
    }
  }
export function toConvexPolyhedronProps(geometry : THREE.BufferGeometry, scale : THREE.Vector3) {
    const position = geometry.attributes.position
    const normal = geometry.attributes.normal
    const vertices = []
    for (let i = 0; i < position.count; i++) {
        vertices.push(new THREE.Vector3().multiplyVectors(new THREE.Vector3().fromBufferAttribute(position, i), scale))
    }
    const faces = []
    for (let i = 0; i < position.count; i += 3) {
        const vertexNormals =
            normal === undefined
                ? []
                : [
                    new THREE.Vector3().fromBufferAttribute(normal, i),
                    new THREE.Vector3().fromBufferAttribute(normal, i + 1),
                    new THREE.Vector3().fromBufferAttribute(normal, i + 2),
                ]

        let face;
        if (computeNormal(vertices[0], vertices[1], vertices[2], vertexNormals[0])) {
            face = {
                a: i,
                b: i + 1,
                c: i + 2,
                normals: vertexNormals,
            }
        }
        else {
            face = {
                a: i,
                b: i + 2,
                c: i + 1,
                normals: vertexNormals,
            }
        }
        faces.push(face)
    }

    const verticesMap : any= {}
    const points = []
    const changes : any = []
    for (let i = 0, il = vertices.length; i < il; i++) {
        const v = vertices[i]
        const tempKey : string =
            Math.round(v.x * 100) +
            '_' +
            Math.round(v.y * 100) +
            '_' +
            Math.round(v.z * 100)
        const key : number  = parseFloat(tempKey);
        if (verticesMap[key] === undefined) {
            verticesMap[key] = i
            points.push({ x: vertices[i].x, y: vertices[i].y, z: vertices[i].z })
            changes[i] = points.length - 1
        } else {
            changes[i] = changes[verticesMap[key]]
        }
    }

    const faceIdsToRemove = []
    for (let i = 0, il = faces.length; i < il; i++) {
        const face = faces[i]
        face.a = changes[face.a]
        face.b = changes[face.b]
        face.c = changes[face.c]
        const indices = [face.a, face.b, face.c]
        for (let n = 0; n < 3; n++) {
            if (indices[n] === indices[(n + 1) % 3]) {
                faceIdsToRemove.push(i)
                break
            }
        }
    }

    for (let i = faceIdsToRemove.length - 1; i >= 0; i--) {
        const idx = faceIdsToRemove[i]
        faces.splice(idx, 1)
    }

    const cannonFaces = faces.map(function (f) {
        return [f.a, f.b, f.c]
    })

    return [points.map((v) => [v.x, v.y, v.z]), cannonFaces]
}


export function toConvexProps(geometry : THREE.BufferGeometry) {
    /*
    

    let vertices=[];
    for (let i = 0; i < object.geometry.attributes.position.count; i++) {
        vertices.push(new Vector3().fromBufferAttribute(object.geometry.attributes.position, i))
    }
    let convGeo = new ConvexGeometry(vertices);
    convGeo.computeVertexNormals();
    //console.log(convGeo);
    
    return toConvexPolyhedronProps(convGeo)
    */
    /*
    let geometry = new ConvexHull();
    geometry.setFromObject(object);
    geometry.compute();
    
    
    let vertices = [];
    let faces =[];
    geometry.vertices.forEach((vertex) => {
        vertices.push([vertex.point.x, vertex.point.y, vertex.point.z]);
    });
    geometry.faces.forEach((face) => {
        let faceData = [-1, -1, -1];
        let vertex1 = [face.edge.vertex.point.x, face.edge.vertex.point.y, face.edge.vertex.point.z]
        let vertex2 = [face.edge.next.vertex.point.x, face.edge.next.vertex.point.y, face.edge.next.vertex.point.z]
        let vertex3 = [face.edge.next.next.vertex.point.x, face.edge.next.next.vertex.point.y, face.edge.next.next.vertex.point.z]
        let normal = [face.normal.x, face.normal.y, face.normal.z];
        for (let i = 0; i < vertices.length; i++) {
            
            if (vertices[i][0]==vertex1[0] && vertices[i][1]==vertex1[1] && vertices[i][2]==vertex1[2]) {
                faceData[0]=i;
            }
            else if(vertices[i][0]==vertex2[0] && vertices[i][1]==vertex2[1] && vertices[i][2]==vertex2[2]) {
                faceData[1]=i;
            }
            else if(vertices[i][0]==vertex3[0] && vertices[i][1]==vertex3[1] && vertices[i][2]==vertex3[2]) {
                faceData[2]=i;
            }
        }
        if (faceData[0]!=-1 && faceData[1]!=-1 && faceData[2]!=-1) {
            faces.push(faceData);
        }
    })
    */
    const position = geometry.attributes.position;
    const index = geometry.index;
    const vertices = [];
    for (let i = 0; i < position.count; i++) {
        vertices.push(new THREE.Vector3().fromBufferAttribute(position, i))
    }
    let faces = [];
    for (let i = 0; i < index!.count; i+=3) {
        faces.push([index!.array[i], index!.array[i + 1], index!.array[i+2]]);
    }
    return [vertices.map((v) => [v.x, v.y, v.z]), faces]; 
  }
  

export default function Diamond()  {
    /* useEffect(() => {
        return () => {
            useGLTF.clear( diamondGLTFPath);   //clear cache of GLTFLoader
        }
    },[diamondGLTFPath]) */
    const { nodes, materials }  = useGLTF(diamondGLB);
    materials['Material'].transparent=true;
    const ref = useRef<THREE.Mesh>();
    /*
    const ref = useRef<THREE.Mesh>();
    
    const [diamondGeometry] = useTrimesh(() => ({
        args: [
            geometry.attributes.position.array,
            geometry.index.array,
        ],
        mass: 1,
        position:position,
        ...props,
    }),
        useRef<THREE.Object3D>()
    );
    */
    return (
        <mesh 
        ref={ref as React.RefObject<THREE.Mesh<THREE.BufferGeometry>>}        
        //@ts-ignore
        geometry={nodes.facetedDiamond.geometry} //this does exist, typescript is lying and I honestly cannot be bothered to 'fix' this.
        material={materials['Material']}
        >
            
        </mesh>
    );
}

