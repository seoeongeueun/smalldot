import AuthForm from "../AuthForm";
import { useState } from "react";
import UserModal from "../UserModal";

export default function LoginModal() {
  const [isPreview, setIsPreview] = useState<boolean>(true);

  return (
    <div className="flex w-full h-full !pointer-events-none items-center justify-center fixed inset-0 z-50">
      <div className="w-70 h-fit flex flex-col border border-theme border-px rounded-px pointer-events-auto bg-black/80 overflow-hidden backdrop-blur-xs p-4 text-white">
        {isPreview ? (
          <UserModal isLogin={false} setIsPreview={setIsPreview} />
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
}
