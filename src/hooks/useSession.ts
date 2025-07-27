//유저 로그인 세션 정보
import { useQuery } from "@tanstack/react-query";
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
