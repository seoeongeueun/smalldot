import { supabase } from "./supabase";

export async function signIn(email: string, password: string) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) return { data: null, error };

  return { data: authData.user, error: null };
}

export async function signUp(
  email: string,
  password: string,
  username: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
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

export async function getUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { data: null, error: userError };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { data: profile, error: profileError };
}
