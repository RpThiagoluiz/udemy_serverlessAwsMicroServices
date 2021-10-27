import commonMiddleware from "../lib/commonMiddleware";
import { getAuctionById } from "../utils/getAuctionByid";

// Ver a documentação do aws-sdk
async function getAuction(event, context) {
  const { id } = event.pathParameters; //aws, event da requisição

  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);
// caso ele precise de um tratamento diferenciado. So enviar .use...
