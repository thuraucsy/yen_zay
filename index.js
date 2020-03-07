const fs = require('fs');
const apigClientFactory = require('aws-api-gateway-client').default;

function main() {
    console.log("main start");

    config = {
        invokeUrl: process.env.API_GATEWAY_INVOKE_URL,
        region: process.env.API_GATEWAY_REGION,
        accessKey: process.env.API_GATEWAY_ACCESSKEY,
        secretKey: process.env.API_GATEWAY_SECRETKEY,
    }
    var apigClient = apigClientFactory.newClient(config);

    apigClient.invokeApi({}, 'today', 'GET', {}, {})
    .then(function(todayResult){
        console.log(`todayResult`, todayResult.data);

        var apiLocalFolder = 'build/v1/';
        var apiFolderObj = {
            dayFolder: `${apiLocalFolder}day/`,
            monthFolder: `${apiLocalFolder}month/`,
            monthAvgFolder: `${apiLocalFolder}month/average/`,
            yearFolder: `${apiLocalFolder}year/`,
            yearAvgFolder: `${apiLocalFolder}year/average/`
        };

        if (!fs.existsSync(apiLocalFolder)) {
            fs.mkdirSync(apiLocalFolder);
        }
        for (var key in apiFolderObj) {
            if (!fs.existsSync(apiFolderObj[key])) {
                fs.mkdirSync(apiFolderObj[key]);
            }
        }

        fs.writeFileSync(`${apiFolderObj.dayFolder}today.json`, JSON.stringify(todayResult.data, null, 4));

        /* တကယ်လို့ today json ရလဒ်က တစ်ခုပဲရှိတယ်ဆိုရင် အဲ့နေ့ရဲ့ ပထမဆုံး update ဖြစ်တာမလို့ မနေ့က လနဲ့နှစ်ကို update လုပ်ပေးရန် */
        if (todayResult.data.Items.length == 1) {
            apigClient.invokeApi({}, 'year_month', 'GET', {}, {})
            .then(function(yearMonthResult){
                var yearMonthResObj = yearMonthResult.data;
                console.log(`yearMonthResult`, JSON.stringify(yearMonthResObj, null, 4));

                if (Object.keys(yearMonthResObj).length > 0) {
                    fs.writeFileSync(`${apiFolderObj.yearFolder}${Object.keys(yearMonthResObj)[0].substr(0, 4)}.json`, JSON.stringify(yearMonthResObj, null, 4));

                    var yearAvgObj = {};
                    for (var yearMonthKey in yearMonthResObj) {
                        fs.writeFileSync(`${apiFolderObj.monthFolder}${yearMonthKey}.json`, JSON.stringify(yearMonthResObj[yearMonthKey], null, 4));

                        /* တစ်ရက်ချင်းစီရဲ့ပျမ်းမျှတွက်၊ ပထမဆုံး စုစုပေါင်းနဲ့ အကြိမ်ရေအတွက်ကိုအရင်ရှာ */
                        if (!yearAvgObj[yearMonthKey]) {
                            yearAvgObj[yearMonthKey] = {
                                'Items': {}
                            };
                        }
                        let yearMonthObj = yearMonthResObj[yearMonthKey];
                        for (var index in yearMonthObj.Items) {
                            let dayObj = yearMonthObj.Items[index];

                            let usd = parseFloat(dayObj.USDRatePerDollar);
                            let mmk = parseFloat(dayObj.MMKRatePerYen);
                            let ym = dayObj.YearMonth;
                            let dt = dayObj.DayTime;
                            let dtArr = dt.split(' ');

                            /* တစ်ရက် Obj ကို ပျမ်းမျှတန်ဖိုးထည့်ရန်တည်ဆောက် */
                            if (!yearAvgObj[yearMonthKey]['Items'][dtArr[0]]) {
                                yearAvgObj[yearMonthKey]['Items'][dtArr[0]] = {
                                    'YearMonth': ym,
                                    'USDRatePerDollar': 0,
                                    'MMKRatePerYen': 0,
                                    'DayTime': `${dtArr[0]} 00:00`,
                                    'USDRatePerDollarTotal': 0,
                                    'MMKRatePerYenTotal': 0,
                                    'Count': 0
                                };
                            }

                            yearAvgObj[yearMonthKey]['Items'][dtArr[0]]['USDRatePerDollarTotal'] += usd;
                            yearAvgObj[yearMonthKey]['Items'][dtArr[0]]['MMKRatePerYenTotal'] += mmk;
                            yearAvgObj[yearMonthKey]['Items'][dtArr[0]]['Count']++;
                        }
                    }

                    for (var yearMonthKey in yearAvgObj) {
                        for (var dayKey in yearAvgObj[yearMonthKey]['Items']) {
                            let dayObj = yearAvgObj[yearMonthKey]['Items'][dayKey];
                            dayObj['USDRatePerDollar'] = dayObj['USDRatePerDollarTotal'] / dayObj['Count'];
                            dayObj['MMKRatePerYen'] = dayObj['MMKRatePerYenTotal'] / dayObj['Count'];
                        }
                        fs.writeFileSync(`${apiFolderObj.monthAvgFolder}${yearMonthKey}.json`, JSON.stringify(yearAvgObj[yearMonthKey], null, 4));
                    }
                    fs.writeFileSync(`${apiFolderObj.yearAvgFolder}${Object.keys(yearAvgObj)[0].substr(0, 4)}.json`, JSON.stringify(yearAvgObj, null, 4));
                }
            }).catch( function(err){
                console.log(err);
            });
        }
    }).catch( function(err){
        console.log(err);
    });
}

main();