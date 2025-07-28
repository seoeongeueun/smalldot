import { useState, useEffect } from "react";
import clsx from "clsx";
import { useNotes } from "@/hooks/useNotes";
import { useClickStore } from "@/stores/clickStore";
import { useToastStore } from "@/stores/toastStore";
import { getKeywordsFromText } from "@/lib/geminiAnalyzer";

export default function TextBox() {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const countryCode = useClickStore((s) => s.countryCode);
  const toast = useToastStore((s) => s.toast);
  const setToast = useToastStore((s) => s.setToast);
  const resetToast = useToastStore((s) => s.reset);

  const { createNote } = useNotes();

  useEffect(() => {
    if (!toast) return;
    setIsLoading(false);

    const timeout = setTimeout(() => {
      resetToast();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    if (!countryCode) {
      setToast("Missing country code");
      return;
    }

    setIsLoading(true);

    try {
      // 제미나이 분석 키워드 또는 실패시는 문장의 첫 단어로 임시 지정
      const title =
        (await getKeywordsFromText(input)) || input.trim().split(" ")[0];

      createNote.mutate(
        {
          title,
          content: input,
          country_code: countryCode,
          date: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            setInput("");
            setToast("Saved");
          },
          onError: (error) => {
            if (error.message.includes("logged"))
              setToast("Log in expired", true);
            else setToast("Save failed", true);
          },
        }
      );
    } catch (err) {
      console.log("Title generation error:", err);
      setToast("Title generation failed", true);
    } finally {
      setIsLoading(false);
      setIsFocused(false);
    }
  };

  return (
    <section className="w-full flex flex-col items-end justify-start gap-2">
      {isLoading && (
        <i
          aria-hidden="true"
          className="hn hn-spinner-third text-theme animate-spin"
        ></i>
      )}
      {toast?.message && (
        <span
          className={clsx(
            "tracking-wide animate-fade",
            toast.isError ? "text-error" : "text-theme"
          )}
        >
          {toast.message.toUpperCase()}
        </span>
      )}
      <form
        onSubmit={handleSubmit}
        className={clsx(
          "w-full flex flex-row bg-black/20 backdrop-blur-xs text-white leading-8 h-8 px-2 gap-2 transition-all duration-300 border border-px rounded-xs",
          isFocused ? "border-theme" : "border-transparent"
        )}
      >
        <label htmlFor="note">NOTE:</label>
        <textarea
          id="note"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          className="pointer-events-auto w-full p-0 m-0 pr-1 resize-none outline-none focus:outline-none text-sm !leading-8"
          rows={1}
        ></textarea>
        <button
          type="submit"
          aria-label="Save note"
          className="pointer-events-auto border-none text-xxxs transition-colors"
        >
          SAVE
        </button>
      </form>
    </section>
  );
}
