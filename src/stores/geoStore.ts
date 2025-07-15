// 로컬 world geo 파일을 저장
import { create } from "zustand";
import type { FeatureCollection } from "geojson";

interface GeoStore {
  geojson: FeatureCollection | null;
  setGeojson: (data: FeatureCollection) => void;
}

export const useGeoStore = create<GeoStore>((set) => ({
  geojson: null,
  setGeojson: (data) => set({ geojson: data }),
}));
