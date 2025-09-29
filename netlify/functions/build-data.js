// build-data.js

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// =========================================================================
// 🛑 تأكد أن هذا الرابط هو رابط Google Sheet الصحيح الذي يعمل لديك!
// =========================================================================
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT82iOdGJcS7-3Osrsuh2WTO8tc6NWn5EWw0qLNsiy2F7-g5xrz-E5MUwKIWMlOxSLHh2OEFEme3zef/pub?gid=2101882'; 
// (يرجى استبدال هذا برابط جدول البيانات الخاص بك)

async function fetchAndBuildData() {
    console.log('Starting data fetch and build process...');

    try {
        // 1. جلب البيانات من Google Sheet
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        
        // 2. معالجة البيانات (نفس الكود القديم يعمل هنا)
        const matches = data.feed.entry.map(item => ({
            matchId: item.gsx$matchid.$t,
            date: item.gsx$date.$t,
            league: item.gsx$league.$t,
            homeTeam: item.gsx$hometeam.$t,
            homeLogo: item.gsx$homelogo.$t,
            scoreHome: item.gsx$scorehome.$t,
            scoreAway: item.gsx$scoreaway.$t,
            awayTeam: item.gsx$awayteam.$t,
            awayLogo: item.gsx$awaylogo.$t,
            status: item.gsx$status.$t,
        }));

        // 3. حفظ البيانات كملف JSON في المجلد الرئيسي (الجذر)
        // __dirname هو مجلد netlify/functions، لذا نرجع خطوتين للخلف للوصول إلى الجذر
        const filePath = path.join(__dirname, '../../matches.json');
        
        fs.writeFileSync(filePath, JSON.stringify(matches, null, 2));

        console.log('✅ Successfully created matches.json in the root directory.');

    } catch (error) {
        console.error('❌ FATAL BUILD ERROR:', error.message);
        // نُعيد رمز خروج (exit code) غير صفري للتسبب في فشل البناء
        // هذا أمر جيد حتى لا يتم نشر نسخة قديمة أو معطلة من الموقع
        process.exit(1);
    }
}

fetchAndBuildData();
