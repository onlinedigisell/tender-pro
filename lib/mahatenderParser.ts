import { tenderPayload } from "./tenderData";

type ParsedTender = {
  title: string;
  department: string;
  location: string;
  value: string;
  startDate: string;
  endDate: string;
  onlineLink: string;
  notes: string;
};

const DATE_PATTERN =
  /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b|\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})\b/gi;

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDate(value?: string) {
  if (!value) return "";
  const trimmed = value.trim();
  const numeric = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (numeric) {
    const day = numeric[1].padStart(2, "0");
    const month = numeric[2].padStart(2, "0");
    const year = numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function moneyFrom(line: string) {
  const value =
    line.match(/(?:rs\.?|inr|\u20b9)\s*[\d,]+(?:\.\d+)?/i)?.[0] ??
    line.match(/[\d,]+(?:\.\d+)?\s*(?:lakh|lakhs|cr|crore)/i)?.[0] ??
    "";
  return value.replace(/rs\.?|inr|\u20b9/gi, "").trim();
}

function departmentFrom(block: string) {
  const line =
    block
      .split("\n")
      .find((item) => /department|organisation|organization|authority|client/i.test(item)) ?? "";
  return line.replace(/department|organisation|organization|authority|client|name|:|-/gi, "").trim();
}

function locationFrom(block: string) {
  const line = block.split("\n").find((item) => /district|location|place|city/i.test(item)) ?? "";
  return line.replace(/district|location|place|city|:|-/gi, "").trim();
}

function titleFrom(block: string) {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/tender no|date|amount|emd|fee|department|organisation|organization/i.test(line));

  return lines.find((line) => line.length > 18)?.slice(0, 260) ?? lines[0]?.slice(0, 260) ?? "";
}

function splitTenderBlocks(text: string) {
  const normalized = text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const byBlank = normalized.split(/\n\s*\n/).filter((block) => /tender|work|nit|bid/i.test(block));

  if (byBlank.length > 1) return byBlank;

  return normalized
    .split(/(?=Tender\s*(?:No|ID|Ref)|(?=NIT\s*(?:No|ID))|(?=Work\s*Name))/i)
    .map((block) => block.trim())
    .filter((block) => block.length > 30);
}

export function parseMahaTenderText(text: string): ParsedTender[] {
  const blocks = splitTenderBlocks(text);
  const fallbackDate = todayInput();

  return blocks
    .map((block) => {
      const dates = Array.from(block.matchAll(DATE_PATTERN)).map((match) => match[0]);
      const title = titleFrom(block);
      const department = departmentFrom(block) || "MahaTender";
      const location = locationFrom(block) || "Maharashtra";
      const valueLine = block
        .split("\n")
        .find((line) => /tender value|estimated|amount|cost put|value/i.test(line));
      const link = block.match(/https?:\/\/\S+/i)?.[0] ?? "";

      return {
        title,
        department,
        location,
        value: valueLine ? moneyFrom(valueLine).replace(/,/g, "") : "",
        startDate: normalizeDate(dates[0]) || fallbackDate,
        endDate: normalizeDate(dates[dates.length - 1]) || fallbackDate,
        onlineLink: link,
        notes: `Imported from MahaTender assisted import.\n\n${block.slice(0, 1800)}`,
      };
    })
    .filter((item) => item.title);
}

export function mahatenderImportPayload(parsed: ParsedTender) {
  return tenderPayload({
    ...parsed,
    status: "OPEN",
    bidDecision: "PENDING",
    documentPrepared: false,
    bidSubmitted: false,
    resultStatus: "PENDING",
  });
}
