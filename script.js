let player = { name: '', main: '' };
let currentQuestion = 0;
let score = 0;
let questions = [];
let answers = [];
let questionStartTime = 0;
let quizStartTime = 0;

document.getElementById('player-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  player.name = document.getElementById('player-name').value.trim();
  player.main = document.getElementById('player-main').value.trim();

  if (!player.name || !player.main) {
    alert('Please enter your name and main character.');
    return;
  }

  document.getElementById('player-form-container').style.display = 'none';
  document.getElementById('trivia-container').style.display = 'block';

  quizStartTime = Date.now();

  try {
    await loadQuestions();
    displayQuestion();
  } catch (error) {
    alert('Failed to load questions, please try again later.');
    console.error(error);
  }
});

async function loadQuestions() {
  const response = await fetch('trivia.json');
  if (!response.ok) throw new Error('Could not load trivia.json');
  const allQuestions = await response.json();

  // Shuffle and take first 20 questions
  questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
  currentQuestion = 0;
  score = 0;
  answers = [];
}

function displayQuestion() {
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  questionStartTime = Date.now();

  const q = questions[currentQuestion];
  document.getElementById('question').textContent = `Q${currentQuestion + 1}: ${q.question}`;

  // Update progress bar width
  const progressPercent = (currentQuestion / questions.length) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  try {
    const correctIndex = q.answer;
    const correctAnswer = q.answers[correctIndex];
    // Shuffle all answers so correct isn't always first
    const choices = shuffleArray(q.answers);

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice;
      btn.onclick = () => selectAnswer(choice, correctAnswer, q);
      answersDiv.appendChild(btn);
    });
  } catch (err) {
    console.error('Error displaying question:', err);
    alert('Error displaying question, please reload.');
  }
}

function selectAnswer(selected, correctAnswer, questionObj) {
  const answerTime = (Date.now() - questionStartTime) / 1000; // seconds
  const isCorrect = selected === correctAnswer;

  answers.push({
    questionNumber: currentQuestion + 1,
    question: questionObj.question,
    selected,
    correct: correctAnswer,
    correctBool: isCorrect ? 'Yes' : 'No',
    answerTime,
    timestamp: new Date().toISOString()
  });

  if (isCorrect && questionObj.question.toLowerCase().includes('tekken')) {
    const secretMsg = document.getElementById('secret-msg');
    secretMsg.style.display = 'block';
    setTimeout(() => (secretMsg.style.display = 'none'), 2000);
  }

  if (isCorrect) score++;

  currentQuestion++;
  displayQuestion();
}

async function endQuiz() {
  const totalTime = (Date.now() - quizStartTime) / 1000; // seconds

  document.getElementById('trivia-container').style.display = 'none';

  const endContainer = document.getElementById('end-container');
  document.getElementById('final-score').textContent = `${player.name} | Main: ${player.main} | Score: ${score}/${questions.length}`;
  document.getElementById('total-time').textContent = `Total quiz time: ${totalTime.toFixed(2)} seconds`;

  endContainer.style.display = 'block';

  // Bind buttons
  document.getElementById('btn-download-csv').onclick = downloadCSV;
  document.getElementById('btn-restart-quiz').onclick = restartQuiz;
  document.getElementById('btn-go-leaderboard-end').onclick = goLeaderboard;

  // Upload results to Google Sheets
  const uploadData = {
    player: player.name,
    main: player.main,
    score,
    totalTime: totalTime.toFixed(2),
    answers
  };

  await uploadResultsToGoogleSheet(uploadData);
}

function downloadCSV() {
  const csvRows = [
    ['Player', 'Main', 'Question Number', 'Question', 'Selected Answer', 'Correct Answer', 'Correct?', 'Answer Time (s)', 'Timestamp'],
    ...answers.map(ans => [
      player.name,
      player.main,
      ans.questionNumber,
      ans.question,
      ans.selected,
      ans.correct,
      ans.correctBool,
      ans.answerTime.toFixed(2),
      ans.timestamp
    ])
  ];

  const csv = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const filename = `trivia_results_${Date.now()}.csv`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function restartQuiz() {
  document.getElementById('end-container').style.display = 'none';
  document.getElementById('player-form-container').style.display = 'block';
  // Clear inputs
  document.getElementById('player-name').value = '';
  document.getElementById('player-main').value = '';
}

function goLeaderboard() {
  window.location.href = 'doc/leaderboard/leaderboard.html';
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Upload to Google Sheets Web App
async function uploadResultsToGoogleSheet(data) {
  const url = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL'; // Replace this with your actual Google Apps Script Web App URL

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',  // Google Apps Script doesn't send CORS headers
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    // No response body expected in no-cors mode; assume success
  } catch (err) {
    console.error('Failed to upload results:', err);
  }
}
