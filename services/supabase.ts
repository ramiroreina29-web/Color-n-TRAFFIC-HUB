import { createClient } from '@supabase/supabase-js';

// Configuration from prompt
const SUPABASE_URL = 'https://rycthaanxldslgqivcna.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TN0ZCkYj8neQLTCA9Vn4Sg_nZ1tQMoh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BUCKET_NAME = 'colorinhub';