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
  countryCode: string | null;
  setClick: (lat: number, lon: number, feature: ClickFeature) => void;
  reset: () => void;
};

export const useClickStore = create<ClickStore>((set) => ({
  click: null,
  countryCode: null,
  setClick: (lat, lon, feature) =>
    set({
      click: { lat, lon, feature },
      countryCode: feature?.properties?.iso_a3 || null,
    }),
  reset: () => set({ click: null, countryCode: null }),
}));
