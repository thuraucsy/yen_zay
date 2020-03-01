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
            yearFolder: `${apiLocalFolder}year/`,
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

                    for (var yearMonthKey in yearMonthResObj) {
                        fs.writeFileSync(`${apiFolderObj.monthFolder}${yearMonthKey}.json`, JSON.stringify(yearMonthResObj[yearMonthKey], null, 4));
                    }
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