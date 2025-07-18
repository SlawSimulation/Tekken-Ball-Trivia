async function loadLeaderboard() {
  const response = await fetch('../results/results-index.json');
  const data = await response.json();
  const leaderboardDiv = document.getElementById('leaderboard');
  let allResults = [];

  for (const file of data.csvFiles) {
    const res = await fetch(`../results/${file}`);
    const text = await res.text();
    const rows = text.trim().split('\n').slice(1); // skip header

    rows.forEach(row => {
      const [timestamp, playerName, character, score] = row.split(',');
      allResults.push({ timestamp, playerName, character, score: parseInt(score) });
    });
  }

  allResults.sort((a, b) => b.score - a.score);

  leaderboardDiv.innerHTML = allResults.map((entry, index) => `
    <div class="entry">
      <span class="rank">#${index + 1}</span>
      <span class="name">${entry.playerName}</span>
      <span class="char">${entry.character}</span>
      <span class="score">${entry.score}</span>
    </div>
  `).join('');
}

window.onload = loadLeaderboard;
