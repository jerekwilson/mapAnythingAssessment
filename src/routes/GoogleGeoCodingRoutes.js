var express = require('express');
let nconf = require('nconf');
let GeoCodingService = require('../services/GoogleGeoCodingService');
let DBService = require('../services/DBService');

module.exports = function(app){
    let route = express.Router();


    app.use('/geocoding', route);

    route.get('/', async function(req, res, next){
        console.log('reqest body',req.body);
        if(req.body.address !== undefined && req.body.token !== undefined){

            let tokenParts = req.body.token.split(":")
            let user = tokenParts[0];
            let plan = parseInt(tokenParts[1]);
            let userInfo;
            if(tokenParts.length == 2 && !isNaN(plan)){
                try{
                    userInfo = await DBService.getItem("Tokens",user,plan);
                    console.log('User Info retrieved');
                    console.log(userInfo);
                    
                    if(!userInfo.Item){
                        console.log('token: '+req.body.token +' not found, creating token')
                        let item = {
                            user: user,
                            plan: plan,
                            info: {
                                credits: plan * 10
                            }
                        }
                        await DBService.addItem("Tokens",item);
                        userInfo = await DBService.getItem("Tokens",user,plan);
                        console.log('token: '+req.body.token+" successfully created")
                        console.log(userInfo)

                    }

                }
                catch(error){
                    console.log(error);
                    res.statusCode = 400;
                    res.send({
                        status: 'error',
                        message: 'token not found',
                        error: error
                    });
                    return;
                }

            }
            else{
                res.statusCode = 400;
                res.send({
                    status: 'error',
                    message: 'token not formated correctly. Should be the following "user:plan"',
                    requestBody: req.body
                });
                return;
            }

            if(userInfo.Item.info.credits > 0){

                GeoCodingService.getAddress(req.body.address, req.body.token)
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
                    message: 'insufficent credits',
                    user: userInfo
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