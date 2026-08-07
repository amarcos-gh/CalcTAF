-- AlterEnum
ALTER TYPE "PerfilUsuario" ADD VALUE 'GERAL';

-- AlterTable
ALTER TABLE "OM" ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "uf" TEXT;
