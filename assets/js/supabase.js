const SUPABASE_URL  = 'https://webyxfmlhynuubjpzxmz.supabase.co'
const SUPABASE_KEY  = 'sb_publishable_bjdXLU6-F34rXmasRx-HHg_uMGIlrwS'
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_KEY)