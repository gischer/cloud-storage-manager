import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { updateFileList } from './cloudStorageManager';
import './fileItem.html';

Template.FileItem.onCreated(function() {

});

Template.FileItem.helpers({
	file() {
		return Template.currentData().file;
	}
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
	}
});