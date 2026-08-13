/*
  Warnings:

  - You are about to drop the column `codigoCertificacaoHash` on the `ChamadaTAF` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('PENDENTE', 'ATIVO', 'BLOQUEADO');

-- AlterTable
ALTER TABLE "ChamadaTAF" DROP COLUMN "codigoCertificacaoHash",
ADD COLUMN     "codigoAutenticacaoHash" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "status" "StatusUsuario" NOT NULL DEFAULT 'PENDENTE',
ALTER COLUMN "perfil" DROP NOT NULL,
ALTER COLUMN "perfil" DROP DEFAULT;
