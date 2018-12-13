var express = require('express');
let nconf = require('nconf');
let GeoCodingService = require('../services/GoogleGeoCodingService');

module.exports = function(app){
    let route = express.Router();


    app.use('/geocoding', route);

    route.get('/', function(req, res, next){
        console.log('reqest body',req.body);
        if(req.body.address !== undefined && req.body.token !== undefined){
            GeoCodingService.getAddress(req.body.address, req.body.token)
            .then(function(address){
                console.log(address.data)
                res.statusCode = 202
                res.send({
                    status: "success",
                    address: address.data
                })
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