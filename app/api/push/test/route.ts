import { sendPushNotification } from "../../../../lib/push";

export async function POST() {
  const result = await sendPushNotification({
    title: "Tender Pro notifications enabled",
    body: "You will receive tender deadline reminders on this device.",
    url: "/",
  });

  return Response.json(result);
}
