const SMSSvc = require('../../services/smsSvc');
module.exports = async function (payload, done) {
    const destinations = payload.destinations || [];
    const message = payload.message;
    if (process.env.NODE_ENV == 'development') {
        try {
            await SMSSvc.testMessage(message);
        } catch (e) {
            console.error("TEXT MESSAGING ERROR:", e);
        }
    } else {
        try {
            await SMSSvc.sendMessage(destinations, message);
        } catch (e) {
            console.error("TEXT MESSAGING ERROR:", e);
        }
    }
    done();
}