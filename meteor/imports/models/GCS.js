import { Meteor } from "meteor/meteor";
import { Promise } from 'meteor/promise';
import FS from 'fs';

import { Config } from "/imports/models/config";
import { createMetadataRequest } from '/imports/lib/GCSMethods'

const { IAMCredentialsClient } = require('@google-cloud/iam-credentials');
const { Storage } = require('@google-cloud/storage');

const Scopes = ["https://www.googleapis.com/auth/cloud-platform"];

var MyStorage;

function myStorage() {
	// storage object is a singleton
	if (MyStorage == null) {
		const config = Config.findOne();
		process.env.GOOGLE_APPLICATION_CREDENTIALS = config.pemPath;
		MyStorage = new Storage({
			projectId: config.projectId,
			keyFileName: config.pemPath,
		})
	}
	return MyStorage;
}

async function updateCORS(config) {
	const result = await myStorage().bucket(config.bucketName).setCorsConfiguration([
	{
		maxAgeSeconds: 3600,
		method: ["GET", "PUT", "POST", "PATCH", "DELETE", "HEAD", "OPTIONS"],
		origin: ["*"],
		headers: ["*"],
		responseHeader: [
			"Content-Type",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Header",
			"x-goog-resumable",
			"*",
			],
	},
	]);	
};

const GCSStoragePreamble = "https://storage.googleapis.com/";
const GENERATION_PRECONDITION = 0;

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
		Config.update(config._id, {$set: {pemPath: "/var/www/xyzzy.pem", phase: "IdentifyGCSBucket", client_email: credentials.client_email, projectId: credentials.project_id, privateKey: credentials.privateKey }});
	},

	"GCS.submitBucketName"(bucketName) {
		const config = Config.findOne();
		Config.update(config._id, {$set: {bucketName: bucketName, phase: "Complete"}});
		config.bucketName = bucketName;
		//Promise.await(updateCORS(config));
	},

	"GCS.requestListURL"() {
		const config = Config.findOne();
		const options = {
				version: "v4",
				action: "list",
				expires: Date.now() + 15*60*1000, // 15 minutes
		}
		const response = Promise.await(myStorage().bucket(config.bucketName).getSignedUrl(options));
		return response;
	},


	"GCS.requestWriteURL"(args) {
		const config = Config.findOne();
		const uploadOptions = {
			destination: args.name,
		};
		const signingOptions = {
			version: "v4",
			action: "write",
			expires: Date.now() + 15*60*1000,
			contentType: args.fileType,
		};

		const response = Promise.await(myStorage().bucket(config.bucketName).file(args.name, uploadOptions).getSignedUrl(signingOptions));
		return response;
	},

	"GCS.requestDeleteURL"(key) {
		const config = Config.findOne();
		const options = {
			version: "v4",
			action: "delete",
			expires: Date.now() + 15*60*1000 // 15 minutes
		}

		const response = Promise.await(myStorage().bucket(config.bucketName).file(key).getSignedUrl(options))
		return response;
	},

	"GCS.deleteFile"(key) {
		const config = Config.findOne();
		const response = Promise.await(myStorage().bucket(config.bucketName).file(key).delete());
	},

	"GCS.setTags"(key, tag) {
		const config = Config.findOne();
		const response = createMetadataRequest(key, tag);
		return response;
	},

	"GCS.rename"(key, newName) {
		const config = Config.findOne();
		const options = {
			preconditionOpts: {
				ifGenerationMatch: GENERATION_PRECONDITION,
			}
		};

		const response = Promise.await(myStorage().bucket(config.bucketName).file(key).move(newName, options));
		return response;
	},
})