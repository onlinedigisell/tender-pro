import { prisma } from "../../../../lib/prisma";
import { fetchTenderSource } from "../../../../lib/tenderFetch";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sourceId = body.sourceId as string | undefined;

  const sources = await prisma.tenderSource.findMany({
    where: sourceId ? { id: sourceId } : undefined,
  });

  const result = {
    checked: sources.length,
    added: 0,
    errors: [] as string[],
  };

  for (const source of sources) {
    try {
      const fetched = await fetchTenderSource(source);

      for (const item of fetched) {
        const existing = await prisma.externalTender.findUnique({
          where: {
            sourceId_link: {
              sourceId: source.id,
              link: item.link,
            },
          },
        });

        if (existing) continue;

        await prisma.externalTender.create({
          data: {
            sourceId: source.id,
            title: item.title,
            link: item.link,
            summary: item.summary,
          },
        });

        await prisma.notification.create({
          data: {
            message: `New live tender from ${source.name}: ${item.title}`,
          },
        });

        result.added += 1;
      }

      await prisma.tenderSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date() },
      });
    } catch (error) {
      result.errors.push(
        `${source.name}: ${error instanceof Error ? error.message : "Fetch failed"}`,
      );
    }
  }

  return Response.json(result);
}
