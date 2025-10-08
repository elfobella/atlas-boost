-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "boosterId" TEXT,
    "assignedAt" DATETIME,
    "startedAt" DATETIME,
    "game" TEXT NOT NULL,
    "currentRank" TEXT NOT NULL,
    "currentDivision" TEXT,
    "targetRank" TEXT NOT NULL,
    "targetDivision" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "boosterEarnings" REAL,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "orderStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" INTEGER,
    "actualHours" INTEGER,
    "notes" TEXT,
    "customerFeedback" TEXT,
    "customerRating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_boosterId_fkey" FOREIGN KEY ("boosterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("completedAt", "createdAt", "currency", "currentDivision", "currentRank", "game", "id", "orderStatus", "paidAt", "paymentStatus", "price", "stripePaymentIntentId", "stripeSessionId", "targetDivision", "targetRank", "updatedAt", "userId") SELECT "completedAt", "createdAt", "currency", "currentDivision", "currentRank", "game", "id", "orderStatus", "paidAt", "paymentStatus", "price", "stripePaymentIntentId", "stripeSessionId", "targetDivision", "targetRank", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxOrders" INTEGER NOT NULL DEFAULT 3,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
