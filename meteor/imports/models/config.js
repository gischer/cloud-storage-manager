import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { AppConfig } from '/imports/startup/config';

export const Config = new Mongo.Collection('config');

export const Phases = ["Start", "ObtainGCSServiceAccountKeyInJson", "IdentifyGCSBucket", "Complete"];

export const ConfigSchema = new SimpleSchema({
	phase: {type: String, allowedValues: Phases},
	bucketName: {type: String, optional: true},
});

var ResetConfig = true;

export function initializeConfig() {
	const config = Config.findOne();

	if (config == null || AppConfig.resetOnStartup ) {
		Config.remove({});
		Config.insert({phase: "Start"});
		console.log('config reset');
	}
}

Meteor.methods({
	"config.update"(update) {
		// There's only one config, so an id is not needed, but we have to
		// get it anyway.
		const id = Config.findOne()._id;
		Config.update(id, update);
	}
});

if (Meteor.isServer) {
	Meteor.publish('config', function() {
		return Config.find({});
	});
	console.log('publish');
};
