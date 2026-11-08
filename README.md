# 🎓 Apex International College - Frontend Client (Demo Edition)

A modern, full-featured Educational Institute Management System (EIMS) frontend for **Apex International College**, built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, and Shadcn UI.

---

## 🌟 What's New in this Demo Edition

1. **New Prestigious Identity**:
   - Rebranded from "Home Economics" to **Apex International College**.
   - Motto: *"Excellence in Education, Leadership in Innovation"*.
   - New custom vector crest logo in SVG format (`/src/assets/institution/logo.svg`).

2. **Refined Color Palette**:
   - **Primary Brand Navy**: `#0F284E` (replacing previous plum/purple `#5F345F`)
   - **Midnight Navy Surface**: `#0A1C36` & `#07152B` (replacing `#4A1942` & `#3a1434`)
   - **Warm Academic Gold / Amber**: `#F59E0B` (replacing mustard `#FFBC01`)
   - **Clean Accents**: Modern slate, sky blue, and crisp white cards.

3. **Cloudinary Image Integration**:
   - Third-party CDN image hosting via **Cloudinary** (`res.cloudinary.com`).
   - High-resolution Cloudinary assets for Hero banners, Campus at a Glance, Principal & Chairman messages, Head of Departments, Faculty, Student profiles, and Campus Life Gallery.
   - Cloudinary configured in `next.config.ts` under `remotePatterns`.

4. **One-Click Demo Login Helpers**:
   - Login pages (`/admin-login`, `/teacher-login`, `/student-login`) include **"Auto-Fill"** buttons for effortless testing.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@apexacademy.edu` | `admin123` | `/admin-login` -> `/dashboard` |
| **Faculty / Teacher** | `teacher@apexacademy.edu` | `teacher123` | `/teacher-login` -> `/teacher` |
| **Student** | `student@apexacademy.edu` | `student123` | `/student-login` -> `/student-dashboard` |

---

## 🚀 Getting Started

### 1. Ensure Dependencies
Dependencies are shared with the workspace. If needed:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Standalone & Fallback Architecture
The client is connected to `http://localhost:5000/api/v1` by default. If the backend server is temporarily offline, the client automatically engages the built-in demo fallback in `src/lib/demoData.ts` to ensure the landing page and public media render flawlessly without crashing.
