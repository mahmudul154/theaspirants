import { createClient } from '@supabase/supabase-js'

/* আগের অ্যাপের হুবহু same Supabase project */
const SUPABASE_URL = 'https://dgorizwfkyyjrufcqjjo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnb3Jpendma3l5anJ1ZmNxampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTMzODMsImV4cCI6MjA3NDM2OTM4M30.fuN6dnuCkDLEGknhYPJzh6-7O8ucUwBnrBelWc_NNB8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
