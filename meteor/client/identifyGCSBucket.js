import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Config } from '/imports/models/config';

import "./identifyGCSBucket.html";

Template.IdentifyGCSBucket.onCreated(function() {

});

Template.IdentifyGCSBucket.helpers({

});

Template.IdentifyGCSBucket.events({
	"click button#submit-bucket-name"(event) {
		const bucketName = document.getElementById('gcs-bucket-name').value;
		Meteor.call('GCS.submitBucketName', bucketName)
	},

	"click button#reset-phase"(event) {
		Meteor.call('config.update', {$set: {phase: "Start"}})
	}
});