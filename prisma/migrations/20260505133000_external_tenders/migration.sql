-- AlterTable
ALTER TABLE "TenderSource" ADD COLUMN "lastFetchedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ExternalTender" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalTender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalTender_sourceId_link_key" ON "ExternalTender"("sourceId", "link");

-- AddForeignKey
ALTER TABLE "ExternalTender" ADD CONSTRAINT "ExternalTender_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TenderSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
