import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://eqbvawdjphbdfkmcpkry.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYnZhd2RqcGhiZGZrbWNwa3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjMxNDAsImV4cCI6MjEwMDc5OTE0MH0.Ia-XUZpZENZlgvH_bJTFfxwSbqa4QhYOtXCQ47PD7kA'
)

async function run() {
  console.log("Uploading file...")
  await supabase.storage.from('files').upload('test/move_test.txt', 'Hello World', { upsert: true })
  
  console.log("Moving file...")
  const { data, error } = await supabase.storage.from('files').move('test/move_test.txt', 'test/trash/move_test.txt')
  console.log("Move result:", data, error)
}
run()
