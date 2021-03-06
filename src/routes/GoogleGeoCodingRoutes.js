var express = require('express');
let nconf = require('nconf');
let GeoCodingService = require('../services/GoogleGeoCodingService');
let DBService = require('../services/DBService');
let UtilityService = require('../services/UtilityService');
let addresses = [];

module.exports = function(app){
    let route = express.Router();


    app.use('/geocoding', route);

    route.get('/', async function(req, res, next){
        console.log('reqest body',req.body);
        if(req.body.address !== undefined && req.body.token !== undefined){

            let userInfo = UtilityService.validToken(req.body.token);

            if(userInfo && userInfo.Item){

                if(userInfo.Item.info.credits > 0){

                    GeoCodingService.getAddress(req.body.address)
                    .then(function(address){
                        console.log(address.data)
                        userInfo.Item.info.credits = userInfo.Item.info.credits - 1;
                        DBService.updateItem("Tokens", userInfo.Item)
                            .then(function(userInfo){
                                console.log('Updated User Info')
                                console.log(userInfo)
                                res.statusCode = 202
                                res.send({
                                    status: "success",
                                    address: address.data,
                                    userInfo: userInfo.Attributes

                                })

                            })
                            .catch(function(){
                                res.statusCode = 500
                                res.send({
                                    status: "error",
                                    message: "unable to update account. Please try again"
                                })
                            });
                    })
                    .catch(function(error){
                        if (error.response) {
                            // The request was made and the server responded with a status code
                            // that falls out of the range of 2xx
                            console.log('error', "Error occured obtaining address info:")
                            console.log('error',error.response.data);
                            res.send({
                                error: error.response.data,
                                status: error.response.status
                            })
                        } else if (error.request) {
                            // The request was made but no response was received
                            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                            // http.ClientRequest in node.js
                            console.log('error',error.request);
                            res.send({
                                request: error.request
                            })
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            console.log('error','Error', error.message);
                            res.send({
                                message: error.message
                            })
                        }
                        next(error);
                    })
                }
                else{
                    res.statusCode = 403;
                    res.send({
                        status: 'error',
                        message: 'insufficent credits: 1 credit is required for this service',
                        user: userInfo
                    });
                }
            }
            else{
                res.statusCode = 400;
                res.send({
                    status: 'error',
                    message: 'token not formated correctly or could not be found. Should be the following "user:plan"',
                    requestBody: req.body
                });
            }
        }
        else {
            res.statusCode = 400;
            res.send({
                status: 'error',
                message: 'invalid parameters',
                requestBody: req.body
            });
        }
    })

    route.get('/batch', async function(req, res, next){
        console.log('reqest body',req.body);
        if(req.body.addresses !== undefined && req.body.token !== undefined){

            let userInfo = await UtilityService.validToken(req.body.token);

            if(userInfo && userInfo.Item){

                console.log("Attempting to batch "+req.body.addresses.length+" addresses 5 at a time for user: "+userInfo.Item.user);


                if(userInfo.Item.info.credits > req.body.addresses.length){

                    addAddressesToBatch(userInfo,req.body.addresses);

                    let addressesToProcess = [];
                    addresses.forEach(address => {
                        addressesToProcess.push(processAddress(address))

                    });
                    
                    addresses = [];
                    
                    Promise.all(addressesToProcess).then(function(responses){

                        userInfo.Item.info.credits = userInfo.Item.info.credits - req.body.addresses.length;
                        DBService.updateItem("Tokens", userInfo.Item)
                            .then(function(userInfo){
                                console.log('Updated User Info')
                                console.log(userInfo)
                                res.statusCode = 202
                                res.send({
                                    status: "success",
                                    addressBatch: responses,
                                    userInfo: userInfo.Attributes

                                })

                            })
                            .catch(function(){
                                res.statusCode = 500
                                res.send({
                                    status: "error",
                                    message: "unable to update account. Please try again"
                                })
                            });
                    })

                }
                else{
                    res.statusCode = 403;
                    res.send({
                        status: 'error',
                        message: 'insufficent credits: '+req.body.addresses.length+' credits are required for this batch process',
                        user: userInfo
                    });
                }
            }
            else{
                res.statusCode = 400;
                res.send({
                    status: 'error',
                    message: 'token not formated correctly or could not be found. Should be the following "user:plan"',
                    requestBody: req.body
                });
            }
        }
        else {
            res.statusCode = 400;
            res.send({
                status: 'error',
                message: 'invalid parameters',
                requestBody: req.body
            });
        }    
    })

}


function addAddressesToBatch(userInfo, addressesToBatch){
    addressesToBatch.forEach(address => {

        addressToBatch = {
            userInfo: userInfo,
            addressText: address
        }

        addresses.push(addressToBatch);
        
    });
}

function processAddress(addressToBatch){
    
    return new Promise(function(resolve, reject){
        
        GeoCodingService.getAddress(addressToBatch.addressText)
        .then(function(address){
            console.log(address.data)
            resolve({
                status: "success",
                address: addressToBatch.addressText,
                data: address.data
            })

        })
        .catch(function(error){
            resolve({
                status: "failure",
                address: addressToBatch.addressText,
                error: error
            })
        })
    })
}