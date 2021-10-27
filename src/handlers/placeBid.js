import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getAuctionById } from "../utils/getAuctionByid";

// Ver a documentação do aws-sdk
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters; //aws, event da requisição
  const { amount } = event.body;

  console.log(`thiago patch`, event.body);

  const auction = await getAuctionById(id);

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Bid must be higher than current bid, ${auction.highestBid.amount} `
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    // Vamos mudar o valor do amount, para isso vamos usar UpdateExpression
    // set o novo valor usando `set` passando o highestBid, e o amount
    // recuperar ele, e setar ele como amount agora
    UpdateExpression: "set highestBid.amount = :amount",
    // Mudar o valor do amount referenciado acima por esse novo
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    // Assim que for concluido essa acao, retorna pra min todos os valores, daquela chave.
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;

  try {
    const result = await dynamoDb.update(params).promise();
    // Agora vamos receber do resultado os attributos.
    updatedAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid);
// caso ele precise de um tratamento diferenciado. So enviar .use...
