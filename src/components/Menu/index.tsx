import { useClickStore } from "@/stores/clickStore";
import { useRef, useEffect } from "react";
import { geoPath, geoMercator } from "d3-geo";
import gsap from "gsap";

export default function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const click = useClickStore((s) => s.click);

  if (!click?.feature) return null;

  const projection = geoMercator().fitSize([160, 80], click.feature);
  const pathGenerator = geoPath(projection);
  const d = pathGenerator(click.feature as any);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    // 기존 gsap 애니메이션 제거 (중복 방지)
    gsap.killTweensOf(menu);

    gsap.fromTo(
      menu,
      { scale: 0.7, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
    );
  }, [click.feature]);

  return (
    <article
      ref={menuRef}
      className="uppercase backdrop-blur-xs w-full py-4 h-full rounded-px bg-black/50 border border-px border-theme flex flex-row"
    >
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
      <div className="w-full h-full pr-4 pr-2 flex flex-col items-start justify-center tracking-wide">
        <h1>{click.feature.properties?.name}</h1>
        <dl className="w-full mt-1 flex flex-col">
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <i
              aria-hidden="true"
              className="hn hn-envelope text-[0.7rem] mb-px"
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
              <p aria-live="polite">{new Date().toDateString()}</p>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
