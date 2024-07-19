import { Meteor } from 'meteor/meteor';

import { initializeConfig } from '/imports/models/config';


import "/imports/models/config";
import "/imports/models/GCS";
import "/imports/lib/powerbox";

Meteor.startup(() => {
  console.log('startup')
  initializeConfig();
  // code to run on server at startup
  const name = 'projects/-/serviceAccounts/sweetvine-testing-service-acco@sweetvine-systems-infra.iam.gserviceaccount.com';
  //getAuthToken(name);
  Router.route('/funky', function () {
  this.render('Home', {
    data: function () { return {a: 1, b:2}; }
  });
});
});
