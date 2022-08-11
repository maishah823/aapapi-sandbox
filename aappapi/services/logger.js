'use strict';

var winston = require('winston');

var service = {
	get: GetLogger
};


function GetLogger(){
	return winston;
}



module.exports = service;