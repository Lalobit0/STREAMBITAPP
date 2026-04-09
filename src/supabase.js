import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://nxwvkyfeaaywfmungqbh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d3ZreWZlYWF5d2ZtdW5ncWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTA1ODAsImV4cCI6MjA5MTI2NjU4MH0.8HvMso2UaS4fPcZdU2wAhSjBN40dTOVWRGltOVFoBqc'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
