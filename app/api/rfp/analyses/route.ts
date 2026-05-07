import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const analyses = await prisma.rfpAnalysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json(analyses);
}
