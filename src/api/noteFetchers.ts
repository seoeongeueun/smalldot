import { supabase } from "@/lib/supabase";
import type { Note } from "@/types/database";

// 나라 번호로 노트를 리턴
export const fetchNotesByCountryCodeFn = async (countryCode: string | null) => {
  //enabled 조건으로 countryCode가 없으면 애초에 실행되지 않지만 그래도 추후 다른 곳에도 쓰일 경우를 대비해 안전 조치
  if (!countryCode) {
    return [];
  }

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("country_code", countryCode)
    .order("date", { ascending: false, nullsFirst: false }) // date가 있는 애들을 우선
    .order("created_at", { ascending: false }); // date 없는 애들은 created_at 기준
  if (error) throw error;
  return data as Note[];
};

//고유 번호로 단일 노트를 반환
export const fetchNoteByIdFn = async (id: string) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};
