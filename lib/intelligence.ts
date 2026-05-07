export type TenderWorkflowStage =
  | "Source Identified"
  | "RFP Downloaded"
  | "Technical Review"
  | "Eligibility Verified"
  | "BOQ Prepared"
  | "Management Approval"
  | "Submitted"
  | "Result Awaited"
  | "Awarded"
  | "Lost"
  | "Work Order Issued";

export type RiskScore = {
  score: number;
  level: "Low" | "Medium" | "High" | "Critical";
  recommendation: "Go" | "No-Go" | "Manual Review";
  viabilityScore: number;
  effortEstimate: "Low" | "Medium" | "High";
  categories: {
    name: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    note: string;
  }[];
};

export type EligibilityCheck = {
  document: string;
  status: "Pass" | "Fail" | "Missing document" | "Needs manual review" | "JV/partner required";
  note: string;
};

export type CompanyDocument = {
  name: string;
  available: boolean;
  validUntil?: string;
  owner: string;
};

export type Competitor = {
  contractorName: string;
  departments: string[];
  region: string;
  averageBidPercentage: number;
  winRate: number;
  l1Frequency: number;
  aggressivenessLevel: "Low" | "Medium" | "High";
  recentTenderParticipation: string;
};

export type BoqAnalysis = {
  fileName: string;
  abnormalQuantities: number;
  riskyLineItems: string[];
  marginZones: { zone: string; margin: string; note: string }[];
  manualReviewItems: string[];
};

export type AlertSeverity = "Critical" | "High" | "Medium" | "Low";

export type SmartAlert = {
  type:
    | "Deadline approaching"
    | "EMD validity expiry"
    | "Corrigendum added"
    | "Technical bid opening tomorrow"
    | "Financial bid opening"
    | "Eligibility changed"
    | "Missing document"
    | "Competitor participated";
  severity: AlertSeverity;
  message: string;
  due: string;
};

export const workflowStages: TenderWorkflowStage[] = [
  "Source Identified",
  "RFP Downloaded",
  "Technical Review",
  "Eligibility Verified",
  "BOQ Prepared",
  "Management Approval",
  "Submitted",
  "Result Awaited",
  "Awarded",
  "Lost",
  "Work Order Issued",
];

export const companyDocuments: CompanyDocument[] = [
  { name: "GST", available: true, owner: "Accounts" },
  { name: "PAN", available: true, owner: "Accounts" },
  { name: "Turnover certificate", available: true, owner: "CA" },
  { name: "Experience certificates", available: false, owner: "Projects" },
  { name: "ISO", available: true, validUntil: "31 Mar 2027", owner: "Admin" },
  { name: "PF/ESIC", available: true, owner: "HR" },
  { name: "Machinery list", available: false, owner: "Plant" },
  { name: "Bank solvency", available: false, owner: "Finance" },
  { name: "Digital signature", available: true, validUntil: "12 Dec 2026", owner: "Director" },
  { name: "Affidavits", available: false, owner: "Legal" },
];

export const mockCompetitors: Competitor[] = [
  {
    contractorName: "Shree Infra Projects",
    departments: ["PWD", "Municipal", "Water Resources"],
    region: "Maharashtra",
    averageBidPercentage: -8.4,
    winRate: 32,
    l1Frequency: 41,
    aggressivenessLevel: "High",
    recentTenderParticipation: "Road widening and storm-water drainage packages",
  },
  {
    contractorName: "Buildwell EPC",
    departments: ["MIDC", "Irrigation"],
    region: "Western India",
    averageBidPercentage: -4.7,
    winRate: 24,
    l1Frequency: 28,
    aggressivenessLevel: "Medium",
    recentTenderParticipation: "Industrial infrastructure and pipeline works",
  },
  {
    contractorName: "Patil Civil Contractors",
    departments: ["ZP", "PWD"],
    region: "Marathwada",
    averageBidPercentage: -2.1,
    winRate: 18,
    l1Frequency: 16,
    aggressivenessLevel: "Low",
    recentTenderParticipation: "Buildings, culverts, and local road maintenance",
  },
];

export const mockBoqAnalysis: BoqAnalysis = {
  fileName: "sample-boq-analysis.xlsx",
  abnormalQuantities: 6,
  riskyLineItems: [
    "Earthwork quantity is higher than comparable tenders",
    "Steel item rate needs market verification",
    "Bitumen escalation clause not visible",
  ],
  marginZones: [
    { zone: "Safe margin", margin: "6% - 9%", note: "Suitable for routine civil packages" },
    { zone: "Competitive margin", margin: "3% - 5%", note: "Use if bidder competition is high" },
    { zone: "Risk zone", margin: "Below 3%", note: "Needs management approval" },
  ],
  manualReviewItems: ["Lead/lift assumptions", "GST inclusion", "Royalty and testing charges"],
};

export function workflowStageForTender(tender: {
  status?: string;
  bidDecision?: string;
  documentPrepared?: boolean;
  bidSubmitted?: boolean;
  resultStatus?: string;
  workCompleted?: boolean;
  workDoneCertificate?: boolean;
}): TenderWorkflowStage {
  if (tender.resultStatus === "WON" && tender.workDoneCertificate) return "Work Order Issued";
  if (tender.resultStatus === "WON") return "Awarded";
  if (tender.resultStatus === "LOST") return "Lost";
  if (tender.bidSubmitted || tender.status === "SUBMITTED") return "Submitted";
  if (tender.documentPrepared) return "BOQ Prepared";
  if (tender.bidDecision === "BID") return "Eligibility Verified";
  return "Source Identified";
}

export function riskTone(level: string) {
  if (level === "Critical") return "bg-rose-100 text-rose-800 border-rose-200";
  if (level === "High") return "bg-red-50 text-red-700 border-red-200";
  if (level === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export function statusTone(status?: string) {
  const value = (status ?? "").toUpperCase();
  if (["SUBMITTED", "AWARDED", "WON"].includes(value)) return "bg-emerald-50 text-emerald-700";
  if (["IN_REVIEW", "PENDING", "RESULT AWAITED"].includes(value)) return "bg-amber-50 text-amber-700";
  if (["HIGH_RISK", "DEADLINE_NEAR", "LOST", "OVERDUE"].includes(value)) return "bg-rose-50 text-rose-700";
  if (["DRAFT", "OPEN", "ANALYSIS"].includes(value)) return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

export function buildRiskScore(analysis: {
  lastDate?: string | null;
  submissionDate?: string | null;
  eligibility?: string | null;
  emdAmount?: string | null;
  tenderFee?: string | null;
  requiredDocuments?: string | null;
  keyCriteria?: string | null;
  evaluationMethod?: string | null;
}): RiskScore {
  const missing = [
    !analysis.lastDate && !analysis.submissionDate,
    !analysis.eligibility,
    !analysis.emdAmount,
    !analysis.requiredDocuments,
    !analysis.evaluationMethod || analysis.evaluationMethod === "Not clearly found",
  ].filter(Boolean).length;
  const score = Math.min(95, 35 + missing * 11 + (analysis.keyCriteria ? 8 : 0));
  const level = score >= 75 ? "High" : score >= 55 ? "Medium" : "Low";

  return {
    score,
    level,
    recommendation: score >= 75 ? "Manual Review" : missing >= 4 ? "No-Go" : "Go",
    viabilityScore: Math.max(10, 100 - score + 12),
    effortEstimate: score >= 75 ? "High" : score >= 55 ? "Medium" : "Low",
    categories: [
      {
        name: "Deadline risk",
        severity: analysis.lastDate || analysis.submissionDate ? "Medium" : "High",
        note: analysis.lastDate || analysis.submissionDate ? "Deadline extracted; verify timezone and portal cut-off." : "Submission deadline not clearly found.",
      },
      {
        name: "Eligibility risk",
        severity: analysis.eligibility ? "Medium" : "High",
        note: analysis.eligibility ? "Eligibility criteria found; match documents before bid." : "Eligibility text missing or unclear.",
      },
      {
        name: "Financial risk",
        severity: analysis.emdAmount || analysis.tenderFee ? "Low" : "Medium",
        note: analysis.emdAmount || analysis.tenderFee ? "Fee/EMD information was detected." : "EMD or tender fee needs manual confirmation.",
      },
      {
        name: "Documentation risk",
        severity: analysis.requiredDocuments ? "Medium" : "High",
        note: analysis.requiredDocuments ? "Document list detected; check physical submission." : "Required documents not clearly detected.",
      },
      {
        name: "Technical risk",
        severity: analysis.keyCriteria ? "Medium" : "Low",
        note: analysis.keyCriteria ? "Scope and criteria need engineering review." : "No heavy technical clause detected in extracted text.",
      },
      {
        name: "Legal/contractual risk",
        severity: analysis.keyCriteria ? "Medium" : "Low",
        note: "Review penalty, LD, defect liability, and arbitration clauses manually.",
      },
    ],
  };
}

export function matchEligibility(text?: string | null): EligibilityCheck[] {
  const value = (text ?? "").toLowerCase();

  return companyDocuments.map((doc) => {
    const mentioned = value.includes(doc.name.toLowerCase().split("/")[0]);
    if (doc.available && mentioned) return { document: doc.name, status: "Pass", note: "Available and appears relevant." };
    if (doc.available) return { document: doc.name, status: "Needs manual review", note: "Available, but not directly matched in extracted eligibility." };
    if (mentioned) return { document: doc.name, status: "Missing document", note: "Tender appears to ask for this document." };
    return { document: doc.name, status: "Needs manual review", note: "Not confirmed from RFP text." };
  });
}

export function buildSmartAlerts(tenders: {
  title: string;
  endDate: Date;
  documentPrepared: boolean;
  bidSubmitted: boolean;
}[]): SmartAlert[] {
  const today = new Date();
  const alerts: SmartAlert[] = [];

  tenders.slice(0, 8).forEach((tender) => {
    const days = Math.ceil((tender.endDate.getTime() - today.getTime()) / 86400000);
    if (days <= 2 && !tender.bidSubmitted) {
      alerts.push({
        type: "Deadline approaching",
        severity: "Critical",
        message: `${tender.title} closes in ${Math.max(days, 0)} day(s).`,
        due: tender.endDate.toLocaleDateString("en-IN"),
      });
    }
    if (!tender.documentPrepared) {
      alerts.push({
        type: "Missing document",
        severity: days <= 5 ? "High" : "Medium",
        message: `Document readiness pending for ${tender.title}.`,
        due: tender.endDate.toLocaleDateString("en-IN"),
      });
    }
  });

  return alerts;
}
