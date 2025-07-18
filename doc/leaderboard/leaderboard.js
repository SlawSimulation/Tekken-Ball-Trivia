async function loadCSVFilesManifest() {
  const res = await fetch('../results/results-index.json');
  if (!res.ok) throw new Error('Could not load CSV manifest');
  const data = await res.json();
  return data.csvFiles; // Array of file paths with 'doc/results/...' prefix
}

async function loadCSV(url) {
  // Strip 'doc/' prefix because GitHub Pages serves from root
  const path = url.replace(/^doc\//, '');
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return await res.text();
}

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines.shift().split(',').map(h => h.replace(/^"|"$/g, ''));
  return lines.map(line => {
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i].replace(/^"|"$/g, '');
      return obj;
    }, {});
  });
}

async function buildLeaderboard() {
  try {
    const csvFiles = await loadCSVFilesManifest();
    const leaderboardData = {};

    for (const file of csvFiles) {
      const csvText = await loadCSV(file);
      const rows = parseCSV(csvText);

      rows.forEach(row => {
        const player = row.Player;
        const main = row.Main;
        const correct = row['Correct?'] === 'Yes' ? 1 : 0;
        const timestamp = row.Timestamp;

        if (!leaderboardData[player]) {
          leaderboardData[player] = { main, totalCorrect: 0, lastPlayed: '' };
        }
        leaderboardData[player].totalCorrect += correct;

        if (!leaderboardData[player].lastPlayed || leaderboardData[player].lastPlayed < timestamp) {
          leaderboardData[player].lastPlayed = timestamp;
        }
      });
    }

    renderLeaderboard(leaderboardData);
  } catch (error) {
    console.error(error);
    document.querySelector('p').textContent = 'Failed to load leaderboard.';
  }
}

function renderLeaderboard(data) {
  const sortedPlayers = Object.entries(data)
    .map(([player, info]) => ({ player, ...info }))
    .sort((a, b) => b.totalCorrect - a.totalCorrect);

  const tbody = document.querySelector('#leaderboard tbody');
  tbody.innerHTML = '';

  sortedPlayers.forEach(({ player, main, totalCorrect, lastPlayed }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${player}</td>
      <td>${main}</td>
      <td>${totalCorrect}</td>
      <td>${new Date(lastPlayed).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelector('p').style.display = 'none';
  document.getElementById('leaderboard').style.display = 'table';
}

// Run on page load
buildLeaderboard();
