function fetchTrivia() {
  fetch('trivia.json')
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        loadQuestion(data[0]); // Load the first trivia question
      } else {
        showError("No trivia found.");
      }
    })
    .catch(err => {
      console.error("Error loading trivia:", err);
      showError("Failed to load trivia.");
    });
}

function loadQuestion(qData) {
  const correct = qData.answer.trim();
  const question = qData.question;

  document.getElementById('question').innerText = question;
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  // Generate fake answers + correct one
  const options = shuffle([
    correct,
    "Kazuya", "Nina", "Gon", "Yoshimitsu", "Heihachi"
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4));

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, correct);
    answersDiv.appendChild(btn);
  });
}

function handleAnswer(selected, correct) {
  if (selected === correct) {
    if (selected.toLowerCase() === 'gon') {
      document.getElementById('secret-msg').style.display = 'block';
    }
    alert("✅ Correct!");
    fetchTrivia(); // Load next question
  } else {
    alert("❌ Wrong! Try again.");
  }
}

function showError(message) {
  document.getElementById('question').innerText = message;
  document.getElementById('answers').innerHTML = '';
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

window.onload = fetchTrivia;
