-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "implant" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_email_key" ON "Booking"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_slot_key" ON "Booking"("slot");
