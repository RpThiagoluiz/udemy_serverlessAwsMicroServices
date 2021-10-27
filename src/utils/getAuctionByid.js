import AWS from "aws-sdk";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
export async function getAuctionById(id) {
  let auction;

  try {
    // Query no lugar do scan, queremos apenas um registro
    const result = await dynamoDb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    auction = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction not found, "id: ${id}" .`);
  }

  return auction;
}
