const questionElem = document.getElementById('question');
const answersElem = document.getElementById('answers');
const secretMsg = document.getElementById('secret-msg');
const triviaContainer = document.getElementById('trivia-container');

let questions = [];
let currentIndex = 0;

async function loadQuestions() {
  const res = await fetch('trivia.json');
  questions = await res.json();
  currentIndex = 0;
  showQuestion(currentIndex);
}

function showQuestion(index) {
  if (!questions[index]) return;

  const q = questions[index];
  questionElem.textContent = q.question;

  answersElem.innerHTML = '';
  secretMsg.style.display = 'none';

  q.answers.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.textContent = answer;
    btn.onclick = () => checkAnswer(i);
    answersElem.appendChild(btn);
  });

  addNavigationButtons();
}

function checkAnswer(selectedIndex) {
  const correctIndex = questions[currentIndex].answer;
  if (selectedIndex === correctIndex) {
    secretMsg.style.display = 'block';
    secretMsg.textContent = '🎉 Correct! Secret Tekken Knowledge Unlocked! 🎉';
  } else {
    secretMsg.style.display = 'block';
    secretMsg.textContent = '❌ Incorrect! Try again or move on.';
  }
}

function addNavigationButtons() {
  const existingNav = document.getElementById('nav-buttons');
  if (existingNav) existingNav.remove();

  const navDiv = document.createElement('div');
  navDiv.id = 'nav-buttons';
  navDiv.style.marginTop = '1rem';
  navDiv.style.display = 'flex';
  navDiv.style.justifyContent = 'center';
  navDiv.style.gap = '1rem';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '⬅️ Previous';
  prevBtn.disabled = currentIndex === 0;
  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      showQuestion(currentIndex);
    }
  };
  navDiv.appendChild(prevBtn);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ➡️';
  nextBtn.disabled = currentIndex === questions.length - 1;
  nextBtn.onclick = () => {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      showQuestion(currentIndex);
    }
  };
  navDiv.appendChild(nextBtn);

  triviaContainer.appendChild(navDiv);
}

loadQuestions();
