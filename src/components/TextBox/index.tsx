import { useState, useEffect } from "react";
import clsx from "clsx";

export default function TextBox() {
  const [isFocused, setIsFocused] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => {
      setMessage("");
    }, 1500);

    return () => clearTimeout(timeout);
  }, [message]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsFocused(false);
    setMessage("Saved");
  };

  return (
    <section className="w-full flex flex-col items-end justify-start gap-2">
      {message && (
        <span className="text-theme tracking-wide animate-fade">{message}</span>
      )}
      <form
        onSubmit={handleSubmit}
        className={clsx(
          "w-full flex flex-row bg-black/20 backdrop-blur-xs text-white leading-8 h-8 px-2 gap-2 transition-all duration-300 border border-px rounded-px",
          isFocused ? "border-theme" : "border-transparent"
        )}
      >
        <label htmlFor="note">NOTE:</label>
        <textarea
          id="note"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pointer-events-auto w-full p-0 m-0 pr-1 resize-none outline-none focus:outline-none text-sm !leading-8"
          rows={1}
        ></textarea>
        <button
          type="submit"
          aria-label="Save note"
          className="pointer-events-auto border-none text-xxxs hover:cursor-pointer hover:text-theme transition-colors"
        >
          SAVE
        </button>
      </form>
    </section>
  );
}
