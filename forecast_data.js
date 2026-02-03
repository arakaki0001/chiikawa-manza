// 商品別販売実績データ（2025年10月〜2026年1月、123日間）
// GTIN(JAN)コード別の総販売数量

const productSalesData = {
    "4571609364252": 1399,  // スマホに貼れるステッカー ア...ぅん…
    "4571609364238": 914,   // スマホに貼れるステッカー ビール缶
    "4571609364214": 891,   // ホログラムクリアファイル ハイビスカス
    "4571609364221": 846,   // スマホに貼れるステッカー ハイビスカス
    "4571609364184": 636,   // おみやげバッグ ハイビスカス
    "4571609364245": 583,   // スマホに貼れるステッカー くりまんじゅう
    "4571609364344": 549,   // フェイスタオル ハイビスカス
    "4571609364207": 478,   // アクリルマグネット ビール缶
    "4571609364269": 283,   // Tシャツ M ハイビスカス
    "4571609364306": 269,   // Tシャツ M ア...ぅん…
    "4571609364313": 267,   // Tシャツ L ア...ぅん…
    "4571609369929": 200,   // Tシャツ S ハイビスカス
    "4571609364276": 188,   // Tシャツ L ハイビスカス
    "4571609369936": 176,   // Tシャツ S ア...ぅん…
    "4571609364191": 159,   // 大きめトートバッグ ア...ぅん…
    "4571609364320": 129,   // Tシャツ XL ア...ぅん…
    "4582662959378": 129,   // なんくるないさ〜!!マスコット（うさぎ）
    "4571609364283": 97,    // Tシャツ XL ハイビスカス
    "4582662919921": 93,    // もちっとぷちミニマスコット（シーサー）
    "4582662959361": 58,    // なんくるないさ〜!!マスコット（ハチワレ）
    "4571670330194": 56,    // おかおのスクイーズ［うさぎ］
    "4571609364337": 53,    // Tシャツ 2XL ア...ぅん…
    "4582662959354": 51,    // なんくるないさ〜!!マスコット（ちいかわ）
    "4571670330170": 48,    // おかおのスクイーズ［ハチワレ］
    "4571609337935": 45,    // 大きめトートバッグ ハイビスカス
    "4571609364290": 40,    // Tシャツ 2XL ハイビスカス
    "4571670330996": 37,    // アクリルネームタグ BOX
    "4571670330828": 35,    // マンガスタンプ２ BOX
    "4571670330156": 33,    // おかおのスクイーズ［ちいかわ］
    "4571609336778": 26,    // ダイカットマスキングテープ なんくるないさ〜!!
    "4582662919914": 24,    // もちっとぬいぐるみS（シーサー）
    "4582662917880": 19,    // もちっとぷちミニマスコット（ハチワレ）
    "4582662917910": 17,    // もちっとぷちミニマスコット（モモンガ）
    "4571609336785": 16,    // ダイカットマスキングテープ ピ～ゥ～イッ
    "4582662917873": 13,    // もちっとぷちミニマスコット（ちいかわ）
    "4582662917897": 13,    // もちっとぷちミニマスコット（うさぎ）
    "4582662917903": 11,    // もちっとぷちミニマスコット（くりまんじゅう）
    "4582662917835": 10,    // もちっとぬいぐるみS（ハチワレ）
    "4589468440802": 7,     // ぷちミニマスコット（ラッコ）
    "4582662917842": 7,     // もちっとぬいぐるみS（うさぎ）
    "4582662984219": 6,     // ぬいぐるみS（ラッコ）
    "4582662917866": 5,     // もちっとぬいぐるみS（モモンガ）
    "4582662917859": 3,     // もちっとぬいぐるみS（くりまんじゅう）
    "4582662917828": 2      // もちっとぬいぐるみS（ちいかわ）
};

// 販売期間（日数）
const SALES_PERIOD_DAYS = 123;

// 日平均販売数を計算
function getDailyAverage(jan) {
    const totalSales = productSalesData[jan] || 0;
    return totalSales / SALES_PERIOD_DAYS;
}

// 在庫予測を計算
function calculateForecast(item, leadTimeDays = 14, safetyStockDays = 7) {
    const dailyAvg = getDailyAverage(item.jan);

    // 日平均販売がない場合
    if (dailyAvg === 0) {
        return {
            ...item,
            dailyAverage: 0,
            daysUntilStockout: Infinity,
            stockoutDate: null,
            stock6MonthsLater: item.stock,
            reorderDate: null,
            status: 'no_sales'
        };
    }

    // 在庫切れまでの日数
    const daysUntilStockout = item.stock / dailyAvg;

    // 在庫切れ予測日
    const today = new Date();
    const stockoutDate = new Date(today);
    stockoutDate.setDate(today.getDate() + Math.floor(daysUntilStockout));

    // 6ヶ月後の予測在庫
    const stock6MonthsLater = Math.max(0, item.stock - (dailyAvg * 180));

    // 発注タイミング（在庫切れ - リードタイム - 安全在庫日数）
    const reorderDays = daysUntilStockout - leadTimeDays - safetyStockDays;
    let reorderDate = null;
    if (reorderDays > 0) {
        reorderDate = new Date(today);
        reorderDate.setDate(today.getDate() + Math.floor(reorderDays));
    } else {
        reorderDate = new Date(today); // 今すぐ発注が必要
    }

    // ステータス判定
    let status = 'good';
    if (daysUntilStockout <= 7) {
        status = 'critical';
    } else if (daysUntilStockout <= 30) {
        status = 'warning';
    } else if (daysUntilStockout <= 60) {
        status = 'attention';
    }

    return {
        ...item,
        dailyAverage: dailyAvg,
        totalSales: productSalesData[item.jan] || 0,
        daysUntilStockout: Math.floor(daysUntilStockout),
        stockoutDate: stockoutDate,
        stock6MonthsLater: Math.floor(stock6MonthsLater),
        reorderDate: reorderDate,
        status: status
    };
}

// 全商品の予測を取得
function getAllForecasts(leadTimeDays = 14, safetyStockDays = 7) {
    return inventoryData.map(item => calculateForecast(item, leadTimeDays, safetyStockDays));
}
