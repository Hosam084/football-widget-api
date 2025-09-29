const fetch = require('node-fetch');

// رابط Google Sheet
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT82iOdGJcS7-3Osrsuh2WTO8tc6NWn5EWw0qLNsiy2F7-g5xrz-E5MUwKIWMlOxSLHh2OEFEme3zef/pub?gid=2101882513&single=true&output=tsv';

exports.handler = async function (event, context) {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const tsv = await response.text();

    const rows = tsv.trim().split("\n").slice(1);
    const matches = rows.map(r => {
      const cells = r.split("\t");
      return {
        matchId: cells[0],
        date: cells[1],
        league: cells[2],
        homeTeam: cells[3],
        awayTeam: cells[4],
        homeLogo: cells[5],
        awayLogo: cells[6],
        scoreHome: cells[7],
        scoreAway: cells[8],
        status: cells[9]
      };
    }).filter(m => m.matchId);

    return {
      statusCode: 200,
      headers: {
        "Cache-Control": "public, max-age=300, must-revalidate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ matches: matches })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load data." })
    };
  }
};
