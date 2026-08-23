-- CreateEnum
CREATE TYPE "TipoSolicitacaoAcesso" AS ENUM ('NOVA_SENHA', 'ATIVACAO_PERFIL');

-- CreateEnum
CREATE TYPE "StatusSolicitacaoAcesso" AS ENUM ('PENDENTE', 'ATENDIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "SolicitacaoAcesso" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "tipo" "TipoSolicitacaoAcesso" NOT NULL,
    "status" "StatusSolicitacaoAcesso" NOT NULL DEFAULT 'PENDENTE',
    "token" TEXT,
    "expiraEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoAcesso_token_key" ON "SolicitacaoAcesso"("token");
