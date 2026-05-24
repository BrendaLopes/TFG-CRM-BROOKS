-- AlterTable
ALTER TABLE "Propuesta" ADD COLUMN     "cargoFirmante" TEXT,
ADD COLUMN     "condicionesPago" TEXT,
ADD COLUMN     "nombreFirmante" TEXT,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "validadeDias" INTEGER NOT NULL DEFAULT 5;
