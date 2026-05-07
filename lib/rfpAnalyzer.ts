type AnalysisInput = {
  fileName: string;
  text: string;
};

export type RfpAnalysisResult = {
  fileName: string;
  tenderTitle: string;
  department: string;
  tenderValue: string;
  summary: string;
  liveDate: string;
  openingDate: string;
  submissionDate: string;
  lastDate: string;
  eligibility: string;
  evaluationMethod: string;
  markingSystem: string;
  requiredDocuments: string;
  physicalSubmission: string;
  emdAmount: string;
  tenderFee: string;
  similarWork: string;
  technicalRequirements: string;
  financialRequirements: string;
  importantClauses: string;
  riskyClauses: string;
  keyCriteria: string;
  rawText: string;
};

const DATE_PATTERN =
  /(?:\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{2,4}\b)/gi;

function cleanText(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function lines(text: string) {
  return cleanText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findLine(allLines: string[], keywords: string[]) {
  return (
    allLines.find((line) =>
      keywords.some((keyword) => line.toLowerCase().includes(keyword.toLowerCase())),
    ) ?? ""
  );
}

function findBlock(allLines: string[], keywords: string[], maxLines = 5) {
  const index = allLines.findIndex((line) =>
    keywords.some((keyword) => line.toLowerCase().includes(keyword.toLowerCase())),
  );

  if (index === -1) return "";

  return allLines.slice(index, index + maxLines).join(" ");
}

function findDateNear(allLines: string[], keywords: string[]) {
  const block = findBlock(allLines, keywords, 4);
  return block.match(DATE_PATTERN)?.[0] ?? "";
}

function findMoneyNear(allLines: string[], keywords: string[]) {
  const block = findBlock(allLines, keywords, 4);
  const money =
    block.match(/(?:rs\.?|inr|\u20b9)\s*[\d,]+(?:\.\d+)?(?:\s*(?:lakh|lakhs|cr|crore))?/i)?.[0] ??
    block.match(/[\d,]+(?:\.\d+)?\s*(?:lakh|lakhs|cr|crore)/i)?.[0] ??
    "";

  return money;
}

function titleFromText(allLines: string[]) {
  const tenderTitle = findLine(allLines, ["name of work", "tender title", "work of", "request for proposal"]);
  if (tenderTitle) return tenderTitle.slice(0, 240);

  return allLines.find((line) => line.length > 20 && line.length < 220)?.slice(0, 240) ?? "RFP Analysis";
}

function departmentFromText(allLines: string[]) {
  const line = findLine(allLines, ["department", "client", "authority", "employer", "organization"]);
  return line.slice(0, 220);
}

function evaluationMethod(text: string) {
  const value = text.toLowerCase();
  if (value.includes("qcbs") || value.includes("quality and cost")) {
    return "QCBS / Quality and Cost Based Selection";
  }
  if (value.includes("least cost") || value.includes("l1") || value.includes("lowest bidder")) {
    return "L1 / Lowest Cost Based Selection";
  }
  if (value.includes("technical score") || value.includes("financial score")) {
    return "Technical and Financial Evaluation";
  }
  return "Not clearly found";
}

function summaryFrom(allLines: string[]) {
  const useful = allLines.filter((line) =>
    /tender|proposal|work|consultant|submission|eligibility|emd|fee|document/i.test(line),
  );

  return useful.slice(0, 6).join(" ").slice(0, 900) || "Summary could not be confidently extracted.";
}

export function analyzeRfp({ fileName, text }: AnalysisInput): RfpAnalysisResult {
  const cleaned = cleanText(text).slice(0, 60000);
  const allLines = lines(cleaned);

  const method = evaluationMethod(cleaned);

  return {
    fileName,
    tenderTitle: titleFromText(allLines),
    department: departmentFromText(allLines),
    tenderValue: findMoneyNear(allLines, ["estimated cost", "tender value", "project cost", "estimated value", "cost put to tender"]),
    summary: summaryFrom(allLines),
    liveDate: findDateNear(allLines, ["published date", "publication date", "start date", "download start"]),
    openingDate: findDateNear(allLines, ["opening date", "bid opening", "technical opening", "financial opening"]),
    submissionDate: findDateNear(allLines, ["submission date", "bid submission", "last date of submission"]),
    lastDate: findDateNear(allLines, ["last date", "closing date", "due date", "deadline"]),
    eligibility: findBlock(allLines, ["eligibility", "eligible", "qualification criteria"], 8),
    evaluationMethod: method,
    markingSystem: findBlock(allLines, ["marks", "marking", "score", "technical evaluation"], 8),
    requiredDocuments: findBlock(allLines, ["documents required", "required documents", "documentary proof", "documents"], 10),
    physicalSubmission: findBlock(allLines, ["physical", "hard copy", "offline submission", "original document"], 5),
    emdAmount: findMoneyNear(allLines, ["emd", "earnest money"]),
    tenderFee: findMoneyNear(allLines, ["tender fee", "document fee", "processing fee"]),
    similarWork: findBlock(allLines, ["similar work", "similar nature", "experience", "past experience"], 8),
    technicalRequirements: findBlock(allLines, ["technical", "specification", "machinery", "engineer", "equipment"], 10),
    financialRequirements: findBlock(allLines, ["turnover", "solvency", "financial", "net worth", "bank guarantee"], 10),
    importantClauses: findBlock(allLines, ["liquidated damages", "defect liability", "security deposit", "performance guarantee", "penalty"], 10),
    riskyClauses: findBlock(allLines, ["penalty", "blacklist", "forfeit", "termination", "delay", "risk and cost"], 10),
    keyCriteria: findBlock(allLines, ["criteria", "terms and conditions", "scope of work"], 10),
    rawText: cleaned.slice(0, 30000),
  };
}
