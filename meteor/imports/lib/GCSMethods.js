import { Meteor } from 'meteor/meteor';
import Crypto from 'crypto';
import { Storage } from '@google-cloud/storage'
import FS from 'fs';
import R from 'ramda';

import { Config } from '/imports/models/config';

function getPrivateKey(config) {
	if (!config.privateKey) {	
		const string = FS.readFileSync(config.pemPath).toString();
		const pemObj = JSON.parse(string);
		config.privateKey = pemObj.private_key;
		Config.update(config._id, config);
	}
	return config.privateKey;
};

export function createMetadataRequest(key, tag) {
	// The 'key' as argument is GCS terminology for the filename of the file in a bucket.
	const config = Config.findOne();
	const bucketName = config.bucketName;
	const object_uri = `storage/v1/b/${bucketName}/o/${key}`
	const privateKey = getPrivateKey(config);
	const request_timestamp  = new Date().toISOString().replace(/-/g, '').replace(/:/g, '').substring(0, 15) + 'Z';
	const datestamp = request_timestamp.substring(0, 8);
	const service_account = config.client_email;
	const credential_scope = `${datestamp}/auto/storage/goog4_request`;
	const credential = `${service_account}/${credential_scope}`;
	const expiration = 3600;

	const raw_canonical_query = [
		'X-Goog-Algorithm=GOOG4-RSA-SHA256',
		`X-Goog-Credential=${encodeURIComponent(credential)}`,
		`X-Goog-Date=${encodeURIComponent(request_timestamp)}`,
		`X-Goog-Expires=${encodeURIComponent(expiration)}`,
		'X-Goog-Signedheaders=host',
		]

	const metadata = {metadata: {}};
	metadata.metadata[tag] = true;
	const body = JSON.stringify(metadata);

	function processHeader(hObj, header) {
		const s = header.split("=")
		hObj[s[0]] = s[1];
		return hObj;
	}

	const headersObj = R.reduce(processHeader, {}, raw_canonical_query);

	const canonical_query = raw_canonical_query.join('&');

	const canonical_request_list = [
		"PATCH",
		`/${object_uri}`,
		canonical_query,
		"host:storage.googleapis.com",
		"",
		"host",
		"UNSIGNED-PAYLOAD",
	];
	const canonical_request = R.join('\n', canonical_request_list)

	console.log('canonical_request:');
	console.log(canonical_request)
	const canonical_request_hash = Crypto.createHash('sha256').update(canonical_request).digest('hex');
	const sign_string = 
	`GOOG4-RSA-SHA256\n${request_timestamp}\n${credential_scope}\n${canonical_request_hash}`;
	console.log('string to sign:');
	console.log(sign_string);


	const signature = Crypto.createSign('sha256').update(sign_string).sign(privateKey, 'hex');
	const query_for_url = raw_canonical_query.join('&');

	const signedUrl = `https://storage.googleapis.com/${object_uri}?${query_for_url}&x-goog-signature=${signature}`;
	return {method: "PATCH", url: signedUrl, headers: headersObj, body: body}
}
