import { supabase } from "../lib/supabase";

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
}

export async function register(
  fullName: string,
  email: string,
  password: string,
  phone: string,
  role: "student" | "parent"
) {
  // Create Auth account
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;

  if (!user) throw new Error("Unable to create account.");

  // Save profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      role,
      phone,
    });

  if (profileError) throw profileError;

  return user;
}