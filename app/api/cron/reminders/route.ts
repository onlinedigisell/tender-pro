import { runTenderReminderCheck } from "../../../../lib/reminders";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runTenderReminderCheck();

  return Response.json({
    ok: true,
    ...result,
  });
}
