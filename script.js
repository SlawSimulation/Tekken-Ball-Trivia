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

  const progressPercent = (currentQuestion / questions.length) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  try {
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

function endQuiz() {
  const totalTime = (Date.now() - quizStartTime) / 1000; // seconds

  document.getElementById('trivia-container').style.display = 'none';

  const endContainer = document.getElementById('end-container');
  document.getElementById('final-score').textContent = `${player.name} | Main: ${player.main} | Score: ${score}/${questions.length}`;
  document.getElementById('total-time').textContent = `Total quiz time: ${totalTime.toFixed(2)} seconds`;

  endContainer.style.display = 'block';

  // Prepare CSV content
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

  // Create downloadable CSV link
  const blob = new Blob([csv], { type: 'text/csv' });
  const filename = `trivia_results_${Date.now()}.csv`;
  const downloadLink = document.getElementById('btn-download-csv');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;

  // Automatically create upload-file.txt trigger for GitHub Action
  createUploadTrigger(filename, csv);

  // Bind buttons
  document.getElementById('btn-restart-quiz').onclick = restartQuiz;
  document.getElementById('btn-go-leaderboard-end').onclick = goLeaderboard;
}

function createUploadTrigger(filename, csvContent) {
  // Base64 encode CSV content to safely store in upload-file.txt
  const encodedCsv = btoa(unescape(encodeURIComponent(csvContent)));
  const triggerText = `FILENAME=${filename}\nCONTENT=${encodedCsv}`;

  const blob = new Blob([triggerText], { type: 'text/plain' });
  const triggerLink = document.getElementById('upload-trigger-link');

  triggerLink.href = URL.createObjectURL(blob);
  triggerLink.download = 'upload-file.txt';
  triggerLink.style.display = 'inline-block';

  // Optional: alert user to upload this file manually or drag/drop to GitHub
  alert('Your upload trigger file is ready! Please commit the generated "upload-file.txt" to the repository to have your results uploaded automatically.');
}

function downloadCSV() {
  document.getElementById('btn-download-csv').click();
}

function restartQuiz() {
  document.getElementById('end-container').style.display = 'none';
  document.getElementById('player-form-container').style.display = 'block';
  document.getElementById('player-name').value = '';
  document.getElementById('player-main').value = '';
}

function goLeaderboard() {
  window.location.href = 'doc/leaderboard/leaderboard.html';
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
