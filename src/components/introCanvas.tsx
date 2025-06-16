import { Canvas, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { EXRLoader } from 'three-stdlib'
import { Box, Environment, MeshRefractionMaterial, OrbitControls, useGLTF } from "@react-three/drei";
import { InstancedRigidBodies, InstancedRigidBodyProps, Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { startTransition, Suspense, useEffect, useMemo, useRef, useState } from "react";
import diamondGLB from "../assets/diamond2.glb";
//import hdr from "../assets/aerodynamics_workshop_1k.hdr"; // sourced https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr
import spaceExr from "../assets/starmap_2020_4k.exr"; // sourced https://svs.gsfc.nasa.gov/4851/
import bankVaultExr from "../assets/bank_vault_4k.exr";//sourced https://polyhaven.com/a/bank_vault
import schoolHallExr from "../assets/school_hall_4k.exr"; // sourced https://polyhaven.com/a/school_hall
import schoolQuadExr from "../assets/school_quad_4k.exr"; // sourced https://polyhaven.com/a/school_quad
import indoorPoolExr from "../assets/indoor_pool_4k.exr"; // ssourced https://polyhaven.com/a/indoor_pool
import deBalieExr from "../assets/de_balie_4k.exr"; // sourced https://polyhaven.com/a/de_balie
import poolExr from "../assets/pool_4k.exr"; // sourced https://polyhaven.com/a/pool
import aftLoungeExr from "../assets/aft_lounge_4k.exr"; // sourced https://polyhaven.com/a/aft_lounge
import castleZavelsteinCellarExr from "../assets/castle_zavelstein_cellar_4k.exr"; //sourced https://polyhaven.com/a/castle_zavelstein_cellar
import dresdenStationNightExr from "../assets/dresden_station_night_4k.exr"; // sourced https://polyhaven.com/a/dresden_station_night
import cinemaLobbyExr from "../assets/cinema_lobby_4k.exr"; // sourced https://polyhaven.com/a/cinema_lobby
import hamburgHBFExr from "../assets/hamburg_hbf_4k.exr"; // sourced https://polyhaven.com/a/hamburg_hbf
import glassPassageExr from "../assets/glass_passage_4k.exr"; //sourced https://polyhaven.com/a/glass_passage
import lapaExr from "../assets/lapa_4k.exr"; // sourced https://polyhaven.com/a/lapa
// import moonLabExr from "../assets/moon_lab_4k.exr"; // sourced https://polyhaven.com/a/moon_lab
import { normalizeRange } from "../webGLFunctions/webGLutils";
import { Loading } from "./loading";


//to do 


//notes
// center of scene is 0, 10, 0, because there is an invisible floor at 0


const createBody = (): InstancedRigidBodyProps => ({
  key: Math.random(),
  position: [(Math.random() - 0.5) * 19, ((Math.random() - 0.5) * 19) + 10, (Math.random() - 0.5) * 19],
  rotation: [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  ],
  scale: new Array<number>(3).fill(normalizeRange(0, 1, Math.random(), 0.35, 1)) as [number, number, number]
});

const useDiamond = () => {
  // @ts-ignore
  return useGLTF(diamondGLB) as {
    nodes: {
      facetedDiamond: THREE.Mesh;
    };
  };
};

//literally just a cube
function Cube() {
  return (<RigidBody type="fixed" colliders="cuboid" name="floor" restitution={1} friction={0.1}>
    <Box
      position={[0, -10, 0]}
      scale={[20, 20, 20]}
      rotation={[0, 0, 0]}
      receiveShadow
    >
      <shadowMaterial opacity={0.2} />
    </Box>
    <Box
      position={[0, 30, 0]}
      scale={[20, 20, 20]}
      rotation={[0, 0, 0]}
      receiveShadow
    >
      <shadowMaterial opacity={0.2} />
    </Box>
    <Box
      position={[20, 10, 0]}
      scale={[20, 20, 20]}
      rotation={[0, 0, 0]}
      receiveShadow
    >
      <shadowMaterial opacity={0.2} />
    </Box>
    <Box
      position={[-20, 10, 0]}
      scale={[20, 20, 20]}
      rotation={[0, 0, 0]}
      receiveShadow
    >
      <shadowMaterial opacity={0.2} />
    </Box>
    <Box
      position={[0, 10, 20]}
      scale={[20, 20, 20]}
      rotation={[0, 0, 0]}
      receiveShadow
    >
      <shadowMaterial opacity={0.2} />
    </Box>
    <Box
      position={[0, 10, -20]}
      scale={[20, 20, 20]}
      rotation={[0, 0, 0]}
      receiveShadow
    >
      <shadowMaterial opacity={0.2} />
    </Box>
  </RigidBody>)
}

function useEnvState() {
  const [envTexture, setEnvTexture] = useState("Indoor Pool")
  const keys : {[key : string] : any} = {
    "Aft Lounge" : aftLoungeExr,
    "Bank Vault" : bankVaultExr,
    "Castle Zavelstein Cellar" : castleZavelsteinCellarExr,
    "Cinema Lobby" : cinemaLobbyExr,
    "De Balie" : deBalieExr, 
    "Dresden Station, Night" : dresdenStationNightExr,
    "Glass Passage" : glassPassageExr,
    "Hamburg HBF" : hamburgHBFExr,
    "Indoor Pool" : indoorPoolExr,
    "Lapa" : lapaExr,
    "Pool" : poolExr, 
    "School Hall" : schoolHallExr,
    "School Quad" : schoolQuadExr, 
    "Space" : spaceExr,
  }
  const setEnv = (str:string) => {
    if (str in keys) {
      setEnvTexture(str);
    }
    else {
      return false;
    }
  }
  const getEnv = () => {
    return keys[envTexture];
  }

  const keyList=Object.keys(keys);
  return ({getEnv, setEnv, keyList})
}
export function IntroCanvas({ count = 100 }: { count: number }) {
  //const { nodes } = useGLTF(diamondGLB);
  const {
    nodes: { facetedDiamond }
  } = useDiamond();

  //const texture: THREE.DataTexture = useLoader(RGBELoader, hdr) as THREE.DataTexture
  const {getEnv, setEnv, keyList} = useEnvState();
  const onClickSetEnv = (key : string) => {
    startTransition(() => {
      setEnv(key);
    })
  }
  const texture: THREE.DataTexture = useLoader(EXRLoader, getEnv()) as THREE.DataTexture
  const bgColor = new THREE.Color(0xffffff);

  const api = useRef<RapierRigidBody[]>([]);
  const [bodies] = useState<InstancedRigidBodyProps[]>(() =>
    Array.from({
      length: count
    }).map(() => createBody())
  );

  const Impluse = (() => {
    //no clue why this needs to be a separate component for useEffect to actually work, since api is not null
    // like if you hoist this to the main component instead of as a child component it doesn't work
    // idk but React is supposed to make work faster or something
    // not fixing this
    useEffect(() => {
      api.current.forEach((body) => {
        body.addForce({ x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.15, z: (Math.random() - 0.5) * 0.15 }, true);
      });
    }, [])

    return null;
  });

  const getRandomColor = (i: number, r = Math.random()) =>
    (i === 0 || r > 0.3
      ? new THREE.Color('white')
      : r > 0.2
        ? new THREE.Color('#9a0050')
        : r > 0.1
          ? new THREE.Color('#509a00')
          : new THREE.Color('#00509a')
    ).toArray()
  const colorArray = useMemo(() => Float32Array.from(new Array(count).fill(undefined).flatMap((_, i) => getRandomColor(i))), [count])


  return (
    <Suspense fallback={Loading()}>
    <Suspense fallback={Loading()}>
      <Canvas camera={{ position: [0, 10, 5], near: 0.001 }}>
        <color
          attach="background"
          args={[bgColor.r, bgColor.g, bgColor.b]}
        />
        <Physics gravity={[0, 0, 0]}>
          <Environment files={getEnv()} background />
          <ambientLight intensity={10} />
          <directionalLight position={[0, 30, 0]} intensity={1000} color="white" />
            <Cube></Cube>
            <InstancedRigidBodies instances={bodies} ref={api} colliders="hull" restitution={1} friction={0.1}>
              <instancedMesh args={
                //@ts-ignore there is a github issue about this, I will add the link here if I remember
                [facetedDiamond.geometry, undefined, count]}
                frustumCulled={false}
                onClick={(evt) => {
                  api.current![evt.instanceId!].applyTorqueImpulse(
                    {
                      x: 0,
                      y: 1,
                      z: 0
                    },
                    true
                  );
                }}>
                <instancedBufferAttribute attach="geometry-attributes-color" args={[colorArray, 3]} />
                <MeshRefractionMaterial
                  envMap={texture}
                  ior={2.5}
                  bounces={2}
                  aberrationStrength={0.02}
                  fresnel={0.5}
                  toneMapped={false}
                  vertexColors
                />
              </instancedMesh>
            </InstancedRigidBodies>
            <Impluse></Impluse>
        </Physics>
        <OrbitControls target={[0, 10, 0]} autoRotate={true} autoRotateSpeed={3} enableZoom={false}></OrbitControls>
      </Canvas>
    </Suspense>
    <Suspense fallback={Loading()}>
      <div className="controls">{keyList.map((key : string)=> {
        return (<div className="controlButtons" key={key} onClick={()=>{onClickSetEnv(key)}}>{key}</div>)
      })}</div>
    </Suspense>
    </Suspense>
  )
}

export default IntroCanvas