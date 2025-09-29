// build-data.js

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// =========================================================================
// 🛑 الرابط الصحيح (تم تعديله ليتناسب مع نموذج التصدير JSON)
// =========================================================================
const SPREADSHEET_ID = '19YowWyLXXR5nLFhjgSIL95wakSGZVJzXUrUi-afWDjE';
const SHEET_NAME = 'SoccerMatches'; // اسم الورقة (كما ظهر في صورتك: SoccerMatches)
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;


async function fetchAndBuildData() {
    console.log('Starting data fetch and build process...');

    try {
        // 1. جلب البيانات من Google Sheet
        const response = await fetch(SHEET_URL);
        
        // 🛑 معالجة استجابة جوجل شييت (لإزالة الأجزاء غير الضرورية)
        const text = await response.text();
        const jsonText = text.replace('/*O_o*/\ngoogle.visualization.Query.setResponse(', '').slice(0, -2);
        const data = JSON.parse(jsonText);

        // 2. معالجة البيانات وتحويلها إلى الهيكل الذي يحتاجه الويجت (Widget)
        const rows = data.table.rows;
        const cols = data.table.cols.map(c => c.label);

        const matches = rows.map(row => {
            const rowData = row.c.map(cell => (cell && cell.v !== undefined) ? cell.v : '');
            
            // يجب أن تتأكد أن ترتيب الأعمدة يطابق ملف الشيت لديك
            return {
                matchId: rowData[0], 
                date: rowData[1], 
                league: rowData[2], 
                homeTeam: rowData[3], 
                homeLogo: rowData[4],
                scoreHome: rowData[5],
                scoreAway: rowData[6],
                awayTeam: rowData[7],
                awayLogo: rowData[8],
                status: rowData[9],
            };
        });

        // 3. حفظ البيانات كملف JSON في المجلد الرئيسي (الجذر)
        // هذا يحل مشكلة مسار الحفظ (Publish directory)
        const filePath = path.join(__dirname, '../../matches.json');
        
        fs.writeFileSync(filePath, JSON.stringify(matches, null, 2));

        console.log('✅ Successfully created matches.json in the root directory.');

    } catch (error) {
        console.error('❌ FATAL BUILD ERROR:', error.message);
        console.error('❌ CHECK THE GOOGLE SHEET URL AND ACCESS PERMISSIONS.');
        process.exit(1);
    }
}

fetchAndBuildData();
