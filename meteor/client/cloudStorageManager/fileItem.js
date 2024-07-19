import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { updateFileList } from './cloudStorageManager';
import { FSM } from '/imports/lib/fsm';
import { sendGCSRequest } from '/imports/lib/GCSClient';
import { Config } from '/imports/models/config';
import { AppConfig } from '/imports/startup/config';

import './fileItem.html';

Template.FileItem.onCreated(function() {
	this.fsm = new FSM(
		['hidden', 'active'], // states
		['activate', 'cancel', 'commit'], // actions
		[{state: 'hidden', event: 'activate', result: 'active'},
		 {state: 'active', event: 'commit', result: 'hidden'},
		 {state: 'active', event: 'cancel', result: 'hidden'}
		], // transitions
		'hidden', // start state
	);
	const config = Config.findOne();
	this.bucketName = config.bucketName;
});

Template.FileItem.helpers({
	file() {
		return Template.currentData().file;
	},

	url() {
		return urlForKey(Template.currentData().file.Key, Template.instance().bucketName);
	},

	isActive() {
		return Template.instance().fsm.isActive()
	},

	isHidden() {
		return Template.instance().fsm.isHidden();
	},
});

Template.FileItem.events({

	'click .btn-delete-file'(event) {
		const file = Template.currentData().file;
		console.log(`clicked delete button for ${file.Key}`);
		Meteor.call("GCS.requestDeleteURL", file.Key, (error, deleteFileUrl) => {
			if (error) {
				console.log(error);
			} else {
				console.log(deleteFileUrl);
				fetch(deleteFileUrl, {method: "DELETE", /*headers: {"Origin": "localhost:3000"}*/})
				.then(function(response) {
					console.log(`successfully deleted ${file.Key}`);
					updateFileList();
				})
			}
		});
	},

	'click .btn-add-tag'(event) {
		Template.instance().fsm.activate()
	},

	'click .btn-commit-tag'(event) {
		const file = Template.currentData().file;
		const tags = document.getElementsByClassName('new-tag-input')[0].value;
		Template.instance().fsm.commit();
		const response = Meteor.call('GCS.setTags', file.Key, tags, (error, response) => {
			console.log(`Error: ${error}`);
			console.log(response);
			sendGCSRequest(response);
		});
	},

	'click .btn-cancel-tag'(event) {
		Template.instance().fsm.cancel();
	},
});

function urlForKey(key, bucketName) {
	console.log(key);
	console.log(bucketName);
	return `/${bucketName}/${key}`;
};
