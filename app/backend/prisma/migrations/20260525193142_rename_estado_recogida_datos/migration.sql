/*
  Warnings:

  - The values [EN_ENTREVISTA_TECNICA] on the enum `EstadoOportunidad` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoOportunidad_new" AS ENUM ('LEAD', 'CUALIFICADA', 'EN_RECOGIDA_DE_DATOS', 'PROPUESTA_EN_ELABORACION', 'PROPUESTA_ENVIADA', 'EN_NEGOCIACION', 'GANADA', 'PERDIDA', 'NO_VIABLE');
ALTER TABLE "public"."Oportunidad" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Oportunidad" ALTER COLUMN "estado" TYPE "EstadoOportunidad_new" USING ("estado"::text::"EstadoOportunidad_new");
ALTER TYPE "EstadoOportunidad" RENAME TO "EstadoOportunidad_old";
ALTER TYPE "EstadoOportunidad_new" RENAME TO "EstadoOportunidad";
DROP TYPE "public"."EstadoOportunidad_old";
ALTER TABLE "Oportunidad" ALTER COLUMN "estado" SET DEFAULT 'LEAD';
COMMIT;
