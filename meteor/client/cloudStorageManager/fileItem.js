import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './fileItem.html';

Template.FileItem.onCreated(function() {

});

Template.FileItem.helpers({
	file() {
		return Template.currentData().file;
	}
});

Template.FileItem.events({

});