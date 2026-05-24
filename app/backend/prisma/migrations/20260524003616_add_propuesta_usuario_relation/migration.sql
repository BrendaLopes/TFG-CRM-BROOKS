-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
