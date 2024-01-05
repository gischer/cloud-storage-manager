import { Meteor } from 'meteor/meteor';

import { initializeConfig } from '/imports/models/config'

Meteor.startup(() => {
  console.log('startup')
  initializeConfig();
  // code to run on server at startup
});
