import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const RECOVERED_SUPABASE_URL = "https://dkeublajopddezuydulj.supabase.co";
const RECOVERED_PUBLIC_KEY = "sb_publishable_Ccqwvv68qeRgEfCq3wLZqg_MkdM0u_P";

export const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? RECOVERED_SUPABASE_URL;
export const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  RECOVERED_PUBLIC_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
