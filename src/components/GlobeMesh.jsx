import GlobeLines from "./GlobeLines";

export default function GlobeMesh() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        {/* <meshStandardMaterial color="white" /> */}
        {/* 조명 무시 버전 */}
        <meshBasicMaterial color="darkslateblue" />
      </mesh>
      <GlobeLines />
    </>
  );
}
