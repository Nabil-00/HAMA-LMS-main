# HAMA LMS - Learning Management System

## Project Overview

HAMA LMS is a comprehensive Learning Management System (LMS) built for music education, specifically tailored for teaching Hausa music production. The platform enables instructors to create, publish, and manage courses while providing students with an immersive learning experience.

### Core Purpose
- Music production education platform for Hausa artists
- Course creation and management for instructors
- Course enrollment and progress tracking for students
- Monetization of premium content via Paystack

---

## Technical Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication (Email/Password + OAuth ready)
  - Real-time subscriptions
  - Storage (for course assets)
  - Row Level Security (RLS)

### Payment Integration
- **Paystack** - Nigerian payment gateway for course purchases

---

## Database Schema

### Tables

#### 1. profiles
Extends Supabase Auth users with additional LMS metadata.
```sql
- id (UUID, PK)
- name (TEXT)
- role (TEXT) - Admin, Teacher, Student
- status (TEXT) - Active, Inactive, Suspended
- avatar_url (TEXT)
- department (TEXT)
- joined_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

#### 2. courses
Main course content storage.
```sql
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- thumbnail_url (TEXT)
- status (TEXT) - Draft, Published, Archived
- current_version (TEXT) - SemVer format
- tags (JSONB)
- author_id (UUID, FK to profiles)
- default_locale (TEXT)
- supported_locales (JSONB)
- localizations (JSONB)
- modules (JSONB)
- versions (JSONB)
- price (NUMERIC)
- is_free (BOOLEAN)
- last_modified (TIMESTAMP)
```

#### 3. enrollments
Tracks student course enrollments.
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- course_id (UUID, FK)
- enrolled_at (TIMESTAMP)
- enrolled_by (UUID, FK)
- status (TEXT) - Active, Completed, Dropped
```

#### 4. payments
Tracks course purchases.
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- course_id (UUID, FK)
- amount (NUMERIC)
- currency (TEXT)
- reference (TEXT, UNIQUE)
- status (TEXT) - pending, success, failed, refunded
- paystack_response (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 5. notifications
User notifications system.
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- title (TEXT)
- message (TEXT)
- type (TEXT) - Info, Success, Warning, Alert, Message
- is_read (BOOLEAN)
- link (TEXT)
- created_at (TIMESTAMP)
```

---

## Key Features

### 1. Authentication System
- Email/Password registration and login
- Google OAuth (configurable, requires verification)
- Session management via Supabase Auth
- Role-based access control (Admin, Teacher, Student)

### 2. Course Management
- **Course Builder** - Visual editor for creating courses
  - Module and lesson organization
  - Multiple content types (Video, Audio, Text, Quiz, Embed, etc.)
  - Thumbnail and media uploads
  - Course settings (price, free/paid)
- **Course List** - Browse and search courses
- **Course Player** - Immersive lesson viewing experience

### 3. Monetization
- Free and paid courses
- Paystack integration for payments
- Payment tracking and verification
- Automatic enrollment after successful payment

### 4. User Management
- Admin dashboard for user oversight
- Role-based permissions
- User status management (Active, Inactive, Suspended)

### 5. Notifications
- In-app notification system
- Notification center in header

---

## User Roles & Permissions

### Admin
- Full system access
- Create/Edit/Delete courses
- Manage users
- View analytics
- System settings

### Teacher
- Create and manage own courses
- View enrolled students
- Cannot access user management

### Student
- Browse and purchase courses
- View enrolled courses
- Track progress

---

## Content Types Supported

1. **TEXT** - Rich text lessons
2. **VIDEO_VOD** - Video on demand
3. **VIDEO_LIVE** - Live streaming
4. **AUDIO_PODCAST** - Audio content
5. **QUIZ** - Interactive quizzes
6. **SCORM_HTML5** - E-learning packages
7. **VR_AR** - Virtual reality content
8. **SIMULATION** - Interactive simulations
9. **ASSIGNMENT** - Homework/assignments
10. **EMBED** - External content embedding

---

## API Services

### courseService.ts
- `getCourses()` - Fetch all published courses
- `saveCourse()` - Create/update courses
- `deleteCourse()` - Remove courses
- `uploadAsset()` - Upload media files

### userService.ts
- User CRUD operations
- Enrollment management
- Payment processing

### paystackService.ts
- Payment initialization
- Script loading
- Transaction handling

### notificationService.ts
- Fetch notifications
- Mark as read
- Create notifications

---

## Security

### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only access own data
- Admins have elevated permissions

### Authentication
- Supabase Auth integration
- JWT-based sessions
- Secure password handling

---

## File Structure

```
HAMA-LMS-main/
├── components/
│   ├── Layout.tsx          # Main app layout with sidebar
│   ├── Login.tsx         # Login page
│   ├── Signup.tsx         # Registration page
│   ├── Dashboard.tsx      # User dashboard
│   ├── CourseList.tsx    # Course catalog
│   ├── CourseBuilder.tsx  # Course creation/editing
│   ├── UserManagement.tsx # Admin user management
│   └── ...
├── contexts/
│   └── AuthContext.tsx   # Authentication state
├── services/
│   ├── courseService.ts
│   ├── userService.ts
│   ├── paystackService.ts
│   └── notificationService.ts
├── types.ts              # TypeScript definitions
├── schema.sql            # Database schema
├── index.css            # Global styles
└── rebrand.css          # Design overrides
```

---

## Design System

### Color Palette (Alaport-inspired)
- **Background**: #1A1A1A (Deep Charcoal)
- **Primary Accent**: #D4AF37 (Rich Gold)
- **Secondary Accent**: #046307 (Emerald Green)
- **Text Primary**: #F5F5DC (Parchment)
- **Text Secondary**: #A0A0A0 (Muted Gray)

### Typography
- **Headers**: Montserrat (Bold/Black)
- **Body**: Inter
- **Accents**: Playfair Display (Serif)

---

## Deployment

### Vercel
- Frontend hosted on Vercel
- Environment variables for Supabase and Paystack keys

### Supabase
- PostgreSQL database
- Authentication
- Storage buckets
- Edge functions (future)

---

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
VITE_SITE_URL=https://yourdomain.com
```

---

## Future Enhancements

1. **Google OAuth** - Complete verification for production
2. **AI Course Generation** - Gemini integration for content creation
3. **Progress Tracking** - Lesson completion tracking
4. **Certificates** - Auto-generate completion certificates
5. **Analytics** - Detailed learning metrics
6. **Offline Mode** - PWA capabilities
7. **Live Classes** - Real-time video sessions

---

## Credits

Built with React, TypeScript, Supabase, and Paystack.
Design inspired by Alaport (Northern Nigerian music heritage platform).
