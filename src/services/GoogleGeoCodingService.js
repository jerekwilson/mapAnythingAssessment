/**
 * Created by jerek wilson 12/11/18
 */

let axios = require('axios');
let nconf = require('nconf');

exports.getAddress = function(address) {    

    let path = nconf.get('googleMapsGeocodeURL');
    console.debug("Geocode Path: " + path);
    return axios.get(path, {
        params: {
            address: address,
            key: nconf.get('googleAPIKey')
        }
    });

 };
