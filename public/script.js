const API_KEY = 'YOUR_API_KEY_HERE';
const endpoint = 'https://api.api-ninjas.com/v1/trivia';

function fetchTrivia() {
  fetch(endpoint, {
    headers: {
      'X-Api-Key': API_KEY
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data && data[0]) {
        loadQuestion(data[0]);
      }
    })
    .catch(err => {
      console.error('Error fetching trivia:', err);
      document.getElementById('question').innerText = 'Failed to load question.';
    });
}

function loadQuestion(qData) {
  const correct = qData.answer.trim();
  const q = qData.question;

  document.getElementById('question').innerText = q;
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  // Shuffle answers: include correct one + 3 random distractors
  const options = shuffle([correct, "Kazuya", "Nina", "Gon", "Yoshimitsu"].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4));

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.onclick = () => {
      if (opt === correct) {
        if (opt === 'Gon') { // SECRET TRIGGER
          document.getElementById('secret-msg').style.display = 'block';
        }
        fetchTrivia();
      } else {
        alert("Try again!");
      }
    };
    answersDiv.appendChild(btn);
  });
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

window.onload = fetchTrivia;
