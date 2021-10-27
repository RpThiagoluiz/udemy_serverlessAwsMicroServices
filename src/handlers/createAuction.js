import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

// Ver a documentação do aws-sdk
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  // event -> teremos acesso a ele quando a lambda for chamada
  // headers, body, path, pathParameters, queryStringParameters, stageVariables

  // context -> teremos acesso a ele quando a lambda for chamada
  // context, vc pode usa custom dados, middlewares, etc

  // Sempre bom seguir esse padrao de resposta, {StatusCode, Body}
  // Vem como Json vc precisa usar o stringify

  const body = event.body;

  // Vc nao precisar mais passar o parse, devido a middy
  // const { title, description, initialPrice, deadline } = JSON.parse(event.body);

  const now = new Date();

  const auction = {
    id: uuid(),
    title: body?.title,
    status: "OPEN",
    description: body?.description,
    createdAt: now.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  try {
    // salvar na tabela, precisa esperara ate ele seguir
    // Toda acao da aws, vc precisa usar o `await` e o `async`, resolvendo a promisse

    await dynamoDb
      .put({
        // TableName: "AuctionsTable-dev",
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();

    // precisa ter acesso, se nao vc ganha um 502 na mulera.
    // vc pode usar isso pelo cloudformation iamRoleStatements, ou pelo console da aws
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);

    // throw new createError.Unauthorized("Unauthorized");
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Auction created", auction }),
  };
}

export const handler = commonMiddleware(createAuction);

// export const handler = middy(createAuction)
//   // middlewares
//   // parserar o body automatico
//   .use(httpJsonBodyParser())
//   // ajudar o apiGateWay a entender o evento
//   .use(httpEventNormalizer())
//   .use(httpErrorHandler());

// export const handler = createAuction;
