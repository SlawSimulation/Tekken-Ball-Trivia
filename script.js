let player = {
  name: '',
  main: ''
};

let currentQuestion = 0;
let score = 0;
let questions = [];
let answers = [];

let questionStartTime = 0;
let quizStartTime = 0;

const questionTimeLimit = 15; // seconds
let timerInterval;

document.getElementById('player-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  player.name = document.getElementById('player-name').value.trim();
  player.main = document.getElementById('player-main').value.trim();

  if (!player.name || !player.main) {
    alert('Please enter your name and main character.');
    return;
  }

  document.getElementById('player-form').style.display = 'none';
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

  // Shuffle all questions and pick 20
  questions = shuffleArray(allQuestions).slice(0, 20);
  currentQuestion = 0;
  score = 0;
  answers = [];
}

function displayQuestion() {
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  resetTimer();

  questionStartTime = Date.now();

  const q = questions[currentQuestion];
  document.getElementById('question').textContent = `Q${currentQuestion + 1}: ${q.question}`;

  // Update progress bar width
  const progressPercent = (currentQuestion / questions.length) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  const correctIndex = q.answer;
  const correctAnswer = q.answers[correctIndex];
  const wrongAnswers = q.answers.filter((_, i) => i !== correctIndex);
  const choices = shuffleArray([correctAnswer, ...wrongAnswers]);

  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.onclick = () => selectAnswer(choice, correctAnswer, q);
    answersDiv.appendChild(btn);
  });

  startTimer();
}

function selectAnswer(selected, correctAnswer, questionObj) {
  stopTimer();

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

function endQuiz() {
  stopTimer();

  const totalTime = (Date.now() - quizStartTime) / 1000; // seconds

  // Fill progress bar to 100%
  document.getElementById('progress-bar').style.width = `100%`;

  document.getElementById('trivia-container').style.display = 'none';
  const finishDiv = document.getElementById('finish-msg');
  finishDiv.style.display = 'block';
  finishDiv.innerHTML = `
    <h2>🎮 Game Over!</h2>
    <p>${player.name} | Main: ${player.main}</p>
    <p>Your final score: ${score}/${questions.length}</p>
    <p>Total quiz time: ${totalTime.toFixed(2)} seconds</p>
    <button onclick="downloadCSV()">Download Results CSV</button>
  `;
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

// Timer code
function startTimer() {
  let timeLeft = questionTimeLimit;
  const timeLeftSpan = document.getElementById('time-left');
  timeLeftSpan.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timeLeftSpan.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      selectAnswer('', questions[currentQuestion], questions[currentQuestion]); // no answer chosen
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  stopTimer();
  document.getElementById('time-left').textContent = questionTimeLimit;
}

function shuffleArray(arr) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
