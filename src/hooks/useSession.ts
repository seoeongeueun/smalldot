//유저 로그인 세션 정보
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export function useSession() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 세션 상태 변경되면 refetch
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  return sessionQuery;
}
