# Admin Access Configuration

## Current Admin Users

The following email addresses have admin access to Toolstoy:

- `mortadagzar@gmail.com`

## How Admin Access Works

Admin access is determined by email address in `src/context/UserContext.tsx`:

```typescript
const SUPER_ADMINS = ['mortadagzar@gmail.com', 'mortada@howvie.com']
const ADMINS: string[] = []      // Full admin access, cannot manage other admins
const ASSISTANTS: string[] = []   // Read-only admin dashboard access
```

Roles: `super_admin` | `admin` | `assistant` (any non-null = `isAdmin`).

When a user signs in:
1. Their email is checked against the `ADMIN_EMAILS` list
2. If matched, `user.isAdmin` is set to `true`
3. Admin users can access `/admin/*` routes
4. Non-admin users are redirected to `/dashboard` if they try to access admin routes

## Admin Features

Admin users have access to:

- **Toolstizer Dashboard** (`/admin`) - Platform health monitoring
- **Bedrock Playground** (`/admin/playground`) - Test image/video generation
- **Quality Lab** (`/admin/quality`) - Coming soon
- **Pipeline** (`/admin/pipeline`) - Coming soon
- **Merchants** (`/admin/merchants`) - Coming soon
- **Alerts** (`/admin/alerts`) - Coming soon

## Admin Navigation

Admin users see:
- "Admin Dashboard →" link in sidebar when viewing merchant dashboard
- "← Merchant Dashboard" link in sidebar when viewing admin dashboard
- "Toolstizer" badge instead of plan badge (Free/Pro/Enterprise)

## Adding New Admin Users

To add a new admin user:

1. Open `src/context/UserContext.tsx`
2. Add email to the appropriate list:
   ```typescript
   const SUPER_ADMINS = ['mortadagzar@gmail.com', 'newadmin@example.com']
   // or ADMINS for full admin, or ASSISTANTS for read-only
   ```
3. Save and redeploy
4. User must sign out and sign in again to get admin access

## Removing Admin Access

To remove admin access:

1. Open `src/context/UserContext.tsx`
2. Remove email from `SUPER_ADMINS`, `ADMINS`, or `ASSISTANTS` array
3. Save and redeploy
4. User will lose admin access on next page load

## Security Notes

- Admin emails are hardcoded in the frontend (not ideal for production)
- For production, consider:
  - Store admin list in environment variables
  - Use Cognito groups for role-based access
  - Implement backend admin verification
  - Add audit logging for admin actions

## Testing Admin Access

1. Sign in with admin email: `mortadagzar@gmail.com`
2. You should see "Toolstizer" badge in sidebar
3. Navigate to `/admin` - should work
4. Navigate to `/admin/playground` - should work
5. Sign out and sign in with non-admin email
6. Try to access `/admin` - should redirect to `/dashboard`

## Troubleshooting

**Issue: Admin user can't access /admin routes**
- Verify email is in `SUPER_ADMINS`, `ADMINS`, or `ASSISTANTS` array
- Check email spelling (case-insensitive)
- Sign out and sign in again
- Clear browser cache

**Issue: Non-admin user can access /admin routes**
- Check `AuthGuard` has `requireAdmin` prop
- Verify `isAdmin` check in `AuthGuard.tsx`
- Check browser console for errors

**Issue: Admin badge not showing**
- Check `user.isAdmin` in browser console
- Verify `UserContext` is providing `isAdmin`
- Check `Sidebar.tsx` is using `isAdmin` correctly

---

**Last Updated:** 2026-02-21
