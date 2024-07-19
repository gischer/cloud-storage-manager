import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import X2JS from 'x2js';

import { Config } from '/imports/models/config';
import { initiatePowerboxDialog } from '/imports/lib/powerbox';
import "./cloudStorageManager.html";
import "./fileItem";

const PowerboxDescriptor = "EA1QAQEAABEBF1EEAQH/x80lxnnjecgAQAMxCQIBAAH/aHR0cHM6Ly8Dc3RvcmFnZS5nb29nbGVhcGlzLmNvbS8A";
const SignedListUrl = ReactiveVar(false);
const ListOfFiles = ReactiveVar(false);
const x2js = new X2JS();

Template.CloudStorageManager.onCreated(function() {
	// Fire off the request for a signed URL that will list the bucket
	updateFileList();
	initiatePowerboxDialog(PowerboxDescriptor);
	// Watch for the production of a signed URL that will list the bucket, and fetch it once it shows up.
	this.autorun(function() {
		const signedListUrl = SignedListUrl.get();
		if (signedListUrl) {
			fetch(signedListUrl, {method: "GET", origin: "https://localhost:3000"})
			.then(function(response) {
				response.text()
				.then((xmlText) => {
					const responseObj = x2js.xml2js(xmlText);
					ListOfFiles.set(responseObj.ListBucketResult.Contents);
				});
			})
			.catch(function(error) {
				console.log(error);
			})
		}
	})

	// Subscribe to Config
	this.subscribe('config');
});

Template.CloudStorageManager.helpers({
	files() {
		return ListOfFiles.get();
	},

	bucketName() {
		const config = Config.findOne();
		return (!!config ? config.bucketName : "");
	}
});

Template.CloudStorageManager.events({
	"click #start-upload-file"(event) {
		const fileElement = document.getElementById('upload-file');
		if (fileElement.files && fileElement.files[0]) {
			console.log('changed upload-file');
			console.log(fileElement.files[0]);
			const args = {
				name: fileElement.files[0].name,
				fileType: fileElement.files[0].type,
			};
			Meteor.call("GCS.requestWriteURL", args, (error, writeUrl) => {
				if (error) {
					console.log(error);
				} else {
					fetch(writeUrl, 
						{method: "PUT", 
						contentType: fileElement.files[0].type,
						body: fileElement.files[0]})
					.then((response) => {
						console.log(`Upload of ${fileElement.files[0].name} successful`);
						updateFileList();
					})
					.catch((error) => {
						console.log(`Upload of ${fileElement.files[0].name} failed`);
						console.log(error);
					})

				}
			})
		}

	}
});

// This function sets a reactive variable and the autorun takes care of the rest.
export function updateFileList() {
	const result = Meteor.call('GCS.requestListURL', (error, result) => {
		if (error) {
			console.log(error);
		}
		SignedListUrl.set(result[0]);
	});
}