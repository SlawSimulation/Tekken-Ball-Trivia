async function loadLeaderboard() {
  const tableBody = document.getElementById("leaderboard-body");
  if (!tableBody) {
    console.error("Leaderboard table body not found");
    return;
  }

  try {
    const indexResponse = await fetch("../results/results-index.json");
    if (!indexResponse.ok) {
      throw new Error("Failed to load results index");
    }

    const indexData = await indexResponse.json();
    const allResults = [];

    for (const csvPath of indexData.csvFiles) {
      try {
        const csvResponse = await fetch(`../${csvPath}`);
        if (!csvResponse.ok) {
          console.warn(`Skipped ${csvPath} (status ${csvResponse.status})`);
          continue;
        }

        const csvText = await csvResponse.text();
        const rows = csvText.trim().split('\n');
        if (rows.length < 2) continue;

        const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());

        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',').map(c => c.replace(/"/g, '').trim());
          if (cols.length !== headers.length) continue;

          const result = {};
          headers.forEach((header, idx) => {
            result[header] = cols[idx];
          });

          allResults.push(result);
        }
      } catch (err) {
        console.warn(`Error parsing ${csvPath}:`, err);
        continue;
      }
    }

    // Sort by Score descending, then by Time ascending
    allResults.sort((a, b) => {
      const scoreDiff = (parseInt(b.Score) || 0) - (parseInt(a.Score) || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (parseFloat(a["Time (s)"]) || 9999) - (parseFloat(b["Time (s)"]) || 9999);
    });

    // Populate leaderboard
    tableBody.innerHTML = "";
    allResults.forEach(result => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${result["Player"] || "-"}</td>
        <td>${result["Main"] || "-"}</td>
        <td>${result["Score"] || "-"}</td>
        <td>${result["Time (s)"] || "-"}</td>
        <td>${result["Date"] || "-"}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading leaderboard:", error);
    tableBody.innerHTML = `<tr><td colspan="5">Failed to load leaderboard.</td></tr>`;
  }
}

// Define goBack() so leaderboard.html doesn't throw error
function goBack() {
  window.location.href = "../index.html";
}

window.onload = loadLeaderboard;
