let questions = [];
let currentIndex = 0;
let playerName = "";
let mainCharacter = "";
let responses = [];

document.getElementById("start-btn").addEventListener("click", () => {
  playerName = document.getElementById("player-name").value.trim();
  mainCharacter = document.getElementById("main-character").value.trim();

  if (!playerName || !mainCharacter) {
    alert("Please enter your name and main.");
    return;
  }

  document.getElementById("player-info").style.display = "none";
  document.getElementById("trivia-container").style.display = "block";

  loadQuestions();
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function loadQuestions() {
  const res = await fetch("trivia.json");
  questions = await res.json();
  shuffleArray(questions);
  showQuestion();
}

function showQuestion() {
  if (currentIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const question = questions[currentIndex];
  document.getElementById("question").innerText = question.question;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  question.answers.forEach((ans, idx) => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.onclick = () => {
      const correct = idx === question.answer;
      if (correct && Math.random() > 0.5) {
        document.getElementById("secret-msg").style.display = "block";
        setTimeout(() => {
          document.getElementById("secret-msg").style.display = "none";
        }, 2000);
      }

      const timestamp = new Date().toISOString();
      responses.push({
        player: playerName,
        main: mainCharacter,
        question: question.question,
        selected: ans,
        correct: question.answers[question.answer],
        timestamp
      });

      currentIndex++;
      showQuestion();
    };
    answersDiv.appendChild(btn);
  });
}

function finishQuiz() {
  alert("Trivia completed! Submitting your answers...");

  fetch("https://api.github.com/repos/SlawSimulation/Tekken-Ball-Trivia/contents/submissions/" + playerName.replace(/\W+/g, "_") + "_" + Date.now() + ".csv", {
    method: "PUT",
    headers: {
      Authorization: "Bearer YOUR_GITHUB_PAT", // stored in Actions, not exposed
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Add trivia submission",
      content: btoa(generateCSV(responses)),
      branch: "main"
    })
  });
}

function generateCSV(data) {
  const headers = ["Player", "Main", "Question", "Selected", "Correct", "Timestamp"];
  const rows = data.map(d => [d.player, d.main, d.question, d.selected, d.correct, d.timestamp]);
  return [headers, ...rows].map(row => row.join(",")).join("\n");
}
