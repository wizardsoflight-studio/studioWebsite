# Quick Start: Create Your First Admin

## 3-Step Setup (5 minutes)

### 1️⃣ Run the Migration

In **Supabase Dashboard** → **SQL Editor**, paste and run:

```sql
-- Create the RBAC system
-- (Copy entire contents of: supabase/migrations/20250320_create_rbac_system.sql)
```

Or via CLI:
```bash
npx supabase db push
```

---

### 2️⃣ Create Admin Account

**First, sign up** at: https://wizardoflight-studio.netlify.app/signup

Then run this SQL (replace with your email):

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

INSERT INTO admin_users (profile_id, granted_by)
SELECT id, id FROM profiles WHERE email = 'your-email@example.com'
ON CONFLICT (profile_id) DO NOTHING;
```

---

### 3️⃣ Access Admin Dashboard

1. **Log in** with your admin account
2. Click your **avatar** in the header → **Admin Dashboard**
3. Or go directly to: `/admin`

---

## That's It!

You now have:
- ✅ Role-based access control (Admin / Staff / Customer)
- ✅ Admin dashboard with user management
- ✅ Staff dashboard for operations
- ✅ Secure RLS policies
- ✅ Promote/demote users with one click

---

## Quick Reference

| URL | Access |
|-----|--------|
| `/admin` | Admins only |
| `/admin/staff` | Staff & Admins |
| `/account` | All logged-in users |

| Role | Dashboard | User Management |
|------|-----------|-----------------|
| **Admin** | ✅ Full access | ✅ Promote/Demote |
| **Staff** | ✅ Limited access | ❌ None |
| **Customer** | ❌ None | ❌ None |

---

For detailed documentation, see: [`docs/RBAC_SETUP.md`](./RBAC_SETUP.md)
