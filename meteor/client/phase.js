import { Template } from 'meteor/templating';

import { Config } from '/imports/models/config';

import './phase.html';
import './starting';
import './obtainKey';
import './identifyGCSBucket';
import './cloudStorageManager/cloudStorageManager';

Template.Phase.onCreated(function() {
	const self = this;
	this.autorun(function() {
		self.configHandle = self.subscribe('config');
	})
});

const PhaseTitleMap = {
	Start: "Starting",
	ObtainGCSServiceAccountKeyInJson: "Obtain GCS Service Account Key",
	IdentifyGCSBucket: "Specify a GCS Bucket Name",
	Complete: "",
	//Complete: "View and Manage Your Files",
}

Template.Phase.helpers({
	dataReady() {
		return Template.instance().subscriptionsReady();
	},

	phase() {
		return getPhase();
	},

	starting() {
		return getPhase() === "Start";
	},

	obtainGCSKey() {
		return getPhase() === "ObtainGCSServiceAccountKeyInJson";
	},

	identifyGCSBucket() {
		return getPhase() === "IdentifyGCSBucket";
	},

	complete() {
		return getPhase() === "Complete";
	},

	phaseTitle() {
		return PhaseTitleMap[getPhase()];
	}
});

function getPhase() {
	const config = Config.findOne();
	if (typeof config === 'undefined') {
		return "Not Ready"
	}
	return config.phase;
}