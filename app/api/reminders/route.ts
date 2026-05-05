import { runTenderReminderCheck } from "../../../lib/reminders";

export async function GET() {
  const result = await runTenderReminderCheck();

  return Response.json({
    message: "Reminder check completed",
    ...result,
  });
}
