import { Meteor } from 'meteor/meteor';

import { initializeConfig } from '/imports/models/config';
import { getAuthToken } from '/imports/lib/GCSIamCredentials';


import "/imports/models/config";
import "/imports/models/GCS";


Meteor.startup(() => {
  console.log('startup')
  initializeConfig();
  // code to run on server at startup
  const name = 'projects/-/serviceAccounts/sweetvine-testing-service-acco@sweetvine-systems-infra.iam.gserviceaccount.com';
  //getAuthToken(name);
});
