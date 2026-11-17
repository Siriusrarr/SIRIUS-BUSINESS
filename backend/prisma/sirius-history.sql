BEGIN;
CREATE TABLE IF NOT EXISTS "SiriusThread" (
  "id" UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" VARCHAR(120) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "SiriusThread_userId_businessId_updatedAt_idx"
  ON "SiriusThread" ("userId", "businessId", "updatedAt");
CREATE TABLE IF NOT EXISTS "SiriusTurn" (
  "id" UUID PRIMARY KEY,
  "threadId" UUID NOT NULL REFERENCES "SiriusThread"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SiriusTurn_threadId_createdAt_idx" ON "SiriusTurn" ("threadId", "createdAt");
COMMIT;
