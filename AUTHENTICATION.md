# QueueFlow - Authentication & Role-Based Access Control Documentation

## Overview

QueueFlow implements a comprehensive role-based access control (RBAC) system with multiple user roles, each with specific permissions and access levels.

---

## User Roles & Responsibilities

### 1. **Global Admin (You)**
**Email:** `incrediblegamer64@gmail.com`

**Permissions:**
- Create and manage restaurants
- Manage all staff members (assign roles, restaurants)
- View all queues and orders across all restaurants
- Audit system-wide activities
- Full system access

**Sign-In Flow:**
1. Click "Sign in with Google" on Login page
2. Select your email: `incrediblegamer64@gmail.com`
3. Verify with your Google account
4. System automatically detects you as global admin (email verification check)
5. Redirected to `/admin` (Admin Dashboard)
6. **No additional setup needed** - you're automatically recognized

---

### 2. **Restaurant Admin**
**Role:** `admin` in user profile

**Permissions:**
- Manage menu items (create, edit, delete)
- Manage staff members (assign as waiter/receptionist)
- View all queues and orders
- Generate reports
- Moderate customer interactions

**Sign-In Flow:**
1. Google login page appears
2. Sign in with your Google account
3. **First time login:** Onboarding screen appears asking for:
   - **Role:** Select `admin`
   - **Restaurant ID:** Enter your restaurant identifier (e.g., "pizza-palace")
4. Profile saved to Firestore `users/{uid}` with:
   ```json
   {
     "uid": "firebase-uid",
     "email": "admin@restaurant.com",
     "displayName": "Your Name",
     "role": "admin",
     "restaurantId": "pizza-palace",
     "createdAt": "2024-05-25T..."
   }
   ```
5. Redirected to `/admin` dashboard
6. **Future logins:** Auto-redirected to dashboard (no re-onboarding)

---

### 3. **Receptionist**
**Role:** `receptionist` in user profile

**Permissions:**
- Manage queue (seat customers, cancel entries)
- View active orders
- Cannot modify menu or staff

**Sign-In Flow:**
1. Google login page appears
2. Sign in with your Google account
3. **First time login:** Onboarding screen appears asking for:
   - **Role:** Select `receptionist`
   - **Restaurant ID:** Enter restaurant ID (provided by admin)
4. Profile saved to Firestore
5. Redirected to `/receptionist/{restaurantId}` dashboard
6. **Future logins:** Auto-redirected to same dashboard

---

### 4. **Waiter**
**Role:** `waiter` in user profile

**Permissions:**
- View queue and customer positions
- Notify customers
- View orders (read-only)
- Cannot modify menu, staff, or queue status

**Sign-In Flow:**
1. Google login page appears
2. Sign in with your Google account
3. **First time login:** Onboarding screen appears asking for:
   - **Role:** Select `waiter`
   - **Restaurant ID:** Enter restaurant ID (provided by admin)
4. Profile saved to Firestore
5. Redirected to `/waiter/{restaurantId}` dashboard
6. **Future logins:** Auto-redirected to same dashboard

---

## Technical Implementation

### Authentication Flow

```
User clicks Login
       ↓
Google OAuth Sign-In
       ↓
Firebase Auth Creates Session
       ↓
Check Firestore for User Profile
       ├─ Global Admin? → /admin
       ├─ Profile Exists? → Redirect to role dashboard
       └─ No Profile? → Show Onboarding
       ↓
Onboarding (First Time Only)
├─ Select Role (admin/receptionist/waiter)
├─ Enter Restaurant ID
├─ Save to Firestore
└─ Redirect to Role Dashboard
```

### Role Detection

**Global Admin Detection:**
```typescript
// Automatic - checked via Firebase token
if (user.email === "incrediblegamer64@gmail.com" && user.emailVerified) {
  role = "global_admin"
}
```

**Other Roles Detection:**
```typescript
// From Firestore users/{uid}
const userDoc = await getDoc(doc(db, 'users', user.uid));
const { role, restaurantId } = userDoc.data();
```

### Protected Routes

All staff routes are protected by the `ProtectedRoute` component:

```typescript
<Route 
  path="/admin" 
  element={
    <ProtectedRoute 
      userRole={profile?.role}
      requiredRoles={['admin', 'global_admin']}
      loading={profileLoading}
    >
      <AdminView />
    </ProtectedRoute>
  } 
/>
```

If user doesn't have required role → redirected to `/login`

---

## Firestore Rules (Security)

### Restaurants Collection
- **Read:** Anyone (customers need to see info)
- **Write:** Only global admin and restaurant admin

### Menu Items
- **Read:** Anyone
- **Write:** Only global admin and restaurant admin

### Queue
- **Read:** Anyone (to show position)
- **Create:** Customers (join queue)
- **Update:** 
  - Waiters: Can set status to `notified`
  - Receptionists: Can set status to `seated` or `cancelled`
  - Admin/Global Admin: Full control

### Orders
- **Read:** Authenticated users only
- **Create/Update:** Authenticated users
- **Delete:** Only admin/global admin

### Users Collection
- **Read:** Self or global admin only
- **Create:** Self (during onboarding)
- **Update:** Self (cannot change role/restaurantId)
- **Delete:** Only global admin

---

## Step-by-Step: Adding New Staff

### As Global Admin:

1. **Tell staff member to sign in** with their Google account
2. **They select their role** during onboarding:
   - Admin (manager)
   - Receptionist
   - Waiter
3. **They enter restaurant ID** (you provide this)
4. **System creates user profile** in Firestore
5. **They're automatically routed** to their dashboard

**No manual setup needed!** The onboarding is self-service.

---

## Step-by-Step: Setting Permissions

### User Profile Structure
```json
{
  "uid": "firebase-uid",
  "email": "staff@restaurant.com",
  "displayName": "Staff Name",
  "role": "waiter|receptionist|admin",
  "restaurantId": "restaurant-id",
  "createdAt": "ISO-timestamp"
}
```

### To Change Someone's Role:
1. Global Admin must manually update in Firestore Console
2. Or create an admin panel (future feature)
3. Firestore rules prevent users from changing their own role

---

## Security Features

✅ **Email Verification** - Global admin only via verified Google account
✅ **Role-Based Access Control** - Firestore rules enforce permissions
✅ **Route Protection** - Protected routes validate user role before rendering
✅ **Profile Isolation** - Users can only read/modify their own profile
✅ **Session Management** - Firebase Auth handles secure sessions
✅ **Menu Access** - Only admins can modify menus (fixed from MVP)
✅ **Restaurant Isolation** - Staff only see their assigned restaurant

---

## Troubleshooting

### Issue: "User profile not found" after login
**Solution:** Complete onboarding by selecting role and restaurant ID

### Issue: Redirected to login after onboarding
**Solution:** Check that role/restaurantId are correctly filled in Firestore

### Issue: Can't access admin panel
**Solution:** Ensure your email is `incrediblegamer64@gmail.com` with verified email

### Issue: Staff member can't see their restaurant
**Solution:** Verify restaurantId matches in their profile

---

## File Structure

```
src/
├── hooks/
│   └── useUserRole.ts          # Role detection hook
├── components/
│   ├── Login.tsx               # Login + onboarding flow
│   ├── UserOnboarding.tsx       # Role selection UI
│   ├── ProtectedRoute.tsx       # Route protection component
│   ├── AdminView.tsx            # Admin dashboard
│   ├── WaiterView.tsx          # Waiter dashboard
│   └── ReceptionistView.tsx     # Receptionist dashboard
├── App.tsx                      # Protected routing setup
└── firestore.rules              # Firestore security rules
```

---

## Future Enhancements

- [ ] Admin panel to manage staff roles
- [ ] Activity logging & audit trail
- [ ] Role-based dashboard customization
- [ ] Bulk staff import/export
- [ ] Permission templates
- [ ] 2FA for global admin
- [ ] Staff invitation system with email

---

## Questions?

For role assignment issues or permission questions, contact the global admin.
