async function loadLeaderboard() {
  try {
    const indexResponse = await fetch('../results/results-index.json');
    if (!indexResponse.ok) throw new Error('Could not load results-index.json');
    const indexData = await indexResponse.json();

    const allResults = [];

    for (const csvPath of indexData.csvFiles) {
      try {
        const csvResponse = await fetch(csvPath);
        if (!csvResponse.ok) continue;
        const csvText = await csvResponse.text();
        const rows = csvText.trim().split('\n');
        const headers = rows[0].split(',');

        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',');
          const result = {};
          headers.forEach((header, idx) => {
            result[header.replace(/"/g, '')] = cols[idx].replace(/"/g, '');
          });
          allResults.push(result);
        }
      } catch {
        // ignore CSV loading errors
      }
    }

    // Sort by Score desc, then Time asc, then Date desc
    allResults.sort((a, b) => {
      const scoreDiff = parseInt(b.Score) - parseInt(a.Score);
      if (scoreDiff !== 0) return scoreDiff;
      const timeDiff = parseFloat(a['Time (s)']) - parseFloat(b['Time (s)']);
      if (timeDiff !== 0) return timeDiff;
      return new Date(b.Date) - new Date(a.Date);
    });

    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    allResults.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.Player}</td>
        <td>${row.Main}</td>
        <td>${row.Score}</td>
        <td>${row['Time (s)']}</td>
        <td>${row.Date}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading leaderboard:', err);
  }
}

function goBack() {
  window.history.back();
}

loadLeaderboard();
