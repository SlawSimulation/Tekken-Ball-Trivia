async function loadLeaderboard() {
  try {
    // Fetch the results-index.json (relative path from leaderboard.html)
    const indexResponse = await fetch('../results/results-index.json');
    const indexData = await indexResponse.json();

    const leaderboardTableBody = document.getElementById('leaderboard-body');
    leaderboardTableBody.innerHTML = '';

    for (const csvFile of indexData.csvFiles) {
      // Prepend '../' because leaderboard.html is inside 'doc/leaderboard/'
      const csvPath = `../${csvFile}`;

      const response = await fetch(csvPath);
      if (!response.ok) {
        console.warn(`Failed to load CSV file: ${csvPath}`);
        continue; // skip missing files
      }
      const text = await response.text();

      // Parse CSV, skipping header row
      const lines = text.trim().split('\n');
      for (let i = 1; i < lines.length; i++) {
        const [player, main, questionNumber, question, selected, correct, correctBool, answerTime, timestamp] = parseCSVLine(lines[i]);

        // You can customize what you want to show in leaderboard — 
        // here we show player, main, score (count correct answers), time, date
        // Assuming each CSV is one quiz session, score and time are same for all rows,
        // so you may want to aggregate or just display individual rows.

        // For simplicity, show one row per CSV with aggregated data (you can adapt as needed)
        // Or show individual answers per row (less common for leaderboard).

        // Example: Just append each answer row:
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${player}</td>
          <td>${main}</td>
          <td>${correctBool === 'Yes' ? 1 : 0}</td>
          <td>${answerTime}</td>
          <td>${new Date(timestamp).toLocaleString()}</td>
        `;
        leaderboardTableBody.appendChild(tr);
      }
    }
  } catch (err) {
    console.error('Error loading leaderboard:', err);
  }
}

// Simple CSV parser (handles commas inside quotes, etc.)
function parseCSVLine(line) {
  const regex = /(?:,|\n|^)(?:"([^"]*(?:""[^"]*)*)"|([^",\n]*))/g;
  const fields = [];
  line.replace(regex, (m0, m1, m2) => {
    if (m1 !== undefined) {
      fields.push(m1.replace(/""/g, '"'));
    } else {
      fields.push(m2);
    }
    return '';
  });
  return fields;
}

document.addEventListener('DOMContentLoaded', () => {
  loadLeaderboard();
});
