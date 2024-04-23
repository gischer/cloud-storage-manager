import { Mongo } from 'meteor/mongo';

import { http } from 'http';
import { https } from 'https';

// Records in the following table are very simple:
// They have two attributes: 
//  
//   host:  The hostname of the http(s) request.
//   token: The auth token which the sandstorm proxy wants to see (as Bearer);

const PowerboxMappings = new Mongo.Collection('powerbox.mappings');


const DefaultHttpProxyPort = 8080;
const DefaultHttpsProxyPort = 8443;

export function create_proxy(options) {
	// We're going to use a self-signed cert for https
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

	const proxyPort = options.proxyPort || DefaultProxyPort;


}

export function create_http_proxy(options) {
	const sandstormBridgePort = process.env.HTTP_PROXY;
	const proxyPort = options.proxyPort || DefaultHttpProxyPort;
	const server = http.createServer(onRequest).listen(proxyPort);
	function onRequest(client_req, client_res) {
		// parse the request hostname, we need to look up the right bearer token.
		const url = new URL(client_req.hostname);
		
		const options = {
			hostname = 
		}
	}
}