import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qckxhnrakxawjqevnvet.supabase.co";
const supabaseAnonKey = "sb_publishable_Q0H5QznFMZMaUMOfGPOTrA_BQhy-H0o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
