import { create } from "zustand";
import type {
  Feature,
  Polygon,
  MultiPolygon,
  GeoJsonProperties,
} from "geojson";

type ClickFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties> | null;

type ClickStore = {
  click: {
    lat: number;
    lon: number;
    feature: ClickFeature;
  } | null;
  setClick: (lat: number, lon: number, feature: ClickFeature) => void;
};

export const useClickStore = create<ClickStore>((set) => ({
  click: null,
  setClick: (lat, lon, feature) => set({ click: { lat, lon, feature } }),
}));
