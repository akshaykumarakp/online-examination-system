/**
 * Online Examination System - Pure HTML & JavaScript Application Logic
 * No external CSS or stylesheets required.
 * Implements: Authentication, Examination Dashboard, Real-time Auto-save,
 * Timer with Auto-submission on expiry, Offline detection & recovery,
 * One-by-One / All Questions navigation, Objective Auto-evaluation,
 * Examiner Descriptive Evaluation, and Result Publishing.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_USER = 'oes_current_user';
  const STORAGE_KEY_SUBMISSIONS = 'oes_submissions';
  const STORAGE_KEY_SESSION_PREFIX = 'oes_exam_session_';

  // Application State
  const state = {
    currentUser: null,
    currentExam: null,
    currentQuestionIndex: 0,
    viewMode: 'one-by-one', // 'one-by-one' or 'all'
    answers: {},            // { [questionId]: string }
    reviewFlags: {},        // { [questionId]: boolean }
    visitedQuestions: {},   // { [questionId]: boolean }
    timeRemainingSeconds: 0,
    timerInterval: null,
    autoSaveInterval: null,
    isOfflineSimulated: false,
    lastSavedTimestamp: null
  };

  /* -------------------------------------------------------------
   * 1. Storage & State Initialization
   * ----------------------------------------------------------- */
  function initializeSubmissions() {
    if (!localStorage.getItem(STORAGE_KEY_SUBMISSIONS)) {
      localStorage.setItem(
        STORAGE_KEY_SUBMISSIONS,
        JSON.stringify(INITIAL_DATA.sampleSubmissions || [])
      );
    }
  }

  function getSubmissions() {
    initializeSubmissions();
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
        navigateView(state.currentUser.role === 'examiner' ? 'examiner-dashboard' : 'student-dashboard');
      } catch (e) {
        state.currentUser = null;
      }
    } else {
      navigateView('login-view');
    }
  }

  /* -------------------------------------------------------------
   * 2. View Navigation Router (Using Native HTML hidden Attribute)
   * ----------------------------------------------------------- */
  function navigateView(viewId) {
    const views = [
      'login-view',
      'student-dashboard',
      'exam-instructions-view',
      'active-exam-view',
      'review-submit-modal',
      'result-view',
      'examiner-dashboard',
      'examiner-evaluate-view'
    ];

    views.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });

    const targetEl = document.getElementById(viewId);
    if (targetEl) {
      targetEl.hidden = false;
      window.scrollTo(0, 0);
    }

    updateUserHeader();

    if (viewId === 'student-dashboard') {
      renderStudentDashboard();
    } else if (viewId === 'examiner-dashboard') {
      renderExaminerDashboard();
    }
  }

  function updateUserHeader() {
    const userBadge = document.getElementById('header-user-badge');
    const userNameSpan = document.getElementById('header-user-name');
    const userRoleSpan = document.getElementById('header-user-role');

    if (state.currentUser) {
      if (userBadge) userBadge.hidden = false;
      if (userNameSpan) userNameSpan.textContent = state.currentUser.name;
      if (userRoleSpan) {
        userRoleSpan.textContent = state.currentUser.role === 'examiner' ? '[Role: Examiner]' : '[Role: Student]';
      }
    } else {
      if (userBadge) userBadge.hidden = true;
    }
  }

  /* -------------------------------------------------------------
   * 3. Authentication Handlers
   * ----------------------------------------------------------- */
  function handleLogin(event) {
    if (event) event.preventDefault();
    const userIdInput = document.getElementById('login-userid');
    const passwordInput = document.getElementById('login-password');
    const errorAlert = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');

    const enteredId = (userIdInput.value || '').trim();
    const enteredPassword = (passwordInput.value || '').trim();

    const user = INITIAL_DATA.users.find(
      u => u.id.toLowerCase() === enteredId.toLowerCase() && u.password === enteredPassword
    );

    if (user) {
      state.currentUser = user;
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      errorAlert.hidden = true;
      userIdInput.value = '';
      passwordInput.value = '';

      if (user.role === 'examiner') {
        navigateView('examiner-dashboard');
      } else {
        navigateView('student-dashboard');
      }
    } else {
      if (errorText) errorText.textContent = 'Invalid credentials. Please enter a valid registered Student ID or Examiner ID.';
      errorAlert.hidden = false;
    }
  }

  function fillDemoCredentials(userId, password) {
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
    navigateView('login-view');
  }

  /* -------------------------------------------------------------
   * 4. Student Dashboard
   * ----------------------------------------------------------- */
  function renderStudentDashboard() {
    if (!state.currentUser) return;

    document.getElementById('profile-student-name').textContent = state.currentUser.name;
    document.getElementById('profile-student-roll').textContent = state.currentUser.rollNo;
    document.getElementById('profile-student-dept').textContent = state.currentUser.department;
    document.getElementById('profile-student-sem').textContent = state.currentUser.semester;

    const examListContainer = document.getElementById('available-exams-list');
    examListContainer.innerHTML = '';

    const submissions = getSubmissions();

    INITIAL_DATA.examinations.forEach(exam => {
      const userSubmission = submissions.find(
        s => s.examId === exam.id && s.studentId === state.currentUser.id
      );

      const sessionKey = `${STORAGE_KEY_SESSION_PREFIX}${exam.id}_${state.currentUser.id}`;
      const savedSession = localStorage.getItem(sessionKey);

      let statusText = '<b>[Status: Available]</b>';
      let actionButtons = `
        <button type="button" onclick="app.showExamInstructions('${exam.id}')">
          <b>Read Instructions &amp; Start Exam</b>
        </button>
      `;

      if (userSubmission) {
        if (userSubmission.evaluation && userSubmission.evaluation.evaluated) {
          statusText = '<b>[Status: Evaluated &amp; Result Published]</b>';
          actionButtons = `
            <button type="button" onclick="app.viewExamResult('${userSubmission.submissionId}')">
              <b>View Published Result</b>
            </button>
          `;
        } else {
          statusText = '<b>[Status: Submitted - Examiner Grading Pending]</b>';
          actionButtons = `
            <button type="button" onclick="app.viewExamResult('${userSubmission.submissionId}')">
              View Submission Status
            </button>
          `;
        }
      } else if (savedSession) {
        statusText = '<b>[Status: In Progress - Locally Saved]</b>';
        actionButtons = `
          <button type="button" onclick="app.resumeExam('${exam.id}')">
            <b>Resume Saved Examination</b>
          </button>
        `;
      }

      const examFieldset = document.createElement('fieldset');
      examFieldset.style.marginBottom = '16px';
      examFieldset.innerHTML = `
        <legend><b>${exam.code}: ${escapeHtml(exam.title)}</b></legend>
        <p>${statusText}</p>
        <table border="1" cellpadding="6" cellspacing="0" width="100%">
          <tr>
            <td width="25%"><b>Department:</b></td>
            <td width="25%">${escapeHtml(exam.department)}</td>
            <td width="25%"><b>Examination Date:</b></td>
            <td width="25%">${exam.date}</td>
          </tr>
          <tr>
            <td><b>Duration:</b></td>
            <td>${exam.durationMinutes} Minutes</td>
            <td><b>Total Questions:</b></td>
            <td>${exam.questions.length} (${exam.questions.filter(q => q.type === 'objective').length} Objective, ${exam.questions.filter(q => q.type === 'descriptive').length} Descriptive)</td>
          </tr>
          <tr>
            <td><b>Total Marks:</b></td>
            <td>${exam.totalMarks} Marks</td>
            <td><b>Passing Marks:</b></td>
            <td>${exam.passingMarks} Marks</td>
          </tr>
        </table>
        <p align="right">
          ${actionButtons}
        </p>
      `;

      examListContainer.appendChild(examFieldset);
    });
  }

  /* -------------------------------------------------------------
   * 5. Exam Instructions
   * ----------------------------------------------------------- */
  function showExamInstructions(examId) {
    const exam = INITIAL_DATA.examinations.find(e => e.id === examId);
    if (!exam) return;

    state.currentExam = exam;

    document.getElementById('inst-exam-code').textContent = exam.code;
    document.getElementById('inst-exam-title').textContent = exam.title;
    document.getElementById('inst-exam-duration').textContent = `${exam.durationMinutes} Minutes`;
    document.getElementById('inst-exam-questions').textContent = `${exam.questions.length} Questions`;
    document.getElementById('inst-exam-marks').textContent = `${exam.totalMarks} Marks`;
    document.getElementById('inst-exam-pass').textContent = `${exam.passingMarks} Marks`;

    const instructionsList = document.getElementById('inst-instructions-list');
    instructionsList.innerHTML = '';
    exam.instructions.forEach(inst => {
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

    navigateView('exam-instructions-view');
  }

  /* -------------------------------------------------------------
   * 6. Starting / Resuming Examination
   * ----------------------------------------------------------- */
  function startExam(isResume = false) {
    if (!state.currentExam || !state.currentUser) return;

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
        showNotificationBanner('Previous examination session restored with all your saved answers.', 'online');
      } catch (e) {
        initFreshExamSession();
      }
    } else {
      initFreshExamSession();
    }

    state.viewMode = 'one-by-one';
    state.visitedQuestions[state.currentExam.questions[state.currentQuestionIndex].id] = true;

    document.getElementById('live-exam-title').textContent = `${state.currentExam.code}: ${state.currentExam.title}`;
    document.getElementById('offline-simulation-btn').textContent = 'Simulate Connection Drop';

    startTimer();
    startAutoSaveBackgroundWorker();

    renderExamInterface();
    navigateView('active-exam-view');
  }

  function resumeExam(examId) {
    const exam = INITIAL_DATA.examinations.find(e => e.id === examId);
    if (!exam) return;
    state.currentExam = exam;
    startExam(true);
  }

  function initFreshExamSession() {
    state.answers = {};
    state.reviewFlags = {};
    state.visitedQuestions = {};
    state.currentQuestionIndex = 0;
    state.timeRemainingSeconds = state.currentExam.durationMinutes * 60;
  }

  /* -------------------------------------------------------------
   * 7. Timer & Auto-submission
   * ----------------------------------------------------------- */
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
    const timerText = document.getElementById('timer-countdown-text');
    const warningLabel = document.getElementById('timer-warning-label');
    if (!timerText) return;

    const secondsLeft = Math.max(0, state.timeRemainingSeconds);
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (warningLabel) {
      warningLabel.hidden = secondsLeft > 120;
    }
  }

  function handleTimeExpiredAutoSubmit() {
    showNotificationBanner('⚠️ Examination Time Expired! The system is automatically submitting your saved answers...', 'offline');

    setTimeout(() => {
      submitExam(true);
    }, 1200);
  }

  /* -------------------------------------------------------------
   * 8. Auto-Save & Offline Storage Engine
   * ----------------------------------------------------------- */
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
      statusEl.innerHTML = `<b><font color="red">[Saved locally (Offline)]</font></b>`;
    } else {
      const timeStr = state.lastSavedTimestamp ? state.lastSavedTimestamp.toLocaleTimeString() : 'Just now';
      statusEl.innerHTML = `<b><font color="green">[Auto-saved at ${timeStr}]</font></b>`;
    }
  }

  function startAutoSaveBackgroundWorker() {
    if (state.autoSaveInterval) clearInterval(state.autoSaveInterval);
    state.autoSaveInterval = setInterval(() => {
      saveCurrentStateToStorage();
    }, 5000);
  }

  /* -------------------------------------------------------------
   * 9. Examination Interface Rendering
   * ----------------------------------------------------------- */
  function renderExamInterface() {
    const currentQ = state.currentExam.questions[state.currentQuestionIndex];
    state.visitedQuestions[currentQ.id] = true;

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
    const qIndex = state.currentQuestionIndex + 1;
    const isObjective = q.type === 'objective';
    const currentAnswer = state.answers[q.id] || '';

    let answerHtml = '';

    if (isObjective) {
      answerHtml = `
        <fieldset>
          <legend><b>Options:</b></legend>
          ${q.options.map(opt => `
            <p>
              <label>
                <input 
                  type="radio" 
                  name="opt_${q.id}" 
                  value="${opt.key}" 
                  ${currentAnswer === opt.key ? 'checked' : ''} 
                  onchange="app.handleOptionSelect(${q.id}, '${opt.key}')"
                >
                <b>${opt.key}.</b> ${escapeHtml(opt.text)}
              </label>
            </p>
          `).join('')}
          <p>
            <button type="button" onclick="app.clearOptionSelection(${q.id})">Clear Choice</button>
          </p>
        </fieldset>
      `;
    } else {
      const wordCount = currentAnswer ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
      answerHtml = `
        <fieldset>
          <legend><b>Descriptive Answer:</b></legend>
          <p>
            <textarea 
              id="desc_ans_${q.id}" 
              rows="9" 
              cols="70" 
              placeholder="Type your descriptive response here. The system continuously saves your text..."
              oninput="app.handleDescriptiveInput(${q.id}, this.value)"
            >${escapeHtml(currentAnswer)}</textarea>
          </p>
          <p>
            <b>Word Count:</b> <span id="word-count-${q.id}">${wordCount} words</span> &nbsp;|&nbsp;
            <b>Max Recommended:</b> ${q.maxWords || 250} words
          </p>
          <p><i>Guideline: Answers are evaluated by the course examiner based on clarity, correctness, and completeness.</i></p>
        </fieldset>
      `;
    }

    container.innerHTML = `
      <fieldset>
        <legend>
          <h3>Question ${qIndex} of ${state.currentExam.questions.length} [${isObjective ? 'Objective - MCQ' : 'Descriptive'} &bull; ${q.marks} Marks]</h3>
        </legend>
        <p><b>Question:</b></p>
        <p>${escapeHtml(q.question)}</p>
        ${answerHtml}
      </fieldset>
    `;
  }

  function renderAllQuestionsView() {
    const container = document.getElementById('all-questions-container');
    container.innerHTML = '';

    state.currentExam.questions.forEach((q, idx) => {
      const isObjective = q.type === 'objective';
      const currentAnswer = state.answers[q.id] || '';

      let answerHtml = '';
      if (isObjective) {
        answerHtml = `
          ${q.options.map(opt => `
            <p>
              <label>
                <input 
                  type="radio" 
                  name="opt_all_${q.id}" 
                  value="${opt.key}" 
                  ${currentAnswer === opt.key ? 'checked' : ''} 
                  onchange="app.handleOptionSelect(${q.id}, '${opt.key}')"
                >
                <b>${opt.key}.</b> ${escapeHtml(opt.text)}
              </label>
            </p>
          `).join('')}
          <button type="button" onclick="app.clearOptionSelection(${q.id})">Clear Choice</button>
        `;
      } else {
        const wordCount = currentAnswer ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
        answerHtml = `
          <textarea 
            id="desc_all_ans_${q.id}" 
            rows="6" 
            cols="70" 
            placeholder="Type your response..."
            oninput="app.handleDescriptiveInput(${q.id}, this.value)"
          >${escapeHtml(currentAnswer)}</textarea>
          <p>
            <b>Word Count:</b> <span id="word-count-all-${q.id}">${wordCount} words</span>
          </p>
        `;
      }

      const qFieldset = document.createElement('fieldset');
      qFieldset.style.marginBottom = '16px';
      qFieldset.innerHTML = `
        <legend><b>Question ${idx + 1} (${isObjective ? 'MCQ' : 'Descriptive'}) &bull; ${q.marks} Marks</b></legend>
        <p>${escapeHtml(q.question)}</p>
        ${answerHtml}
      `;

      container.appendChild(qFieldset);
    });
  }

  function renderQuestionPalette() {
    const grid = document.getElementById('question-palette-grid');
    if (!grid || !state.currentExam) return;

    grid.innerHTML = '';

    let answeredCount = 0;
    let notAnsweredCount = 0;
    let reviewCount = 0;
    let notVisitedCount = 0;

    const list = document.createElement('ol');

    state.currentExam.questions.forEach((q, index) => {
      const isCurrent = index === state.currentQuestionIndex && state.viewMode === 'one-by-one';
      const hasAnswer = state.answers[q.id] && String(state.answers[q.id]).trim().length > 0;
      const isReview = !!state.reviewFlags[q.id];
      const isVisited = !!state.visitedQuestions[q.id];

      let labelText = '';

      if (isReview && hasAnswer) {
        labelText = '[✓ ? Answered &amp; Review]';
        reviewCount++;
        answeredCount++;
      } else if (isReview) {
        labelText = '[? Review]';
        reviewCount++;
      } else if (hasAnswer) {
        labelText = '[✓ Answered]';
        answeredCount++;
      } else if (isVisited) {
        labelText = '[• Not Answered]';
        notAnsweredCount++;
      } else {
        labelText = '[  Not Visited]';
        notVisitedCount++;
      }

      const li = document.createElement('li');
      li.style.marginBottom = '6px';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `${isCurrent ? '<b>&rarr; Q' + (index + 1) + '</b>' : 'Q' + (index + 1)} ${labelText}`;
      btn.onclick = () => jumpToQuestion(index);

      li.appendChild(btn);
      list.appendChild(li);
    });

    grid.appendChild(list);

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
      if (reviewBtn) reviewBtn.disabled = true;
      return;
    }

    if (prevBtn) prevBtn.disabled = state.currentQuestionIndex === 0;
    if (nextBtn) {
      if (state.currentQuestionIndex === state.currentExam.questions.length - 1) {
        nextBtn.textContent = 'End of Questions';
        nextBtn.disabled = true;
      } else {
        nextBtn.textContent = 'Next Question →';
        nextBtn.disabled = false;
      }
    }

    if (reviewBtn) {
      const q = state.currentExam.questions[state.currentQuestionIndex];
      const isMarked = !!state.reviewFlags[q.id];
      reviewBtn.textContent = isMarked ? '★ Unmark Review' : '☆ Mark for Review';
    }
  }

  /* -------------------------------------------------------------
   * 10. Student Answer Inputs & Navigation Actions
   * ----------------------------------------------------------- */
  function handleOptionSelect(questionId, optionKey) {
    state.answers[questionId] = optionKey;
    saveCurrentStateToStorage();
    renderQuestionPalette();
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
    state.reviewFlags[q.id] = !state.reviewFlags[q.id];
    saveCurrentStateToStorage();
    renderExamInterface();
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
   * 11. Review Section & Validation Before Final Submission
   * ----------------------------------------------------------- */
  function openReviewModal() {
    saveCurrentStateToStorage();

    const totalQuestions = state.currentExam.questions.length;
    let answeredCount = 0;
    let unansweredCount = 0;
    let reviewCount = 0;

    const listContainer = document.getElementById('review-modal-question-list');
    listContainer.innerHTML = '';

    state.currentExam.questions.forEach((q, idx) => {
      const isAnswered = state.answers[q.id] && String(state.answers[q.id]).trim().length > 0;
      const isReview = !!state.reviewFlags[q.id];

      if (isAnswered) answeredCount++;
      else unansweredCount++;
      if (isReview) reviewCount++;

      let statusBadge = isAnswered ? '<b>[Answered]</b>' : '<b><font color="red">[Unanswered]</font></b>';
      if (isReview) statusBadge += ' <b>[Marked for Review]</b>';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td align="center"><b>Question ${idx + 1}</b></td>
        <td>${q.type === 'objective' ? 'Objective (MCQ)' : 'Descriptive'}</td>
        <td>${statusBadge}</td>
        <td align="center">
          <button type="button" onclick="app.closeReviewModalAndJump(${idx})">
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

    document.getElementById('active-exam-view').hidden = true;
    document.getElementById('review-submit-modal').hidden = false;
    window.scrollTo(0, 0);
  }

  function closeReviewModal() {
    document.getElementById('review-submit-modal').hidden = true;
    document.getElementById('active-exam-view').hidden = false;
  }

  function closeReviewModalAndJump(index) {
    closeReviewModal();
    jumpToQuestion(index);
  }

  /* -------------------------------------------------------------
   * 12. Submission & Objective Auto-Evaluation Engine
   * ----------------------------------------------------------- */
  function submitExam(isAutoExpired = false) {
    if (!state.currentExam || !state.currentUser) return;

    if (state.timerInterval) clearInterval(state.timerInterval);
    if (state.autoSaveInterval) clearInterval(state.autoSaveInterval);
    document.getElementById('review-submit-modal').hidden = true;

    const submissionTime = new Date().toISOString();
    const submissionId = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

    let objectiveMarks = 0;
    const objectiveQuestions = state.currentExam.questions.filter(q => q.type === 'objective');
    const descriptiveQuestions = state.currentExam.questions.filter(q => q.type === 'descriptive');

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
      timeTakenMinutes: Math.round((state.currentExam.durationMinutes * 60 - state.timeRemainingSeconds) / 60),
      answers: { ...state.answers },
      evaluation: {
        evaluated: !hasDescriptive,
        evaluatedBy: hasDescriptive ? null : 'System Automated Engine',
        evaluatedAt: hasDescriptive ? null : submissionTime,
        objectiveMarksObtained: objectiveMarks,
        descriptiveMarksObtained: 0,
        totalMarksObtained: objectiveMarks,
        totalPossibleMarks: state.currentExam.totalMarks,
        percentage: Math.round((objectiveMarks / state.currentExam.totalMarks) * 100),
        passed: objectiveMarks >= state.currentExam.passingMarks,
        feedback: {},
        generalRemarks: hasDescriptive
          ? 'Objective questions have been evaluated automatically. Descriptive answers have been submitted to the university examiner for grading.'
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
   * 13. Result View (Student & Evaluator)
   * ----------------------------------------------------------- */
  function viewExamResult(submissionId) {
    const submissions = getSubmissions();
    const submission = submissions.find(s => s.submissionId === submissionId);
    if (!submission) {
      alert('Submission record not found.');
      return;
    }

    const exam = INITIAL_DATA.examinations.find(e => e.id === submission.examId);
    if (!exam) return;

    document.getElementById('res-exam-title').textContent = `${exam.code}: ${exam.title}`;
    document.getElementById('res-submission-id').textContent = submission.submissionId;
    document.getElementById('res-student-info').textContent = `${submission.studentName} (${submission.studentRoll}) - ${submission.department}`;
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
      statusBadge.innerHTML = isPassed ? '<font color="green">PASSED</font>' : '<font color="red">FAILED</font>';
      scoreVal.textContent = `${evalObj.totalMarksObtained} / ${evalObj.totalPossibleMarks}`;
      scorePercent.textContent = `Percentage: ${evalObj.percentage}%`;
      marksBreakdown.innerHTML = `
        <b>Marks Breakdown:</b> Objective Marks: ${evalObj.objectiveMarksObtained} &bull; 
        Descriptive Marks: ${evalObj.descriptiveMarksObtained} &bull; 
        Total Marks: ${evalObj.totalMarksObtained} / ${evalObj.totalPossibleMarks}
        ${evalObj.evaluatedBy ? `<br><i>Evaluated by: ${evalObj.evaluatedBy} on ${new Date(evalObj.evaluatedAt).toLocaleDateString()}</i>` : ''}
        ${evalObj.generalRemarks ? `<br><b>General Remarks:</b> "${escapeHtml(evalObj.generalRemarks)}"` : ''}
      `;
    } else {
      statusBadge.innerHTML = '<font color="orange">EVALUATION IN PROGRESS</font>';
      scoreVal.textContent = `${evalObj.objectiveMarksObtained} (Objective Only)`;
      scorePercent.textContent = 'Descriptive questions pending examiner evaluation';
      marksBreakdown.innerHTML = `
        <b>Objective Score:</b> ${evalObj.objectiveMarksObtained} Marks (Automated Evaluation)<br>
        <b>Descriptive Questions:</b> Submitted to university examiner for review and grading.
      `;
    }

    const detailsContainer = document.getElementById('res-questions-breakdown');
    detailsContainer.innerHTML = '';

    exam.questions.forEach((q, idx) => {
      const qFieldset = document.createElement('fieldset');
      qFieldset.style.marginBottom = '16px';

      const studentAns = submission.answers[q.id];
      const isObjective = q.type === 'objective';

      let evaluationHtml = '';

      if (isObjective) {
        const isCorrect = studentAns && studentAns.toUpperCase() === q.correctOption.toUpperCase();
        evaluationHtml = `
          <table border="1" cellpadding="6" cellspacing="0" width="100%">
            <tr>
              <td width="25%"><b>Your Selected Answer:</b></td>
              <td width="25%">${studentAns ? `Option ${studentAns}` : '<i>Not Answered</i>'}</td>
              <td width="25%"><b>Correct Answer:</b></td>
              <td width="25%">Option ${q.correctOption}</td>
            </tr>
            <tr>
              <td><b>Evaluation Result:</b></td>
              <td>${isCorrect ? '<b><font color="green">CORRECT</font></b>' : '<b><font color="red">INCORRECT</font></b>'}</td>
              <td><b>Marks Awarded:</b></td>
              <td><b>${isCorrect ? q.marks : 0} / ${q.marks} Marks</b></td>
            </tr>
          </table>
          <p><b>Explanation:</b> ${escapeHtml(q.explanation || 'N/A')}</p>
        `;
      } else {
        const feedback = (evalObj.feedback && evalObj.feedback[q.id]) || null;
        const awardedMarks = feedback ? feedback.marks : (isEvaluated ? 0 : 'Pending Evaluation');

        evaluationHtml = `
          <p><b>Candidate's Submitted Answer:</b></p>
          <pre>${escapeHtml(studentAns || '[Candidate left this answer blank]')}</pre>
          <table border="1" cellpadding="6" cellspacing="0" width="100%">
            <tr>
              <td width="30%"><b>Marks Awarded:</b></td>
              <td width="70%"><b>${awardedMarks} / ${q.marks} Marks</b></td>
            </tr>
            <tr>
              <td><b>Examiner Comments:</b></td>
              <td><i>${feedback && feedback.comments ? escapeHtml(feedback.comments) : (isEvaluated ? 'No specific comments provided.' : 'Pending examiner review.')}</i></td>
            </tr>
          </table>
          <details style="margin-top:8px;">
            <summary><b>View Model Answer Key &amp; Rubric</b></summary>
            <pre>${escapeHtml(q.modelAnswerKey || q.rubric)}</pre>
          </details>
        `;
      }

      qFieldset.innerHTML = `
        <legend><b>Question ${idx + 1} (${isObjective ? 'Objective - MCQ' : 'Descriptive'}) &bull; Max Marks: ${q.marks}</b></legend>
        <p><b>Question:</b> ${escapeHtml(q.question)}</p>
        ${evaluationHtml}
      `;

      detailsContainer.appendChild(qFieldset);
    });

    navigateView('result-view');
  }

  /* -------------------------------------------------------------
   * 14. Examiner Evaluation Portal
   * ----------------------------------------------------------- */
  function renderExaminerDashboard() {
    if (!state.currentUser || state.currentUser.role !== 'examiner') {
      alert('Access restricted to Examiners.');
      navigateView('login-view');
      return;
    }

    const container = document.getElementById('examiner-submissions-list');
    container.innerHTML = '';

    const submissions = getSubmissions();

    if (submissions.length === 0) {
      container.innerHTML = '<p>No student submissions found in the system yet.</p>';
      return;
    }

    const table = document.createElement('table');
    table.border = '1';
    table.cellPadding = '6';
    table.cellSpacing = '0';
    table.width = '100%';

    table.innerHTML = `
      <thead>
        <tr>
          <th>Submission ID</th>
          <th>Exam</th>
          <th>Student Name (Roll)</th>
          <th>Submitted At</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${submissions.map(sub => {
          const exam = INITIAL_DATA.examinations.find(e => e.id === sub.examId);
          const isEvaluated = sub.evaluation && sub.evaluation.evaluated;
          return `
            <tr>
              <td><b>${sub.submissionId}</b></td>
              <td>${exam ? exam.code : sub.examId}</td>
              <td>${escapeHtml(sub.studentName)} (${sub.studentRoll})</td>
              <td>${new Date(sub.submittedAt).toLocaleString()}</td>
              <td>
                ${isEvaluated ? '<b><font color="green">[Result Published]</font></b>' : '<b><font color="orange">[Pending Grading]</font></b>'}
              </td>
              <td align="center">
                ${isEvaluated ? `
                  <button type="button" onclick="app.viewExamResult('${sub.submissionId}')">View Result</button>
                  <button type="button" onclick="app.openExaminerEvaluation('${sub.submissionId}')">Re-grade</button>
                ` : `
                  <button type="button" onclick="app.openExaminerEvaluation('${sub.submissionId}')"><b>Grade Descriptive Answers</b></button>
                `}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;

    container.appendChild(table);
  }

  function openExaminerEvaluation(submissionId) {
    const submissions = getSubmissions();
    const submission = submissions.find(s => s.submissionId === submissionId);
    if (!submission) return;

    const exam = INITIAL_DATA.examinations.find(e => e.id === submission.examId);
    if (!exam) return;

    document.getElementById('eval-exam-title').textContent = `${exam.code}: ${exam.title}`;
    document.getElementById('eval-student-meta').textContent = `${submission.studentName} (${submission.studentRoll}) - ${submission.department}`;
    document.getElementById('eval-submission-id').value = submissionId;

    const formContainer = document.getElementById('eval-questions-form');
    formContainer.innerHTML = '';

    const descriptiveQuestions = exam.questions.filter(q => q.type === 'descriptive');

    if (descriptiveQuestions.length === 0) {
      formContainer.innerHTML = '<p>This examination contains only objective questions and was auto-evaluated.</p>';
    } else {
      descriptiveQuestions.forEach((q, idx) => {
        const studentAns = submission.answers[q.id] || '';
        const prevFeedback = (submission.evaluation && submission.evaluation.feedback && submission.evaluation.feedback[q.id]) || {};

        const qFieldset = document.createElement('fieldset');
        qFieldset.style.marginBottom = '16px';

        qFieldset.innerHTML = `
          <legend><b>Descriptive Question ${idx + 1} &bull; Max Marks: ${q.marks}</b></legend>
          <p><b>Question:</b> ${escapeHtml(q.question)}</p>
          
          <p><b>Student's Submitted Answer:</b></p>
          <pre>${escapeHtml(studentAns || '[Candidate left this answer blank]')}</pre>

          <details style="margin-bottom:10px;">
            <summary><b>Model Answer Key &amp; Rubric</b></summary>
            <pre>${escapeHtml(q.modelAnswerKey || q.rubric)}</pre>
          </details>

          <table border="1" cellpadding="6" cellspacing="0" width="100%">
            <tr>
              <td width="30%">
                <label for="eval_marks_${q.id}"><b>Award Marks (0 to ${q.marks}):</b></label><br>
                <input 
                  type="number" 
                  id="eval_marks_${q.id}" 
                  min="0" 
                  max="${q.marks}" 
                  step="0.5" 
                  value="${prevFeedback.marks !== undefined ? prevFeedback.marks : ''}" 
                  required
                >
              </td>
              <td width="70%">
                <label for="eval_feedback_${q.id}"><b>Examiner Comments / Feedback:</b></label><br>
                <input 
                  type="text" 
                  id="eval_feedback_${q.id}" 
                  size="60" 
                  placeholder="Feedback on candidate's response..." 
                  value="${escapeHtml(prevFeedback.comments || '')}"
                >
              </td>
            </tr>
          </table>
        `;

        formContainer.appendChild(qFieldset);
      });
    }

    document.getElementById('eval-general-remarks').value = (submission.evaluation && submission.evaluation.generalRemarks) || '';

    navigateView('examiner-evaluate-view');
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
    const exam = INITIAL_DATA.examinations.find(e => e.id === sub.examId);
    if (!exam) return;

    let descriptiveTotal = 0;
    const feedbackMap = {};

    const descriptiveQuestions = exam.questions.filter(q => q.type === 'descriptive');

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
      evaluatedBy: state.currentUser.name,
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
    navigateView('examiner-dashboard');
  }

  /* -------------------------------------------------------------
   * 15. Offline Detection & Simulated Connection Resilience
   * ----------------------------------------------------------- */
  function setupNetworkListeners() {
    window.addEventListener('online', () => {
      if (!state.isOfflineSimulated) {
        handleNetworkOnline();
      }
    });

    window.addEventListener('offline', () => {
      handleNetworkOffline();
    });
  }

  function handleNetworkOffline() {
    showNotificationBanner('⚠️ Network Disconnected: You are currently offline. All your answers are safely stored locally. You can continue answering.', 'offline');
    updateAutoSaveStatusUI();
  }

  function handleNetworkOnline() {
    showNotificationBanner('🟢 Internet Connection Restored! System synchronized with latest saved answers.', 'online');
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

    textEl.innerHTML = type === 'offline' 
      ? `<font color="red">${escapeHtml(message)}</font>` 
      : `<font color="green">${escapeHtml(message)}</font>`;
    banner.hidden = false;

    if (type === 'online') {
      setTimeout(() => {
        banner.hidden = true;
      }, 5000);
    }
  }

  /* -------------------------------------------------------------
   * 16. Utility Helpers
   * ----------------------------------------------------------- */
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
   * 17. Application Expose & Initialization
   * ----------------------------------------------------------- */
  window.app = {
    handleLogin,
    handleLogout,
    fillDemoCredentials,
    navigateView,
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
    openReviewModal,
    closeReviewModal,
    closeReviewModalAndJump,
    submitExam,
    viewExamResult,
    renderExaminerDashboard,
    openExaminerEvaluation,
    handleSaveAndPublishEvaluation,
    toggleSimulateOffline
  };

  document.addEventListener('DOMContentLoaded', () => {
    initializeSubmissions();
    setupNetworkListeners();
    checkExistingSession();
  });
})();
