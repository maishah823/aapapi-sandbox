let plivo = require('plivo');
let client = new plivo.Client(process.env.PLIVO_AUTH_ID, process.env.PLIVO_AUTH_TOKEN);

module.exports = {
    sendMessage: SendMessage,
    testMessage : TestMessage
};

function SendMessage(destinations, message) {
    const sourceNumber = '+18476937422';
    var numbers = [];

    //FILTER OUT IMPROPER NUMBERS
    if (!Array.isArray(destinations)) {
        if (destinations.replace(/[\D]/g, "").length === 10) {
            numbers.push(destinations.replace(/\D/g, ""));
        }
    } else {
        numbers = destinations.map((numberToFormat) => {
            return numberToFormat.replace(/\D/g, "");
        }).filter((number) => {
            if (number.length !== 10) {
                return false;
            }
            return true;
        })
    }

    if (numbers.length < 1) {
        return;
    }

    //BUILD DESTINATION STRING
    var destinationNumber = "";
    for (var i = 0; i < numbers.length; i++) {
        if (i != 0) {
            destinationNumber = destinationNumber + "<"
        }
        destinationNumber = destinationNumber + "1" + numbers[i];
    }

    if(process.env.NODE_ENV == 'development'){
        console.log("NUMBERS: " + destinationNumber);
        console.log("SENDING DEV MESSAGE");
        destinationNumber = '12037680190';
    }

    return client.messages.create(
        sourceNumber,
        destinationNumber,
        message
    ).catch(function(err){
        console.error(err);
    });

}

function TestMessage(message){
    const sourceNumber = '+18476937422';
    return client.messages.create(
        sourceNumber,
        '12037680190',
        message
    );
}
