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
    .then(function(result){
        console.log(result.data);

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

        fs.writeFileSync(`${apiFolderObj.dayFolder}today.json`, JSON.stringify(result.data, null, 4));
    }).catch( function(err){
        console.log(err);
    });
}

main();