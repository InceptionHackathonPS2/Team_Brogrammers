/**
 * Script to create dummy users via Supabase Admin API
 * 
 * Usage:
 * 1. Install dependencies: npm install @supabase/supabase-js dotenv
 * 2. Create .env file with:
 *    SUPABASE_URL=your_supabase_url
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 * 3. Run: node scripts/create-dummy-users.js
 * 
 * Note: This requires the Supabase Service Role Key (admin key)
 * Get it from: Supabase Dashboard → Settings → API → service_role key
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('Get your service role key from: Supabase Dashboard → Settings → API')
  process.exit(1)
}

// Create admin client (uses service role key for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}
)

// Read and parse users CSV
const usersCsv = readFileSync('dummy_data/users.csv', 'utf-8')
const users = parse(usersCsv, {
  columns: true,
  skip_empty_lines: true
})

async function createUsers() {
  console.log(`Creating ${users.length} users...\n`)

  for (const user of users) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: 'TestPassword123!', // Default password for dummy users
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: user.name
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${user.email} already exists, updating profile...`)
          // User exists, get their ID
          const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
          const foundUser = existingUser.users.find(u => u.email === user.email)
          
          if (foundUser) {
            // Update user profile
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update({
                name: user.name,
                college: user.college,
                year: user.year,
                department: user.department,
                bio: user.bio,
                skills: user.skills ? JSON.parse(user.skills.replace(/{/g, '[').replace(/}/g, ']')) : [],
                interests: user.interests ? JSON.parse(user.interests.replace(/{/g, '[').replace(/}/g, ']')) : [],
              })
              .eq('id', foundUser.id)

            if (updateError) {
              console.error(`  ❌ Error updating profile: ${updateError.message}`)
            } else {
              console.log(`  ✅ Updated profile for ${user.email}`)
            }
          }
        } else {
          console.error(`  ❌ Error creating ${user.email}: ${authError.message}`)
        }
        continue
      }

      if (!authData.user) {
        console.error(`  ❌ No user data returned for ${user.email}`)
        continue
      }

      // Parse skills and interests from CSV format
      const skills = user.skills 
        ? JSON.parse(user.skills.replace(/{/g, '[').replace(/}/g, ']'))
        : []
      const interests = user.interests
        ? JSON.parse(user.interests.replace(/{/g, '[').replace(/}/g, ']'))
        : []

      // Create user profile
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: user.email,
          name: user.name,
          college: user.college,
          year: user.year,
          department: user.department,
          bio: user.bio,
          skills: skills,
          interests: interests,
          avatar_url: user.avatar_url || null,
        })

      if (profileError) {
        console.error(`  ❌ Error creating profile for ${user.email}: ${profileError.message}`)
      } else {
        console.log(`  ✅ Created user: ${user.name} (${user.email})`)
        console.log(`     Password: TestPassword123!`)
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error for ${user.email}:`, error.message)
    }
  }

  console.log(`\n✅ Done! Created/updated ${users.length} users`)
  console.log(`\nDefault password for all users: TestPassword123!`)
  console.log(`\n⚠️  Remember to change passwords after first login!`)
}

createUsers().catch(console.error)

