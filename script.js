let currentQuestion = 0;
let questions = [];

async function loadTrivia() {
  try {
    const res = await fetch('trivia.json'); // or 'tekkenball-trivia.json'
    const data = await res.json();
    questions = shuffleArray(data).slice(0, 20); // randomize and pick 20
    showQuestion();
    createNavButtons();
  } catch (error) {
    document.getElementById('question').innerText = 'Failed to load questions.';
    console.error(error);
  }
}

function shuffleArray(arr) {
  return arr
    .map((q) => ({ sort: Math.random(), value: q }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
}

function showQuestion() {
  const questionEl = document.getElementById('question');
  const answersEl = document.getElementById('answers');
  const secretMsg = document.getElementById('secret-msg');
  const q = questions[currentQuestion];

  questionEl.innerText = `Q${currentQuestion + 1}: ${q.question}`;
  answersEl.innerHTML = '';
  secretMsg.style.display = 'none';
  secretMsg.innerText = '';

  q.answers.forEach((ans, index) => {
    const btn = document.createElement('button');
    btn.textContent = ans;
    btn.onclick = () => {
      const correct = index === q.answer;
      if (correct) {
        btn.classList.add('correct');
        secretMsg.innerText = '🎉 Secret Tekken Knowledge Unlocked! 🎉';
        secretMsg.style.display = 'block';
      } else {
        btn.classList.add('wrong');
        secretMsg.innerText = '❌ Try again, Tekken Warrior!';
        secretMsg.style.display = 'block';
      }
      disableAnswers();
    };
    answersEl.appendChild(btn);
  });

  updateNavButtons();
}

function disableAnswers() {
  const buttons = document.querySelectorAll('#answers button');
  buttons.forEach((btn) => (btn.disabled = true));
}

function createNavButtons() {
  const nav = document.createElement('div');
  nav.id = 'nav-buttons';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '⬅ Previous';
  prevBtn.onclick = () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion();
    }
  };

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ➡';
  nextBtn.onclick = () => {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    } else {
      endGame();
    }
  };

  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);
  document.getElementById('trivia-container').appendChild(nav);
}

function updateNavButtons() {
  const nav = document.getElementById('nav-buttons');
  if (!nav) return;
  const [prevBtn, nextBtn] = nav.querySelectorAll('button');
  prevBtn.disabled = currentQuestion === 0;
  nextBtn.textContent = currentQuestion < questions.length - 1 ? 'Next ➡' : '🎮 Restart';
  nextBtn.onclick = () => {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    } else {
      location.reload(); // restart
    }
  };
}

function endGame() {
  document.getElementById('question').innerText = "🏆 You've mastered Tekken Ball Trivia!";
  document.getElementById('answers').innerHTML = '';
  document.getElementById('secret-msg').innerText = "Thanks for playing!";
}

loadTrivia();
