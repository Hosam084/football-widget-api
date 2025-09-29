// build-data.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// رابط Google Sheet الأصلي
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT82iOdGJcS7-3Osrsuh2WTO8tc6NWn5EWw0qLNsiy2F7-g5xrz-E5MUwKIWMlOxSLHh2OEFEme3zef/pub?gid=2101882513&single=true&output=tsv";

async function buildMatchData() {
  try {
    console.log("Starting data fetch from Google Sheets...");
    const res = await fetch(sheetUrl);

    if (!res.ok) {
      throw new Error("Failed to fetch data from Google Sheets.");
    }

    const tsv = await res.text();
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

    // ********* الخطوة الحاسمة: حفظ البيانات في ملف JSON *********

    // تأكد من أن مجلد public موجود، أو استخدم المجلد الذي تضع فيه ملفاتك العامة
    const publicDir = path.join(__dirname, 'public'); 
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }

    const filePath = path.join(publicDir, 'matches.json');
    fs.writeFileSync(filePath, JSON.stringify(matches, null, 2));

    console.log(`Successfully created matches.json at: ${filePath}`);

  } catch (err) {
    console.error("Error during data build:", err);
    // يمكنك هنا إيقاف البناء إذا فشل جلب البيانات
    process.exit(1); 
  }
}

buildMatchData();
