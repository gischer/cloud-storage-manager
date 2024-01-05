import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Config } from '/imports/models/config';

import './starting.html';

Template.Starting.onCreated(function() {

});

Template.Starting.helpers({

});

Template.Starting.events({
	'click #startGCSConfig'(event) {
		Meteor.call('config.update', {$set: {phase: "ObtainGCSServiceAccountKeyInJson"}});
	},

	'click #resetConfig'(event) {
		Meteor.call('config.update', {$set: {phase: "Start"}});
	}
})