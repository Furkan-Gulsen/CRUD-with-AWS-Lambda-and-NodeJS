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
