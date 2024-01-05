import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Config } from '/imports/models/config';

import "./obtainKey.html";

Template.ObtainGCSKey.onCreated(function() {

});

Template.ObtainGCSKey.helpers({

});

Template.ObtainGCSKey.events({
	"click #submitKey"(event) {
		const keyJson = document.getElementById("GCSKey").value;
		Meteor.call('config.update', {$set: {GCSKey: keyJson, phase: "IdentifyGCSBucket"}});
	},

	"click #resetPhase"(event) {
		Meteor.call('config.update', {$set: {phase: "Start"}})
	}
})