import { useState, useEffect } from "react";
import { signIn, signUp, checkEmailVerified } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, ERROR_STATUS } from "@/utils/constants";
import { getErrorStatusFromMessage } from "@/utils/helpers";
import clsx from "clsx";

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [status, setStatus] = useState<ERROR_STATUS>("DEFAULT");

  //모드가 바뀌면 에러 메세지도 초기화
  useEffect(() => {
    setStatus("DEFAULT");
  }, [isSignup]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setIsLoading(true);

    try {
      const { error } = isSignup
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        console.log(`${isSignup ? "Signup" : "Login"} error:`, error);
        setStatus(getErrorStatusFromMessage(error.message));
      } else {
        if (isSignup) setStatus("SIGNUP_SUCCESS");
        else setStatus("LOGIN_SUCCESS");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setStatus("UNEXPECTED_ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="relative flex flex-col gap-3 w-full">
      <fieldset className="flex flex-col gap-3">
        <h3 className="tracking-wide">
          {isSignup ? "JOIN THE MISSION" : "ENTER CREDENTIALS"}
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <i className="hn hn-envelope text-[0.8rem] mb-px"></i>
            <label className="text-xs whitespace-nowrap" htmlFor="email">
              EMAIL:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="youremail@gmail.com"
              className="ml-auto border rounded-xs border-px px-2 w-full max-w-[60%]"
              required
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <i className="hn hn-lock text-[0.8rem] mb-px"></i>
            <label className="text-xs whitespace-nowrap" htmlFor="password">
              PASSWORD:
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              className="ml-auto border rounded-xs border-px px-2 w-full max-w-[60%]"
              required
            />
          </div>
          {isSignup && (
            <div className="flex flex-row items-center gap-2">
              <i className="hn hn-user-headset text-[0.8rem] mb-px"></i>
              <label className="text-xs whitespace-nowrap" htmlFor="username">
                AGENT NAME:
              </label>
              <input
                id="username"
                name="username"
                type="username"
                placeholder="ARMSTRONG"
                className="ml-auto border rounded-xs border-px px-2 w-full max-w-[60%]"
                required
              />
            </div>
          )}
          {status !== "DEFAULT" && (
            <div className="flex flex-row items-start gap-2">
              <i className="hn hn-message text-[0.8rem] mt-1" />
              <label className="text-xs">SYSTEM:</label>
              <span
                className={clsx(
                  "whitespace-pre-wrap break-words ml-auto max-w-[60%] text-start",
                  status.includes("SUCCESS") ? "text-theme" : "text-red-500"
                )}
              >
                {AUTH_ERROR_MESSAGES[status]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </fieldset>

      <div className="flex flex-row justify-between items-center gap-2">
        <button
          type="button"
          onClick={() => setIsSignup((prev) => !prev)}
          className="w-fit border border-px text-white px-2 text-xs uppercase"
        >
          <i
            className={`hn ${
              !isSignup ? "hn-upload" : "hn-login"
            } text-[0.8rem] mb-px`}
          />
          {isSignup ? "SWITCH TO LOG IN" : "SWITCH TO SIGN UP"}
        </button>
        <button
          type="submit"
          className="w-fit border border-px text-white px-2 text-xs uppercase"
        >
          {isLoading ? (
            <i
              aria-hidden="true"
              className="hn hn-spinner-third text-theme text-[0.8rem] animate-spin mb-px"
            ></i>
          ) : (
            <i className={`hn hn-check text-[0.8rem] mb-px`} />
          )}
          CONFIRM
        </button>
      </div>
    </form>
  );
}
