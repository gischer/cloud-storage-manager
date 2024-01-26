import { Meteor } from "meteor/meteor";
import { Promise } from 'meteor/promise';
import FS from 'fs';

import { Config } from "/imports/models/config";

const {IAMCredentialsClient} = require('@google-cloud/iam-credentials');
const { Storage } = require('@google-cloud/storage');

const Scopes = ["https://www.googleapis.com/auth/cloud-platform"];
async function getAuthToken() {
	const config = Config.findOne();
	process.env.GOOGLE_APPLICATION_CREDENTIALS = config.pemPath;
	const client_options = {
			"credentials_file": config.pemPath,
		}
	const credentialsClient = new IAMCredentialsClient(credentials_file=config.pemPath);
	const request = {
		name: config.client_email,
		scope: Scopes,
	}

	const response = await credentialsClient.generateAccessToken(request);
	config.accessToken = response.accessToken;
	config.expireTime = response.expireTime.seconds;
}

var myStorage;

async function createStorageObject(config) {
	process.env.GOOGLE_APPLICATION_CREDENTIALS = config.pemPath;
	myStorage = new Storage({
		projectId: config.projectId,
		keyFileName: config.pemPath,
	});

};

async function updateCORS(config) {
	const result = await myStorage.bucket(config.bucketName).setCorsConfiguration([
	{
		maxAgeSeconds: 3600,  // Is this right?  I have no idea.  Docs mention "preflighted requests"
		method: ["GET"],
		origin: ["*"],
		responseHeader: ["Access-Control-Allow-Origin *"],
	}]);	
};

const GCSStoragePreamble = "https://storage.googleapis.com/";

Meteor.methods({
	"GCS.submitPem"(pemContents) {
		// Make sure directory exists
		FS.mkdir("/var/www", {recursive: true}, (err) => {
			if (err) throw err
		});
		FS.writeFile('/var/www/xyzzy.pem', pemContents, function(err) {
			if (err) throw err;
			console.log("wrote credentials file")
		});
		const config = Config.findOne();
		// Now get the name of the account from the pemContents
		const credentials = JSON.parse(pemContents);
		Config.update(config._id, {$set: {pemPath: "/var/www/xyzzy.pem", phase: "IdentifyGCSBucket", client_email: credentials.client_email, projectId: credentials.project_id}});
	},

	"GCS.submitBucketName"(bucketName) {
		const config = Config.findOne();
		Config.update(config._id, {$set: {bucketName: bucketName, phase: "Complete"}});
		createStorageObject(Config.findOne());
		//getAuthToken();
	},

	"GCS.requestListURL"() {
		const config = Config.findOne();
		const options = {
				version: "v4",
				action: "list",
				expires: Date.now() + 15*60*1000, // 15 minutes
		}
		Promise.await(updateCORS(config));
		const response = Promise.await(myStorage.bucket(config.bucketName).getSignedUrl(options));
		return response;
	},
})