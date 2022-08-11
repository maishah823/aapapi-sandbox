var ObjectID = require('mongoose').Types.ObjectId;

module.exports = {
    isValidObjectId: IsValidObjectId
}

function IsValidObjectId(objId) {
	try {
		var testObjId = new ObjectID(objId);

		if (!ObjectID.isValid(objId)) {
			return false;
		}
		if (testObjId.toHexString() !== objId) {
			return false;
		}
		return true;
	} catch (err) {
		return false;
    }
}
