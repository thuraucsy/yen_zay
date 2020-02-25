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
        fs.writeFileSync('build/today.json', JSON.stringify(result.data, null, 4));
    }).catch( function(err){
        console.log(err);
    });
}

main();