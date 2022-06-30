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
