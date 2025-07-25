import { supabase } from "./supabase";

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(
  email: string,
  password: string,
  redirectUrl?: string
) {
  return supabase.auth.signUp({
    email,
    password,
    ...(redirectUrl && {
      options: { emailRedirectTo: redirectUrl },
    }),
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
