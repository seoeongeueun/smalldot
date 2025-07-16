import { useState } from "react";
import clsx from "clsx";

export default function TextBox() {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "w-full flex flex-row bg-black/20 backdrop-blur-xs leading-8 h-8 px-2 gap-2 transition-all duration-300 border border-px rounded-px",
        isFocused ? "border-theme" : "border-transparent"
      )}
    >
      <label htmlFor="note">NOTE:</label>
      <textarea
        id="note"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pointer-events-auto w-full p-0 m-0 resize-none outline-none focus:outline-none text-sm !leading-8"
        rows={1}
      ></textarea>
      <button
        type="submit"
        aria-label="Save note"
        className="pointer-events-auto border-none text-xxxs hover:cursor-pointer"
      >
        SAVE
      </button>
    </form>
  );
}
