import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import X2JS from 'x2js';

import { Config } from '/imports/models/config';

import "./cloudStorageManager.html";
import "./fileItem";

const SignedListUrl = ReactiveVar(false);
const ListOfFiles = ReactiveVar(false);
const x2js = new X2JS();

Template.CloudStorageManager.onCreated(function() {
	const result = Meteor.call('GCS.requestListURL', (error, result) => {
		if (error) {
			console.log(error);
		}
		SignedListUrl.set(result[0]);
		console.log(result);
	});

	this.autorun(function() {
		const signedListUrl = SignedListUrl.get();
		if (signedListUrl) {
			fetch(signedListUrl, {method: "GET", origin: "https://localhost:3000"})
			.then(function(response) {
				response.text()
				.then((xmlText) => {
					const responseObj = x2js.xml2js(xmlText);
					console.log(responseObj.ListBucketResult.Contents);
					ListOfFiles.set(responseObj.ListBucketResult.Contents);
				});
			})
			.catch(function(error) {
				console.log(error);
			})
		}
	})
});

Template.CloudStorageManager.helpers({
	files() {
		return ListOfFiles.get();
	}
});

Template.CloudStorageManager.events({
})