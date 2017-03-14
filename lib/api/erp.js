'use strict';
var debug = require('debug')('bot:api:erp');
var extend = require('extend');
var watson = require('watson-developer-cloud');
var requestDefaults = {
	json: true
};

var request;

const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
var discovery = new DiscoveryV1({
	username: '39e5de94-1526-40d7-9170-54b25bc12c88',
	password: '7J6lhBSNhw4U',
	version_date: '2016-12-01',
	path: {
		environment_id: 'd76544dc-6d9f-4b3c-82aa-65c6d807d649',
		collection_id: '20b999b5-5025-44ae-b616-0b5eb4e5458e'
	},
	qs: { count:1}
});

module.exports = {
	/**
	 * 
	 * @param {string}
	 *            params.name The ban
	 * @param {Function}
	 *            callback The callback
	 * @return {void}
	 */
	getLoopLength: function(params, callback) {

		var qString;

		request = require('request').defaults(requestDefaults);
		qString = {
			ban: params
		};

		request({
			method: 'GET',
			json: true,
			url: 'http://attsim.mybluemix.net/customers/loopLength',
			qs: qString
		}, function(err, response, body) {
			if (err) {
				callback(err);
			} else if (response.statusCode != 200) {
				if (response.statusCode == 404 && body.error) {
					callback(null, {
						ERROR: '404: ' + body.error
					});
				} else {
					callback(null, {
						ERROR: 'Error http status: ' + response.statusCode
					});
				}

			} else if (body.error && body.error.length > 0) {
				callback(null, {
					ERROR: body.error
				});
			} else {
				debug('looplength is: %s', body.loopLength);

				callback(null, {
					LOOP: body.loopLength
				});
			}
		});
	},

	/**
	 * 
	 * @param {string}
	 *            params.name The ban
	 * @param {Function}
	 *            callback The callback
	 * @return {void}
	 */
	getLoopProfile: function(params, callback) {

		var qString;

		request = require('request').defaults(requestDefaults);
		qString = {
			loopLength: params
		};

		request({
			method: 'GET',
			json: true,
			url: 'http://attsim.mybluemix.net/serviceprofiles/recommend',
			qs: qString
		}, function(err, response, body) {
			if (err) {
				callback(err);
			} else if (response.statusCode != 200) {
				callback(null, {
					ERROR: 'Error http status: ' + response.statusCode
				});
			} else if (body.error && body.error.length > 0) {
				callback(null, {
					ERROR: body.error
				});
			} else {
				debug('max is: %s and min is: %s', body.maxBRUpstream, body.maxBRDownstream);
				var profile = body.maxBRDownstream + '/' + body.maxBRUpstream;

				callback(null, {
					PROFILE: profile,
					NewProfileName: body.name,
					NewProfileID: body._id,
					NewMRC: body.mrc
				});
			}
		});
	},

	/**
	 * 
	 * @param {string}
	 *            params.name The ban
	 * @param {Function}
	 *            callback The callback
	 * @return {void}
	 */
	getCurrentMRC: function(params, callback) {

		var qString;

		request = require('request').defaults(requestDefaults);
		qString = {
			ban: params
		};

		request({
			method: 'GET',
			json: true,
			url: 'http://attsim.mybluemix.net/customers/mrc',
			qs: qString
		}, function(err, response, body) {
			if (err) {
				callback(err);
			} else if (response.statusCode != 200) {
				callback(null, {
					ERROR: 'Error http status: ' + response.statusCode
				});
			} else if (body.error && body.error.length > 0) {
				callback(null, {
					ERROR: body.error
				});
			} else {
				debug('mrc is: %s', body.serviceMrc);

				callback(null, {
					CurMRC: body.serviceMrc
				});
			}
		});
	},

	/**
	 * 
	 * @param {string}
	 *            params.name The ban
	 * @param {Function}
	 *            callback The callback
	 * @return {void}
	 */
	postOrder: function(params, callback) {

		var qString;

		var request = require("request");

		var options = {
			method: 'POST',
			json: true,
			url: 'http://attsim.mybluemix.net/serviceorders',
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'application/x-www-form-urlencoded'
			},
			form: {
				ban: params.ban,
				profile: params.profile
			}
		};

		request(options, function(err, response, body) {
			if (err) {
				callback(err);
			} else if (response.statusCode != 200) {
				callback(null, {
					ERROR: 'Error http status: ' + response.statusCode
				});
			} else if (body.error && body.error.length > 0) {
				callback(null, {
					ERROR: body.error
				});
			} else {
				debug('order is: %s', body.orderNumber);

				callback(null, {
					ORDNMBR: body.orderNumber
				});
			}
		});
	},

	/**
	 * 
	 * @param {string}
	 *            params.name The ban
	 * @param {Function}
	 *            callback The callback
	 * @return {void}
	 */
	getCustInfo: function(params, callback) {

		var qString;

		request = require('request').defaults(requestDefaults);
		qString = {
			ban: params
		};

		request({
			method: 'GET',
			json: true,
			url: 'http://attsim.mybluemix.net/customers',
			qs: qString
		}, function(err, response, body) {
			if (err) {
				callback(err);
			} else if (response.statusCode != 200) {
				callback(null, {
					ERROR: 'Error http status: ' + response.statusCode
				});
			} else if (body.error && body.error.length > 0) {
				callback(null, {
					ERROR: body.error
				});
			} else if (body === undefined || body.length == 0) {
				// empty
				callback(null, {
					ERROR: 'No customer found'
				});
			} else {
				debug('Cust Info is: %s', JSON.stringify(body[0]));
				var firstBody = body[0];
				callback(null, {
					NAME: firstBody.name,
					ADDRESS: firstBody.address,
					SERVICEPROFILE: firstBody.serviceProfile,
					SERVICEOTC: firstBody.charges.serviceOtc,
					SERVICEMRC: firstBody.charges.serviceMrc,
					EQUIPOTC: firstBody.charges.equipmentOtc,
					EQUIPMRC: firstBody.charges.equipmentMrc
				});
			}
		});
	},

	searchDiscovery: function(params, callback) {
		debug('Discovery Search Text: %s', params);
		var searchParams = {
				count: 1,
				query: params
		};
		discovery.query((searchParams), function(error, data) {
			  console.log(JSON.stringify(data, null, 2));
			  if (error) {
				  callback(error)
			  } else {
				  debug('Discovery result text: %s',data.results[0].html);
				  callback(null, {
					  DiscoveryResult: data.results[0].html
				  });
			  }
			});
	}

}