import { Meteor } from 'meteor/meteor';
import { headers } from 'meteor/gadicohen:headers';

const POWERBOX_ID = 42;
var AccessToken;
var SessionId;
export var PowerboxServer;

export function initiatePowerboxDialog(descriptor) {

	new Promise(function(resolve, reject) {
		console.log(`sessionId is ${SessionId}`)
		window.parent.postMessage({
			powerboxRequest: {
				rpcId: POWERBOX_ID,
				query: [descriptor],
				saveLabel: {defaultText: "The url you want"}
			}
		}, "*");
		window.addEventListener("message", function (event) {
			if (event.source !== window.parent) {
				// Ignore this for the sake of security
				return;
			}

			const response = event.data;
			if (response.rpcId !== POWERBOX_ID) {
				// Not for us
				return;
			}

			if (response.error) {
				reject(response.error);
				return;
			}

			if (response.cancelled) {
				// No selection was made.
				resolve(null);
				return;
			};
			console.log('powerbox response:')
			console.log(response);
			resolve(response.token);
		})
	}).then((claimToken) => {
		console.log('submit claim token');
		Meteor.call('powerbox.establishLink', claimToken)
	});
}

if (Meteor.isServer) {
	import Axios from 'axios';
	const urlRegex = /([a-z0-9]+):\/\/([a-z0-9\.]+):([\d]+)/;
	Meteor.methods({
		"powerbox.establishLink"(claimToken) {
			var self = this;
			SessionId = headers.get(this)['x-sandstorm-session-id'];
			console.log('powerbox.establishLink');
			const proxyParsed = process.env.HTTP_PROXY.match(urlRegex)
			Axios({
				proxy: {
					protocol: proxyParsed[1],
					host: proxyParsed[2],
					port: Number(proxyParsed[3]),
				},
				method: "POST",
				url: `http://http-bridge/session/${SessionId}/claim`,
				data: {
					"requestToken": claimToken,
					"requiredPermissions": [],
				}
			})
			.then(function(response) {
				console.log('setting access token');
				console.log(response.data);
				AccessToken = response.data.cap;
			})
			.catch((error) => {console.error(error)})
		}
	})
}

export function proxyViaSandstormBridge(clientRequest, clientResponse) {

	new Axios({
		method: clientRequest.method,
		host: request.host,
		path: request.path,
		headers: {"Authorization": `Bearer ${AccessToken}`},
	}).then(function(response) {
		if (clientRequest.responseType == 'stream') {
			response.data.pipe(clientResponse, {
				end: true,
			});
		} else {
			var body;
			response.on('data', function(chunk) {
				body += chunk;
			});
			response.on("end", function() {
				clientResponse.writeHead(response.statusCode, response.headers);
				clientResponse.end(body);
			})
		}
	})
}