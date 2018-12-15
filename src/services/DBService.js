var AWS = require("aws-sdk");

AWS.config.loadFromPath('config.json');
AWS.config.update({
    region: "us-east-2",
    endpoint: "https://dynamodb.us-east-2.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

exports.addItem = function(table, item){

    var addParams = {
        TableName: table,
        Item: {
            "user": item.user,
            "plan": item.plan,
            "info": item.info
        }
    }

    return docClient.put(addParams).promise() 
    
    // , function(err, data){
    //     if (err) {
    //         console.error("Unable to add item to Table: ", Table, ". Error JSON:", JSON.stringify(err, null, 2));
    //     } else {
    //         console.log("Added Item to Table: ", movie.title);
    //     }
    // })

}


exports.getItem = function(table, user, plan){
    var getParams = {
        TableName: table,
        Key: {
            "user": user,
            "plan": plan
        }
    }

    return docClient.get(getParams).promise()
    // , function(err, data) {
    //     if (err) {
    //         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    //         return null;
    //     } else {
    //         console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    //         return data;
    //     }
    // });
}

exports.updateItem = function(table, item){
    var updateParams = {
        TableName:table,
        Key:{
            "user": item.user,
            "plan": item.plan
        },
        UpdateExpression: "set info.credits = :c",
        ExpressionAttributeValues:{
            ":c": item.info.credits
        },
        ReturnValues:"ALL_NEW"
    }

    return docClient.update(updateParams).promise()
    // , function(err, data) {
    //     if (err) {
    //         console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    //     } else {
    //         console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    //     }
    // });

}

exports.deleteItem = function(table, user, plan){
    var deleteParams = {
        TableName:table,
        Key:{
            "user": user,
            "plan": plan
        },
    };

    return docClient.delete(deleteParams).promise()
    // , function(err, data) {
    //     if (err) {
    //         console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    //     } else {
    //         console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    //     }
    // });
}