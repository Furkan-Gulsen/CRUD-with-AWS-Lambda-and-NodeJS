# CRUD with AWS Lambda and NodeJS

We are creating our serverless application with the following command:

```Shell
serverless create --template aws-nodejs
```

To push changes to the AWS system:

```Shell
sls deploy
```

To install the npm service:

```Shell
npm init
npm i --save serverless-webpack
npm i --save webpack
```

Then we create a file called webpack.config.js and enter the following two lines:

```yaml
module.exports = {
  target: "node",
  mode: "none",
};
```

We also edit the contents of the serverless.yml file as follows:

```yaml
service: aws-nodejs

frameworkVersion: "3"

provider:
  name: aws
  runtime: nodejs12.x

plugins:
  - serverless-webpack

package:
  individually: true

functions:
  hello:
    handler: handler.hello
```

To add the DynamoDB database to our service, we enter the following commands in the serverless.yml file:

```yaml
custom:
  tableName: aws-nodejs-table

resources:
  Resources:
    MyFirstDynamoDBTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.tableName}
        AttributeDefinitions:
          - AttributeName: ID
            AttributeType: N
        KeySchema:
          - AttributeName: ID
            KeyType: HASH
        BillingMode: PAY_PER_REQUE
```

API response is required to perform the get operation. For this, we create a folder called lambdas in our project. Then we create two more folders named common and endpoint. We create a file named API_Responses.js inside the Common folder. In the endpoint folder, we create a file called getItem.js.

## Get

```javascript
const Responses = {
  _200(data = {}) {
    return {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify(data),
    };
  },
  _400(data = {}) {
    return {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 400,
      body: JSON.stringify(data),
    };
  },
};

module.exports = Responses;
```

We add the following to the provider in the serverless.yml file:

```yaml
environment:
  tableName: ${self:custom.tableName}
```

We added these to get the tableName from the getItem.js file that we will write now.

```javascript
const Responses = require("../common/API_Responses");
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.tableName;

exports.handler = async (event) => {
  if (!event.pathParameters || !event.pathParameters.ID) {
    Responses._400({ message: "ID or parameters not found" });
  }

  let id = event.pathParameters.ID;
  let params = {
    TableName,
    Key: {
      ID: parseInt(id),
    },
  };

  const res = documentClient.get(params).promise();
  return Responses._200(res);
};
```

Finally; Since we have added a function, we need to specify it in the serverless.yml file:

```yaml
functions:
  hello:
    handler: handler.hello
  getItem:
    handler: lambdas/endpoints/getItem.handler
    events:
      - http:
          path: get-item/{ID}
          method: GET
          cors: true
```

## Create

For the create process, we create a file named createItem in the endpoints folder. Then we write the following codes in the file:

```javascript
const Responses = require("../common/API_Responses");
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.tableName;

exports.handler = async (event) => {
  if (!event.pathParameters || !event.pathParameters.ID) {
    Responses._400({ message: "ID or parameters not found" });
  }

  let newItem = JSON.parse(event.body);

  let params = {
    TableName,
    Item: {
      ID: newItem.ID,
      FirstName: newItem.FirstName,
      LastName: newItem.LastName,
      Department: newItem.Department,
    },
  };

  const res = await documentClient.put(params).promise();
  return Responses._200(res);
};
```

Then, to create a Lambda function to represent this endpoint, we add the following lines under functions in the serverless file:

```yaml
createItem:
  handler: lambdas/endpoints/getItem.handler
  events:
    - http:
        path: create-item/{ID}
        method: POST
        cors: true
```

## Delete

For the delete operation, we create a file named deleteItem in the endpoints folder. Then we write the following codes in the file:

```javascript
const Responses = require("../common/API_Responses");
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.tableName;

exports.handler = async (event) => {
  if (!event.pathParameters || !event.pathParameters.ID) {
    Responses._400({ message: "ID or parameters not found" });
  }

  let id = event.pathParameters.ID;

  let params = {
    TableName,
    Key: {
      ID: parseInt(id),
    },
  };

  const res = await documentClient.delete(params).promise();
  return Responses._200(res);
};
```

Then, to create a Lambda function to represent this endpoint, we add the following lines under functions in the serverless file:

```yaml
deleteItem:
  handler: lambdas/endpoints/deleteItem.handler
  events:
    - http:
        path: delete-item/{ID}
        method: DELETE
        cors: true
```

## Update

For the update process, we create a file called updateItem in the endpoints folder. Then we write the following codes in the file:

```javascript
const Responses = require("../common/API_Responses");
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.tableName;

exports.handler = async (event) => {
  if (!event.pathParameters || !event.pathParameters.ID) {
    Responses._400({ message: "ID or parameters not found" });
  }

  let id = event.pathParameters.ID;
  let updatedBody = JSON.parse(event.body);

  let params = {
    TableName,
    Key: {
      ID: parseInt(id),
    },
    UpdateExpression: "SET FirstName=:fn, LastName=:ln, Department=:dp",
    ExpressionAttributeValues: {
      ":fn": updatedBody.FirstName,
      ":ln": updatedBody.LastName,
      ":dp": updatedBody.Department,
    },
    ReturnValues: "UPDATED_NEW",
  };

  const res = await documentClient.update(params).promise();
  return Responses._200(res);
};
```

Then, to create a Lambda function to represent this endpoint, we add the following lines under functions in the serverless file:

```yaml
updateItem:
  handler: lambdas/endpoints/updateItem.handler
  events:
    - http:
        path: update-item/{ID}
        method: PUT
        cors: true
```
