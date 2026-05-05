import { prisma } from "../../../lib/prisma";

export async function GET() {
  const tenders = await prisma.externalTender.findMany({
    orderBy: { fetchedAt: "desc" },
    take: 100,
    include: {
      source: {
        select: {
          name: true,
          url: true,
        },
      },
    },
  });

  return Response.json(tenders);
}
