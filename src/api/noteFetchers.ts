import { supabase } from "@/lib/supabase";
import type { Note } from "@/types/database";

// 나라 번호로 노트를 리턴
export const fetchNotesByCountryCodeFn = async (countryCode: string) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("country_code", countryCode);
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
