import { supabase } from "./supabase";

export async function signIn(email: string, password: string) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) return { data: null, error };

  const user = authData.user;

  //유저의 데이터를 업데이트 하기 위해 로그인 성공 정보를 가져오기
  const { data: authUser } = await supabase.auth.getUser();
  const uid = authUser?.user?.id;

  if (!uid || !user) return;

  // 프로필 존재 확인
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();

  // 프로필이 없고 user_metadata에 username이 있으면 insert
  if (!profile && user.user_metadata?.username) {
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        username: user.user_metadata.username,
      },
    ]);

    // insert 성공 시 user_metadata에서 제거
    if (!insertError) {
      await supabase.auth.updateUser({
        data: { username: null },
      });
    }
  }

  return { data: authData.user, error: null };
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  redirectUrl?: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      ...(redirectUrl && { emailRedirectTo: redirectUrl }),
      data: {
        username,
      },
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function checkEmailVerified(): Promise<boolean> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to fetch user:", error.message);
    return false;
  }

  return !!data.user?.email_confirmed_at;
}
