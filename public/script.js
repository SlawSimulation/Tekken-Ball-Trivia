const trivia = [
  {
    question: "Who was the final boss in Tekken Ball Mode?",
    options: ["Heihachi", "Ogre", "Gon", "Devil"],
    answer: "Gon",
    secretTrigger: true
  },
  {
    question: "Which Tekken game first featured Tekken Ball?",
    options: ["Tekken 2", "Tekken 3", "Tekken Tag", "Tekken 5"],
    answer: "Tekken 3"
  }
];

let current = 0;

function loadQuestion() {
  const q = trivia[current];
  document.getElementById('question').innerText = q.question;
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.onclick = () => {
      if (opt === q.answer) {
        if (q.secretTrigger) {
          document.getElementById('secret-msg').style.display = 'block';
        }
        nextQuestion();
      } else {
        alert("Try again!");
      }
    };
    answersDiv.appendChild(btn);
  });
}

function nextQuestion() {
  current++;
  if (current < trivia.length) {
    loadQuestion();
  } else {
    document.getElementById('question').innerText = "🎉 You've completed the trivia!";
    document.getElementById('answers').innerHTML = '';
  }
}

window.onload = loadQuestion;
