# 📈 TQP Platform: Progress Report & MVP Roadmap

## 📌 Executive Overview
The **TQP Platform** is a digital management system designed for the TQP (Tahfiz/Qur'an memorisation) programme of MSSN OAU. Its core objective is to replace irregular attendance and informal scheduling with a structured, accountable ecosystem driven by tutor assignments, progress tracking, and proactive intervention.

---

## 🛠️ Feature Audit: Planned vs. Implemented

| Plan Component | Status | Implemented Functionality | Pending Deliverables |
| :--- | :--- | :--- | :--- |
| **1. Student Onboarding** | 🟢 Done | Next.js onboarding form, academic level, faculty/dept, & current Qur'an baseline (Surah, Aayah, Page). | Semester target/goal setting (e.g. target Juz count for semester end). |
| **2. Schedule & Assignment** | 🟢 Done | Mongoose query methods & `getNextOccurrenceDate` proximity algorithm for active class mapping. | Dynamic schedule status updates based on real-time class boundaries. |
| **3. Tutor Management** | 🟢 Done | Tutor dashboard, student schedule retrieval, session logging, and custom group rule configurations (gender preference, max capacity limits, memorization ranges). | Tutor schedule override and custom leave management. |
| **4. Session Tracking** | 🟢 Done | Attendance recording (`present`/`absent`), memorization tracking, and past session history feeds. | Detailed performance notes and revision rating system. |
| **5. Student Progress Dashboard** | 🟢 Done | Progress metrics, attendance rate calculations, live class banners, status badges, and self-enrollment workflow (`enrollWithTutor`). | Semester target completion percentage visualizer. |
| **6. Coordinator System** | 🟢 Done | Admin analytics dashboard, rule-validated student assignment engine (`assignStudentToTutor`), bulk student assignment engine & UI (`assignBulkStudents`), and unassigned student queue management interface. | Automated student risk classification engine. |
| **7. Google Meet & Reminders** | 🟡 Partial | Dynamic pseudo-links and Google Meet link fallback resolution on dashboards. | Pre/post-class automated notifications via Email or WhatsApp. |

---

## 🎯 Current MVP Completion Status

[==================================....] 85% MVP Completed


### ✅ Phase 1: Onboarding & Foundations (Completed)
- [x] Student registration & academic profile setup (`StudentOnboardingForm`).
- [x] Initial Qur'an memorization entry (Surah, Aayah, Page, Juz).
- [x] Custom `SearchableSelect` components for faculties and Surah lists.
- [x] Data transformations for server actions (string to number conversions).

### ✅ Phase 2: Schedule Engine & Student Dashboard (Completed)
- [x] Query logic to retrieve nearest upcoming schedules (`getNearestSchedule`).
- [x] Date/time calculation helper (`getNextOccurrenceDate`) to map weekly recurring slots to current dates.
- [x] Render nearest upcoming session on the Student Dashboard (`/dashboard`).
- [x] Dynamic `JoinClassButton` rendering with active/inactive link state detection.
- [x] Student self-enrollment workflow (`enrollWithTutor`) with validation parity (gender restriction, Juz range compliance, capacity checks).

### ✅ Phase 3: Tutor Workflows & Session Logging (Completed)
- [x] Build Tutor Dashboard & schedule toggle mechanics (`ActivateNearestScheduleButton`).
- [x] Build Session Logger for tutors and recent session history feed:
  - Attendance Status (`present` / `absent`).
  - New Memorization completed (start/end Surah, Juz, Page).
  - Attendance rate calculations across sessions.

### 🟡 Phase 4: Coordinator & Admin System (Near Completion)
- [x] Admin Command Center overview (`/admin`) with platform KPIs (Total Students, Total Tutors, Live Classes).
- [x] Rule-validated student assignment engine (`assignStudentToTutor`) with capacity checks, gender rules (`femaleOnly`), and memorization range compliance (`Juz` matching).
- [x] Bulk Student Assignment engine & UI (`assignBulkStudents`).
- [x] Unassigned student queue management interface.
- [ ] Automated status detection engine (🟢 On Track, 🟡 At Risk, 🔴 Inactive based on attendance thresholds).

### 🟡 Phase 5: Testing, Notifications & Polish (In Progress)
- [x] Playwright E2E smoke testing suite (`e2e.mjs`) covering public routes and authentication flows.
- [ ] Pre-class and post-session automated reminders via Nodemailer.
- [ ] Toast notifications and loading skeleton screens across all flows.
- [ ] Full E2E user verification (Student onboarding ➔ Student self-enrollment / Admin assignment ➔ Tutor session logging).

---

## 🚀 Priority Action Plan (Next Immediate Steps)

1. **Automated At-Risk Engine:** Implement a query background task to auto-flag students as `at risk` when attendance rates drop or sessions are missed consecutively.
2. **Automated Email Reminders:** Configure Nodemailer integrations to trigger automated reminders prior to live scheduled sessions.