/**
 * Created by jerek wilson 12/11/18
 */

let axios = require('axios');
let nconf = require('nconf');
let DBService = require('./DBService');

exports.validToken = async function(token){
    //Find user or create it if it doesn't exist
    let tokenParts = token.split(":")
    let user = tokenParts[0];
    let plan = parseInt(tokenParts[1]);

    if(!isNaN(plan) && plan > 3){
        plan = 3;
    }
    if(!isNaN(plan) && plan < 1){
        plan = 1;
    }


    let userInfo;
    if(tokenParts.length == 2 && !isNaN(plan)){
        try{
            userInfo = await DBService.getItem("Tokens",user,plan);
            console.log('User Info retrieved');
            console.log(userInfo);
            
            if(!userInfo.Item){
                console.log('token: '+token +' not found, creating token')
                let item = {
                    user: user,
                    plan: plan,
                    info: {
                        credits: plan * 10
                    }
                }
                await DBService.addItem("Tokens",item);
                userInfo = await DBService.getItem("Tokens",user,plan);
                console.log('token: '+token+" successfully created")
                console.log(userInfo)

            }

            return userInfo;

        }
        catch(error){
            console.log(error);
            return null; 
        }
    }
    else{
        return null;
    }
}