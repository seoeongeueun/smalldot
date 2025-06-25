import GlobeLines from "./GlobeLines";

export default function GlobeMesh() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#00b9e3" />
      </mesh>
      <GlobeLines />
    </>
  );
}
