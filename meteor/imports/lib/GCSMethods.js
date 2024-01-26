import { Meteor } from 'meteor/meteor';
import { Storage } from '@google-cloud/storage'

import { Bucket } from '/imports/models/buckets';
import { Config } from '/imports/models/config';

if (Meteor.isServer) {
	Meteor.method('signedUrl.listFiles', function(args) {
		const config = Config.findOne();
		const storageArgs = {
			
		}
	})
}