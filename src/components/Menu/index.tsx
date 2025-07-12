export default function Menu() {
  return (
    <section
      aria-label="Menu"
      className="fixed pointer-events-none bottom-0 w-full h-40 flex justify-center xs:py-2 py-8 box-content text-white"
    >
      <article className="uppercase w-1/2 max-w-120 py-4 h-full rounded-sm bg-black/70  border border-px border-blue-200 flex flex-row">
        <div className="w-40 px-4 h-full shrink-0 flex flex-col items-center justify-end text-cyan-300">
          <span className="!text-xxxs text-center whitespace-nowrap">
            21.7679° N 78.8718° E
          </span>
        </div>
        <div className="w-full h-full px-4 flex flex-col items-start justify-center">
          <h1>India</h1>
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
