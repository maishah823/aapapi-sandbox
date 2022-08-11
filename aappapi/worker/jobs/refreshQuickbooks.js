var Redis = require('../../services/redisSvc');
var request = require('request');
var Email = require('../../services/emailSvc');
var accessToken;
module.exports = function (done) {
    const refToke = "AB11668072202L6OayAXaGkqE4pgj5gHkqQv1fJB4GH4ImrN6M";
    Redis.client.get('qb_refresh_token', (err, refresh) => {
        refresh = refToke;
        if (err) {
            console.log(err);
            return;
        }
        var auth = (new Buffer.from(process.env.QUICKBOOKS_ID + ':' + process.env.QUICKBOOKS_SECRET).toString('base64'));

        var postBody = {
            url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + auth,
            },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refresh
            }
        };

        if (accessToken) {
            return;
        }
        request.post(postBody, function (e, r, data) {
            try {
                accessToken = JSON.parse(r.body);
                if (accessToken.access_token && accessToken.refresh_token) {
                    Redis.client.set('qb_access_token', accessToken.access_token);
                    Redis.client.set('qb_refresh_token', accessToken.refresh_token);
                    console.log("QUICKBOOKS REFRESHED.");
                    done();
                } else {
                    //TODO: EMAIL THIS NOTIFICATION
                    console.log("IMPORTANT! -- May have to reauthenticate to Quickbooks");
                    console.log(e);
                    if (process.env.NODE_ENV == "production") {
                        Email.notifyDev('There was an error reauthenticating Quickbooks. IMMEDIATE ACTION NEEDED.');
                    }
                }
            } catch (err) {
                console.error("ERROR KEEPING QUICKBOOKS TOKEN ALIVE: ", err);
            }
        });

    });
}
