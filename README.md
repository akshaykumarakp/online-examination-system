# Online Examination System (Pure Semantic HTML & JavaScript)

A complete web-based **Online Examination System** built for university examination branches using **pure semantic HTML and vanilla JavaScript without any CSS stylesheets**.

It covers all functional requirements: student authentication, examination selection, timed assessments with countdown timer, continuous auto-saving to prevent data loss, offline network disconnection tolerance, question review/modification, automatic objective question grading, manual examiner evaluation for descriptive questions, and final result publishing.

---

## 🌟 Architecture & Highlights (Without CSS)

- **Pure HTML Markup**: Uses native browser semantic elements (`<fieldset>`, `<legend>`, `<table border="1">`, `<form>`, `<label>`, `<input>`, `<textarea>`, `<button>`, `<select>`, `<ol>`, `<ul>`, `<details>`, `<summary>`).
- **No External CSS / Stylesheets**: Zero CSS dependencies—no stylesheets (`<link rel="stylesheet">`), no `<style>` blocks, and no framework bloat.
- **Native HTML5 Visibility Control**: Uses the standard HTML `hidden` attribute for view routing (`navigateView`) and alerts.
- **Offline & Storage API**: Native `localStorage`, `sessionStorage`, and `window.addEventListener('online' / 'offline')`.

---

## 📋 Features Checklist

### 1. Student Authentication & Profile Verification
- Student login with registered University Student ID and password.
- Verification and display of student details (Name, Roll Number, Department, Semester).
- Separate role-based login for university **Examiners/Evaluators**.
- One-click **Demo Credentials** buttons on the login screen for rapid evaluation.

### 2. Available Examinations & Guidelines
- Dashboard displays all assigned university examinations.
- Displays examination code, course title, scheduled date, duration, total questions (objective + descriptive breakdown), total marks, and passing threshold.
- Candidates select an examination to view the complete instructions.
- Mandatory candidate agreement checkbox (*"I have read, understood, and agreed to abide by all the examination rules..."*) before starting.

### 3. Examination Interface & Question Display
- **Flexible Display Configurations**:
  - **One-by-One Question Mode**: Focused question view with Previous, Next, and Question Palette.
  - **All Questions View Mode**: Displays all questions in a single structured list.
- **Objective Questions (MCQs)**: Radio button option selection (A, B, C, D) with a "Clear Choice" button.
- **Descriptive Questions**: Multi-line response `<textarea>` with real-time word counting and formatting instructions.

### 4. Continuous Auto-Save & Offline Resilience
- **Real-Time Auto-Save**: Saves answers directly to `localStorage` on every keystroke and option change.
- **Background Interval**: Saves every 5 seconds to ensure zero data loss.
- **Status Indicator**: Live text indicator displays `[Auto-saved at HH:MM:SS]` or `[Saved locally (Offline)]`.
- **Offline Network Resilience**:
  - Listens to browser network `offline` and `online` events.
  - If internet drops, all answers are preserved locally on the candidate's device.
  - Alert banner notifies the candidate that work is safely preserved locally.
  - Upon reconnection, displays `🟢 Internet Connection Restored` and synchronizes saved state.
  - Includes a **Simulate Connection Drop** button in the exam toolbar to test this behavior without disabling Wi-Fi.
  - If a student accidentally refreshes or closes the browser tab, the system restores the exact in-progress session, answers, and remaining time upon logging back in.

### 5. Review & Modify Prior to Submission
- **Question Palette**: An organized list displaying status indicators for each question:
  - `[✓ Answered]`
  - `[• Not Answered]`
  - `[? Marked for Review]`
  - `[✓ ? Answered & Review]`
  - `[  Not Visited]`
- **Review Summary Section**:
  - Displays summary statistics: Total questions, Answered count, Unanswered count, and Marked for Review count.
  - Warning notification if any questions remain unanswered.
  - "Modify Answer" buttons allow jumping directly to any question to adjust answers before final submission.

### 6. Submission Validation & Timer Auto-Submit
- **Countdown Timer**: Real-time timer tracking remaining minutes and seconds.
- **Warning Alert**: Displays a warning when fewer than 2 minutes remain.
- **Automated Submission on Expiry**: When the timer reaches `00:00`, the system automatically submits all saved answers.
- **Submission Timestamp**: Records the exact ISO timestamp (`submittedAt`) and submission mode (`manual` vs `auto-expired`).

### 7. Automated & Examiner Evaluation + Result Publishing
- **Automated Objective Evaluation**:
  - Objective MCQ questions are automatically scored instantly against the official answer keys upon submission.
- **Examiner Evaluation Portal**:
  - Appointed course examiners log in with examiner credentials (`EXAM2026`).
  - View all student submissions with status badges (*Pending Grading* or *Result Published*).
  - Side-by-side grading interface: Displays the student's submitted descriptive text alongside the question, model answer key, and maximum marks.
  - Examiners input marks awarded, question-specific comments, and overall remarks.
  - Click **Calculate Final Marks & Publish Result** to publish final marks to the candidate.
- **Published Result Screen**:
  - Overall status: **PASSED** or **FAILED**.
  - Total marks obtained, total possible marks, and percentage.
  - Breakdown: Objective marks + Descriptive marks.
  - Question-by-question review:
    - MCQs: Shows student answer, correct answer key, and detailed explanation.
    - Descriptive: Shows student response, marks awarded, examiner's qualitative feedback, and model rubric.
  - One-click **Print / Save Result** button formatted for clean printing.

---

## 📁 Project Structure

```
online-examination-system/
├── index.html          # Main application file in pure semantic HTML (no CSS)
├── js/
│   ├── data.js         # Initial mock data: accounts, examinations, questions, rubrics
│   └── app.js          # Core logic: auth, auto-save, timer, evaluation, offline handler
├── server.js           # Zero-dependency Node.js HTTP server (built-in modules)
├── package.json        # Project metadata and run scripts
└── README.md           # Documentation and walkthrough guide
```

---

## 🖥️ How to Run the Project

### Option 1: Direct in Browser (Zero Setup)
Simply open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Using the Lightweight Local Node.js Server
Run the following in the project directory:
```bash
# Start the local server
npm start
# or
node server.js
```
Then open your browser to:
[http://localhost:3000](http://localhost:3000)

---

## 👥 Demo User Credentials

The login screen includes one-click buttons to automatically fill in demo credentials:

| Role | User ID | Password | Name / Details |
| :--- | :--- | :--- | :--- |
| **Student 1** | `STU202601` | `password123` | Priya Sharma (B.Tech CSE, 6th Sem) |
| **Student 2** | `STU202602` | `password123` | Rahul Verma (B.Tech IT, 6th Sem) |
| **Examiner** | `EXAM2026` | `admin123` | Dr. K. Ramanathan (Chief Evaluator) |

---

## 🧪 Testing the Requirements Step-by-Step

1. **Log in as Student**:
   - Click "Demo Student 1 (Priya Sharma - B.Tech CSE)" and sign in.
   - View the student profile table and available examinations.
2. **Start Examination**:
   - Click "Read Instructions & Start Exam" on *CS401: Data Structures & Algorithms*.
   - Read the candidate instructions, check the agreement checkbox, and click "Start Examination Now".
3. **Answer Questions & Test Auto-Save**:
   - Select MCQ options and type into descriptive response boxes.
   - Notice the `[Auto-saved at HH:MM:SS]` indicator updating on every keystroke.
4. **Test Network Disconnection Resilience**:
   - Click the "Simulate Connection Drop" button in the exam toolbar.
   - Observe the offline notification and status change to `[Saved locally (Offline)]`.
   - Continue answering questions.
   - Click "Simulate Connection Reconnect" and verify connection restoration with synchronized data.
5. **Review & Submit**:
   - Click "Review & Submit Examination" to view the statistics table (Answered / Unanswered / Review count).
   - Click "Confirm Final Submission".
   - Objective questions are evaluated immediately.
6. **Examiner Grading & Result Publishing**:
   - Log out and log in as Examiner (`EXAM2026` / `admin123`).
   - Click "Grade Descriptive Answers" on Priya's submission.
   - Enter marks and feedback for each descriptive question.
   - Click "Calculate Final Marks & Publish Result".
7. **View Published Result**:
   - Log back in as Student (`STU202601`).
   - Click "View Published Result" to inspect the final score, breakdown, and examiner remarks.
