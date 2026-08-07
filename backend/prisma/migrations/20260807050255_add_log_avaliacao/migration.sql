-- CreateEnum
CREATE TYPE "AcaoLogAvaliacao" AS ENUM ('CADASTRO', 'ATUALIZACAO');

-- CreateEnum
CREATE TYPE "OrigemLog" AS ENUM ('WEB', 'CAMPO', 'IMPORTACAO');

-- CreateTable
CREATE TABLE "LogAvaliacao" (
    "id" SERIAL NOT NULL,
    "avaliacaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "acao" "AcaoLogAvaliacao" NOT NULL,
    "origem" "OrigemLog" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAvaliacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LogAvaliacao" ADD CONSTRAINT "LogAvaliacao_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "AvaliacaoTAF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAvaliacao" ADD CONSTRAINT "LogAvaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
