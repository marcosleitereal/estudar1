// Script to create admin user for Estudar.Pro Platform
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface AdminUser {
  email: string
  password: string
  name: string
  role: 'admin'
  isPremium: boolean
}

const adminUser: AdminUser = {
  email: 'dev@sonnik.com.br',
  password: 'EstudarPro2024!', // Strong default password - should be changed on first login
  name: 'Administrador Sonnik',
  role: 'admin',
  isPremium: true
}

async function createAdminUser() {
  console.log('🔧 Creating admin user for Estudar.Pro...')
  
  try {
    // 1. Create user in Supabase Auth
    console.log('📝 Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: adminUser.name,
        role: adminUser.role
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      
      // If user already exists, try to get existing user
      if (authError.message.includes('already registered')) {
        console.log('👤 User already exists, fetching existing user...')
        const { data: existingUsers, error: fetchError } = await supabase.auth.admin.listUsers()
        
        if (fetchError) {
          throw new Error(`Failed to fetch existing users: ${fetchError.message}`)
        }
        
        const existingUser = existingUsers.users.find(u => u.email === adminUser.email)
        if (!existingUser) {
          throw new Error('User exists but could not be found')
        }
        
        console.log('✅ Found existing user:', existingUser.id)
        
        // Update existing user to admin role
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            name: adminUser.name,
            role: adminUser.role
          }
        })
        
        if (updateError) {
          throw new Error(`Failed to update user role: ${updateError.message}`)
        }
        
        console.log('✅ Updated existing user to admin role')
        return existingUser
      } else {
        throw authError
      }
    }

    const user = authData.user
    if (!user) {
      throw new Error('User creation succeeded but no user data returned')
    }

    console.log('✅ Auth user created successfully:', user.id)

    // 2. Create user profile in users table
    console.log('📊 Creating user profile in database...')
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        is_premium: adminUser.isPremium,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        stats: {
          quizzes_completed: 0,
          study_time: 0,
          average_score: 0,
          streak: 0
        }
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError.message)
      // Don't throw here, auth user is already created
    } else {
      console.log('✅ User profile created successfully')
    }

    // 3. Grant admin permissions (if using RLS policies)
    console.log('🔐 Setting up admin permissions...')
    
    // Update RLS policies to recognize this user as admin
    const { error: policyError } = await supabase.rpc('grant_admin_access', {
      user_id: user.id
    })

    if (policyError) {
      console.log('⚠️  Admin RPC function not found, permissions will be handled by role')
    } else {
      console.log('✅ Admin permissions granted')
    }

    console.log('\n🎉 Admin user created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Password:', adminUser.password)
    console.log('👤 Name:', adminUser.name)
    console.log('🛡️  Role: Administrator')
    console.log('\n⚠️  IMPORTANT: Change the password on first login!')
    console.log('🌐 Login at: https://estudar-mzs6in.manus.space/auth/login')

    return user

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    throw error
  }
}

// Run the script if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('\n✅ Admin user creation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Admin user creation failed:', error)
      process.exit(1)
    })
}

export { createAdminUser, adminUser }

