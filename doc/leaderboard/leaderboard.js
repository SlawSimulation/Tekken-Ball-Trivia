async function loadLeaderboard() {
  const container = document.getElementById('leaderboard-container');
  container.textContent = 'Loading leaderboard...';

  try {
    const indexResp = await fetch('../results/results-index.json');
    if (!indexResp.ok) throw new Error('Could not load results index');
    const indexData = await indexResp.json();

    const csvFiles = indexData.csvFiles;
    if (!csvFiles.length) {
      container.textContent = 'No results found.';
      return;
    }

    const allResults = [];

    for (const filePath of csvFiles) {
      try {
        const csvResp = await fetch(filePath);
        if (!csvResp.ok) continue;
        const csvText = await csvResp.text();
        const rows = csvText.trim().split('\n').slice(1); // skip header

        let correctCount = 0;
        let totalTime = 0;
        let playerName = '';
        let playerMain = '';
        let date = '';

        rows.forEach(row => {
          const cols = parseCSVRow(row);
          playerName = cols[0];
          playerMain = cols[1];
          if (cols[6] === 'Yes') correctCount++;
          totalTime += parseFloat(cols[7]) || 0;
          date = cols[8]; // use last row's timestamp as session date
        });

        allResults.push({
          player: playerName,
          main: playerMain,
          score: correctCount,
          time: totalTime.toFixed(2),
          date: new Date(date)
        });

      } catch {
        continue;
      }
    }

    allResults.sort((a, b) => {
      if (b.score === a.score) return a.time - b.time;
      return b.score - a.score;
    });

    let html = `<table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Main</th>
          <th>Score</th>
          <th>Time (s)</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>`;

    allResults.forEach((r, i) => {
      html += `<tr>
        <td>${i + 1}</td>
        <td>${escapeHTML(r.player)}</td>
        <td>${escapeHTML(r.main)}</td>
        <td>${r.score}</td>
        <td>${r.time}</td>
        <td>${r.date.toLocaleString()}</td>
      </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

  } catch (err) {
    container.textContent = 'Failed to load leaderboard.';
    console.error(err);
  }
}

function parseCSVRow(row) {
  const re = /("([^"]|"")*"|[^,]*)(,|$)/g;
  const cols = [];
  let match;
  while ((match = re.exec(row)) !== null) {
    let val = match[1];
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1).replace(/""/g, '"');
    }
    cols.push(val);
    if (match[3] === '') break;
  }
  return cols;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function goBack() {
  window.location.href = '../../index.html';
}

loadLeaderboard();
