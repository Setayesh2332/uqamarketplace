import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase configuration missing. Define REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or equivalent SUPABASE_* vars) in your environment."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
