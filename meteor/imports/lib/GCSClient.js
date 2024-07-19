import R from 'ramda';

const SANDSTORM=false;
export function sendGCSRequest(params) {
	if (SANDSTORM) {
		sendGCSSandstormRequest(params);
	} else {
		sendGCSRequest(params);
	}
};

function sendGCSSandstormRequest(signedReqAndHeaders) {
	console.log('sendGCSSandstormRequest called');
	console.log(`url is ${signedReqAndHeaders.url}`);
	console.log(`headers are ${signedRequAndHeaders.headers}`)
};

function sendGCSRequest(params) {
	console.log(params.headers);
	const url = params.url;
	const headers = params.headers;
	headers["Content-Type"] = 'application/json';
	if (params.method == "POST") {
		headers["Content-Type"] = 'multipart/form-data';
	}
	const method = params.method;

	const options = {
		method: params.method,
		headers: headers,
		body: params.body,
	}

	if (params.method == 'PATCH') {
		//options.method = 'POST'
		//options.headers = {"X-HTTP-Method-Override": "PATCH"}
	}

	fetch(url, options)
		.then((response) => {
			console.log(response);
		});
};