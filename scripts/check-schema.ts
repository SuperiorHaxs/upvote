import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxezdhlspjilclwsswki.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZXpkaGxzcGppbGNsd3Nzd2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDU2MjEsImV4cCI6MjA4NDA4MTYyMX0.bDSSHZxDTfAPF13xs6RvqcOoR4Lk2SDLjEV_bbyfwzI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking arguments table...')
  const { data, error } = await supabase.from('arguments').select('*').limit(1)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Arguments data:', data)
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]))
    }
  }

  console.log('\nChecking profiles table...')
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(1)

  if (profilesError) {
    console.error('Error:', profilesError)
  } else {
    console.log('Profiles data:', profiles)
    if (profiles && profiles.length > 0) {
      console.log('Columns:', Object.keys(profiles[0]))
    }
  }
}

checkSchema()
