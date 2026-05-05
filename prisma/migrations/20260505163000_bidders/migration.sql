-- CreateTable
CREATE TABLE "Bidder" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "bidderName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "quotedAmount" DOUBLE PRECISION,
    "percentBelow" DOUBLE PRECISION,
    "rank" INTEGER,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bidder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bidder_tenderId_idx" ON "Bidder"("tenderId");

-- AddForeignKey
ALTER TABLE "Bidder" ADD CONSTRAINT "Bidder_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
