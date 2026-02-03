// 売上データ（2025年10月〜2026年1月）
// 日付別の純売上高

const salesData = [
    { date: "2025-10-01", sales: 113565 },
    { date: "2025-10-02", sales: 173625 },
    { date: "2025-10-03", sales: 304835 },
    { date: "2025-10-04", sales: 169460 },
    { date: "2025-10-05", sales: 251010 },
    { date: "2025-10-06", sales: 268570 },
    { date: "2025-10-07", sales: 238910 },
    { date: "2025-10-08", sales: 209375 },
    { date: "2025-10-09", sales: 160755 },
    { date: "2025-10-10", sales: 223105 },
    { date: "2025-10-11", sales: 354510 },
    { date: "2025-10-12", sales: 191785 },
    { date: "2025-10-13", sales: 236735 },
    { date: "2025-10-14", sales: 251685 },
    { date: "2025-10-15", sales: 191655 },
    { date: "2025-10-16", sales: 165185 },
    { date: "2025-10-17", sales: 224430 },
    { date: "2025-10-18", sales: 282600 },
    { date: "2025-10-19", sales: 165165 },
    { date: "2025-10-20", sales: 91410 },
    { date: "2025-10-21", sales: 106270 },
    { date: "2025-10-22", sales: 164870 },
    { date: "2025-10-23", sales: 102535 },
    { date: "2025-10-24", sales: 199830 },
    { date: "2025-10-25", sales: 155730 },
    { date: "2025-10-26", sales: 85910 },
    { date: "2025-10-27", sales: 123915 },
    { date: "2025-10-28", sales: 37455 },
    { date: "2025-10-29", sales: 106235 },
    { date: "2025-10-30", sales: 80620 },
    { date: "2025-10-31", sales: 86125 },
    { date: "2025-11-01", sales: 209970 },
    { date: "2025-11-02", sales: 106250 },
    { date: "2025-11-03", sales: 148460 },
    { date: "2025-11-04", sales: 55420 },
    { date: "2025-11-05", sales: 66715 },
    { date: "2025-11-06", sales: 151180 },
    { date: "2025-11-07", sales: 109725 },
    { date: "2025-11-08", sales: 182125 },
    { date: "2025-11-09", sales: 150100 },
    { date: "2025-11-10", sales: 140805 },
    { date: "2025-11-11", sales: 55675 },
    { date: "2025-11-12", sales: 134020 },
    { date: "2025-11-13", sales: 102975 },
    { date: "2025-11-14", sales: 142870 },
    { date: "2025-11-15", sales: 178820 },
    { date: "2025-11-16", sales: 152680 },
    { date: "2025-11-17", sales: 196390 },
    { date: "2025-11-18", sales: 190335 },
    { date: "2025-11-19", sales: 62100 },
    { date: "2025-11-20", sales: 69155 },
    { date: "2025-11-21", sales: 151605 },
    { date: "2025-11-22", sales: 197125 },
    { date: "2025-11-23", sales: 124080 },
    { date: "2025-11-24", sales: 163120 },
    { date: "2025-11-25", sales: 95795 },
    { date: "2025-11-26", sales: 171965 },
    { date: "2025-11-27", sales: 143420 },
    { date: "2025-11-28", sales: 87560 },
    { date: "2025-11-29", sales: 134105 },
    { date: "2025-11-30", sales: 76340 },
    { date: "2025-12-01", sales: 88365 },
    { date: "2025-12-02", sales: 97650 },
    { date: "2025-12-03", sales: 152825 },
    { date: "2025-12-04", sales: 120715 },
    { date: "2025-12-05", sales: 45320 },
    { date: "2025-12-06", sales: 105925 },
    { date: "2025-12-07", sales: 112355 },
    { date: "2025-12-08", sales: 134960 },
    { date: "2025-12-09", sales: 54890 },
    { date: "2025-12-10", sales: 112365 },
    { date: "2025-12-11", sales: 131395 },
    { date: "2025-12-12", sales: 83670 },
    { date: "2025-12-13", sales: 101255 },
    { date: "2025-12-14", sales: 173690 },
    { date: "2025-12-15", sales: 127150 },
    { date: "2025-12-16", sales: 84700 },
    { date: "2025-12-17", sales: 107260 },
    { date: "2025-12-18", sales: 81160 },
    { date: "2025-12-19", sales: 70840 },
    { date: "2025-12-20", sales: 45100 },
    { date: "2025-12-21", sales: 119680 },
    { date: "2025-12-22", sales: 93720 },
    { date: "2025-12-23", sales: 72975 },
    { date: "2025-12-24", sales: 80810 },
    { date: "2025-12-25", sales: 52130 },
    { date: "2025-12-26", sales: 85260 },
    { date: "2025-12-27", sales: 139965 },
    { date: "2025-12-28", sales: 145805 },
    { date: "2025-12-29", sales: 132730 },
    { date: "2025-12-30", sales: 143345 },
    { date: "2025-12-31", sales: 87340 },
    { date: "2026-01-01", sales: 66055 },
    { date: "2026-01-02", sales: 283955 },
    { date: "2026-01-03", sales: 131670 },
    { date: "2026-01-04", sales: 123255 },
    { date: "2026-01-05", sales: 37675 },
    { date: "2026-01-06", sales: 90420 },
    { date: "2026-01-07", sales: 57685 },
    { date: "2026-01-08", sales: 62535 },
    { date: "2026-01-09", sales: 70605 },
    { date: "2026-01-10", sales: 87320 },
    { date: "2026-01-11", sales: 180060 },
    { date: "2026-01-12", sales: 115315 },
    { date: "2026-01-13", sales: 23870 },
    { date: "2026-01-14", sales: 127945 },
    { date: "2026-01-15", sales: 119255 },
    { date: "2026-01-16", sales: 172030 },
    { date: "2026-01-17", sales: 103690 },
    { date: "2026-01-18", sales: 145240 },
    { date: "2026-01-19", sales: 76795 },
    { date: "2026-01-20", sales: 98295 },
    { date: "2026-01-21", sales: 39590 },
    { date: "2026-01-22", sales: 98010 },
    { date: "2026-01-23", sales: 117440 },
    { date: "2026-01-24", sales: 108625 },
    { date: "2026-01-25", sales: 107690 },
    { date: "2026-01-26", sales: 153155 },
    { date: "2026-01-27", sales: 82115 },
    { date: "2026-01-28", sales: 71390 },
    { date: "2026-01-29", sales: 80740 },
    { date: "2026-01-30", sales: 53900 },
    { date: "2026-01-31", sales: 126610 }
];

// 月別集計データを生成
function getMonthlySales() {
    const monthly = {};
    salesData.forEach(item => {
        const month = item.date.substring(0, 7); // YYYY-MM
        if (!monthly[month]) monthly[month] = 0;
        monthly[month] += item.sales;
    });
    return Object.entries(monthly).map(([month, sales]) => ({ month, sales }));
}

// 曜日別集計データを生成
function getWeekdaySales() {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekdaySales = [0, 0, 0, 0, 0, 0, 0];
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

    salesData.forEach(item => {
        const date = new Date(item.date);
        const day = date.getDay();
        weekdaySales[day] += item.sales;
        weekdayCounts[day]++;
    });

    return weekdays.map((name, i) => ({
        weekday: name,
        total: weekdaySales[i],
        average: Math.round(weekdaySales[i] / weekdayCounts[i]),
        count: weekdayCounts[i]
    }));
}

// 統計情報を取得
function getSalesStats() {
    const total = salesData.reduce((sum, item) => sum + item.sales, 0);
    const average = Math.round(total / salesData.length);
    const max = Math.max(...salesData.map(item => item.sales));
    const min = Math.min(...salesData.map(item => item.sales));
    const maxDay = salesData.find(item => item.sales === max);
    const minDay = salesData.find(item => item.sales === min);

    return { total, average, max, min, maxDay, minDay, days: salesData.length };
}
