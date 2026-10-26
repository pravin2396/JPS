# Job Portal System (JPS) - Module 1: Authentication

A comprehensive Job Portal System built with **React.js 19 (Vite)**, **Tailwind CSS**, **Context API**, **React Router v7**, **Axios / Fetch API**, **React Hook Form**, **React Toastify**, and **LocalStorage**.

---

## 🛠️ Technology Stack

| Technology | Purpose & Implementation |
|---|---|
| **React.js (Vite 8.3 & React 19)** | High performance frontend framework & lightning-fast bundler |
| **Tailwind CSS** | Clean, responsive, modern utility-first UI design |
| **Context API** | Global auth state management (`AuthProvider`, `useAuth`) |
| **React Router (v7)** | Client-side routing, protected routes & role-based route guards |
| **Axios** | Pre-configured API client with Bearer token request/response interceptors |
| **React Hook Form** | Declarative form handling and real-time validation rules |
| **React Toastify** | Animated feedback alerts (success, error, info notifications) |
| **LocalStorage** | Persistent session storage, mock JWT tokens, and users database |
| **Lucide React** | Icons for accessibility, password reveal, badges & dashboard stats |

---

## ✨ Features Implemented in Module 1

### 1. Role Selection (Candidate / Recruiter)
- **Registration**: Visual role cards distinguishing Candidate vs Recruiter accounts.
- **Login**: Role selection tab with instant demo fill buttons.
- **Dynamic Role Badge**: Highlighted badges throughout the navbar, profile, and dashboards.
- **Separate Dashboards**:
  - **Candidate Dashboard**: Job applications tracker, interview schedule, saved jobs.
  - **Recruiter Dashboard**: Published jobs list, applicant count, quick "Post Job" modal.

### 2. Login
- Email and password input with React Hook Form validation.
- Role-specific login verification.
- **Remember Me** option (stores remembered email in LocalStorage).
- **Password Show / Hide** toggle.
- **1-Click Demo Fill Buttons**:
  - `Candidate Demo`: `candidate@jobportal.dev` / `Password123!`
  - `Recruiter Demo`: `recruiter@jobportal.dev` / `Password123!`
- Loading spinner and button disabling during submission.
- Real-time React Toastify alerts on success and invalid credentials.

### 3. Register
- Full Name and Email validation.
- Account Role selection (Candidate vs Recruiter).
- **Role-specific fields**:
  - Recruiter: Company Name & Designation.
  - Candidate: Desired Job Title / Specialization.
- Password & Confirm Password with match validation.
- **Live Password Strength Meter**:
  - Color-coded bar (Weak, Fair, Good, Strong) + real-time checkmarks (8+ characters, uppercase, number, symbol).
- Password Show/Hide on both password fields.
- Terms & Conditions acceptance checkbox.
- Automatically stores newly registered user into LocalStorage.

### 4. Forgot Password UI
- **Step 1: Email Request**: Verifies email against registered LocalStorage accounts.
- **Step 2: OTP Verification**: Simulated 6-digit OTP delivery (`849201`) with 1-click **Auto Fill** helper.
- **Step 3: New Password**: Strong password creation with live show/hide and confirmation match.
- **Step 4: Success Confirmation**: Updates password in LocalStorage and directs user to login.

### 5. Password Show / Hide
- Reusable `PasswordInput` component with `Eye` / `EyeOff` icons.
- Fully accessible (`aria-label`, keyboard friendly, non-submitting toggle button).
- Applied on Login, Register, and Forgot Password screens.

### 6. Protected Routes & Authorization Guards
- `ProtectedRoute`:
  - Validates authentication state from `useAuth()`.
  - Preserves attempted URL via `location.state.from` for post-login redirect.
  - Enforces `allowedRoles`: If a Candidate tries to access `/recruiter/dashboard` or vice versa, they are redirected to `/unauthorized` with explanatory guidance.
- `PublicOnlyRoute`:
  - Redirects already logged-in users away from `/login` or `/register` to their role dashboard.

### 7. Logout
- Clears active user session and mock JWT token from LocalStorage.
- Resets AuthContext state.
- Dispatches informative toast alert and redirects to `/login`.

### 8. LocalStorage Persistence & Inspector
- Stored keys:
  - `jps_auth_user`: Active logged-in user profile.
  - `jps_auth_token`: Mock JWT token.
  - `jps_users`: Pre-seeded default users list + all registered users.
  - `jps_remembered_email`: Remembered login email.
- **Live LocalStorage Inspector**: Available on the `/profile` page to view and verify raw JSON data stored in browser LocalStorage.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# In the template folder
npm install
```

### 2. Run the Development Server
```bash
# Start Vite development server
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🔑 Default Test Accounts (Pre-seeded)

| Role | Email | Password | Pre-configured Details |
|---|---|---|---|
| **Candidate** | `candidate@jobportal.dev` | `Password123!` | Alex Johnson (Senior Frontend Developer) |
| **Recruiter** | `recruiter@jobportal.dev` | `Password123!` | Sarah Connor (TechCorp Innovations) |

*(You can also register brand-new Candidate or Recruiter accounts at `/register`, which will be persisted to LocalStorage.)*

---

## 📁 Project Architecture

```
template/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx             # Top navigation with role badge & user menu
│   │   │   ├── Footer.jsx             # Footer with system status
│   │   │   └── PasswordInput.jsx      # Reusable password show/hide input
│   │   └── routes/
│   │       ├── ProtectedRoute.jsx     # Route guard with role-based access control
│   │       └── PublicOnlyRoute.jsx    # Guard for unauthenticated routes
│   ├── context/
│   │   ├── authContextInstance.js     # React Context instance
│   │   └── AuthContext.jsx            # Auth Provider with login, register, logout
│   ├── hooks/
│   │   └── useAuth.js                 # useAuth custom hook
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx              # Sign-in form with demo buttons & validation
│   │   │   ├── Register.jsx           # Registration form with role cards & strength meter
│   │   │   └── ForgotPassword.jsx     # 3-step OTP recovery flow
│   │   ├── candidate/
│   │   │   └── CandidateDashboard.jsx # Protected Candidate portal
│   │   ├── recruiter/
│   │   │   └── RecruiterDashboard.jsx # Protected Recruiter portal
│   │   └── common/
│   │       ├── Home.jsx               # Landing page & features overview
│   │       ├── Profile.jsx            # User profile & LocalStorage inspector
│   │       ├── Unauthorized.jsx       # 403 Forbidden access page
│   │       └── NotFound.jsx           # 404 Not Found page
│   ├── services/
│   │   ├── api.js                     # Axios instance with request/response interceptors
│   │   ├── authService.js             # Simulated async auth API service
│   │   └── storageService.js          # LocalStorage CRUD & seed data
│   ├── utils/
│   │   └── validation.js              # React Hook Form validation rules & strength meter
│   ├── App.jsx                        # Main router & ToastContainer
│   ├── main.jsx                       # React entry point
│   └── index.css                      # Tailwind CSS v4 styling
├── package.json
└── vite.config.js
```
