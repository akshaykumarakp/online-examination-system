/**
 * Online Examination System - 10-Page Unified Application Logic
 * 
 * Student Section (6 pages):
 *  1. Login / Register (Student authentication & registration)
 *  2. Student Dashboard (Available and upcoming exams)
 *  3. Exam Instructions (Rules, duration, and exam details)
 *  4. Examination Page (Display questions, timer, auto-save, answer selection)
 *  5. Review & Submit (Review and modify answers before submission)
 *  6. Results Page (Display marks and examination results)
 * 
 * Admin Section (3 pages):
 *  7. Admin Dashboard (Statistics and examination overview)
 *  8. Manage Examinations (Create, edit, and delete examinations)
 *  9. Manage Questions (Add MCQs and descriptive questions)
 * 
 * Examiner Section (1 page):
 *  10. Evaluate Answers (Check descriptive answers and assign marks)
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_USER = 'oes_current_user';
  const STORAGE_KEY_SUBMISSIONS = 'oes_submissions';
  const STORAGE_KEY_EXAMS = 'oes_examinations';
  const STORAGE_KEY_USERS = 'oes_users';
  const STORAGE_KEY_SESSION_PREFIX = 'oes_exam_session_';

  // Application State
  const state = {
    currentUser: null,
    currentExam: null,
    currentQuestionIndex: 0,
    viewMode: 'one-by-one',
    answers: {},
    reviewFlags: {},
    visitedQuestions: {},
    timeRemainingSeconds: 0,
    timerInterval: null,
    autoSaveInterval: null,
    isOfflineSimulated: false,
    lastSavedTimestamp: null,
    selectedQuestionExamId: null
  };

  /* -------------------------------------------------------------
   * 1. Storage & State Initialization
   * ----------------------------------------------------------- */
  function initializeData() {
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
      return INITIAL_DATA.users;
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
      return INITIAL_DATA.examinations;
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

  function checkExistingSession() {
    const savedUserJson = sessionStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem(STORAGE_KEY_USER);
    if (savedUserJson) {
      try {
        state.currentUser = JSON.parse(savedUserJson);
        updateUserHeader();
        if (state.currentUser.role === 'admin') {
          navigateToPage('page-admin-dashboard');
        } else if (state.currentUser.role === 'examiner') {
          navigateToPage('page-evaluate-answers');
        } else {
          navigateToPage('page-student-dashboard');
        }
      } catch (e) {
        state.currentUser = null;
        navigateToPage('page-login-register');
      }
    } else {
      navigateToPage('page-login-register');
    }
  }

  /* -------------------------------------------------------------
   * 2. Page Router & Header Navigation
   * ----------------------------------------------------------- */
  const ALL_PAGES = [
    'page-login-register',     // Page 1
    'page-student-dashboard',  // Page 2
    'page-exam-instructions',  // Page 3
    'page-examination',        // Page 4
    'page-review-submit',      // Page 5
    'page-results',            // Page 6
    'page-admin-dashboard',    // Page 7
    'page-manage-exams',       // Page 8
    'page-manage-questions',   // Page 9
    'page-evaluate-answers'    // Page 10
  ];

  function navigateToPage(pageId) {
    ALL_PAGES.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });

    const targetEl = document.getElementById(pageId);
    if (targetEl) {
      targetEl.hidden = false;
      window.scrollTo(0, 0);
    }

    updateUserHeader();

    // Trigger page-specific initializers
    if (pageId === 'page-student-dashboard') {
      renderStudentDashboard();
    } else if (pageId === 'page-admin-dashboard') {
      renderAdminDashboard();
    } else if (pageId === 'page-manage-exams') {
      renderManageExams();
    } else if (pageId === 'page-manage-questions') {
      renderManageQuestions();
    } else if (pageId === 'page-evaluate-answers') {
      renderExaminerDashboard();
    }
  }

  function updateUserHeader() {
    const navLinks = document.getElementById('header-nav-links');
    const userBadge = document.getElementById('header-user-badge');
    const userNameSpan = document.getElementById('header-user-name');
    const userRoleSpan = document.getElementById('header-user-role');
    const logoutBtn = document.getElementById('header-logout-btn');

    if (state.currentUser) {
      userBadge.hidden = false;
      logoutBtn.hidden = false;
      userNameSpan.textContent = state.currentUser.name;

      if (state.currentUser.role === 'admin') {
        userRoleSpan.textContent = 'Admin';
        userRoleSpan.className = 'badge badge-warning';
        navLinks.innerHTML = `
          <button type="button" class="nav-link-btn" onclick="app.navigateToPage('page-admin-dashboard')">Admin Dashboard (7)</button>
          <button type="button" class="nav-link-btn" onclick="app.navigateToPage('page-manage-exams')">Manage Exams (8)</button>
          <button type="button" class="nav-link-btn" onclick="app.navigateToPage('page-manage-questions')">Manage Questions (9)</button>
        `;
      } else if (state.currentUser.role === 'examiner') {
        userRoleSpan.textContent = 'Examiner';
        userRoleSpan.className = 'badge badge-warning';
        navLinks.innerHTML = `
          <button type="button" class="nav-link-btn" onclick="app.navigateToPage('page-evaluate-answers')">Evaluate Answers (10)</button>
        `;
      } else {
        userRoleSpan.textContent = 'Student';
        userRoleSpan.className = 'badge badge-info';
        navLinks.innerHTML = `
          <button type="button" class="nav-link-btn" onclick="app.navigateToPage('page-student-dashboard')">Dashboard (2)</button>
          <button type="button" class="nav-link-btn" onclick="app.viewSampleResult()">Results (6)</button>
        `;
      }
      navLinks.hidden = false;
    } else {
      userBadge.hidden = true;
      logoutBtn.hidden = true;
      navLinks.hidden = true;
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

  /* -------------------------------------------------------------
   * PAGE 1: Login / Register (Student authentication)
   * ----------------------------------------------------------- */
  function switchAuthTab(tab) {
    const loginBtn = document.getElementById('tab-login-btn');
    const registerBtn = document.getElementById('tab-register-btn');
    const loginBox = document.getElementById('auth-login-box');
    const registerBox = document.getElementById('auth-register-box');

    if (tab === 'register') {
      loginBtn.classList.remove('active');
      registerBtn.classList.add('active');
      loginBox.hidden = true;
      registerBox.hidden = false;
    } else {
      registerBtn.classList.remove('active');
      loginBtn.classList.add('active');
      registerBox.hidden = true;
      loginBox.hidden = false;
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
      state.currentUser = user;
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      errorAlert.hidden = true;
      userIdInput.value = '';
      passwordInput.value = '';

      if (user.role === 'admin') {
        navigateToPage('page-admin-dashboard');
      } else if (user.role === 'examiner') {
        navigateToPage('page-evaluate-answers');
      } else {
        navigateToPage('page-student-dashboard');
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

    // Switch to login tab and prefill
    setTimeout(() => {
      switchAuthTab('login');
      document.getElementById('login-userid').value = newStudentId;
      document.getElementById('login-password').value = password;
    }, 1200);
  }

  function fillDemoCredentials(userId, password) {
    switchAuthTab('login');
    document.getElementById('login-userid').value = userId;
    document.getElementById('login-password').value = password;
    document.getElementById('login-error').hidden = true;
  }

  function handleLogout() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    if (state.autoSaveInterval) clearInterval(state.autoSaveInterval);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    state.currentUser = null;
    state.currentExam = null;
    navigateToPage('page-login-register');
  }

  /* -------------------------------------------------------------
   * PAGE 2: Student Dashboard (Available and upcoming exams)
   * ----------------------------------------------------------- */
  function renderStudentDashboard() {
    if (!state.currentUser) return;

    document.getElementById('profile-student-name').textContent = state.currentUser.name;
    document.getElementById('profile-student-roll').textContent = state.currentUser.rollNo;
    document.getElementById('profile-student-dept').textContent = state.currentUser.department;
    document.getElementById('profile-student-sem').textContent = state.currentUser.semester;

    const availableContainer = document.getElementById('available-exams-list');
    const upcomingContainer = document.getElementById('upcoming-exams-list');
    availableContainer.innerHTML = '';
    upcomingContainer.innerHTML = '';

    const exams = getExaminations();
    const submissions = getSubmissions();

    exams.forEach(exam => {
      const userSubmission = submissions.find(
        s => s.examId === exam.id && s.studentId === state.currentUser.id
      );

      const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${exam.id}_${state.currentUser.id}`;
      const savedSession = localStorage.getItem(sessionKey);

      const card = document.createElement('div');
      card.className = 'exam-card';

      let statusBadge = '<span class="badge badge-info">Available</span>';
      let actionButtons = `
        <button class="btn btn-primary" type="button" onclick="app.showExamInstructions('${exam.id}')">
          Read Instructions &amp; Start
        </button>
      `;

      if (userSubmission) {
        if (userSubmission.evaluation && userSubmission.evaluation.evaluated) {
          statusBadge = '<span class="badge badge-success">Evaluated - Result Published</span>';
          actionButtons = `
            <button class="btn btn-outline" type="button" onclick="app.viewExamResult('${userSubmission.submissionId}')">
              View Published Result
            </button>
          `;
        } else {
          statusBadge = '<span class="badge badge-warning">Submitted - Grading Pending</span>';
          actionButtons = `
            <button class="btn btn-secondary" type="button" onclick="app.viewExamResult('${userSubmission.submissionId}')">
              View Submission Status
            </button>
          `;
        }
      } else if (savedSession) {
        statusBadge = '<span class="badge badge-review">In Progress (Saved)</span>';
        actionButtons = `
          <button class="btn btn-warning" type="button" onclick="app.resumeExam('${exam.id}')">
            Resume Saved Exam
          </button>
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
   * PAGE 3: Exam Instructions (Rules, duration and exam details)
   * ----------------------------------------------------------- */
  function showExamInstructions(examId) {
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId) || exams[0];
    if (!exam) return;

    state.currentExam = exam;

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
      "When the timer reaches 00:00, the system automatically submits your saved answers."
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

    navigateToPage('page-exam-instructions');
  }

  /* -------------------------------------------------------------
   * PAGE 4: Examination Page (Display questions, timer and answer selection)
   * ----------------------------------------------------------- */
  function startExam(isResume = false) {
    if (!state.currentExam) {
      const exams = getExaminations();
      state.currentExam = exams[0];
    }
    if (!state.currentUser) {
      const users = getUsers();
      state.currentUser = users[0];
    }

    const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${state.currentExam.id}_${state.currentUser.id}`;
    const savedSession = localStorage.getItem(sessionKey);

    if (isResume && savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        state.answers = parsed.answers || {};
        state.reviewFlags = parsed.reviewFlags || {};
        state.visitedQuestions = parsed.visitedQuestions || {};
        state.timeRemainingSeconds = parsed.timeRemainingSeconds || (state.currentExam.durationMinutes * 60);
        state.currentQuestionIndex = parsed.currentQuestionIndex || 0;
        showNotificationBanner('Previous examination session restored with saved answers.', 'reconnected');
      } catch (e) {
        initFreshExamSession();
      }
    } else {
      initFreshExamSession();
    }

    state.viewMode = 'one-by-one';
    if (state.currentExam.questions && state.currentExam.questions.length > 0) {
      state.visitedQuestions[state.currentExam.questions[state.currentQuestionIndex].id] = true;
    }

    document.getElementById('live-exam-title').textContent = `${state.currentExam.code}: ${state.currentExam.title}`;
    document.getElementById('offline-simulation-btn').textContent = 'Simulate Connection Drop';

    startTimer();
    startAutoSaveBackgroundWorker();

    renderExamInterface();
    navigateToPage('page-examination');
  }

  function resumeExam(examId) {
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    if (exam) state.currentExam = exam;
    startExam(true);
  }

  function initFreshExamSession() {
    state.answers = {};
    state.reviewFlags = {};
    state.visitedQuestions = {};
    state.currentQuestionIndex = 0;
    state.timeRemainingSeconds = (state.currentExam.durationMinutes || 15) * 60;
  }

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.timeRemainingSeconds--;
      updateTimerDisplay();

      if (state.timeRemainingSeconds <= 0) {
        clearInterval(state.timerInterval);
        handleTimeExpiredAutoSubmit();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerBox = document.getElementById('exam-timer');
    const timerText = document.getElementById('timer-countdown-text');
    if (!timerText) return;

    const secondsLeft = Math.max(0, state.timeRemainingSeconds);
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timerBox) {
      if (secondsLeft <= 120) timerBox.classList.add('timer-warning');
      else timerBox.classList.remove('timer-warning');
    }
  }

  function handleTimeExpiredAutoSubmit() {
    showNotificationBanner('⚠️ Examination Time Expired! Automatically submitting your saved answers...', 'offline');
    setTimeout(() => {
      submitExam(true);
    }, 1200);
  }

  function saveCurrentStateToStorage() {
    if (!state.currentExam || !state.currentUser) return;
    const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${state.currentExam.id}_${state.currentUser.id}`;
    const sessionData = {
      examId: state.currentExam.id,
      studentId: state.currentUser.id,
      answers: state.answers,
      reviewFlags: state.reviewFlags,
      visitedQuestions: state.visitedQuestions,
      currentQuestionIndex: state.currentQuestionIndex,
      timeRemainingSeconds: state.timeRemainingSeconds,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    state.lastSavedTimestamp = new Date();
    updateAutoSaveStatusUI();
  }

  function updateAutoSaveStatusUI() {
    const statusEl = document.getElementById('exam-autosave-status');
    if (!statusEl) return;
    const isOffline = !navigator.onLine || state.isOfflineSimulated;

    if (isOffline) {
      statusEl.className = 'autosave-status offline';
      statusEl.innerHTML = `<span>●</span> <strong>Saved locally (Offline)</strong>`;
    } else {
      const timeStr = state.lastSavedTimestamp ? state.lastSavedTimestamp.toLocaleTimeString() : 'Just now';
      statusEl.className = 'autosave-status';
      statusEl.innerHTML = `<span>●</span> Auto-saved at ${timeStr}`;
    }
  }

  function startAutoSaveBackgroundWorker() {
    if (state.autoSaveInterval) clearInterval(state.autoSaveInterval);
    state.autoSaveInterval = setInterval(() => {
      saveCurrentStateToStorage();
    }, 5000);
  }

  function renderExamInterface() {
    if (!state.currentExam.questions || state.currentExam.questions.length === 0) return;
    const currentQ = state.currentExam.questions[state.currentQuestionIndex];
    if (currentQ) state.visitedQuestions[currentQ.id] = true;

    renderQuestionDisplay();
    renderQuestionPalette();
    updateNavigationControls();
    saveCurrentStateToStorage();
  }

  function renderQuestionDisplay() {
    const container = document.getElementById('single-question-container');
    const allQuestionsContainer = document.getElementById('all-questions-container');

    if (state.viewMode === 'all') {
      container.hidden = true;
      allQuestionsContainer.hidden = false;
      renderAllQuestionsView();
      return;
    }

    container.hidden = false;
    allQuestionsContainer.hidden = true;

    const q = state.currentExam.questions[state.currentQuestionIndex];
    if (!q) return;

    const qIndex = state.currentQuestionIndex + 1;
    const isObjective = q.type === 'objective';
    const currentAnswer = state.answers[q.id] || '';

    let answerHtml = '';

    if (isObjective) {
      answerHtml = `
        <div class="options-list">
          ${(q.options || []).map(opt => `
            <label class="option-item ${currentAnswer === opt.key ? 'selected' : ''}" onclick="app.handleOptionSelect(${q.id}, '${opt.key}')">
              <input type="radio" name="opt_${q.id}" value="${opt.key}" ${currentAnswer === opt.key ? 'checked' : ''}>
              <span class="option-key">${opt.key}.</span>
              <span class="option-content">${escapeHtml(opt.text)}</span>
            </label>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" type="button" onclick="app.clearOptionSelection(${q.id})">
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
            oninput="app.handleDescriptiveInput(${q.id}, this.value)"
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
          <span style="font-size:1.15rem; font-weight:700; color:var(--primary);">Question ${qIndex} of ${state.currentExam.questions.length}</span>
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

  function renderAllQuestionsView() {
    const container = document.getElementById('all-questions-container');
    container.innerHTML = '';

    state.currentExam.questions.forEach((q, idx) => {
      const qCard = document.createElement('div');
      qCard.className = 'card';
      qCard.style.marginBottom = '20px';

      const isObjective = q.type === 'objective';
      const currentAnswer = state.answers[q.id] || '';

      let answerHtml = '';
      if (isObjective) {
        answerHtml = `
          <div class="options-list">
            ${(q.options || []).map(opt => `
              <label class="option-item ${currentAnswer === opt.key ? 'selected' : ''}" onclick="app.handleOptionSelect(${q.id}, '${opt.key}')">
                <input type="radio" name="opt_all_${q.id}" value="${opt.key}" ${currentAnswer === opt.key ? 'checked' : ''}>
                <span class="option-key">${opt.key}.</span>
                <span class="option-content">${escapeHtml(opt.text)}</span>
              </label>
            `).join('')}
          </div>
          <button class="btn btn-secondary btn-sm" type="button" onclick="app.clearOptionSelection(${q.id})">Clear Selection</button>
        `;
      } else {
        const wordCount = currentAnswer ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
        answerHtml = `
          <textarea 
            id="desc_all_ans_${q.id}" 
            class="form-control" 
            placeholder="Type your response..."
            oninput="app.handleDescriptiveInput(${q.id}, this.value)"
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

  function renderQuestionPalette() {
    const grid = document.getElementById('question-palette-grid');
    if (!grid || !state.currentExam || !state.currentExam.questions) return;
    grid.innerHTML = '';

    let answeredCount = 0;
    let notAnsweredCount = 0;
    let reviewCount = 0;
    let notVisitedCount = 0;

    state.currentExam.questions.forEach((q, index) => {
      const isCurrent = index === state.currentQuestionIndex && state.viewMode === 'one-by-one';
      const hasAnswer = state.answers[q.id] && String(state.answers[q.id]).trim().length > 0;
      const isReview = !!state.reviewFlags[q.id];
      const isVisited = !!state.visitedQuestions[q.id];

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
      btn.onclick = () => jumpToQuestion(index);

      grid.appendChild(btn);
    });

    document.getElementById('palette-count-answered').textContent = answeredCount;
    document.getElementById('palette-count-not-answered').textContent = notAnsweredCount;
    document.getElementById('palette-count-review').textContent = reviewCount;
    document.getElementById('palette-count-not-visited').textContent = notVisitedCount;
  }

  function updateNavigationControls() {
    const prevBtn = document.getElementById('btn-prev-question');
    const nextBtn = document.getElementById('btn-next-question');
    const reviewBtn = document.getElementById('btn-toggle-review');

    if (state.viewMode === 'all') {
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    if (prevBtn) prevBtn.disabled = state.currentQuestionIndex === 0;
    if (nextBtn) {
      if (state.currentQuestionIndex === state.currentExam.questions.length - 1) {
        nextBtn.textContent = 'Last Question';
        nextBtn.disabled = true;
      } else {
        nextBtn.textContent = 'Next Question →';
        nextBtn.disabled = false;
      }
    }

    if (reviewBtn) {
      const q = state.currentExam.questions[state.currentQuestionIndex];
      const isMarked = q && !!state.reviewFlags[q.id];
      reviewBtn.textContent = isMarked ? '★ Unmark Review' : '☆ Mark for Review';
      reviewBtn.className = isMarked ? 'btn btn-warning' : 'btn btn-secondary';
    }
  }

  function handleOptionSelect(questionId, optionKey) {
    state.answers[questionId] = optionKey;
    saveCurrentStateToStorage();
    renderExamInterface();
  }

  function clearOptionSelection(questionId) {
    delete state.answers[questionId];
    saveCurrentStateToStorage();
    renderExamInterface();
  }

  function handleDescriptiveInput(questionId, text) {
    state.answers[questionId] = text;
    const countEl = document.getElementById(`word-count-${questionId}`);
    if (countEl) {
      const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      countEl.textContent = `${words} words`;
    }
    saveCurrentStateToStorage();
    renderQuestionPalette();
  }

  function toggleReviewFlag() {
    const q = state.currentExam.questions[state.currentQuestionIndex];
    if (q) {
      state.reviewFlags[q.id] = !state.reviewFlags[q.id];
      saveCurrentStateToStorage();
      renderExamInterface();
    }
  }

  function jumpToQuestion(index) {
    if (index >= 0 && index < state.currentExam.questions.length) {
      state.currentQuestionIndex = index;
      if (state.viewMode === 'all') {
        state.viewMode = 'one-by-one';
        document.getElementById('view-mode-select').value = 'one-by-one';
      }
      renderExamInterface();
    }
  }

  function nextQuestion() {
    if (state.currentQuestionIndex < state.currentExam.questions.length - 1) {
      state.currentQuestionIndex++;
      renderExamInterface();
    }
  }

  function previousQuestion() {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--;
      renderExamInterface();
    }
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    renderExamInterface();
  }

  /* -------------------------------------------------------------
   * PAGE 5: Review & Submit (Review and modify answers before submission)
   * ----------------------------------------------------------- */
  function openReviewSubmitPage() {
    if (!state.currentExam) {
      const exams = getExaminations();
      state.currentExam = exams[0];
    }
    saveCurrentStateToStorage();

    const totalQuestions = state.currentExam.questions ? state.currentExam.questions.length : 0;
    let answeredCount = 0;
    let unansweredCount = 0;
    let reviewCount = 0;

    const listContainer = document.getElementById('review-modal-question-list');
    listContainer.innerHTML = '';

    (state.currentExam.questions || []).forEach((q, idx) => {
      const isAnswered = state.answers[q.id] && String(state.answers[q.id]).trim().length > 0;
      const isReview = !!state.reviewFlags[q.id];

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
          <button class="btn btn-secondary btn-sm" type="button" onclick="app.closeReviewAndJumpTo(${idx})">
            Modify Answer
          </button>
        </td>
      `;
      listContainer.appendChild(tr);
    });

    document.getElementById('modal-stat-total').textContent = totalQuestions;
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

    navigateToPage('page-review-submit');
  }

  function closeReviewAndJumpTo(index) {
    jumpToQuestion(index);
    navigateToPage('page-examination');
  }

  function submitExam(isAutoExpired = false) {
    if (!state.currentExam || !state.currentUser) return;
    if (state.timerInterval) clearInterval(state.timerInterval);
    if (state.autoSaveInterval) clearInterval(state.autoSaveInterval);

    const submissionTime = new Date().toISOString();
    const submissionId = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

    let objectiveMarks = 0;
    const questions = state.currentExam.questions || [];
    const objectiveQuestions = questions.filter(q => q.type === 'objective');
    const descriptiveQuestions = questions.filter(q => q.type === 'descriptive');

    objectiveQuestions.forEach(q => {
      const studentAnswer = state.answers[q.id];
      if (studentAnswer && studentAnswer.toUpperCase() === q.correctOption.toUpperCase()) {
        objectiveMarks += q.marks;
      }
    });

    const hasDescriptive = descriptiveQuestions.length > 0;

    const newSubmission = {
      submissionId: submissionId,
      examId: state.currentExam.id,
      studentId: state.currentUser.id,
      studentName: state.currentUser.name,
      studentRoll: state.currentUser.rollNo,
      department: state.currentUser.department,
      submittedAt: submissionTime,
      submissionType: isAutoExpired ? 'auto-expired' : 'manual',
      timeTakenMinutes: Math.round(((state.currentExam.durationMinutes || 15) * 60 - state.timeRemainingSeconds) / 60),
      answers: { ...state.answers },
      evaluation: {
        evaluated: !hasDescriptive,
        evaluatedBy: hasDescriptive ? null : 'Automated Evaluation Engine',
        evaluatedAt: hasDescriptive ? null : submissionTime,
        objectiveMarksObtained: objectiveMarks,
        descriptiveMarksObtained: 0,
        totalMarksObtained: objectiveMarks,
        totalPossibleMarks: state.currentExam.totalMarks,
        percentage: Math.round((objectiveMarks / state.currentExam.totalMarks) * 100),
        passed: objectiveMarks >= state.currentExam.passingMarks,
        feedback: {},
        generalRemarks: hasDescriptive
          ? 'Objective questions evaluated automatically. Descriptive answers submitted to course examiner.'
          : 'Automated evaluation completed.'
      }
    };

    const submissions = getSubmissions();
    submissions.push(newSubmission);
    saveSubmissions(submissions);

    const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${state.currentExam.id}_${state.currentUser.id}`;
    localStorage.removeItem(sessionKey);

    viewExamResult(submissionId);
  }

  /* -------------------------------------------------------------
   * PAGE 6: Results Page (Display marks and examination results)
   * ----------------------------------------------------------- */
  function viewExamResult(submissionId) {
    const submissions = getSubmissions();
    const submission = submissions.find(s => s.submissionId === submissionId);
    if (!submission) {
      alert('Submission record not found.');
      return;
    }

    const exams = getExaminations();
    const exam = exams.find(e => e.id === submission.examId);
    if (!exam) return;

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

    navigateToPage('page-results');
  }

  function viewSampleResult() {
    const submissions = getSubmissions();
    if (submissions.length > 0) {
      viewExamResult(submissions[0].submissionId);
    } else {
      alert('No submissions found yet. Take an exam first or use the sample records.');
    }
  }

  /* -------------------------------------------------------------
   * PAGE 7: Admin Dashboard (Statistics and examination overview)
   * ----------------------------------------------------------- */
  function renderAdminDashboard() {
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

    // Overview Table
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
          <button class="btn btn-secondary btn-sm" type="button" onclick="app.editExamination('${e.id}')">Edit</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="app.openQuestionsForExam('${e.id}')">Questions</button>
        </td>
      `;
      examsTable.appendChild(tr);
    });

    // Recent Submissions Table
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
            <button class="btn btn-secondary btn-sm" type="button" onclick="app.viewExamResult('${sub.submissionId}')">View</button>
          </td>
        `;
        subTable.appendChild(tr);
      });
    }
  }

  /* -------------------------------------------------------------
   * PAGE 8: Manage Examinations (Create, edit and delete examinations)
   * ----------------------------------------------------------- */
  function renderManageExams() {
    const exams = getExaminations();
    const tbody = document.getElementById('manage-exams-table-body');
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
          <button class="btn btn-secondary btn-sm" type="button" onclick="app.editExamination('${e.id}')">Edit</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="app.openQuestionsForExam('${e.id}')">Questions</button>
          <button class="btn btn-danger btn-sm" type="button" onclick="app.deleteExamination('${e.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function handleSaveExamination(event) {
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
      // Update
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
      // Create New
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
    resetExamForm();
    renderManageExams();
    alert('Examination configuration saved successfully!');
  }

  function editExamination(examId) {
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    navigateToPage('page-manage-exams');

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
  }

  function resetExamForm() {
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

  function deleteExamination(examId) {
    if (!confirm('Are you sure you want to delete this examination? All its questions will also be removed.')) return;
    let exams = getExaminations();
    exams = exams.filter(e => e.id !== examId);
    saveExaminations(exams);
    renderManageExams();
  }

  /* -------------------------------------------------------------
   * PAGE 9: Manage Questions (Add MCQs and descriptive questions)
   * ----------------------------------------------------------- */
  function renderManageQuestions() {
    const exams = getExaminations();
    const select = document.getElementById('question-exam-select');
    select.innerHTML = '';

    exams.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.code}: ${e.title}`;
      select.appendChild(opt);
    });

    if (!state.selectedQuestionExamId && exams.length > 0) {
      state.selectedQuestionExamId = exams[0].id;
    }

    if (state.selectedQuestionExamId) {
      select.value = state.selectedQuestionExamId;
      handleQuestionExamChange(state.selectedQuestionExamId);
    }
  }

  function handleQuestionExamChange(examId) {
    state.selectedQuestionExamId = examId;
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    const metaSpan = document.getElementById('question-exam-meta');
    const container = document.getElementById('manage-questions-list');

    if (!exam) return;
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
          <button class="btn btn-danger btn-sm" type="button" onclick="app.deleteQuestion('${exam.id}', ${q.id})">
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

  function handleAddQuestion(event) {
    if (event) event.preventDefault();
    const examId = state.selectedQuestionExamId;
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

    // Reset inputs
    document.getElementById('q-text-input').value = '';
    document.getElementById('q-opt-a').value = '';
    document.getElementById('q-opt-b').value = '';
    document.getElementById('q-opt-c').value = '';
    document.getElementById('q-opt-d').value = '';
    document.getElementById('q-explanation').value = '';
    document.getElementById('q-rubric').value = '';

    handleQuestionExamChange(examId);
    alert('Question added successfully to examination!');
  }

  function deleteQuestion(examId, qId) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const exams = getExaminations();
    const exam = exams.find(e => e.id === examId);
    if (!exam || !exam.questions) return;

    exam.questions = exam.questions.filter(q => q.id !== qId);
    saveExaminations(exams);
    handleQuestionExamChange(examId);
  }

  function openQuestionsForExam(examId) {
    state.selectedQuestionExamId = examId;
    navigateToPage('page-manage-questions');
  }

  /* -------------------------------------------------------------
   * PAGE 10: Evaluate Answers (Check descriptive answers and assign marks)
   * ----------------------------------------------------------- */
  function renderExaminerDashboard() {
    const listContainer = document.getElementById('eval-list-container');
    const formContainer = document.getElementById('eval-form-container');
    listContainer.hidden = false;
    formContainer.hidden = true;

    const container = document.getElementById('examiner-submissions-list');
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
              <button class="btn btn-secondary btn-sm" type="button" onclick="app.viewExamResult('${sub.submissionId}')">View Published Result</button>
              <button class="btn btn-outline btn-sm" type="button" onclick="app.openExaminerEvaluation('${sub.submissionId}')">Re-grade</button>
            ` : `
              <button class="btn btn-primary" type="button" onclick="app.openExaminerEvaluation('${sub.submissionId}')">Evaluate Descriptive Answers</button>
            `}
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function openExaminerEvaluation(submissionId) {
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

  function closeExaminerGradingForm() {
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

    sub.evaluation = {
      evaluated: true,
      evaluatedBy: state.currentUser ? state.currentUser.name : 'University Examiner',
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
    renderExaminerDashboard();
  }

  /* -------------------------------------------------------------
   * Network Offline Simulation & Listeners
   * ----------------------------------------------------------- */
  function setupNetworkListeners() {
    window.addEventListener('online', () => {
      if (!state.isOfflineSimulated) handleNetworkOnline();
    });
    window.addEventListener('offline', () => {
      handleNetworkOffline();
    });
  }

  function handleNetworkOffline() {
    showNotificationBanner('⚠️ Network Disconnected: You are currently offline. Answers are saved locally in browser storage.', 'offline');
    updateAutoSaveStatusUI();
  }

  function handleNetworkOnline() {
    showNotificationBanner('🟢 Internet Connection Restored! System synchronized with saved answers.', 'reconnected');
    saveCurrentStateToStorage();
    updateAutoSaveStatusUI();
  }

  function toggleSimulateOffline() {
    state.isOfflineSimulated = !state.isOfflineSimulated;
    const btn = document.getElementById('offline-simulation-btn');

    if (state.isOfflineSimulated) {
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
   * Expose API to Window
   * ----------------------------------------------------------- */
  window.app = {
    navigateToPage,
    toggleStyles,
    switchAuthTab,
    handleLogin,
    handleStudentRegister,
    fillDemoCredentials,
    handleLogout,
    showExamInstructions,
    startExam,
    resumeExam,
    handleOptionSelect,
    clearOptionSelection,
    handleDescriptiveInput,
    toggleReviewFlag,
    jumpToQuestion,
    nextQuestion,
    previousQuestion,
    setViewMode,
    openReviewSubmitPage,
    closeReviewAndJumpTo,
    submitExam,
    viewExamResult,
    viewSampleResult,
    renderAdminDashboard,
    renderManageExams,
    handleSaveExamination,
    editExamination,
    resetExamForm,
    deleteExamination,
    renderManageQuestions,
    handleQuestionExamChange,
    handleQuestionTypeToggle,
    handleAddQuestion,
    deleteQuestion,
    openQuestionsForExam,
    renderExaminerDashboard,
    openExaminerEvaluation,
    closeExaminerGradingForm,
    handleSaveAndPublishEvaluation,
    toggleSimulateOffline
  };

  document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    setupNetworkListeners();
    checkExistingSession();
  });
})();
