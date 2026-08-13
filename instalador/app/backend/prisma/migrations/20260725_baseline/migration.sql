-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMINISTRADOR', 'OPERADOR', 'AVALIADOR');

-- CreateTable
CREATE TABLE "OM" (
    "id" SERIAL NOT NULL,
    "sigla" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codom" TEXT NOT NULL,

    CONSTRAINT "OM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subunidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "omId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subunidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostoGraduacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "abreviacao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "PostoGraduacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Militar" (
    "id" SERIAL NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "nomeGuerra" TEXT NOT NULL,
    "segmento" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "omId" INTEGER NOT NULL,
    "subunidadeId" INTEGER NOT NULL,
    "postoGraduacaoId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Militar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampanhaTAF" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "numeroTAF" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampanhaTAF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChamadaTAF" (
    "id" SERIAL NOT NULL,
    "numeroChamada" INTEGER NOT NULL,
    "campanhaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodoInicio" TIMESTAMP(3),
    "periodoFim" TIMESTAMP(3),
    "codigoCertificacaoHash" TEXT,
    "codigoGeradoEm" TIMESTAMP(3),
    "avaliadorId" INTEGER,

    CONSTRAINT "ChamadaTAF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoTAF" (
    "id" SERIAL NOT NULL,
    "militarId" INTEGER NOT NULL,
    "chamadaId" INTEGER NOT NULL,
    "corrida" DOUBLE PRECISION,
    "mencaoCorrida" TEXT NOT NULL DEFAULT 'NR',
    "flexao" INTEGER,
    "mencaoFlexao" TEXT NOT NULL DEFAULT 'NR',
    "abdominal" INTEGER,
    "mencaoAbdominal" TEXT NOT NULL DEFAULT 'NR',
    "barra" INTEGER,
    "mencaoBarra" TEXT NOT NULL DEFAULT 'NR',
    "ppm" TEXT,
    "mencaoPPM" TEXT NOT NULL DEFAULT 'NR',
    "mencaoFinal" TEXT NOT NULL DEFAULT 'NR',
    "situacao" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoTAF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiceTAF" (
    "id" SERIAL NOT NULL,
    "segmento" TEXT NOT NULL,
    "cursoCodigo" TEXT NOT NULL,
    "exercicio" TEXT NOT NULL,
    "idadeMin" INTEGER NOT NULL,
    "idadeMax" INTEGER NOT NULL,
    "mencao" TEXT NOT NULL,
    "valorMin" DOUBLE PRECISION,
    "valorMax" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndiceTAF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'OPERADOR',
    "omId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OM_codom_key" ON "OM"("codom");

-- CreateIndex
CREATE UNIQUE INDEX "Subunidade_nome_omId_key" ON "Subunidade"("nome", "omId");

-- CreateIndex
CREATE UNIQUE INDEX "PostoGraduacao_abreviacao_key" ON "PostoGraduacao"("abreviacao");

-- CreateIndex
CREATE UNIQUE INDEX "PostoGraduacao_ordem_key" ON "PostoGraduacao"("ordem");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_key" ON "Curso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "CampanhaTAF_ano_numeroTAF_key" ON "CampanhaTAF"("ano", "numeroTAF");

-- CreateIndex
CREATE UNIQUE INDEX "ChamadaTAF_campanhaId_numeroChamada_key" ON "ChamadaTAF"("campanhaId", "numeroChamada");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoTAF_militarId_chamadaId_key" ON "AvaliacaoTAF"("militarId", "chamadaId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Subunidade" ADD CONSTRAINT "Subunidade_omId_fkey" FOREIGN KEY ("omId") REFERENCES "OM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Militar" ADD CONSTRAINT "Militar_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Militar" ADD CONSTRAINT "Militar_omId_fkey" FOREIGN KEY ("omId") REFERENCES "OM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Militar" ADD CONSTRAINT "Militar_postoGraduacaoId_fkey" FOREIGN KEY ("postoGraduacaoId") REFERENCES "PostoGraduacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Militar" ADD CONSTRAINT "Militar_subunidadeId_fkey" FOREIGN KEY ("subunidadeId") REFERENCES "Subunidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChamadaTAF" ADD CONSTRAINT "ChamadaTAF_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChamadaTAF" ADD CONSTRAINT "ChamadaTAF_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "CampanhaTAF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoTAF" ADD CONSTRAINT "AvaliacaoTAF_militarId_fkey" FOREIGN KEY ("militarId") REFERENCES "Militar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoTAF" ADD CONSTRAINT "AvaliacaoTAF_chamadaId_fkey" FOREIGN KEY ("chamadaId") REFERENCES "ChamadaTAF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_omId_fkey" FOREIGN KEY ("omId") REFERENCES "OM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

