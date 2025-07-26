import { useState, useEffect, useCallback } from "react";
import { signIn, signUp, checkEmailVerified } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, ERROR_STATUS } from "@/utils/constants";
import { getErrorStatusFromMessage } from "@/utils/helpers";
import { useModalStore } from "@/stores/modalStore";
import clsx from "clsx";
import { useForm } from "react-hook-form";

type FormFields = {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
};

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [status, setStatus] = useState<ERROR_STATUS>("DEFAULT");
  const setIsOpen = useModalStore((s) => s.setIsOpen);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormFields>();

  //모드가 바뀌면 에러 메세지와 인풋을 초기화
  useEffect(() => {
    setStatus("DEFAULT");
  }, [isSignup]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "SIGNUP_SUCCESS") setIsSignup(false);
      if (status === "LOGIN_SUCCESS") setIsOpen(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [status]);

  const onSubmit = async (data: FormFields) => {
    setIsLoading(true);

    if (isSignup && !data.username?.trim()) {
      setStatus("MISSING_INPUT");
      setIsLoading(false);
      return;
    }

    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    if (isSignup && password !== confirmPassword) {
      setStatus("PASSWORD_MISMATCH");
      setIsLoading(false);
      return;
    }

    try {
      const { data: result, error } = isSignup
        ? await signUp(data.email, data.password, data.username!)
        : await signIn(data.email, data.password);

      if (error) {
        console.log(`${isSignup ? "Signup" : "Login"} error:`, error);
        setStatus(getErrorStatusFromMessage(error.message));
      } else {
        setStatus(isSignup ? "SIGNUP_SUCCESS" : "LOGIN_SUCCESS");
      }
    } catch (err) {
      setStatus("UNEXPECTED_ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = () => {
    setStatus("INVALID_INPUT");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="relative flex flex-col gap-3 w-full"
    >
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
              type="email"
              placeholder="youremail@gmail.com"
              className="ml-auto border rounded-xs border-px px-2 w-full max-w-[60%]"
              {...register("email", { required: true })}
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <i className="hn hn-lock text-[0.8rem] mb-px"></i>
            <label className="text-xs whitespace-nowrap" htmlFor="password">
              PASSWORD:
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              placeholder="••••••••"
              className="ml-auto border rounded-xs border-px px-2 w-full max-w-[60%]"
            />
          </div>
          {isSignup && (
            <div className="flex flex-row items-center gap-2">
              <i className="hn hn-lock text-[0.8rem] mb-px"></i>
              <label
                className="text-xs whitespace-nowrap"
                htmlFor="confirmPassword"
              >
                CONFIRM:
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: true,
                })}
                placeholder="••••••••"
                className="ml-auto border rounded-xs border-px px-2 w-full max-w-[60%]"
              />
            </div>
          )}
          {isSignup && (
            <div className="flex flex-row items-center gap-2">
              <i className="hn hn-user-headset text-[0.8rem] mb-px"></i>
              <label className="text-xs whitespace-nowrap" htmlFor="username">
                AGENT NAME:
              </label>
              <input
                id="username"
                type="text"
                {...register("username", {
                  required: true,
                  minLength: { value: 2, message: "Username too short" },
                })}
                placeholder="ARMSTRONG"
                className="ml-auto border rounded-xs border-px px-2 w-full max-w-[60%]"
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
