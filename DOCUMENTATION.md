# Udhanam Matrimony — Project Documentation

## 1. Overview

Udhanam Matrimony is a web-based marriage matchmaking and astrology consultation platform. A single owner/admin manages astrologers and customer interactions. Customers can browse astrologers, book consultations, chat in real-time, and call astrologers directly.

---

## 2. Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Frontend      | React 18 + TypeScript + Vite        |
| Styling       | Tailwind CSS + shadcn/ui            |
| Routing       | React Router v6                     |
| State/Data    | TanStack React Query                |
| Backend       | Lovable Cloud (Database, Auth, Realtime) |
| Validation    | Zod                                 |

---

## 3. Authentication & Authorization

- **Method**: Email/password signup & login
- **Roles**: `admin` | `customer` (stored in `user_roles` table)
- **Auto-provisioning**: A database trigger automatically creates a profile and assigns the `customer` role upon user signup
- **Admin access**: Separate `/admin-login` route for admin sign-in
- **Row Level Security (RLS)**: All tables are protected — customers can only access their own data, admins can access all data

---

## 4. Database Schema

### 4.1 `profiles`

Stores customer profile information linked to auth users.

| Column       | Type      | Nullable | Default           |
|-------------|-----------|----------|-------------------|
| id          | uuid (PK) | No       | gen_random_uuid() |
| user_id     | uuid (FK) | No       | —                 |
| full_name   | text      | Yes      | —                 |
| age         | integer   | Yes      | —                 |
| gender      | text      | Yes      | —                 |
| religion    | text      | Yes      | —                 |
| caste       | text      | Yes      | —                 |
| education   | text      | Yes      | —                 |
| profession  | text      | Yes      | —                 |
| birth_date  | date      | Yes      | —                 |
| birth_time  | time      | Yes      | —                 |
| birth_place | text      | Yes      | —                 |
| phone_number| text      | Yes      | —                 |
| created_at  | timestamptz | No     | now()             |
| updated_at  | timestamptz | No     | now()             |

**RLS Policies:**
- Customers: Read/write own profile only
- Admins: Read all profiles

---

### 4.2 `user_roles`

Maps users to their application role.

| Column  | Type         | Nullable | Default           |
|---------|-------------|----------|-------------------|
| id      | uuid (PK)   | No       | gen_random_uuid() |
| user_id | uuid (FK)   | No       | —                 |
| role    | enum        | No       | — (`admin` or `customer`) |

**RLS Policies:**
- Customers: Read own role only
- Admins: Full CRUD on all roles

---

### 4.3 `astrologers`

Stores astrologer details managed by admin.

| Column         | Type      | Nullable | Default           |
|---------------|-----------|----------|-------------------|
| id            | uuid (PK) | No       | gen_random_uuid() |
| name          | text      | No       | —                 |
| specialization| text      | No       | —                 |
| experience    | integer   | No       | 0                 |
| phone_number  | text      | No       | —                 |
| is_active     | boolean   | Yes      | true              |
| created_at    | timestamptz | No     | now()             |
| updated_at    | timestamptz | No     | now()             |

**RLS Policies:**
- Customers: Read active astrologers only
- Admins: Full CRUD

---

### 4.4 `bookings`

Tracks customer consultation bookings with astrologers.

| Column        | Type      | Nullable | Default           |
|--------------|-----------|----------|-------------------|
| id           | uuid (PK) | No       | gen_random_uuid() |
| user_id      | uuid (FK) | No       | —                 |
| astrologer_id| uuid (FK) | No       | —                 |
| booking_date | date      | No       | —                 |
| booking_time | time      | No       | —                 |
| status       | text      | Yes      | 'pending'         |
| created_at   | timestamptz | No     | now()             |
| updated_at   | timestamptz | No     | now()             |

**Status Flow:** `pending` → `confirmed` → `completed` (or `cancelled`)

**RLS Policies:**
- Customers: Read/create/update own bookings
- Admins: Read/update all bookings
- No delete allowed

---

### 4.5 `messages`

Real-time chat messages between customers and admin.

| Column      | Type      | Nullable | Default           |
|------------|-----------|----------|-------------------|
| id         | uuid (PK) | No       | gen_random_uuid() |
| sender_id  | uuid (FK) | No       | —                 |
| receiver_id| uuid (FK) | Yes      | —                 |
| booking_id | uuid (FK) | Yes      | —                 |
| content    | text      | No       | —                 |
| is_read    | boolean   | Yes      | false             |
| created_at | timestamptz | No     | now()             |

**RLS Policies:**
- Customers: Read/create own messages, update (mark read) own messages
- Admins: Read all messages, create messages
- No delete allowed

---

## 5. Page Routes

### 5.1 Public Routes

| Route          | Purpose                    |
|---------------|----------------------------|
| `/`           | Landing page               |
| `/auth`       | Customer sign up / sign in |
| `/admin-login`| Admin sign in              |

### 5.2 Customer Routes (Authenticated)

| Route           | Purpose                              |
|----------------|--------------------------------------|
| `/dashboard`   | Customer dashboard                   |
| `/profile`     | Edit profile (birth details, etc.)   |
| `/astrologers` | Browse active astrologers            |
| `/book/:id`    | Book a specific astrologer           |
| `/bookings`    | View booking history & actions       |
| `/messages`    | Chat with admin about bookings       |

### 5.3 Admin Routes (Admin Role Required)

| Route                          | Purpose                 |
|-------------------------------|-------------------------|
| `/admin`                      | Dashboard with stats    |
| `/admin/astrologers`          | Manage astrologers      |
| `/admin/astrologers/new`      | Add new astrologer      |
| `/admin/astrologers/:id/edit` | Edit astrologer         |
| `/admin/customers`            | View all customers      |
| `/admin/bookings`             | Manage all bookings     |
| `/admin/messages`             | Reply to customer chats |

---

## 6. Feature Details

### 6.1 Customer Features

- **Profile Management**: Users can fill in personal details including birth date, time, place, religion, caste, education, and profession
- **Astrologer Browsing**: View list of active astrologers with their name, specialization, and years of experience
- **Booking System**: Select an astrologer, choose date and time for consultation. Bookings go through status flow: pending → confirmed → completed
- **Real-time Chat**: Message the admin regarding confirmed or completed bookings. Messages update in real-time
- **Call Astrologer**: Direct phone call button available only for confirmed bookings. Disabled once booking is marked as completed

### 6.2 Admin Features

- **Dashboard**: Overview stats showing total customers, astrologers, bookings, and messages
- **Astrologer CRUD**: Add, edit, activate/deactivate astrologers with name, specialization, experience, and phone number
- **Customer Management**: View all registered customer profiles
- **Booking Management**: View all bookings across customers, update booking statuses
- **Messaging**: Reply to customer inquiries with real-time notifications including sound alerts and toast popups
- **Real-time Alerts**: Admin receives audio + visual notifications for new incoming customer messages

---

## 7. Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Navigation header
│   │   ├── Footer.tsx        # Page footer
│   │   └── Layout.tsx        # Layout wrapper component
│   ├── ui/                   # shadcn/ui components (50+ components)
│   └── NavLink.tsx           # Navigation link component
├── hooks/
│   ├── use-mobile.tsx        # Mobile detection hook
│   ├── use-toast.ts          # Toast notification hook
│   └── useAdminMessageNotifications.ts  # Real-time admin alerts
├── integrations/
│   └── supabase/
│       ├── client.ts         # Supabase client (auto-generated)
│       └── types.ts          # Database types (auto-generated)
├── lib/
│   ├── auth.tsx              # AuthProvider & useAuth hook
│   └── utils.ts              # Utility functions
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminAstrologers.tsx
│   │   ├── AstrologerForm.tsx
│   │   ├── AdminCustomers.tsx
│   │   ├── AdminBookings.tsx
│   │   └── AdminMessages.tsx
│   ├── Index.tsx             # Landing page
│   ├── Auth.tsx              # Customer authentication
│   ├── AdminLogin.tsx        # Admin authentication
│   ├── Dashboard.tsx         # Customer dashboard
│   ├── Profile.tsx           # Profile management
│   ├── Astrologers.tsx       # Astrologer listing
│   ├── BookAstrologer.tsx    # Booking form
│   ├── Bookings.tsx          # Booking history
│   ├── Messages.tsx          # Customer chat
│   └── NotFound.tsx          # 404 page
├── App.tsx                   # Root component with routes
├── App.css                   # Global styles
├── index.css                 # Tailwind & design tokens
└── main.tsx                  # Entry point
```

---

## 8. Security Summary

| Table        | RLS Enabled | Customer Access              | Admin Access        |
|-------------|-------------|------------------------------|---------------------|
| profiles    | ✅          | Own profile (read/write)     | All (read)          |
| user_roles  | ✅          | Own role (read)              | All (full CRUD)     |
| astrologers | ✅          | Active only (read)           | Full CRUD           |
| bookings    | ✅          | Own (read/create/update)     | All (read/update)   |
| messages    | ✅          | Own (read/create/update)     | All (read/create)   |

**Key Security Features:**
- All RLS policies use `RESTRICTIVE` mode (deny by default)
- Admin verification uses `has_role()` database function
- No direct foreign key to `auth.users` — uses `user_id` UUID references
- No delete operations allowed on bookings or messages

---

## 9. Business Rules

1. **Astrologers are human-led** — no AI-generated readings
2. **Call option** is available only during `confirmed` status, disabled on `completed`
3. **Chat** remains available for both `confirmed` and `completed` bookings
4. **Single admin** manages the entire platform
5. **New users** automatically receive `customer` role via database trigger
6. **Admin notifications** include sound alerts for incoming messages

---

*Generated: February 2026*
*Platform: Lovable Cloud*
