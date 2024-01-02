import { Template } from 'meteor/templating';

import { Config } from '/imports/models/config';

import './phase.html';

Template.Phase.onCreated(function() {
	const self = this;
	this.autorun(function() {
		self.configHandle = self.subscribe('config');
	})
});

Template.Phase.helpers({
	dataReady() {
		return Template.instance().subscriptionsReady();
	},

	phase() {
		const config = Config.findOne();
		if (typeof config === 'undefined') {
			return "Not Ready";
		}
		return config.phase;
	}
});