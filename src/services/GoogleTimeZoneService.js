/**
 * Created by jerek wilson 12/11/18
 */

let axios = require('axios');
let nconf = require('nconf');

exports.getTimeZone = function(location,timestamp) {    

    let path = nconf.get('googleMapsTimezoneURL');
    console.debug("Timezone Path: " + path);
    console.debug("location: "+location);
    return axios.get(path, {
        params: {
            location: location,
            timestamp: timestamp,
            key: nconf.get('googleAPIKey')
        }
    });

 };