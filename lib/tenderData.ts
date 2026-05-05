export function numberOrNull(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function dateOrNull(value: unknown) {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function tenderPayload(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? ""),
    department: String(body.department ?? ""),
    location: String(body.location ?? ""),
    value: numberOrNull(body.value),
    startDate: new Date(String(body.startDate)),
    endDate: new Date(String(body.endDate)),
    status: String(body.status || "OPEN"),
    onlineLink: body.onlineLink ? String(body.onlineLink) : null,
    bidDecision: String(body.bidDecision || "PENDING"),
    documentPrepared: Boolean(body.documentPrepared),
    bidSubmitted: Boolean(body.bidSubmitted),
    quotedRate: numberOrNull(body.quotedRate),
    actualTenderCost: numberOrNull(body.actualTenderCost),
    tenderExpense: numberOrNull(body.tenderExpense),
    resultStatus: String(body.resultStatus || "PENDING"),
    workCompleted: Boolean(body.workCompleted),
    workDoneCertificate: Boolean(body.workDoneCertificate),
    completionDate: dateOrNull(body.completionDate),
    notes: body.notes ? String(body.notes) : null,
  };
}
