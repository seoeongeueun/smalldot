import * as THREE from "three";

export interface TextPlacement {
  letter: string;
  position: [number, number, number];
  rotation: THREE.Euler;
  fontSize: number;
}

export type GridCell = {
  points: [
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3
  ];
};
