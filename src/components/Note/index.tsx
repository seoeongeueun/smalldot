import { useState } from "react";
import clsx from "clsx";

export default function Note() {
  const [openSettings, setOpenSettings] = useState<boolean>(false);

  return (
    <article className="pointer-events-auto w-1/4 min-w-60 p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-1/2 h-fit text-white border border-px rounded-px border-theme bg-black/70 backdrop-blur-xs flex flex-col items-start justify-start gap-1">
      <div className="flex flex-row justify-end items-center w-full">
        <h2 className="mr-auto line-clamp-1">
          Title Title Title Title Title Title
        </h2>
        <div className="flex flex-row items-center gap-1">
          <div
            className={clsx(
              "flex flex-row gap-1 rounded-xs border border-px border-theme overflow-hidden transition-all",
              openSettings ? "w-fit px-px" : "w-0"
            )}
          >
            <button
              type="button"
              title="Edit"
              className="p-1 flex justify-center items-center"
            >
              <i className="hn hn-pen text-[1rem]"></i>
            </button>
            <button
              type="button"
              title="Delete"
              className="p-1 flex justify-center items-center"
            >
              <i className="hn hn-trash-alt text-[1rem]"></i>
            </button>
          </div>
          <button
            type="button"
            aria-label="Edit Note"
            className="rotate-45 p-1 flex items-center justify-center hover:cursor-pointer"
            onClick={() => setOpenSettings((prev) => !prev)}
          >
            <i className="hn hn-cog"></i>
          </button>
        </div>
      </div>
      <textarea id="note-text" readOnly className="w-full p-1" rows={10}>
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum." "Lorem ipsum dolor sit amet, consectetur
        adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
        in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
        qui officia deserunt mollit anim id est laborum.""
      </textarea>
      <span className="ml-auto">
        {new Intl.DateTimeFormat("en-US", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date())}
      </span>
    </article>
  );
}
