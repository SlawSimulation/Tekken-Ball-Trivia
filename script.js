let player = {
  name: '',
  main: ''
};

let currentQuestion = 0;
let score = 0;
let questions = [];
let answers = [];

document.addEventListener("DOMContentLoaded", async () => {
  await promptPlayerInfo();
  await loadQuestions();
  displayQuestion();
});

async function promptPlayerInfo() {
  player.name = prompt("Enter your Player Name (e.g., DQ | SlawPro):");
  player.main = prompt("Enter your Main Character(s):");
}

async function loadQuestions() {
  const response = await fetch('trivia.json');
  const allQuestions = await response.json();

  // Shuffle and get 20
  questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
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

  const choices = shuffleArray([q.correct_answer, ...q.incorrect_answers]);
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.onclick = () => selectAnswer(choice, q);
    answersDiv.appendChild(btn);
  });
}

function selectAnswer(selected, questionObj) {
  const isCorrect = selected === questionObj.correct_answer;

  answers.push({
    question: questionObj.question,
    selected: selected,
    correct: questionObj.correct_answer,
    timestamp: new Date().toISOString()
  });

  if (isCorrect) {
    score++;
    if (questionObj.question.toLowerCase().includes('tekken')) {
      document.getElementById('secret-msg').style.display = 'block';
    }
  }

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
