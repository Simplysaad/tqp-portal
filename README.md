# TQP Platform — Operational & Technical Documentation

The **TQP Platform** is a digital management and accountability system designed for the **Tahfiz/Qur'an Program (TQP)** under the Islamic Affairs Board (IAB) of the **Muslim Students' Society of Nigeria (MSSN), Obafemi Awolowo University (OAU) Branch**.

The core mission of the platform is to transform flexible, informal learning arrangements into a structured, measurable, and sustainable ecosystem. It establishes operational infrastructure driven by rule-validated tutor assignments, fixed class schedules, session progress tracking, automated reminders, and early intervention mechanics for at-risk students.

---

## Problems Addressed

* **Inconsistent Attendance:** Prevents semester burnout and ghosting by tracking attendance patterns and proactively identifying declining participation.
* **Lack of Accountability:** Replaces passive motivation with concrete targets, progress visualizers, and weekly performance feedback.
* **Unbalanced Tutor Distribution:** Eliminates tutor overload by replacing unrestricted student choice with coordinator-managed assignments based on gender, capacity, schedule, and memorization levels.
* **Poor Operational Visibility:** Provides centralized, real-time analytics on student attendance, class completion, and tutor capacity for administrative oversight.

---

## Core Operational Concept

```
[Student Onboarding] -> [Establish Goal] -> [Rule-Based Tutor Assignment] -> [Session Logging] -> [Status Engine]
                                                                                                |
                                                    +-------------------------------------------+-------------------------------------------+
                                                    |                                           |                                           |
                                                    v                                           v                                           v
                                                On Track                                     At Risk                                     Inactive
                                    (Meeting Target Progress)                   (Declining Attendance/Progress)             (Multiple Missed Sessions)

```

At the start of each academic session, every student sets a defined baseline and goal (e.g., *Current: 5 Juz -> Target: 8 Juz*). After each session, tutors log attendance and memorization throughput. The platform continuously computes actual progress against the target timeline, placing the student into a dynamic status tier:

* **On Track:** Student attends regularly and meets target memorization velocity.
* **At Risk:** Attendance or memorization pace drops below expected thresholds.
* **Inactive:** Student misses multiple consecutive sessions or ceases logging activity.

---

## Core Platform Capabilities

### 1. Onboarding & Target Setting

* Collects academic profile, current Qur'an baseline (Surah, Aayah, Page, Juz), preferred availability, and target goals.
* Serves as the quantitative benchmark for semester tracking.

### 2. Rule-Validated Tutor Assignment

* **Coordinated Placement:** Matches students based on gender policies, capacity caps, and memorization ranges.
* **Change Request Workflow:** Formally handles student schedule or tutor reassignment requests with coordinator oversight.

### 3. Structured Class Engine

* Enforces recurring class schedules with Google Meet integration.
* Provides a formal mechanism for temporary academic adjustments (e.g., during exam periods) without dropping out of the program.

### 4. Session Tracking & Logging

Tutors record comprehensive post-class data points in seconds:

* **Attendance:** Present, Absent, or Rescheduled.
* **New Memorization:** Start and end boundaries (Surah, Aayah, Page).
* **Revision:** Completed review pages/Juz.
* **Qualitative Notes:** Performance notes and specific verse retention remarks.

### 5. Automated Status & Intervention System

* **Real-time Monitoring:** Flags declining attendance or falling behind target milestones.
* **Early Warning Feed:** Surfacing `At Risk` and `Inactive` students on the Coordinator Dashboard for rapid intervention.

---

## Role-Based Dashboards

### Student Dashboard

* Visual progress tracker against semester Juz goals.
* Real-time attendance rate metrics.
* Dynamic upcoming class banner with active Google Meet launcher.
* Historical session logs and tutor feedback feed.

### Tutor Dashboard

* Assigned student rosters and capacity indicators.
* Class schedule management and Meet link generator.
* Rapid session logger for post-class recording.
* Individual student progress timeline.

### Coordinator / Admin Command Center

* **Aggregate KPIs:** Total Active Students, At-Risk Count, Total Tutors, and Live Classes.
* **Management Engines:** Single & Bulk student assignment, unassigned queue sorting, and tutor capacity balancing.
* **Program Health:** Program-wide attendance averages and risk distribution metrics.

---

## Minimum Viable Product (MVP) Scope

| Domain | In MVP Scope | Deferred / Post-MVP |
| --- | --- | --- |
| **Student** | Registration, baseline setup, target setting, dashboard, class links, change requests. | Gamified leaderboards, social feeds, mobile app. |
| **Tutor** | Student roster, session logger (attendance + memorization), schedule management. | AI-assisted recitation feedback, automated audio grading. |
| **Coordinator** | Roster management, rule-validated assignment engine, unassigned queue, status monitoring. | Predictive analytics, automated AI intervention scripts. |
| **Automation** | Session reminders, attendance tracking triggers, weekly summary notifications. | Automated WhatsApp bot integrations. |

---

## Primary Success Metric

The primary success metric of the TQP Platform is not merely user registration or database records, but the **retention rate of active students making measurable Qur'an memorization progress throughout the entire academic semester.**