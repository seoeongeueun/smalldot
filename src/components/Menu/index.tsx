import { useClickStore } from "@/stores/clickStore";
import { geoPath, geoMercator } from "d3-geo";

export default function Menu() {
  const click = useClickStore((s) => s.click);
  if (!click?.feature) return null;

  const projection = geoMercator().fitSize([160, 80], click.feature); // SVG 크기에 맞게
  const pathGenerator = geoPath(projection);
  const d = pathGenerator(click.feature as any);

  return (
    <section
      aria-label="Menu"
      className="fixed pointer-events-none bottom-0 w-full h-40 flex justify-center xs:py-2 py-8 box-content text-white"
    >
      <article className="uppercase min-w-1/2 max-w-[40rem] py-4 h-full rounded-sm bg-black/70  border border-px border-blue-200 flex flex-row">
        <div className="w-40 px-4 h-full shrink-0 flex flex-col items-center justify-end text-cyan-300">
          <svg viewBox="0 0 160 80" width="100%" height="auto">
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
        <div className="w-full h-full px-4 flex flex-col items-start justify-center">
          <h1>{click.feature.properties?.name}</h1>
          <div className="mt-1 w-full flex flex-row items-center justify-between">
            <span>Notes:</span>
            <p>3</p>
          </div>
          <div className="w-full flex flex-row items-center justify-between">
            <span>Last Visited:</span>
            <p>01/01/2020</p>
          </div>
        </div>
      </article>
    </section>
  );
}
