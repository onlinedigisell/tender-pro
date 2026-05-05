import { numberOrNull } from "./tenderData";

export function bidderPayload(body: Record<string, unknown>) {
  return {
    tenderId: String(body.tenderId ?? ""),
    bidderName: String(body.bidderName ?? ""),
    contactPerson: body.contactPerson ? String(body.contactPerson) : null,
    phone: body.phone ? String(body.phone) : null,
    quotedAmount: numberOrNull(body.quotedAmount),
    percentBelow: numberOrNull(body.percentBelow),
    rank: numberOrNull(body.rank),
    isWinner: Boolean(body.isWinner),
    remarks: body.remarks ? String(body.remarks) : null,
  };
}
