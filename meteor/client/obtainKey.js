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
		const fReader = new FileReader();
		fReader.onload = function() {
			Meteor.call('GCS.submitPem', fReader.result);
		}
		const fileElement = document.getElementById("pemFile");
		fReader.readAsText(fileElement.files[0]);
	},

	"click #resetPhase"(event) {
		Meteor.call('config.update', {$set: {phase: "Start"}})
	}
})