//유저 정보 또는 유저 정보의 프리뷰를 보여주는 모달의 내부 폼
import { maskEmail } from "@/utils/helpers";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { signOut } from "@/lib/auth";
import { useSession, useUserProfile } from "@/hooks/useSession";
import { useClickStore } from "@/stores/clickStore";
import { useNoteStore } from "@/stores/noteStore";

interface UserModalProps {
  isLogin: boolean;
  setIsPreview?: React.Dispatch<React.SetStateAction<boolean>>;
}

type ProfileType = {
  username: string;
  total_notes: number;
  recent_country: string;
  email: string;
};

export default function UserModal({ isLogin, setIsPreview }: UserModalProps) {
  const numberRef = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const clickReset = useClickStore((s) => s.reset);
  const noteReset = useNoteStore((s) => s.reset);

  const { data: session } = useSession();
  const { data: userProfile } = useUserProfile(!!session?.user?.id);

  useEffect(() => {
    if (userProfile) {
      setProfile({
        username: userProfile.username,
        total_notes: userProfile.total_notes,
        recent_country: userProfile.recent_country || "NO RECORD",
        email: session?.user.email ?? "",
      });
    }
  }, [userProfile, session?.user.id]);

  useEffect(() => {
    const timeouts: number[] = [];
    const intervals: number[] = [];

    const CHARS: string =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const DELAY_MS: number = isLogin ? 8000 : 4000;
    const SCRAMBLE_DURATION: number = isLogin ? 800 : 1000;
    const START_DELAY: [number, number] = isLogin ? [1000, 1500] : [200, 500];
    const LOOP_OPTION: boolean = true;

    const normalize = (t: string) =>
      t
        .replace(/\u00A0/g, " ")
        .trim()
        .replace(/\s+/g, " ");

    const getRandomDelay = () =>
      START_DELAY[0] + Math.random() * (START_DELAY[1] - START_DELAY[0]);

    const runScrambleLoop = (el: HTMLElement, originalText: string) => {
      const createSpansFrom = (text: string) => {
        el.innerHTML = text
          .split("")
          .map(
            (c) =>
              `<span class="scramble-letter">${c === " " ? "&nbsp;" : c}</span>`
          )
          .join("");
        return Array.from(
          el.querySelectorAll(".scramble-letter")
        ) as HTMLSpanElement[];
      };

      const removeSpans = () => {
        el.innerHTML = "";
      };

      const scrambleOnce = () => {
        const spans = createSpansFrom(originalText);
        const revealTimes = spans.map(() => Math.random() * SCRAMBLE_DURATION);
        const revealed = new Array(spans.length).fill(false);
        const startTime = performance.now();

        const interval = window.setInterval(() => {
          const now = performance.now();
          let allRevealed = true;

          spans.forEach((span, i) => {
            if (revealed[i]) return;

            if (now - startTime >= revealTimes[i]) {
              span.innerHTML =
                originalText[i] === " " ? "&nbsp;" : originalText[i];
              span.classList.add("revealed");
              revealed[i] = true;
            } else {
              allRevealed = false;
              span.textContent =
                CHARS[Math.floor(Math.random() * CHARS.length)];
              span.classList.remove("revealed");
            }
          });

          const isFullyRestored =
            normalize(spans.map((s) => s.textContent).join("")) ===
            normalize(originalText);

          if (allRevealed && isFullyRestored) {
            clearInterval(interval);
            if (LOOP_OPTION) {
              const timeout = window.setTimeout(() => {
                removeSpans();
                scrambleOnce(); // 반복
              }, DELAY_MS + getRandomDelay());
              timeouts.push(timeout);
            }
          }
        }, 50);

        intervals.push(interval);
      };

      const startDelay = getRandomDelay();
      const timeout = window.setTimeout(() => {
        scrambleOnce();
      }, startDelay);
      timeouts.push(timeout);
    };

    const elements = Array.from(
      document.querySelectorAll(".scramble-text")
    ) as HTMLElement[];

    elements.forEach((el) => {
      const originalText = (el.dataset.text || "").trim();
      if (!originalText) return;
      runScrambleLoop(el, originalText);
    });

    //유저의 총 메모 개수를 스크램블 하는 용도기 때문에 profile이 존재하는지 확인 필요
    const number = numberRef.current;
    if (number && profile) {
      const obj = { val: 0 };
      const target = profile.total_notes;

      gsap.to(obj, {
        val: target, // 최종 숫자
        duration: 0.8,
        ease: "power1.out",
        onUpdate: () => {
          number.textContent = Math.floor(obj.val).toString();
          if (Math.floor(obj.val) === target) {
            number.style.opacity = "1";
          } else {
            number.style.opacity = "0.5"; // 변화 중일 때 투명하게
          }
        },
      });
    }

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [profile]);

  const handleSwitchMode = () => {
    if (setIsPreview) setIsPreview(false);
  };

  const handleLogOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Sign out error:", error.message);
      } else {
        console.log("Signed out");

        //로그아웃 후 스토어 값 초기화
        clickReset();
        noteReset();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  if (isLogin) {
    return (
      <section className="whitespace-prewrap break-all flex flex-col gap-3 pointer-events-auto">
        <div className="flex flex-row items-center max-w-[calc(100%-2rem)] uppercase gap-2 tracking-wide">
          <h3>AGENT</h3>{" "}
          <h3
            className="scramble-text text-theme"
            data-text={profile?.username}
          ></h3>
        </div>
        <dl className="text-sm uppercase space-y-1">
          <div className="flex flex-row gap-2 justify-start items-center">
            <i className="hn hn-envelope text-[0.8rem] mb-px"></i>
            <dt className="font-medium">Email:</dt>
            <dd
              className="ml-auto scramble-text"
              data-text={maskEmail(profile?.email || "")}
            ></dd>
          </div>
          <div className="flex flex-row gap-2 justify-start items-center">
            <i className="hn hn-folder-open text-[0.8rem] mb-px"></i>
            <dt className="font-medium">Total Notes:</dt>
            <dd
              ref={numberRef}
              className="ml-auto scramble-number transition-opacity duration-300"
            >
              {profile?.total_notes}
            </dd>
          </div>
          <div className="flex flex-row gap-2 justify-start items-center">
            <i className="hn hn-globe-americas text-[0.8rem] mb-px"></i>
            <dt className="font-medium">Recent Country:</dt>
            <dd
              className="ml-auto scramble-text"
              data-text={profile?.recent_country}
            ></dd>
          </div>
        </dl>
        <button
          type="button"
          aria-label="Log out from your account"
          onClick={handleLogOut}
          className="w-fit border border-px text-white px-2 text-center rounded-xs gap-2 text-xs"
        >
          <i
            className="hn hn-logout text-[0.8rem] mb-px"
            aria-hidden="true"
          ></i>
          LOG OUT
        </button>
      </section>
    );
  } else {
    return (
      <section className="whitespace-prewrap break-all flex flex-col gap-3">
        <div className="flex flex-row items-center max-w-[calc(100%-2rem)] uppercase gap-2 tracking-wide">
          <h3>AGENT</h3>{" "}
          <h3 className="scramble-text text-theme" data-text="unknown"></h3>
        </div>

        <dl className="text-sm uppercase space-y-1">
          <div className="flex flex-row gap-2 justify-start items-center">
            <i className="hn hn-bell-exclaimation text-[0.8rem] mb-px"></i>
            <dt className="font-medium">new assignment:</dt>
            <dd
              className="ml-auto scramble-text"
              data-text="join the mission"
            ></dd>
          </div>
          <div className="flex flex-row gap-2 justify-start items-center">
            <i className="hn hn-plane-departure text-[0.8rem] mb-px"></i>
            <dt className="font-medium">setting course to:</dt>
            <dd className="ml-auto scramble-text" data-text="earth"></dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={handleSwitchMode}
          className="w-fit border border-px text-white px-2 text-center rounded-xs gap-2 text-xs uppercase"
        >
          <i className="hn hn-login text-[0.8rem] mb-px" aria-hidden="true"></i>
          SIGN IN TO START
        </button>
      </section>
    );
  }
}
