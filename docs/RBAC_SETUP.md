# RBAC (Role-Based Access Control) Setup Guide

## Overview

Wizard Of Light now has a comprehensive role-based access control system with three user levels:

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features, user management, can promote/demote users |
| **Staff** | Access to staff dashboard, manage orders, products, and customer support |
| **Customer** | Default role - can shop, view orders, manage profile |

---

## Step 1: Run the Migration

First, apply the RBAC migration to your Supabase database:

### Option A: Via Supabase CLI
```bash
npx supabase db push
```

### Option B: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250320_create_rbac_system.sql`
4. Paste and run the entire script

---

## Step 2: Create Your First Admin Account

### Method 1: Via SQL Editor (Recommended)

1. **Sign up** on your website as a normal user: `https://wizardoflight-studio.netlify.app/signup`

2. **Get your user ID** - In Supabase Dashboard:
   - Go to **Authentication** → **Users**
   - Find your email and copy the **User ID (UUID)**

3. **Run this SQL** in the SQL Editor (replace with your email):
```sql
-- Update your profile to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Add to admin_users table
INSERT INTO admin_users (profile_id, granted_by)
SELECT id, id FROM profiles WHERE email = 'your-email@example.com'
ON CONFLICT (profile_id) DO NOTHING;
```

### Method 2: Using the RPC Function

```sql
-- First get your user ID
SELECT id FROM profiles WHERE email = 'your-email@example.com';

-- Then run (replace UUID with your actual user ID)
SELECT assign_user_role(
    'YOUR-USER-ID-HERE'::uuid,
    'admin'
);
```

### Method 3: Direct Database Update

In Supabase Dashboard:
1. Go to **Table Editor** → **profiles**
2. Find your user row
3. Edit the **role** column and change from `customer` to `admin`
4. Save

---

## Step 3: Access the Admin Dashboard

Once your role is set to `admin`:

1. **Log in** to your account
2. You'll see an **"Admin Dashboard"** button in:
   - The header (click your avatar)
   - Your account page (`/account`)
3. Navigate to `/admin` directly

---

## Step 4: Managing Users (Admin Only)

From the Admin Dashboard:

### Promote a User to Staff
1. Find the user in the **User Management** table
2. Click **"Make Staff"** button
3. User now has access to `/admin/staff`

### Promote Staff to Admin
1. Find the staff member in the table
2. Click **"Promote to Admin"**
3. They now have full admin access

### Remove Admin/Staff Role
1. Click **"Remove Role"** button
2. User is demoted back to `customer` role

---

## Step 5: Staff Dashboard Access

Staff members can access:
- `/admin/staff` - Staff dashboard
- Order management
- Product management
- Customer messages
- Reports

Staff **cannot**:
- Access `/admin` (admin-only dashboard)
- Manage user roles
- Delete data

---

## Database Schema

### Tables Created

**`profiles`** (modified)
- `role` - ENUM (`admin`, `staff`, `customer`)

**`admin_users`** (new)
- `id` - UUID (references auth.users)
- `profile_id` - UUID (references profiles)
- `granted_by` - UUID (admin who granted the role)
- `granted_at` - Timestamp
- `expires_at` - Timestamp (for temporary roles)
- `permissions` - JSONB (custom permissions)

### Functions Created

| Function | Description |
|----------|-------------|
| `has_role(required_role)` | Check if current user has a role |
| `get_user_role()` | Get current user's role |
| `assign_user_role(target_user_id, new_role)` | Assign role to user (admin only) |
| `remove_user_role(target_user_id)` | Remove admin/staff role (admin only) |

### Views Created

**`admin_dashboard_stats`**
- Real-time statistics for the admin dashboard

---

## Security Features

### Row Level Security (RLS)

- Users can only view/edit their own profile
- Admins can view/edit all profiles
- Role changes require admin privileges
- Admins cannot remove their own role (prevents lockout)

### Function Security

All role management functions use `SECURITY DEFINER` which means:
- They execute with the database owner's privileges
- Input validation prevents privilege escalation
- Only admins can call role assignment functions

---

## Troubleshooting

### "Unauthorized" Error
- Verify your role in Supabase: `SELECT role FROM profiles WHERE email = 'your-email@example.com';`
- Make sure the migration was applied successfully

### Can't Access Admin Dashboard
- Clear browser cache and cookies
- Log out and log back in to refresh the session
- Check that your role is exactly `'admin'` (case-sensitive)

### Migration Fails
- Check if enum type already exists
- Ensure you have proper permissions in Supabase
- Try running individual sections of the migration

---

## API Routes

### Promote User
- **Path:** `/admin/promote`
- **Method:** POST
- **Body:** `userId`, `role`
- **Access:** Admin only

### Demote User
- **Path:** `/admin/demote`
- **Method:** POST
- **Body:** `userId`
- **Access:** Admin only

---

## Best Practices

1. **Limit Admin Accounts**: Only 1-2 trusted people should have admin access
2. **Use Staff for Operations**: Give staff role to employees who need operational access
3. **Audit Regularly**: Check the `admin_users` table for who granted what roles
4. **Temporary Roles**: Use `expires_at` for temporary staff (e.g., holiday helpers)

---

## Next Steps

After setup:
- [ ] Configure admin email notifications
- [ ] Set up audit logging for role changes
- [ ] Create staff training documentation
- [ ] Define custom permissions in `admin_users.permissions` JSONB field

---

**Questions?** Check the Supabase logs or review the migration file for detailed SQL comments.
