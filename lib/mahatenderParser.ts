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

export type MahaTenderTableRow = string[];

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

function isHeaderRow(cells: string[]) {
  const joined = cells.join(" ").toLowerCase();
  return /tender.*(?:no|id)|work.*name|closing|department|bid.*submission/.test(joined);
}

function isLikelyTenderRow(cells: string[]) {
  const joined = cells.join(" ");
  return (
    cells.length >= 4 &&
    /tender|work|nit|bid|estimated|closing|open|submission|department|organisation|organization/i.test(joined) &&
    new RegExp(DATE_PATTERN.source, "i").test(joined)
  );
}

function bestTitleCell(cells: string[]) {
  const candidates = cells
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 18)
    .filter((cell) => !/view|download|corrigendum|bid|date|amount|emd|fee|department|organisation|organization|closing|opening/i.test(cell));

  return candidates.sort((a, b) => b.length - a.length)[0]?.slice(0, 260) ?? "";
}

function parseRow(cells: string[], pageUrl = ""): ParsedTender | null {
  if (isHeaderRow(cells) || !isLikelyTenderRow(cells)) return null;

  const block = cells.join("\n");
  const dates = Array.from(block.matchAll(DATE_PATTERN)).map((match) => match[0]);
  const title = bestTitleCell(cells) || titleFrom(block);
  if (!title) return null;

  const department =
    cells.find((cell) => /department|organisation|organization|authority|client/i.test(cell)) ??
    cells.find((cell) => /corporation|department|pwd|zp|municipal|irrigation|maharashtra/i.test(cell)) ??
    "MahaTender";
  const location =
    cells.find((cell) => /district|jalna|pune|mumbai|nashik|nagpur|aurangabad|chhatrapati|maharashtra/i.test(cell)) ??
    "Maharashtra";
  const valueCell = cells.find((cell) => /(?:rs\.?|inr|\u20b9)\s*[\d,]+|[\d,]+(?:\.\d+)?\s*(?:lakh|cr|crore)/i.test(cell));
  const link = block.match(/https?:\/\/\S+/i)?.[0] ?? pageUrl;

  return {
    title,
    department: department.slice(0, 180),
    location: location.slice(0, 120),
    value: valueCell ? moneyFrom(valueCell).replace(/,/g, "") : "",
    startDate: normalizeDate(dates[0]) || todayInput(),
    endDate: normalizeDate(dates[dates.length - 1]) || todayInput(),
    onlineLink: link,
    notes: `Imported from MahaTender table row.\n\n${block.slice(0, 1800)}`,
  };
}

export function parseMahaTenderTables(tables: MahaTenderTableRow[][] = [], pageUrl = "") {
  const rows = tables.flat();
  const tenders = rows.map((row) => parseRow(row, pageUrl)).filter(Boolean) as ParsedTender[];
  const seen = new Set<string>();

  return tenders.filter((tender) => {
    const key = `${tender.title}|${tender.endDate}|${tender.department}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
