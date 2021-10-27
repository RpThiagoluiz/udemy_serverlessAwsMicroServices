import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

// Ver a documentação do aws-sdk
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  try {
    const result = await dynamoDb
      .scan({
        TableName: process.env.AUCTIONS_TABLE_NAME,
      })
      .promise();

    auctions = result.Items;
  } catch (error) {
    console.log(error);
    // Tratar o error antes de enviar ele para o frontend.
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions);

// export const handler = middy(getAuctions)
//   // middlewares
//   // parserar o body automatico
//   .use(httpJsonBodyParser())
//   // ajudar o apiGateWay a entender o evento
//   .use(httpEventNormalizer())
//   .use(httpErrorHandler());

// export const handler = getAuctions;
