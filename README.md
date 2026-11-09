# Online Examination System

A comprehensive web-based **Online Examination System** built for university examination branches, covering the complete lifecycle of computer-based testing, question banking, administration, candidate evaluation, and automated result publishing.

Features all **10 required pages** across Student, Admin, and Examiner modules with responsive basic styling and native semantic HTML structure.

---

## 📑 10-Page Directory & Overview

### 🎓 Student Section (6 Pages)

| No. | Page Name | Purpose & Features |
| :---: | :--- | :--- |
| **1** | **Login / Register** | Student authentication with Student ID/Email and password. Includes a dedicated **Student Registration** tab allowing new candidates to register with their Name, Roll Number, Department, Semester, and University Email. Quick 1-click Demo credentials provided. |
| **2** | **Student Dashboard** | Displays student profile details (Name, Roll No, Department, Semester), active **Available Examinations**, and **Upcoming Scheduled Examinations** with duration, question count, and marks. |
| **3** | **Exam Instructions** | Course details, time limit, total marks, passing marks, and candidate guidelines. Requires mandatory agreement checkbox (*"I have read and understood all instructions..."*) before the start button unlocks. |
| **4** | **Examination Page** | Live examination interface featuring question display (One-by-One or All Questions view), countdown timer with 2-minute critical warning, real-time auto-saving (`● Auto-saved at HH:MM:SS`), interactive **Question Palette** grid, and network disconnection simulation. |
| **5** | **Review & Submit** | Overview verification page before final submission. Displays summary statistics (Total, Answered, Unanswered, Marked for Review), unanswered question warning banner, question attempt status table, and **Modify Answer** buttons to jump back. |
| **6** | **Results Page** | Detailed result scorecard displaying marks obtained, maximum marks, percentage, PASSED/NEEDS IMPROVEMENT badge, marks breakdown (Objective + Descriptive), and question-by-question review with model answers and examiner comments. Includes print formatting. |

---

### 🛠️ Admin Section (3 Pages)

| No. | Page Name | Purpose & Features |
| :---: | :--- | :--- |
| **7** | **Admin Dashboard** | Key metrics overview (Total Registered Students, Total Examinations, Questions in Bank, Submissions, Pass Percentage), complete examinations status catalog, and recent student submissions activity log. |
| **8** | **Manage Examinations** | Complete CRUD interface: Create new examinations, configure course code, title, department, date, duration, total marks, passing marks, and candidate instructions. Edit existing exams or delete obsolete exams. |
| **9** | **Manage Questions** | Target examination selector, Question Bank browser, and forms to add both **Objective MCQs** (options A–D, correct answer key, solution explanation) and **Descriptive Questions** (recommended word limit, model rubric/answer key). Includes question deletion. |

---

### ✍️ Examiner Section (1 Page)

| No. | Page Name | Purpose & Features |
| :---: | :--- | :--- |
| **10** | **Evaluate Answers** | Examiner assessment portal: lists candidate submissions with pending/published status. Opens side-by-side grading screen showing candidate's submitted response alongside model answer key & rubric. Examiners award marks, enter question-specific feedback, provide general remarks, and click **Calculate Final Marks & Publish Result**. |

---

## 🚀 How to Run the Application

### Option 1: Direct in Browser
Simply open [**`index.html`**](file:///c:/Users/Akshay%20kumar/Documents/GitHub/online-examination-system/index.html) in any web browser.

### Option 2: Via Local Server
```bash
npm start
# or
node server.js
```
Open [**http://localhost:3000**](http://localhost:3000) in your browser.

---

## 👥 Demo User Credentials

| Role | User ID / Login | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student 1** | `STU202601` | `password123` | Priya Sharma (B.Tech CSE, 6th Sem) |
| **Student 2** | `STU202602` | `password123` | Rahul Verma (B.Tech IT, 6th Sem) |
| **Administrator** | `ADMIN2026` | `admin123` | Prof. S. Narayanan (Exam Controller) |
| **Examiner** | `EXAM2026` | `admin123` | Dr. K. Ramanathan (Chief Evaluator) |

*(One-click buttons on the Login page fill these credentials automatically.)*

---

## 🔍 Quick Navigation: 10-Page Directory Bar

A dedicated **10-Page Directory Bar** is pinned at the top of the interface allowing instant navigation to any of the 10 pages for grading and testing:
- **Student**: `1. Login/Register` &bull; `2. Student Dashboard` &bull; `3. Exam Instructions` &bull; `4. Examination Page` &bull; `5. Review & Submit` &bull; `6. Results Page`
- **Admin**: `7. Admin Dashboard` &bull; `8. Manage Examinations` &bull; `9. Manage Questions`
- **Examiner**: `10. Evaluate Answers`

---

## 📁 File Structure

```
online-examination-system/
├── index.html        # Main single-page web application with all 10 pages
├── css/
│   └── style.css     # Clean, semantic CSS stylesheet (with toggle support)
├── js/
│   ├── data.js       # Predefined student, admin, and examiner records & exams
│   └── app.js        # Core controller logic for all 10 pages & storage APIs
├── server.js         # Zero-dependency Node.js HTTP server
├── package.json      # Scripts and project metadata
└── README.md         # Complete system documentation
```
