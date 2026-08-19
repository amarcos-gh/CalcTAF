-- CreateEnum
CREATE TYPE "TipoHistoricoColeta" AS ENUM ('IMPORTACAO', 'EXPORTACAO');

-- CreateTable
CREATE TABLE "HistoricoColeta" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" "TipoHistoricoColeta" NOT NULL,
    "arquivo" TEXT NOT NULL,
    "quantidade" INTEGER,
    "origem" "OrigemLog" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoColeta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoricoColeta"
ADD CONSTRAINT "HistoricoColeta_usuarioId_fkey"
FOREIGN KEY ("usuarioId")
REFERENCES "Usuario"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
