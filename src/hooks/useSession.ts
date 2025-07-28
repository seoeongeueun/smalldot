//유저 로그인 세션 정보
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function useSession() {
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  return sessionQuery;
}

//유저 프로필 정보
export function useUserProfile(enable: boolean) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getUserProfile,
    select: (res) => res.data,
    enabled: enable,
  });
}
