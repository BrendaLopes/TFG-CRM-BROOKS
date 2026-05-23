-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CAPTACION', 'COMERCIAL', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "CanalEntrada" AS ENUM ('TELEFONO', 'WHATSAPP', 'WEB', 'INDICACION');

-- CreateEnum
CREATE TYPE "EstadoOportunidad" AS ENUM ('LEAD', 'CUALIFICADA', 'EN_ENTREVISTA_TECNICA', 'PROPUESTA_EN_ELABORACION', 'PROPUESTA_ENVIADA', 'EN_NEGOCIACION', 'GANADA', 'PERDIDA', 'NO_VIABLE');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('RECORRENTE', 'PONTUAL');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "EstadoPropuesta" AS ENUM ('BORRADOR', 'ENVIADA', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('KG', 'M3', 'UNIDAD', 'CONTENEDOR');

-- CreateEnum
CREATE TYPE "ClaseResiduo" AS ENUM ('CLASE_I', 'CLASE_IIA', 'CLASE_IIB');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documentoFiscal" TEXT NOT NULL,
    "numeroRegistroSilc" TEXT,
    "segmento" TEXT,
    "direccion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacto" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "telefono" TEXT,
    "email" TEXT,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "nombreEmpresa" TEXT NOT NULL,
    "canalEntrada" "CanalEntrada" NOT NULL,
    "origen" TEXT,
    "descripcionInicial" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oportunidad" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estado" "EstadoOportunidad" NOT NULL DEFAULT 'LEAD',
    "tipo" "TipoContrato",
    "prioridad" "Prioridad",
    "motivoPerdida" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),

    CONSTRAINT "Oportunidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialSeguimiento" (
    "id" TEXT NOT NULL,
    "oportunidadId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT NOT NULL,
    "fechaProximoContacto" TIMESTAMP(3),

    CONSTRAINT "HistorialSeguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudServicio" (
    "id" TEXT NOT NULL,
    "oportunidadId" TEXT NOT NULL,
    "tipoServicio" TEXT NOT NULL,
    "frecuenciaServicio" TEXT NOT NULL,
    "direccionServicio" TEXT NOT NULL,
    "restriccionesHorario" TEXT,
    "observaciones" TEXT,
    "requiereFichaSeguridad" BOOLEAN NOT NULL DEFAULT false,
    "accesoVehiculo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitudServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemServicioSolicitado" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "residuoId" TEXT NOT NULL,
    "cantidadEstimada" DECIMAL(65,30) NOT NULL,
    "unidadMedida" "UnidadMedida" NOT NULL,
    "acondicionamiento" TEXT,
    "descripcionDetallada" TEXT,

    CONSTRAINT "ItemServicioSolicitado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "distanciaCalculada" DECIMAL(65,30),
    "tiempoEstimadoServicio" INTEGER,
    "totalSugerido" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalFinal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "observaciones" TEXT,

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCotizacion" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "tarifaBaseId" TEXT,
    "itemServicioId" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad" "UnidadMedida" NOT NULL,
    "precioSugerido" DECIMAL(65,30) NOT NULL,
    "precioFinal" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "franquicia" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ajusteManual" BOOLEAN NOT NULL DEFAULT false,
    "justificacionAjuste" TEXT,

    CONSTRAINT "ItemCotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propuesta" (
    "id" TEXT NOT NULL,
    "oportunidadId" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "numeroPropuesta" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoPropuesta" NOT NULL DEFAULT 'BORRADOR',
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEnvio" TIMESTAMP(3),

    CONSTRAINT "Propuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenServicio" (
    "id" TEXT NOT NULL,
    "oportunidadId" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoServicio" TEXT NOT NULL,
    "documentoFiscal" TEXT NOT NULL,
    "frecuenciaServicio" TEXT NOT NULL,
    "direccionServicio" TEXT NOT NULL,
    "condicionPago" TEXT,
    "observaciones" TEXT,
    "numeroOrdenSilc" TEXT,
    "dataExecucao" TIMESTAMP(3),
    "unidadeOperacional" TEXT,

    CONSTRAINT "OrdenServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Residuo" (
    "id" TEXT NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "codigoIbama" TEXT,
    "nombre" TEXT NOT NULL,
    "grupo" TEXT,
    "clase" "ClaseResiduo" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Residuo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarifaBase" (
    "id" TEXT NOT NULL,
    "residuoId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "destinoFinal" TEXT NOT NULL,
    "unidadMedida" "UnidadMedida" NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "franquiciaMinima" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "precioExcedente" DECIMAL(65,30),
    "vigencia" TIMESTAMP(3),
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TarifaBase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Oportunidad_leadId_key" ON "Oportunidad"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudServicio_oportunidadId_key" ON "SolicitudServicio"("oportunidadId");

-- CreateIndex
CREATE UNIQUE INDEX "Cotizacion_solicitudId_key" ON "Cotizacion"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenServicio_oportunidadId_key" ON "OrdenServicio"("oportunidadId");

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidad" ADD CONSTRAINT "Oportunidad_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidad" ADD CONSTRAINT "Oportunidad_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidad" ADD CONSTRAINT "Oportunidad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialSeguimiento" ADD CONSTRAINT "HistorialSeguimiento_oportunidadId_fkey" FOREIGN KEY ("oportunidadId") REFERENCES "Oportunidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialSeguimiento" ADD CONSTRAINT "HistorialSeguimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudServicio" ADD CONSTRAINT "SolicitudServicio_oportunidadId_fkey" FOREIGN KEY ("oportunidadId") REFERENCES "Oportunidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemServicioSolicitado" ADD CONSTRAINT "ItemServicioSolicitado_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemServicioSolicitado" ADD CONSTRAINT "ItemServicioSolicitado_residuoId_fkey" FOREIGN KEY ("residuoId") REFERENCES "Residuo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCotizacion" ADD CONSTRAINT "ItemCotizacion_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCotizacion" ADD CONSTRAINT "ItemCotizacion_tarifaBaseId_fkey" FOREIGN KEY ("tarifaBaseId") REFERENCES "TarifaBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCotizacion" ADD CONSTRAINT "ItemCotizacion_itemServicioId_fkey" FOREIGN KEY ("itemServicioId") REFERENCES "ItemServicioSolicitado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_oportunidadId_fkey" FOREIGN KEY ("oportunidadId") REFERENCES "Oportunidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenServicio" ADD CONSTRAINT "OrdenServicio_oportunidadId_fkey" FOREIGN KEY ("oportunidadId") REFERENCES "Oportunidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifaBase" ADD CONSTRAINT "TarifaBase_residuoId_fkey" FOREIGN KEY ("residuoId") REFERENCES "Residuo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
