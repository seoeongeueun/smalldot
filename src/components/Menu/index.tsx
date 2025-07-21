import { useClickStore } from "@/stores/clickStore";
import { geoPath, geoMercator } from "d3-geo";

export default function Menu() {
  const click = useClickStore((s) => s.click);

  if (!click?.feature) return null;

  const projection = geoMercator().fitSize([160, 80], click.feature);
  const pathGenerator = geoPath(projection);
  const d = pathGenerator(click.feature as any);

  return (
    <article
      aria-labelledby="country-name"
      className="uppercase backdrop-blur-xs w-full sm:min-h-28 sm:h-auto py-2 h-full overflow-hidden rounded-xs bg-black/40 border border-px border-theme flex flex-row items-center"
    >
      <div className="w-40 h-full px-2 py-2 sm:mr-0 flex flex-col items-center justify-between text-theme">
        <svg viewBox="0 0 160 80" width="100%" height="100%">
          <path d={d || ""} fill="none" stroke="cyan" strokeWidth={1} />
        </svg>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <span className="!text-xxxs text-center">
            {`${click.lat || 0}° N`}
          </span>
          <span className="!text-xxxs text-center">
            {`${click.lon || 0}° E`}
          </span>
        </div>
      </div>
      <header className="w-full h-full pr-4 pr-2 ml-2 flex flex-col items-start justify-center tracking-wide">
        <h1 id="country-name" className="leading-[2rem]">
          {click.feature.properties?.name}
        </h1>
        <dl className="w-full mt-1 flex flex-col">
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <i
              aria-hidden="true"
              className="hn hn-folder-open text-[0.7rem] mb-px"
            ></i>
            <dt>
              <span>Notes:</span>
            </dt>
            <dd className="ml-1">
              <p aria-live="polite">3</p>
            </dd>
          </div>
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <i
              aria-hidden="true"
              className="hn hn-location-pin text-[0.7rem] mb-px"
            ></i>
            <dt>
              <span>Last Visited:</span>
            </dt>
            <dd className="ml-1">
              <p aria-live="polite">
                {new Intl.DateTimeFormat("en-US", {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                }).format(new Date())}
              </p>
            </dd>
          </div>
        </dl>
      </header>
    </article>
  );
}
