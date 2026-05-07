-- CreateTable
CREATE TABLE "RfpAnalysis" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "tenderTitle" TEXT,
    "summary" TEXT,
    "liveDate" TEXT,
    "openingDate" TEXT,
    "submissionDate" TEXT,
    "lastDate" TEXT,
    "eligibility" TEXT,
    "evaluationMethod" TEXT,
    "markingSystem" TEXT,
    "requiredDocuments" TEXT,
    "physicalSubmission" TEXT,
    "emdAmount" TEXT,
    "tenderFee" TEXT,
    "similarWork" TEXT,
    "keyCriteria" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RfpAnalysis_pkey" PRIMARY KEY ("id")
);
