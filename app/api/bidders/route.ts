import { prisma } from "../../../lib/prisma";
import { bidderPayload } from "../../../lib/bidderData";

export async function GET() {
  const bidders = await prisma.bidder.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      tender: {
        select: {
          id: true,
          title: true,
          department: true,
          endDate: true,
        },
      },
    },
  });

  return Response.json(bidders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const bidder = await prisma.bidder.create({
    data: bidderPayload(body),
  });

  return Response.json(bidder);
}
