import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Note } from "@/types/database";
import { fetchNotesByCountryCodeFn, fetchNoteByIdFn } from "@/api/noteFetchers";

export function useNotes() {
  const queryClient = useQueryClient();

  //id로 단일 노트 반환
  const fetchNote = (id: string) =>
    useQuery({
      queryKey: ["note", id],
      queryFn: () => fetchNoteByIdFn(id),
      enabled: !!id,
    });

  // 나라 고유번호로 모든 메모 반환
  const fetchNotesByCountryCode = (countryCode: string | null) =>
    useQuery({
      queryKey: ["notes", countryCode],
      queryFn: () => fetchNotesByCountryCodeFn(countryCode),
      enabled: !!countryCode,
    });

  //노트 생성
  const createNote = useMutation({
    mutationFn: async (note: {
      title: string;
      content: string;
      country_code: string;
      date: string;
    }) => {
      const { data, error } = await supabase.from("notes").insert([note]);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.country_code],
      });
    },
  });

  // 아무 필드나 첨부된 값을 수정
  const updateNote = useMutation({
    //country_code는 오로지 쿼리 갱신용으로만 쓰기 때문에 분리
    mutationFn: async (
      payload: { id: string; country_code: string } & Partial<Note>
    ) => {
      const { id, country_code, ...fieldsToUpdate } = payload;
      const { data, error } = await supabase
        .from("notes")
        .update(fieldsToUpdate)
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      //캐싱된 목록에서 수정된 노트만 수정 사항을 반영
      queryClient.setQueryData<Note[]>(
        ["notes", variables.country_code],
        (prev) =>
          prev
            ? prev.map((n) =>
                n.id === variables.id ? { ...n, ...variables } : n
              )
            : []
      );
    },
  });

  //아이디로 노트 삭제
  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { data: note, error: fetchError } = await supabase
        .from("notes")
        .select("country_code")
        .eq("id", id)
        .single();

      if (fetchError || !note) throw fetchError;

      const { error: deleteError } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;

      return note.country_code;
    },
    onSuccess: (country_code) => {
      queryClient.invalidateQueries({ queryKey: ["notes", country_code] });
    },
  });

  return {
    fetchNote,
    fetchNotesByCountryCode,
    createNote,
    updateNote,
    deleteNote,
  };
}
