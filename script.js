let player = {
  name: '',
  main: ''
};

let currentQuestion = 0;
let score = 0;
let questions = [];
let answers = [];

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
  currentQuestion = 0; // reset counter
  score = 0;
  answers = [];
}

function displayQuestion() {
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  const q = questions[currentQuestion];
  document.getElementById('question').textContent = `Q${currentQuestion + 1}: ${q.question}`;

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
  const isCorrect = selected === correctAnswer;

  answers.push({
    question: questionObj.question,
    selected,
    correct: correctAnswer,
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
  document.getElementById('trivia-container').innerHTML = `
    <h2>🎮 Game Over!</h2>
    <p>${player.name} | Main: ${player.main}</p>
    <p>Your final score: ${score}/${questions.length}</p>
    <button onclick="downloadCSV()">Download Results CSV</button>
  `;
}

function downloadCSV() {
  const csvRows = [
    ['Player', 'Main', 'Question', 'Selected', 'Correct', 'Timestamp'],
    ...answers.map(ans => [
      player.name,
      player.main,
      ans.question,
      ans.selected,
      ans.correct,
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

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
