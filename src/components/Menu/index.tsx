import { useClickStore } from "@/stores/clickStore";
import { geoPath, geoMercator } from "d3-geo";

export default function Menu() {
  const click = useClickStore((s) => s.click);
  if (!click?.feature) return null;

  const projection = geoMercator().fitSize([160, 80], click.feature); // SVG 크기에 맞게
  const pathGenerator = geoPath(projection);
  const d = pathGenerator(click.feature as any);

  return (
    <article className="uppercase w-full py-4 h-full rounded-px bg-black/70 border border-px border-theme flex flex-row">
      <div className="w-40 px-4 shrink-0 flex flex-col items-center justify-end text-theme">
        <svg viewBox="0 0 160 80" width="100%" height="100%">
          <path d={d || ""} fill="none" stroke="cyan" strokeWidth={1} />
        </svg>
        <div className="flex flex-wrap gap-2">
          <span className="!text-xxxs text-center">
            {`${click.lat || 0}° N`}
          </span>
          <span className="!text-xxxs text-center">
            {`${click.lon || 0}° E`}
          </span>
        </div>
      </div>
      <div className="w-full h-full px-4 flex flex-col items-start justify-center tracking-wide">
        <h1>{click.feature.properties?.name}</h1>
        <div className="mt-1 w-full flex flex-row items-center justify-between">
          <span>Notes:</span>
          <p>3</p>
        </div>
        <div className="w-full flex flex-row items-center justify-between">
          <span>Last Visited:</span>
          <p>{new Date().toDateString()}</p>
        </div>
      </div>
    </article>
  );
}
