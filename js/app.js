/**
 * Online Examination System - Multi-Page Application Logic
 * Shared storage, routing, and controller functions for all 10 separate HTML pages.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_USER = 'oes_current_user';
  const STORAGE_KEY_SUBMISSIONS = 'oes_submissions';
  const STORAGE_KEY_EXAMS = 'oes_examinations';
  const STORAGE_KEY_USERS = 'oes_users';
  const STORAGE_KEY_SESSION_PREFIX = 'oes_exam_session_';

  /* -------------------------------------------------------------
   * Data Storage Helpers
   * ----------------------------------------------------------- */
  function initializeData() {
    if (typeof INITIAL_DATA === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_DATA.users || []));
    }
    if (!localStorage.getItem(STORAGE_KEY_EXAMS)) {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(INITIAL_DATA.examinations || []));
    }
    if (!localStorage.getItem(STORAGE_KEY_SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(INITIAL_DATA.sampleSubmissions || []));
    }
  }

  function getUsers() {
    initializeData();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    } catch (e) {
      return (typeof INITIAL_DATA !== 'undefined' ? INITIAL_DATA.users : []);
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  function getExaminations() {
    initializeData();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_EXAMS)) || [];
    } catch (e) {
      return (typeof INITIAL_DATA !== 'undefined' ? INITIAL_DATA.examinations : []);
    }
  }

  function saveExaminations(exams) {
    localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
  }

  function getSubmissions() {
    initializeData();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SUBMISSIONS)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveSubmissions(submissions) {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  }

  function getCurrentUser() {
    const saved = sessionStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem(STORAGE_KEY_USER);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY_USER);
    window.location.href = 'login.html';
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  function updateHeaderUI() {
    const user = getCurrentUser();
    const navLinks = document.getElementById('header-nav-links');
    const userBadge = document.getElementById('header-user-badge');
    const userNameSpan = document.getElementById('header-user-name');
    const userRoleSpan = document.getElementById('header-user-role');
    const logoutBtn = document.getElementById('header-logout-btn');

    if (user && userBadge) {
      userBadge.hidden = false;
      if (logoutBtn) logoutBtn.hidden = false;
      if (userNameSpan) userNameSpan.textContent = user.name;

      if (userRoleSpan) {
        if (user.role === 'admin') {
          userRoleSpan.textContent = 'Admin';
          userRoleSpan.className = 'badge badge-warning';
        } else if (user.role === 'examiner') {
          userRoleSpan.textContent = 'Examiner';
          userRoleSpan.className = 'badge badge-warning';
        } else {
          userRoleSpan.textContent = 'Student';
          userRoleSpan.className = 'badge badge-info';
        }
      }

      if (navLinks) {
        if (user.role === 'admin') {
          navLinks.innerHTML = `
            <a href="admin-dashboard.html" class="nav-link-btn">Admin Dashboard</a>
            <a href="manage-exams.html" class="nav-link-btn">Manage Exams</a>
            <a href="manage-questions.html" class="nav-link-btn">Manage Questions</a>
          `;
        } else if (user.role === 'examiner') {
          navLinks.innerHTML = `
            <a href="evaluate-answers.html" class="nav-link-btn">Evaluate Answers</a>
          `;
        } else {
          navLinks.innerHTML = `
            <a href="student-dashboard.html" class="nav-link-btn">Student Dashboard</a>
            <a href="results.html" class="nav-link-btn">Results</a>
          `;
        }
        navLinks.hidden = false;
      }
    } else if (userBadge) {
      userBadge.hidden = true;
      if (logoutBtn) logoutBtn.hidden = true;
      if (navLinks) navLinks.hidden = true;
    }
  }

  function toggleStyles() {
    const link = document.getElementById('main-stylesheet');
    const btn = document.getElementById('toggle-styles-btn');
    if (!link) return;

    if (link.disabled) {
      link.disabled = false;
      if (btn) btn.textContent = 'Toggle CSS (On/Off)';
    } else {
      link.disabled = true;
      if (btn) btn.textContent = 'Styles: OFF (Pure HTML)';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* -------------------------------------------------------------
   * PAGE 1: Login / Register Logic
   * ----------------------------------------------------------- */
  function initLoginPage() {
    const user = getCurrentUser();
    if (user) {
      // Redirect if already logged in
      if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
      else if (user.role === 'examiner') window.location.href = 'evaluate-answers.html';
      else window.location.href = 'student-dashboard.html';
    }
  }

  function switchAuthTab(tab) {
    const loginBtn = document.getElementById('tab-login-btn');
    const registerBtn = document.getElementById('tab-register-btn');
    const loginBox = document.getElementById('auth-login-box');
    const registerBox = document.getElementById('auth-register-box');

    if (tab === 'register') {
      if (loginBtn) loginBtn.classList.remove('active');
      if (registerBtn) registerBtn.classList.add('active');
      if (loginBox) loginBox.hidden = true;
      if (registerBox) registerBox.hidden = false;
    } else {
      if (registerBtn) registerBtn.classList.remove('active');
      if (loginBtn) loginBtn.classList.add('active');
      if (registerBox) registerBox.hidden = true;
      if (loginBox) loginBox.hidden = false;
    }
  }

  function handleLogin(event) {
    if (event) event.preventDefault();
    const userIdInput = document.getElementById('login-userid');
    const passwordInput = document.getElementById('login-password');
    const errorAlert = document.getElementById('login-error');

    const enteredId = (userIdInput.value || '').trim();
    const enteredPassword = (passwordInput.value || '').trim();

    const users = getUsers();
    const user = users.find(
      u => (u.id.toLowerCase() === enteredId.toLowerCase() || u.email.toLowerCase() === enteredId.toLowerCase()) && u.password === enteredPassword
    );

    if (user) {
      setCurrentUser(user);
      errorAlert.hidden = true;

      if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (user.role === 'examiner') {
        window.location.href = 'evaluate-answers.html';
      } else {
        window.location.href = 'student-dashboard.html';
      }
    } else {
      errorAlert.textContent = 'Invalid credentials. Please verify your Student ID/Examiner ID and password.';
      errorAlert.hidden = false;
    }
  }

  function handleStudentRegister(event) {
    if (event) event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const roll = document.getElementById('reg-roll').value.trim();
    const semester = document.getElementById('reg-semester').value;
    const dept = document.getElementById('reg-dept').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirmPass = document.getElementById('reg-confirm-password').value.trim();
    const msg = document.getElementById('register-msg');

    if (password !== confirmPass) {
      alert('Passwords do not match! Please check again.');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase() || u.rollNo === roll)) {
      alert('An account with this Roll Number or Email already exists!');
      return;
    }

    const newStudentId = `STU${Date.now().toString().slice(-6)}`;
    const newStudent = {
      id: newStudentId,
      name: name,
      role: 'student',
      password: password,
      email: email,
      rollNo: roll,
      department: dept,
      semester: semester,
      academicYear: '2025-2026'
    };

    users.push(newStudent);
    saveUsers(users);

    msg.textContent = `Registration Successful! Your Student ID is ${newStudentId}. Please Sign In now.`;
    msg.hidden = false;

    setTimeout(() => {
      switchAuthTab('login');
      document.getElementById('login-userid').value = newStudentId;
      document.getElementById('login-password').value = password;
    }, 1200);
  }

  function fillDemoCredentials(userId, password) {
    switchAuthTab('login');
    const idField = document.getElementById('login-userid');
    const passField = document.getElementById('login-password');
    const errField = document.getElementById('login-error');
    if (idField) idField.value = userId;
    if (passField) passField.value = password;
    if (errField) errField.hidden = true;
  }

  /* -------------------------------------------------------------
   * PAGE 2: Student Dashboard Logic
   * ----------------------------------------------------------- */
  function initStudentDashboard() {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const nameEl = document.getElementById('profile-student-name');
    const rollEl = document.getElementById('profile-student-roll');
    const deptEl = document.getElementById('profile-student-dept');
    const semEl = document.getElementById('profile-student-sem');

    if (nameEl) nameEl.textContent = user.name;
    if (rollEl) rollEl.textContent = user.rollNo || user.id;
    if (deptEl) deptEl.textContent = user.department || 'N/A';
    if (semEl) semEl.textContent = user.semester || 'N/A';

    const availableContainer = document.getElementById('available-exams-list');
    const upcomingContainer = document.getElementById('upcoming-exams-list');
    if (!availableContainer || !upcomingContainer) return;

    availableContainer.innerHTML = '';
    upcomingContainer.innerHTML = '';

    const exams = getExaminations();
    const submissions = getSubmissions();
// Update examination overview counts
const availableCount = exams.filter(exam => exam.status !== 'upcoming').length;
const upcomingCount = exams.filter(exam => exam.status === 'upcoming').length;

const availableCountEl = document.getElementById('available-exam-count');
const upcomingCountEl = document.getElementById('upcoming-exam-count');
const totalCountEl = document.getElementById('total-exam-count');

if (availableCountEl) availableCountEl.textContent = availableCount;
if (upcomingCountEl) upcomingCountEl.textContent = upcomingCount;
if (totalCountEl) totalCountEl.textContent = exams.length;
    exams.forEach(exam => {
      const userSubmission = submissions.find(
        s => s.examId === exam.id && s.studentId === user.id
      );

      const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${exam.id}_${user.id}`;
      const savedSession = localStorage.getItem(sessionKey);

      const card = document.createElement('div');
      card.className = 'exam-card';

      let statusBadge = '<span class="badge badge-info">Available</span>';
      let actionButtons = `
        <a href="exam-instructions.html?examId=${encodeURIComponent(exam.id)}" class="btn btn-primary">
          Read Instructions &amp; Start
        </a>
      `;

      if (userSubmission) {
        if (userSubmission.evaluation && userSubmission.evaluation.evaluated) {
          statusBadge = '<span class="badge badge-success">Evaluated - Result Published</span>';
          actionButtons = `
            <a href="results.html?submissionId=${encodeURIComponent(userSubmission.submissionId)}" class="btn btn-outline">
              View Published Result
            </a>
          `;
        } else {
          statusBadge = '<span class="badge badge-warning">Submitted - Grading Pending</span>';
          actionButtons = `
            <a href="results.html?submissionId=${encodeURIComponent(userSubmission.submissionId)}" class="btn btn-secondary">
              View Submission Status
            </a>
          `;
        }
      } else if (savedSession) {
        statusBadge = '<span class="badge badge-review">In Progress (Saved)</span>';
        actionButtons = `
          <a href="examination.html?examId=${encodeURIComponent(exam.id)}" class="btn btn-warning">
            Resume Saved Exam
          </a>
        `;
      }

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="color:var(--primary); font-size:1.1rem;">${exam.code}</strong>
            ${statusBadge}
          </div>
          <h3 class="exam-card-title">${escapeHtml(exam.title)}</h3>
          <p class="text-muted" style="font-size:0.85rem; margin-bottom:10px;">${escapeHtml(exam.department)}</p>
          <ul class="exam-meta-list">
            <li><span class="exam-meta-label">Date:</span> <span class="exam-meta-val">${exam.date}</span></li>
            <li><span class="exam-meta-label">Duration:</span> <span class="exam-meta-val">${exam.durationMinutes} Minutes</span></li>
            <li><span class="exam-meta-label">Questions:</span> <span class="exam-meta-val">${exam.questions ? exam.questions.length : 0} Questions</span></li>
            <li><span class="exam-meta-label">Total Marks:</span> <span class="exam-meta-val">${exam.totalMarks} Marks (Pass: ${exam.passingMarks})</span></li>
          </ul>
        </div>
        <div style="margin-top:14px; text-align:right;">
          ${actionButtons}
        </div>
      `;

      if (exam.status === 'upcoming') {
        upcomingContainer.appendChild(card);
      } else {
        availableContainer.appendChild(card);
      }
    });

    if (availableContainer.children.length === 0) {
      availableContainer.innerHTML = '<p class="text-muted">No active examinations currently available.</p>';
    }
    if (upcomingContainer.children.length === 0) {
      upcomingContainer.innerHTML = '<p class="text-muted">No upcoming examinations scheduled at this time.</p>';
    }
  }

  /* -------------------------------------------------------------
   * PAGE 3: Exam Instructions Logic
   * ----------------------------------------------------------- */
  function initExamInstructions() {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const examId = getQueryParam('examId') || 'EXAM-CS401';
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId) || exams[0];
    if (!exam) return;

    document.getElementById('inst-exam-code').textContent = exam.code;
    document.getElementById('inst-exam-title').textContent = exam.title;
    document.getElementById('inst-exam-duration').textContent = `${exam.durationMinutes} Minutes`;
    document.getElementById('inst-exam-questions').textContent = `${exam.questions ? exam.questions.length : 0} Questions`;
    document.getElementById('inst-exam-marks').textContent = `${exam.totalMarks} Marks`;
    document.getElementById('inst-exam-pass').textContent = `${exam.passingMarks} Marks`;

    const instructionsList = document.getElementById('inst-instructions-list');
    instructionsList.innerHTML = '';
    (exam.instructions || [
      "Ensure a stable internet connection. All answers are saved locally in case of disconnect.",
      "Answers are automatically saved continuously as you type or select options.",
      "You can review and modify your answers at any point prior to final submission.",
      "When the countdown timer reaches 00:00, the system automatically submits your saved answers."
    ]).forEach(inst => {
      const li = document.createElement('li');
      li.textContent = inst;
      instructionsList.appendChild(li);
    });

    const agreeCheckbox = document.getElementById('inst-agree-checkbox');
    const startBtn = document.getElementById('inst-start-btn');
    agreeCheckbox.checked = false;
    startBtn.disabled = true;

    agreeCheckbox.onchange = function () {
      startBtn.disabled = !this.checked;
    };

    startBtn.onclick = function () {
      window.location.href = `examination.html?examId=${encodeURIComponent(exam.id)}`;
    };
  }

  /* -------------------------------------------------------------
   * PAGE 4: Examination Page Logic
   * ----------------------------------------------------------- */
  let examState = {
    exam: null,
    user: null,
    currentQuestionIndex: 0,
    viewMode: 'one-by-one',
    answers: {},
    reviewFlags: {},
    visitedQuestions: {},
    timeRemainingSeconds: 0,
    timerInterval: null,
    autoSaveInterval: null,
    isOfflineSimulated: false,
    lastSavedTimestamp: null
  };

  function initExaminationPage() {
    examState.user = getCurrentUser();
    if (!examState.user) {
      window.location.href = 'login.html';
      return;
    }

    const examId = getQueryParam('examId') || 'EXAM-CS401';
    const exams = getExaminations();
    examState.exam = exams.find(e => e.id === examId) || exams[0];
    if (!examState.exam) return;

    // Check existing saved session
    const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${examState.exam.id}_${examState.user.id}`;
    const savedSession = localStorage.getItem(sessionKey);

    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        examState.answers = parsed.answers || {};
        examState.reviewFlags = parsed.reviewFlags || {};
        examState.visitedQuestions = parsed.visitedQuestions || {};
        examState.timeRemainingSeconds = parsed.timeRemainingSeconds || (examState.exam.durationMinutes * 60);
        examState.currentQuestionIndex = parsed.currentQuestionIndex || 0;
        showNotificationBanner('Previous examination session restored with saved answers.', 'reconnected');
      } catch (e) {
        initFreshExamState();
      }
    } else {
      initFreshExamState();
    }

    document.getElementById('live-exam-title').textContent = `${examState.exam.code}: ${examState.exam.title}`;

    if (examState.exam.questions && examState.exam.questions.length > 0) {
      examState.visitedQuestions[examState.exam.questions[examState.currentQuestionIndex].id] = true;
    }

    startExamTimer();
    startExamAutoSave();
    setupNetworkListeners();
    renderExaminationInterface();
  }

  function initFreshExamState() {
    examState.answers = {};
    examState.reviewFlags = {};
    examState.visitedQuestions = {};
    examState.currentQuestionIndex = 0;
    examState.timeRemainingSeconds = (examState.exam.durationMinutes || 15) * 60;
  }

  function startExamTimer() {
    if (examState.timerInterval) clearInterval(examState.timerInterval);
    updateExamTimerDisplay();

    examState.timerInterval = setInterval(() => {
      examState.timeRemainingSeconds--;
      updateExamTimerDisplay();

      if (examState.timeRemainingSeconds <= 0) {
        clearInterval(examState.timerInterval);
        handleExamTimeExpired();
      }
    }, 1000);
  }

  function updateExamTimerDisplay() {
    const timerBox = document.getElementById('exam-timer');
    const timerText = document.getElementById('timer-countdown-text');
    if (!timerText) return;

    const secondsLeft = Math.max(0, examState.timeRemainingSeconds);
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timerBox) {
      if (secondsLeft <= 120) timerBox.classList.add('timer-warning');
      else timerBox.classList.remove('timer-warning');
    }
  }

  function handleExamTimeExpired() {
    showNotificationBanner('⚠️ Examination Time Expired! Automatically submitting your saved answers...', 'offline');
    setTimeout(() => {
      finalizeExamSubmission(true);
    }, 1200);
  }

  function saveExamState() {
    if (!examState.exam || !examState.user) return;
    const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${examState.exam.id}_${examState.user.id}`;
    const sessionData = {
      examId: examState.exam.id,
      studentId: examState.user.id,
      answers: examState.answers,
      reviewFlags: examState.reviewFlags,
      visitedQuestions: examState.visitedQuestions,
      currentQuestionIndex: examState.currentQuestionIndex,
      timeRemainingSeconds: examState.timeRemainingSeconds,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    examState.lastSavedTimestamp = new Date();
    updateExamAutoSaveStatus();
  }

  function updateExamAutoSaveStatus() {
    const statusEl = document.getElementById('exam-autosave-status');
    if (!statusEl) return;
    const isOffline = !navigator.onLine || examState.isOfflineSimulated;

    if (isOffline) {
      statusEl.className = 'autosave-status offline';
      statusEl.innerHTML = `<span>●</span> <strong>Saved locally (Offline)</strong>`;
    } else {
      const timeStr = examState.lastSavedTimestamp ? examState.lastSavedTimestamp.toLocaleTimeString() : 'Just now';
      statusEl.className = 'autosave-status';
      statusEl.innerHTML = `<span>●</span> Auto-saved at ${timeStr}`;
    }
  }

  function startExamAutoSave() {
    if (examState.autoSaveInterval) clearInterval(examState.autoSaveInterval);
    examState.autoSaveInterval = setInterval(() => {
      saveExamState();
    }, 5000);
  }

  function renderExaminationInterface() {
    if (!examState.exam.questions || examState.exam.questions.length === 0) return;
    const currentQ = examState.exam.questions[examState.currentQuestionIndex];
    if (currentQ) examState.visitedQuestions[currentQ.id] = true;

    renderExamQuestion();
    renderExamPalette();
    updateExamNavControls();
    saveExamState();
  }

  function renderExamQuestion() {
    const container = document.getElementById('single-question-container');
    const allQuestionsContainer = document.getElementById('all-questions-container');

    if (examState.viewMode === 'all') {
      container.hidden = true;
      allQuestionsContainer.hidden = false;
      renderAllExamQuestions();
      return;
    }

    container.hidden = false;
    allQuestionsContainer.hidden = true;

    const q = examState.exam.questions[examState.currentQuestionIndex];
    if (!q) return;

    const qIndex = examState.currentQuestionIndex + 1;
    const isObjective = q.type === 'objective';
    const currentAnswer = examState.answers[q.id] || '';

    let answerHtml = '';

    if (isObjective) {
      answerHtml = `
        <div class="options-list">
          ${(q.options || []).map(opt => `
            <label class="option-item ${currentAnswer === opt.key ? 'selected' : ''}" onclick="app.selectExamOption(${q.id}, '${opt.key}')">
              <input type="radio" name="opt_${q.id}" value="${opt.key}" ${currentAnswer === opt.key ? 'checked' : ''}>
              <span class="option-key">${opt.key}.</span>
              <span class="option-content">${escapeHtml(opt.text)}</span>
            </label>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" type="button" onclick="app.clearExamOption(${q.id})">
          Clear Selection
        </button>
      `;
    } else {
      const wordCount = currentAnswer ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
      answerHtml = `
        <div class="descriptive-input-container">
          <label for="desc_ans_${q.id}" style="font-weight:600; display:block; margin-bottom:6px;">Your Written Answer:</label>
          <textarea 
            id="desc_ans_${q.id}" 
            class="form-control" 
            placeholder="Type your descriptive response here. System automatically saves your text continuously..."
            oninput="app.handleExamDescriptiveInput(${q.id}, this.value)"
          >${escapeHtml(currentAnswer)}</textarea>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
            <span id="word-count-${q.id}">${wordCount} words</span>
            <span>Max recommended: ${q.maxWords || 250} words</span>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="question-header">
        <div>
          <span style="font-size:1.15rem; font-weight:700; color:var(--primary);">Question ${qIndex} of ${examState.exam.questions.length}</span>
          <span class="badge ${isObjective ? 'badge-info' : 'badge-secondary'}" style="margin-left:8px;">
            ${isObjective ? 'Objective (MCQ)' : 'Descriptive'}
          </span>
        </div>
        <div>
          <span class="badge badge-secondary" style="font-size:0.9rem;">${q.marks} Marks</span>
        </div>
      </div>
      <div style="font-size:1.05rem; font-weight:500; margin-bottom:18px; line-height:1.5;">
        ${escapeHtml(q.question)}
      </div>
      ${answerHtml}
    `;
  }

  function renderAllExamQuestions() {
    const container = document.getElementById('all-questions-container');
    container.innerHTML = '';

    examState.exam.questions.forEach((q, idx) => {
      const qCard = document.createElement('div');
      qCard.className = 'card';
      qCard.style.marginBottom = '20px';

      const isObjective = q.type === 'objective';
      const currentAnswer = examState.answers[q.id] || '';

      let answerHtml = '';
      if (isObjective) {
        answerHtml = `
          <div class="options-list">
            ${(q.options || []).map(opt => `
              <label class="option-item ${currentAnswer === opt.key ? 'selected' : ''}" onclick="app.selectExamOption(${q.id}, '${opt.key}')">
                <input type="radio" name="opt_all_${q.id}" value="${opt.key}" ${currentAnswer === opt.key ? 'checked' : ''}>
                <span class="option-key">${opt.key}.</span>
                <span class="option-content">${escapeHtml(opt.text)}</span>
              </label>
            `).join('')}
          </div>
          <button class="btn btn-secondary btn-sm" type="button" onclick="app.clearExamOption(${q.id})">Clear Selection</button>
        `;
      } else {
        const wordCount = currentAnswer ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
        answerHtml = `
          <textarea 
            id="desc_all_ans_${q.id}" 
            class="form-control" 
            placeholder="Type your response..."
            oninput="app.handleExamDescriptiveInput(${q.id}, this.value)"
          >${escapeHtml(currentAnswer)}</textarea>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
            <span id="word-count-all-${q.id}">${wordCount} words</span>
          </div>
        `;
      }

      qCard.innerHTML = `
        <div class="question-header">
          <span style="font-weight:700;">Question ${idx + 1} (${isObjective ? 'MCQ' : 'Descriptive'})</span>
          <span class="badge badge-secondary">${q.marks} Marks</span>
        </div>
        <p style="font-weight:500;">${escapeHtml(q.question)}</p>
        ${answerHtml}
      `;

      container.appendChild(qCard);
    });
  }

  function renderExamPalette() {
    const grid = document.getElementById('question-palette-grid');
    if (!grid || !examState.exam || !examState.exam.questions) return;
    grid.innerHTML = '';

    let answeredCount = 0;
    let notAnsweredCount = 0;
    let reviewCount = 0;
    let notVisitedCount = 0;

    examState.exam.questions.forEach((q, index) => {
      const isCurrent = index === examState.currentQuestionIndex && examState.viewMode === 'one-by-one';
      const hasAnswer = examState.answers[q.id] && String(examState.answers[q.id]).trim().length > 0;
      const isReview = !!examState.reviewFlags[q.id];
      const isVisited = !!examState.visitedQuestions[q.id];

      let statusClass = 'status-not-visited';

      if (isReview && hasAnswer) {
        statusClass = 'status-answered-review';
        reviewCount++;
        answeredCount++;
      } else if (isReview) {
        statusClass = 'status-review';
        reviewCount++;
      } else if (hasAnswer) {
        statusClass = 'status-answered';
        answeredCount++;
      } else if (isVisited) {
        statusClass = 'status-not-answered';
        notAnsweredCount++;
      } else {
        statusClass = 'status-not-visited';
        notVisitedCount++;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `palette-btn ${statusClass} ${isCurrent ? 'current' : ''}`;
      btn.textContent = index + 1;
      btn.title = `Jump to Question ${index + 1}`;
      btn.onclick = () => jumpExamQuestion(index);

      grid.appendChild(btn);
    });

    document.getElementById('palette-count-answered').textContent = answeredCount;
    document.getElementById('palette-count-not-answered').textContent = notAnsweredCount;
    document.getElementById('palette-count-review').textContent = reviewCount;
    document.getElementById('palette-count-not-visited').textContent = notVisitedCount;
  }

  function updateExamNavControls() {
    const prevBtn = document.getElementById('btn-prev-question');
    const nextBtn = document.getElementById('btn-next-question');
    const reviewBtn = document.getElementById('btn-toggle-review');

    if (examState.viewMode === 'all') {
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    if (prevBtn) prevBtn.disabled = examState.currentQuestionIndex === 0;
    if (nextBtn) {
      if (examState.currentQuestionIndex === examState.exam.questions.length - 1) {
        nextBtn.textContent = 'Last Question';
        nextBtn.disabled = true;
      } else {
        nextBtn.textContent = 'Next Question →';
        nextBtn.disabled = false;
      }
    }

    if (reviewBtn) {
      const q = examState.exam.questions[examState.currentQuestionIndex];
      const isMarked = q && !!examState.reviewFlags[q.id];
      reviewBtn.textContent = isMarked ? '★ Unmark Review' : '☆ Mark for Review';
      reviewBtn.className = isMarked ? 'btn btn-warning' : 'btn btn-secondary';
    }
  }

  function selectExamOption(qId, key) {
    examState.answers[qId] = key;
    saveExamState();
    renderExaminationInterface();
  }

  function clearExamOption(qId) {
    delete examState.answers[qId];
    saveExamState();
    renderExaminationInterface();
  }

  function handleExamDescriptiveInput(qId, text) {
    examState.answers[qId] = text;
    const countEl = document.getElementById(`word-count-${qId}`);
    if (countEl) {
      const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      countEl.textContent = `${words} words`;
    }
    saveExamState();
    renderExamPalette();
  }

  function toggleExamReviewFlag() {
    const q = examState.exam.questions[examState.currentQuestionIndex];
    if (q) {
      examState.reviewFlags[q.id] = !examState.reviewFlags[q.id];
      saveExamState();
      renderExaminationInterface();
    }
  }

  function jumpExamQuestion(index) {
    if (index >= 0 && index < examState.exam.questions.length) {
      examState.currentQuestionIndex = index;
      if (examState.viewMode === 'all') {
        examState.viewMode = 'one-by-one';
        document.getElementById('view-mode-select').value = 'one-by-one';
      }
      renderExaminationInterface();
    }
  }

  function nextExamQuestion() {
    if (examState.currentQuestionIndex < examState.exam.questions.length - 1) {
      examState.currentQuestionIndex++;
      renderExaminationInterface();
    }
  }

  function prevExamQuestion() {
    if (examState.currentQuestionIndex > 0) {
      examState.currentQuestionIndex--;
      renderExaminationInterface();
    }
  }

  function setExamViewMode(mode) {
    examState.viewMode = mode;
    renderExaminationInterface();
  }

  function goToReviewSubmit() {
    saveExamState();
    window.location.href = `review-submit.html?examId=${encodeURIComponent(examState.exam.id)}`;
  }

  /* -------------------------------------------------------------
   * PAGE 5: Review & Submit Logic
   * ----------------------------------------------------------- */
  function initReviewSubmitPage() {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const examId = getQueryParam('examId') || 'EXAM-CS401';
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId) || exams[0];
    if (!exam) return;

    const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${exam.id}_${user.id}`;
    const saved = localStorage.getItem(sessionKey);
    let sessionData = saved ? JSON.parse(saved) : { answers: {}, reviewFlags: {} };

    const questions = exam.questions || [];
    let answeredCount = 0;
    let unansweredCount = 0;
    let reviewCount = 0;

    const listContainer = document.getElementById('review-modal-question-list');
    listContainer.innerHTML = '';

    questions.forEach((q, idx) => {
      const isAnswered = sessionData.answers[q.id] && String(sessionData.answers[q.id]).trim().length > 0;
      const isReview = !!sessionData.reviewFlags[q.id];

      if (isAnswered) answeredCount++;
      else unansweredCount++;
      if (isReview) reviewCount++;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>Question ${idx + 1}</strong></td>
        <td>${q.type === 'objective' ? 'Objective (MCQ)' : 'Descriptive'}</td>
        <td>${q.marks} Marks</td>
        <td>
          ${isAnswered ? '<span class="badge badge-success">Answered</span>' : '<span class="badge badge-warning">Unanswered</span>'}
          ${isReview ? '<span class="badge badge-review" style="margin-left:4px;">Marked for Review</span>' : ''}
        </td>
        <td>
          <a href="examination.html?examId=${encodeURIComponent(exam.id)}" class="btn btn-secondary btn-sm">
            Modify Answer
          </a>
        </td>
      `;
      listContainer.appendChild(tr);
    });

    document.getElementById('modal-stat-total').textContent = questions.length;
    document.getElementById('modal-stat-answered').textContent = answeredCount;
    document.getElementById('modal-stat-unanswered').textContent = unansweredCount;
    document.getElementById('modal-stat-review').textContent = reviewCount;

    const warningBox = document.getElementById('review-unanswered-warning');
    if (unansweredCount > 0) {
      warningBox.hidden = false;
      document.getElementById('unanswered-count-text').textContent = unansweredCount;
    } else {
      warningBox.hidden = true;
    }

    const confirmBtn = document.getElementById('btn-confirm-final-submit');
    if (confirmBtn) {
      confirmBtn.onclick = function () {
        finalizeExamSubmission(false, exam, user, sessionData);
      };
    }
  }

  function finalizeExamSubmission(isAutoExpired = false, customExam = null, customUser = null, customSession = null) {
    const exam = customExam || examState.exam;
    const user = customUser || examState.user;
    if (!exam || !user) return;

    if (examState.timerInterval) clearInterval(examState.timerInterval);
    if (examState.autoSaveInterval) clearInterval(examState.autoSaveInterval);

    const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${exam.id}_${user.id}`;
    const saved = localStorage.getItem(sessionKey);
    const sessionData = customSession || (saved ? JSON.parse(saved) : { answers: {} });

    const submissionTime = new Date().toISOString();
    const submissionId = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

    let objectiveMarks = 0;
    const questions = exam.questions || [];
    const objectiveQuestions = questions.filter(q => q.type === 'objective');
    const descriptiveQuestions = questions.filter(q => q.type === 'descriptive');

    objectiveQuestions.forEach(q => {
      const studentAnswer = sessionData.answers[q.id];
      if (studentAnswer && studentAnswer.toUpperCase() === q.correctOption.toUpperCase()) {
        objectiveMarks += q.marks;
      }
    });

    const hasDescriptive = descriptiveQuestions.length > 0;

    const newSubmission = {
      submissionId: submissionId,
      examId: exam.id,
      studentId: user.id,
      studentName: user.name,
      studentRoll: user.rollNo || user.id,
      department: user.department || 'Computer Science',
      submittedAt: submissionTime,
      submissionType: isAutoExpired ? 'auto-expired' : 'manual',
      timeTakenMinutes: Math.round(((exam.durationMinutes || 15) * 60 - (sessionData.timeRemainingSeconds || 0)) / 60),
      answers: { ...sessionData.answers },
      evaluation: {
        evaluated: !hasDescriptive,
        evaluatedBy: hasDescriptive ? null : 'Automated Evaluation Engine',
        evaluatedAt: hasDescriptive ? null : submissionTime,
        objectiveMarksObtained: objectiveMarks,
        descriptiveMarksObtained: 0,
        totalMarksObtained: objectiveMarks,
        totalPossibleMarks: exam.totalMarks,
        percentage: Math.round((objectiveMarks / exam.totalMarks) * 100),
        passed: objectiveMarks >= exam.passingMarks,
        feedback: {},
        generalRemarks: hasDescriptive
          ? 'Objective questions evaluated automatically. Descriptive answers submitted to course examiner.'
          : 'Automated evaluation completed.'
      }
    };

    const submissions = getSubmissions();
    submissions.push(newSubmission);
    saveSubmissions(submissions);

    localStorage.removeItem(sessionKey);

    window.location.href = `results.html?submissionId=${encodeURIComponent(submissionId)}`;
  }

  /* -------------------------------------------------------------
   * PAGE 6: Results Page Logic
   * ----------------------------------------------------------- */
  function initResultsPage() {
    const submissions = getSubmissions();
    const submissionId = getQueryParam('submissionId');
    let submission = submissions.find(s => s.submissionId === submissionId);

    if (!submission && submissions.length > 0) {
      submission = submissions[submissions.length - 1]; // Latest submission or sample
    }

    if (!submission) {
      alert('No examination submission found to display results.');
      window.location.href = 'student-dashboard.html';
      return;
    }

    const exams = getExaminations();
    const exam = exams.find(e => e.id === submission.examId) || exams[0];

    document.getElementById('res-exam-title').textContent = `${exam.code}: ${exam.title}`;
    document.getElementById('res-submission-id').textContent = submission.submissionId;
    document.getElementById('res-student-info').textContent = `${submission.studentName} (${submission.studentRoll}) &bull; ${submission.department}`;
    document.getElementById('res-submission-time').textContent = new Date(submission.submittedAt).toLocaleString();
    document.getElementById('res-submission-mode').textContent = submission.submissionType === 'auto-expired' ? 'Auto-submitted on time expiry' : 'Manual submission by student';

    const evalObj = submission.evaluation;
    const isEvaluated = evalObj && evalObj.evaluated;

    const statusBadge = document.getElementById('res-status-badge');
    const scoreVal = document.getElementById('res-score-value');
    const scorePercent = document.getElementById('res-score-percentage');
    const marksBreakdown = document.getElementById('res-marks-breakdown');

    if (isEvaluated) {
      const isPassed = evalObj.passed;
      statusBadge.textContent = isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT';
      statusBadge.className = `result-badge-large ${isPassed ? 'badge-success' : 'badge-danger'}`;
      scoreVal.textContent = `${evalObj.totalMarksObtained} / ${evalObj.totalPossibleMarks}`;
      scorePercent.textContent = `Percentage: ${evalObj.percentage}%`;
      marksBreakdown.innerHTML = `
        <strong>Breakdown:</strong> Objective: ${evalObj.objectiveMarksObtained} Marks &bull; 
        Descriptive: ${evalObj.descriptiveMarksObtained} Marks
        ${evalObj.evaluatedBy ? `<br><small class="text-muted">Evaluated by: ${evalObj.evaluatedBy} on ${new Date(evalObj.evaluatedAt).toLocaleDateString()}</small>` : ''}
      `;
    } else {
      statusBadge.textContent = 'EVALUATION IN PROGRESS';
      statusBadge.className = 'result-badge-large badge-warning';
      scoreVal.textContent = `${evalObj.objectiveMarksObtained} (Objective Only)`;
      scorePercent.textContent = 'Descriptive evaluation pending by University Examiner';
      marksBreakdown.innerHTML = `
        <strong>Objective Score:</strong> ${evalObj.objectiveMarksObtained} Marks (Automated Evaluation)<br>
        <strong>Descriptive Questions:</strong> Awaiting marks and feedback from examiner.
      `;
    }

    const detailsContainer = document.getElementById('res-questions-breakdown');
    detailsContainer.innerHTML = '';

    (exam.questions || []).forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '16px';

      const studentAns = submission.answers[q.id];
      const isObjective = q.type === 'objective';

      let evaluationHtml = '';

      if (isObjective) {
        const isCorrect = studentAns && studentAns.toUpperCase() === q.correctOption.toUpperCase();
        evaluationHtml = `
          <div class="review-answer-box ${isCorrect ? 'correct' : 'incorrect'}">
            <strong>Your Answer:</strong> ${studentAns ? `Option ${studentAns}` : '<em>Not Answered</em>'} &nbsp;|&nbsp;
            <strong>Correct Answer:</strong> Option ${q.correctOption} &nbsp;|&nbsp;
            <strong>Marks:</strong> ${isCorrect ? q.marks : 0} / ${q.marks} Marks
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:6px;">
            <strong>Explanation:</strong> ${escapeHtml(q.explanation || 'N/A')}
          </div>
        `;
      } else {
        const feedback = (evalObj.feedback && evalObj.feedback[q.id]) || null;
        const awardedMarks = feedback ? feedback.marks : (isEvaluated ? 0 : 'Pending');

        evaluationHtml = `
          <div class="review-answer-box">
            <strong>Your Submitted Response:</strong>
            <pre style="white-space:pre-wrap; margin-top:6px; font-family:monospace; font-size:0.9rem;">${escapeHtml(studentAns || '[No answer written]')}</pre>
          </div>
          <div class="examiner-feedback-box">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>Examiner Evaluation:</strong>
              <span class="badge ${isEvaluated ? 'badge-info' : 'badge-warning'}">Marks: ${awardedMarks} / ${q.marks}</span>
            </div>
            <p style="margin-top:6px; font-style:italic;">
              ${feedback && feedback.comments ? `"${escapeHtml(feedback.comments)}"` : (isEvaluated ? 'No specific comments provided.' : 'Pending examiner review and grading.')}
            </p>
            <details style="margin-top:8px;">
              <summary style="font-size:0.8rem; cursor:pointer; color:var(--primary);">View Model Rubric / Expected Answer</summary>
              <pre style="font-size:0.82rem; margin-top:4px; white-space:pre-wrap;">${escapeHtml(q.modelAnswerKey || q.rubric)}</pre>
            </details>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="question-header">
          <span style="font-weight:700;">Question ${idx + 1} (${isObjective ? 'Objective' : 'Descriptive'})</span>
          <span class="badge badge-secondary">Max Marks: ${q.marks}</span>
        </div>
        <p style="font-weight:500;">${escapeHtml(q.question)}</p>
        ${evaluationHtml}
      `;

      detailsContainer.appendChild(card);
    });
  }

  /* -------------------------------------------------------------
   * PAGE 7: Admin Dashboard Logic
   * ----------------------------------------------------------- */
  function initAdminDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }

    const users = getUsers();
    const exams = getExaminations();
    const submissions = getSubmissions();

    const students = users.filter(u => u.role === 'student');
    const totalQuestions = exams.reduce((acc, e) => acc + (e.questions ? e.questions.length : 0), 0);
    const evaluatedSubmissions = submissions.filter(s => s.evaluation && s.evaluation.evaluated);
    const passedCount = evaluatedSubmissions.filter(s => s.evaluation.passed).length;
    const passRate = evaluatedSubmissions.length > 0 ? Math.round((passedCount / evaluatedSubmissions.length) * 100) : 100;

    document.getElementById('admin-stat-students').textContent = students.length;
    document.getElementById('admin-stat-exams').textContent = exams.length;
    document.getElementById('admin-stat-questions').textContent = totalQuestions;
    document.getElementById('admin-stat-submissions').textContent = submissions.length;
    document.getElementById('admin-stat-passrate').textContent = `${passRate}%`;

    const examsTable = document.getElementById('admin-exams-overview-table');
    examsTable.innerHTML = '';
    exams.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${e.code}</strong></td>
        <td>${escapeHtml(e.title)}</td>
        <td>${escapeHtml(e.department)}</td>
        <td>${e.date}</td>
        <td>${e.durationMinutes} mins</td>
        <td>${e.questions ? e.questions.length : 0}</td>
        <td>${e.totalMarks}</td>
        <td><span class="badge ${e.status === 'upcoming' ? 'badge-warning' : 'badge-success'}">${e.status || 'available'}</span></td>
        <td>
          <a href="manage-exams.html?editId=${encodeURIComponent(e.id)}" class="btn btn-secondary btn-sm">Edit</a>
          <a href="manage-questions.html?examId=${encodeURIComponent(e.id)}" class="btn btn-outline btn-sm">Questions</a>
        </td>
      `;
      examsTable.appendChild(tr);
    });

    const subTable = document.getElementById('admin-recent-submissions-table');
    subTable.innerHTML = '';
    if (submissions.length === 0) {
      subTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No submissions recorded yet.</td></tr>';
    } else {
      submissions.slice(-5).reverse().forEach(sub => {
        const isEval = sub.evaluation && sub.evaluation.evaluated;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${sub.submissionId}</strong></td>
          <td>${sub.examId}</td>
          <td>${escapeHtml(sub.studentName)} (${sub.studentRoll})</td>
          <td>${new Date(sub.submittedAt).toLocaleDateString()}</td>
          <td>${isEval ? `${sub.evaluation.totalMarksObtained} / ${sub.evaluation.totalPossibleMarks}` : `${sub.evaluation.objectiveMarksObtained} (Obj)`}</td>
          <td><span class="badge ${isEval ? 'badge-success' : 'badge-warning'}">${isEval ? 'Published' : 'Pending'}</span></td>
          <td>
            <a href="results.html?submissionId=${encodeURIComponent(sub.submissionId)}" class="btn btn-secondary btn-sm">View</a>
          </td>
        `;
        subTable.appendChild(tr);
      });
    }
  }

  /* -------------------------------------------------------------
   * PAGE 8: Manage Examinations Logic
   * ----------------------------------------------------------- */
  function initManageExams() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }

    renderManageExamsTable();

    const editId = getQueryParam('editId');
    if (editId) {
      editExistingExam(editId);
    }
  }

  function renderManageExamsTable() {
    const exams = getExaminations();
    const tbody = document.getElementById('manage-exams-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    exams.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${e.code}</strong></td>
        <td>${escapeHtml(e.title)}</td>
        <td>${e.date}</td>
        <td>${e.durationMinutes} mins</td>
        <td>${e.questions ? e.questions.length : 0}</td>
        <td>${e.totalMarks} (Pass: ${e.passingMarks})</td>
        <td><span class="badge ${e.status === 'upcoming' ? 'badge-warning' : 'badge-success'}">${e.status || 'available'}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" type="button" onclick="app.editExistingExam('${e.id}')">Edit</button>
          <a href="manage-questions.html?examId=${encodeURIComponent(e.id)}" class="btn btn-outline btn-sm">Questions</a>
          <button class="btn btn-danger btn-sm" type="button" onclick="app.deleteExamItem('${e.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function handleSaveExaminationForm(event) {
    if (event) event.preventDefault();
    const editId = document.getElementById('edit-exam-id').value;
    const code = document.getElementById('exam-input-code').value.trim();
    const title = document.getElementById('exam-input-title').value.trim();
    const dept = document.getElementById('exam-input-dept').value.trim();
    const date = document.getElementById('exam-input-date').value;
    const duration = parseInt(document.getElementById('exam-input-duration').value, 10);
    const totalMarks = parseInt(document.getElementById('exam-input-totalmarks').value, 10);
    const passMarks = parseInt(document.getElementById('exam-input-passmarks').value, 10);
    const status = document.getElementById('exam-input-status').value;
    const instructionsText = document.getElementById('exam-input-instructions').value.trim();
    const instructions = instructionsText ? instructionsText.split('\n').filter(Boolean) : [
      "Ensure stable internet connection.",
      "Answers are automatically saved.",
      "System auto-submits upon timer expiry."
    ];

    const exams = getExaminations();

    if (editId) {
      const idx = exams.findIndex(e => e.id === editId);
      if (idx !== -1) {
        exams[idx].code = code;
        exams[idx].title = title;
        exams[idx].department = dept;
        exams[idx].date = date;
        exams[idx].durationMinutes = duration;
        exams[idx].totalMarks = totalMarks;
        exams[idx].passingMarks = passMarks;
        exams[idx].status = status;
        exams[idx].instructions = instructions;
      }
    } else {
      const newId = `EXAM-${code.toUpperCase()}-${Date.now().toString().slice(-4)}`;
      exams.push({
        id: newId,
        code: code,
        title: title,
        department: dept,
        date: date,
        durationMinutes: duration,
        totalMarks: totalMarks,
        passingMarks: passMarks,
        status: status,
        instructions: instructions,
        questions: []
      });
    }

    saveExaminations(exams);
    resetManageExamForm();
    renderManageExamsTable();
    alert('Examination saved successfully!');
  }

  function editExistingExam(examId) {
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    document.getElementById('edit-exam-id').value = exam.id;
    document.getElementById('exam-input-code').value = exam.code;
    document.getElementById('exam-input-title').value = exam.title;
    document.getElementById('exam-input-dept').value = exam.department;
    document.getElementById('exam-input-date').value = exam.date;
    document.getElementById('exam-input-duration').value = exam.durationMinutes;
    document.getElementById('exam-input-totalmarks').value = exam.totalMarks;
    document.getElementById('exam-input-passmarks').value = exam.passingMarks;
    document.getElementById('exam-input-status').value = exam.status || 'available';
    document.getElementById('exam-input-instructions').value = (exam.instructions || []).join('\n');

    document.getElementById('manage-exam-form-title').textContent = `Edit Examination: ${exam.code}`;
    document.getElementById('cancel-edit-exam-btn').hidden = false;
    document.getElementById('exam-submit-btn').textContent = 'Update Examination';
    window.scrollTo(0, 0);
  }

  function resetManageExamForm() {
    document.getElementById('edit-exam-id').value = '';
    document.getElementById('exam-input-code').value = '';
    document.getElementById('exam-input-title').value = '';
    document.getElementById('exam-input-dept').value = '';
    document.getElementById('exam-input-date').value = '';
    document.getElementById('exam-input-duration').value = '15';
    document.getElementById('exam-input-totalmarks').value = '20';
    document.getElementById('exam-input-passmarks').value = '10';
    document.getElementById('exam-input-status').value = 'available';
    document.getElementById('exam-input-instructions').value = '';

    document.getElementById('manage-exam-form-title').textContent = 'Create New Examination';
    document.getElementById('cancel-edit-exam-btn').hidden = true;
    document.getElementById('exam-submit-btn').textContent = 'Save Examination';
  }

  function deleteExamItem(examId) {
    if (!confirm('Are you sure you want to delete this examination? All its questions will also be removed.')) return;
    let exams = getExaminations();
    exams = exams.filter(e => e.id !== examId);
    saveExaminations(exams);
    renderManageExamsTable();
  }

  /* -------------------------------------------------------------
   * PAGE 9: Manage Questions Logic
   * ----------------------------------------------------------- */
  let currentTargetExamId = null;

  function initManageQuestions() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }

    const exams = getExaminations();
    const select = document.getElementById('question-exam-select');
    if (!select) return;
    select.innerHTML = '';

    exams.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.code}: ${e.title}`;
      select.appendChild(opt);
    });

    const paramExamId = getQueryParam('examId');
    currentTargetExamId = paramExamId || (exams.length > 0 ? exams[0].id : null);

    if (currentTargetExamId) {
      select.value = currentTargetExamId;
      refreshQuestionList(currentTargetExamId);
    }
  }

  function refreshQuestionList(examId) {
    currentTargetExamId = examId;
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    const metaSpan = document.getElementById('question-exam-meta');
    const container = document.getElementById('manage-questions-list');

    if (!exam || !container) return;
    metaSpan.textContent = `Duration: ${exam.durationMinutes} mins | Total Marks: ${exam.totalMarks} | Current Questions: ${exam.questions ? exam.questions.length : 0}`;

    container.innerHTML = '';
    const questions = exam.questions || [];

    if (questions.length === 0) {
      container.innerHTML = '<p class="text-muted">No questions added to this examination yet. Use the form above to add MCQs or Descriptive questions.</p>';
      return;
    }

    questions.forEach((q, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'card';
      qDiv.style.marginBottom = '12px';

      const isObj = q.type === 'objective';
      let detailsHtml = '';

      if (isObj) {
        detailsHtml = `
          <ul style="margin:8px 0 8px 20px; font-size:0.9rem;">
            ${(q.options || []).map(o => `<li><strong>${o.key}:</strong> ${escapeHtml(o.text)} ${o.key === q.correctOption ? '<b><font color="green">(Correct Key)</font></b>' : ''}</li>`).join('')}
          </ul>
          ${q.explanation ? `<p style="font-size:0.82rem; color:var(--text-muted); margin:0;"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</p>` : ''}
        `;
      } else {
        detailsHtml = `
          <p style="font-size:0.85rem; margin:6px 0;"><strong>Model Rubric:</strong> ${escapeHtml(q.modelAnswerKey || q.rubric || 'N/A')}</p>
        `;
      }

      qDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div>
            <strong>Question ${idx + 1}</strong>
            <span class="badge ${isObj ? 'badge-info' : 'badge-secondary'}" style="margin-left:6px;">${isObj ? 'Objective MCQ' : 'Descriptive'}</span>
            <span class="badge badge-secondary" style="margin-left:6px;">${q.marks} Marks</span>
          </div>
          <button class="btn btn-danger btn-sm" type="button" onclick="app.deleteQuestionItem('${exam.id}', ${q.id})">
            Delete Question
          </button>
        </div>
        <p style="margin:4px 0; font-weight:500;">${escapeHtml(q.question)}</p>
        ${detailsHtml}
      `;

      container.appendChild(qDiv);
    });
  }

  function handleQuestionTypeToggle(type) {
    const mcqFields = document.getElementById('q-mcq-fields');
    const descFields = document.getElementById('q-desc-fields');
    if (type === 'descriptive') {
      mcqFields.hidden = true;
      descFields.hidden = false;
      document.getElementById('q-marks-input').value = '6';
    } else {
      mcqFields.hidden = false;
      descFields.hidden = true;
      document.getElementById('q-marks-input').value = '2';
    }
  }

  function handleAddQuestionForm(event) {
    if (event) event.preventDefault();
    const examId = currentTargetExamId;
    if (!examId) return;

    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const type = document.getElementById('q-type-select').value;
    const marks = parseInt(document.getElementById('q-marks-input').value, 10);
    const questionText = document.getElementById('q-text-input').value.trim();

    if (!exam.questions) exam.questions = [];
    const newQId = exam.questions.length > 0 ? Math.max(...exam.questions.map(q => q.id)) + 1 : 1;

    let newQuestion = {
      id: newQId,
      type: type,
      marks: marks,
      question: questionText
    };

    if (type === 'objective') {
      newQuestion.options = [
        { key: 'A', text: document.getElementById('q-opt-a').value.trim() },
        { key: 'B', text: document.getElementById('q-opt-b').value.trim() },
        { key: 'C', text: document.getElementById('q-opt-c').value.trim() },
        { key: 'D', text: document.getElementById('q-opt-d').value.trim() }
      ];
      newQuestion.correctOption = document.getElementById('q-correct-opt').value;
      newQuestion.explanation = document.getElementById('q-explanation').value.trim();
    } else {
      newQuestion.maxWords = parseInt(document.getElementById('q-maxwords').value, 10) || 250;
      newQuestion.rubric = document.getElementById('q-rubric').value.trim();
      newQuestion.modelAnswerKey = newQuestion.rubric;
    }

    exam.questions.push(newQuestion);
    saveExaminations(exams);

    document.getElementById('q-text-input').value = '';
    document.getElementById('q-opt-a').value = '';
    document.getElementById('q-opt-b').value = '';
    document.getElementById('q-opt-c').value = '';
    document.getElementById('q-opt-d').value = '';
    document.getElementById('q-explanation').value = '';
    document.getElementById('q-rubric').value = '';

    refreshQuestionList(examId);
    alert('Question added successfully to the examination!');
  }

  function deleteQuestionItem(examId, qId) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    if (!exam || !exam.questions) return;

    exam.questions = exam.questions.filter(q => q.id !== qId);
    saveExaminations(exams);
    refreshQuestionList(examId);
  }

  /* -------------------------------------------------------------
   * PAGE 10: Evaluate Answers Logic
   * ----------------------------------------------------------- */
  function initEvaluateAnswers() {
    const user = getCurrentUser();
    if (!user || (user.role !== 'examiner' && user.role !== 'admin')) {
      window.location.href = 'login.html';
      return;
    }

    renderExaminerSubmissionsList();

    const subId = getQueryParam('submissionId');
    if (subId) {
      openExaminerEvaluationForm(subId);
    }
  }

  function renderExaminerSubmissionsList() {
    const listContainer = document.getElementById('eval-list-container');
    const formContainer = document.getElementById('eval-form-container');
    if (listContainer) listContainer.hidden = false;
    if (formContainer) formContainer.hidden = true;

    const container = document.getElementById('examiner-submissions-list');
    if (!container) return;
    container.innerHTML = '';

    const submissions = getSubmissions();
    const exams = getExaminations();

    if (submissions.length === 0) {
      container.innerHTML = '<p class="text-muted">No student submissions available for evaluation yet.</p>';
      return;
    }

    submissions.forEach(sub => {
      const exam = exams.find(e => e.id === sub.examId);
      const isEvaluated = sub.evaluation && sub.evaluation.evaluated;

      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '14px';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <strong style="color:var(--primary); font-size:1.05rem;">${exam ? exam.code : sub.examId}</strong>
              <span class="badge ${isEvaluated ? 'badge-success' : 'badge-warning'}">
                ${isEvaluated ? 'Result Published' : 'Pending Evaluation'}
              </span>
            </div>
            <h4 style="margin:2px 0;">${exam ? escapeHtml(exam.title) : 'Examination'}</h4>
            <p style="margin:4px 0; font-size:0.88rem;">
              <strong>Student:</strong> ${escapeHtml(sub.studentName)} (${sub.studentRoll}) &bull; ${escapeHtml(sub.department)}
            </p>
            <p style="margin:0; font-size:0.8rem; color:var(--text-muted);">
              Submitted: ${new Date(sub.submittedAt).toLocaleString()} (${sub.submissionType})
            </p>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            ${isEvaluated ? `
              <a href="results.html?submissionId=${encodeURIComponent(sub.submissionId)}" class="btn btn-secondary btn-sm">View Published Result</a>
              <button class="btn btn-outline btn-sm" type="button" onclick="app.openExaminerEvaluationForm('${sub.submissionId}')">Re-grade</button>
            ` : `
              <button class="btn btn-primary" type="button" onclick="app.openExaminerEvaluationForm('${sub.submissionId}')">Evaluate Descriptive Answers</button>
            `}
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function openExaminerEvaluationForm(submissionId) {
    const submissions = getSubmissions();
    const submission = submissions.find(s => s.submissionId === submissionId);
    if (!submission) return;

    const exams = getExaminations();
    const exam = exams.find(e => e.id === submission.examId);
    if (!exam) return;

    document.getElementById('eval-list-container').hidden = true;
    document.getElementById('eval-form-container').hidden = false;

    document.getElementById('eval-exam-title').textContent = `${exam.code}: ${exam.title}`;
    document.getElementById('eval-student-meta').textContent = `Student: ${submission.studentName} (${submission.studentRoll}) | Submitted: ${new Date(submission.submittedAt).toLocaleString()}`;
    document.getElementById('eval-submission-id').value = submissionId;

    const formContainer = document.getElementById('eval-questions-form');
    formContainer.innerHTML = '';

    const descriptiveQuestions = (exam.questions || []).filter(q => q.type === 'descriptive');

    if (descriptiveQuestions.length === 0) {
      formContainer.innerHTML = '<p>This examination contains only objective questions and was auto-evaluated.</p>';
    } else {
      descriptiveQuestions.forEach((q, idx) => {
        const studentAns = submission.answers[q.id] || '';
        const prevFeedback = (submission.evaluation && submission.evaluation.feedback && submission.evaluation.feedback[q.id]) || {};

        const qBox = document.createElement('div');
        qBox.className = 'card';
        qBox.style.marginBottom = '20px';

        qBox.innerHTML = `
          <div class="question-header">
            <span style="font-weight:700;">Descriptive Question ${idx + 1}</span>
            <span class="badge badge-secondary">Max Marks: ${q.marks}</span>
          </div>
          <p style="font-weight:500;">${escapeHtml(q.question)}</p>
          
          <div style="background:#f7fafc; border-left:3px solid var(--primary); padding:10px 14px; margin-bottom:12px;">
            <strong>Student's Submitted Response:</strong>
            <pre style="white-space:pre-wrap; font-family:inherit; margin-top:6px; font-size:0.9rem;">${escapeHtml(studentAns || '[Student left this question blank]')}</pre>
          </div>

          <details style="margin-bottom:14px;">
            <summary style="font-size:0.85rem; cursor:pointer; color:var(--primary); font-weight:600;">
              View Model Rubric &amp; Key
            </summary>
            <div style="background:#fffaf0; padding:10px; border-radius:4px; font-size:0.85rem; margin-top:6px; white-space:pre-wrap;">${escapeHtml(q.modelAnswerKey || q.rubric || 'N/A')}</div>
          </details>

          <div style="display:grid; grid-template-columns:160px 1fr; gap:16px;">
            <div class="form-group">
              <label for="eval_marks_${q.id}">Award Marks (0 - ${q.marks}):</label>
              <input 
                type="number" 
                id="eval_marks_${q.id}" 
                class="form-control" 
                min="0" 
                max="${q.marks}" 
                step="0.5" 
                value="${prevFeedback.marks !== undefined ? prevFeedback.marks : ''}" 
                required
              >
            </div>
            <div class="form-group">
              <label for="eval_feedback_${q.id}">Examiner Feedback / Comments:</label>
              <input 
                type="text" 
                id="eval_feedback_${q.id}" 
                class="form-control" 
                placeholder="Specific comments on student's understanding..." 
                value="${escapeHtml(prevFeedback.comments || '')}"
              >
            </div>
          </div>
        `;

        formContainer.appendChild(qBox);
      });
    }

    document.getElementById('eval-general-remarks').value = (submission.evaluation && submission.evaluation.generalRemarks) || '';
  }

  function closeExaminerForm() {
    document.getElementById('eval-list-container').hidden = false;
    document.getElementById('eval-form-container').hidden = true;
  }

  function handleSaveAndPublishEvaluation(event) {
    if (event) event.preventDefault();
    const submissionId = document.getElementById('eval-submission-id').value;
    const submissions = getSubmissions();
    const subIndex = submissions.findIndex(s => s.submissionId === submissionId);

    if (subIndex === -1) {
      alert('Submission not found.');
      return;
    }

    const sub = submissions[subIndex];
    const exams = getExaminations();
    const exam = exams.find(e => e.id === sub.examId);
    if (!exam) return;

    let descriptiveTotal = 0;
    const feedbackMap = {};
    const descriptiveQuestions = (exam.questions || []).filter(q => q.type === 'descriptive');

    for (const q of descriptiveQuestions) {
      const marksInput = document.getElementById(`eval_marks_${q.id}`);
      const commentsInput = document.getElementById(`eval_feedback_${q.id}`);

      const marksAwarded = parseFloat(marksInput.value) || 0;
      if (marksAwarded < 0 || marksAwarded > q.marks) {
        alert(`Marks for Question ${q.id} must be between 0 and ${q.marks}`);
        marksInput.focus();
        return;
      }

      descriptiveTotal += marksAwarded;
      feedbackMap[q.id] = {
        marks: marksAwarded,
        comments: (commentsInput.value || '').trim()
      };
    }

    const generalRemarks = (document.getElementById('eval-general-remarks').value || '').trim();
    const objectiveMarks = sub.evaluation.objectiveMarksObtained || 0;
    const finalTotalMarks = objectiveMarks + descriptiveTotal;
    const finalPercentage = Math.round((finalTotalMarks / exam.totalMarks) * 100);
    const passed = finalTotalMarks >= exam.passingMarks;

    const currentUser = getCurrentUser();
    sub.evaluation = {
      evaluated: true,
      evaluatedBy: currentUser ? currentUser.name : 'University Examiner',
      evaluatedAt: new Date().toISOString(),
      objectiveMarksObtained: objectiveMarks,
      descriptiveMarksObtained: descriptiveTotal,
      totalMarksObtained: finalTotalMarks,
      totalPossibleMarks: exam.totalMarks,
      percentage: finalPercentage,
      passed: passed,
      feedback: feedbackMap,
      generalRemarks: generalRemarks || 'Descriptive answers evaluated and verified.'
    };

    submissions[subIndex] = sub;
    saveSubmissions(submissions);

    alert(`Marks published successfully!\nTotal Marks: ${finalTotalMarks} / ${exam.totalMarks} (${finalPercentage}%)\nResult: ${passed ? 'PASSED' : 'FAILED'}`);
    renderExaminerSubmissionsList();
  }

  /* -------------------------------------------------------------
   * Network Offline Simulation
   * ----------------------------------------------------------- */
  function setupNetworkListeners() {
    window.addEventListener('online', () => {
      if (!examState.isOfflineSimulated) handleNetworkOnline();
    });
    window.addEventListener('offline', () => {
      handleNetworkOffline();
    });
  }

  function handleNetworkOffline() {
    showNotificationBanner('⚠️ Network Disconnected: You are currently offline. Answers are saved locally in browser storage.', 'offline');
    updateExamAutoSaveStatus();
  }

  function handleNetworkOnline() {
    showNotificationBanner('🟢 Internet Connection Restored! System synchronized with saved answers.', 'reconnected');
    saveExamState();
    updateExamAutoSaveStatus();
  }

  function toggleSimulateOffline() {
    examState.isOfflineSimulated = !examState.isOfflineSimulated;
    const btn = document.getElementById('offline-simulation-btn');

    if (examState.isOfflineSimulated) {
      if (btn) btn.textContent = 'Simulate Connection Reconnect';
      handleNetworkOffline();
    } else {
      if (btn) btn.textContent = 'Simulate Connection Drop';
      handleNetworkOnline();
    }
  }

  function showNotificationBanner(message, type) {
    const banner = document.getElementById('connection-status-banner');
    const textEl = document.getElementById('connection-status-text');
    if (!banner || !textEl) return;

    textEl.textContent = message;
    banner.className = `status-banner ${type}`;
    banner.hidden = false;

    if (type === 'reconnected') {
      setTimeout(() => {
        banner.hidden = true;
      }, 5000);
    }
  }

  /* -------------------------------------------------------------
   * Global App API Expose
   * ----------------------------------------------------------- */
  window.app = {
    handleLogout,
    toggleStyles,
    // Page 1
    initLoginPage,
    switchAuthTab,
    handleLogin,
    handleStudentRegister,
    fillDemoCredentials,
    // Page 2
    initStudentDashboard,
    // Page 3
    initExamInstructions,
    // Page 4
    initExaminationPage,
    selectExamOption,
    clearExamOption,
    handleExamDescriptiveInput,
    toggleExamReviewFlag,
    jumpExamQuestion,
    nextExamQuestion,
    prevExamQuestion,
    setExamViewMode,
    goToReviewSubmit,
    toggleSimulateOffline,
    // Page 5
    initReviewSubmitPage,
    finalizeExamSubmission,
    // Page 6
    initResultsPage,
    // Page 7
    initAdminDashboard,
    // Page 8
    initManageExams,
    handleSaveExaminationForm,
    editExistingExam,
    resetManageExamForm,
    deleteExamItem,
    // Page 9
    initManageQuestions,
    refreshQuestionList,
    handleQuestionTypeToggle,
    handleAddQuestionForm,
    deleteQuestionItem,
    // Page 10
    initEvaluateAnswers,
    openExaminerEvaluationForm,
    closeExaminerForm,
    handleSaveAndPublishEvaluation
  };

  document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    updateHeaderUI();
  });
})();
