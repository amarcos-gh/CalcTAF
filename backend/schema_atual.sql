--
-- PostgreSQL database dump
--

\restrict WZKgOL4FrOVT58vvtEduuWYeAZDw5crgPf8MopvCewMhcAgwHtS9Vw4z9BypsG0

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AvaliacaoTAF; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AvaliacaoTAF" (
    id integer NOT NULL,
    "militarId" integer NOT NULL,
    "chamadaId" integer NOT NULL,
    corrida double precision,
    "mencaoCorrida" text DEFAULT 'NR'::text NOT NULL,
    flexao integer,
    "mencaoFlexao" text DEFAULT 'NR'::text NOT NULL,
    abdominal integer,
    "mencaoAbdominal" text DEFAULT 'NR'::text NOT NULL,
    barra integer,
    "mencaoBarra" text DEFAULT 'NR'::text NOT NULL,
    ppm text,
    "mencaoPPM" text DEFAULT 'NR'::text NOT NULL,
    "mencaoFinal" text DEFAULT 'NR'::text NOT NULL,
    situacao text DEFAULT 'PENDENTE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AvaliacaoTAF" OWNER TO postgres;

--
-- Name: AvaliacaoTAF_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AvaliacaoTAF_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AvaliacaoTAF_id_seq" OWNER TO postgres;

--
-- Name: AvaliacaoTAF_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AvaliacaoTAF_id_seq" OWNED BY public."AvaliacaoTAF".id;


--
-- Name: CampanhaTAF; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CampanhaTAF" (
    id integer NOT NULL,
    ano integer NOT NULL,
    "numeroTAF" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CampanhaTAF" OWNER TO postgres;

--
-- Name: CampanhaTAF_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CampanhaTAF_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CampanhaTAF_id_seq" OWNER TO postgres;

--
-- Name: CampanhaTAF_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CampanhaTAF_id_seq" OWNED BY public."CampanhaTAF".id;


--
-- Name: ChamadaTAF; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChamadaTAF" (
    id integer NOT NULL,
    "numeroChamada" integer NOT NULL,
    "campanhaId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "periodoFim" timestamp(3) without time zone,
    "periodoInicio" timestamp(3) without time zone
);


ALTER TABLE public."ChamadaTAF" OWNER TO postgres;

--
-- Name: ChamadaTAF_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChamadaTAF_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChamadaTAF_id_seq" OWNER TO postgres;

--
-- Name: ChamadaTAF_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChamadaTAF_id_seq" OWNED BY public."ChamadaTAF".id;


--
-- Name: Curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Curso" (
    id integer NOT NULL,
    nome text NOT NULL,
    codigo text NOT NULL
);


ALTER TABLE public."Curso" OWNER TO postgres;

--
-- Name: Curso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Curso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Curso_id_seq" OWNER TO postgres;

--
-- Name: Curso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Curso_id_seq" OWNED BY public."Curso".id;


--
-- Name: IndiceTAF; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."IndiceTAF" (
    id integer NOT NULL,
    segmento text NOT NULL,
    "cursoCodigo" text NOT NULL,
    exercicio text NOT NULL,
    "idadeMin" integer NOT NULL,
    "idadeMax" integer NOT NULL,
    mencao text NOT NULL,
    "valorMin" double precision,
    "valorMax" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."IndiceTAF" OWNER TO postgres;

--
-- Name: IndiceTAF_backup_20260625; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."IndiceTAF_backup_20260625" (
    id integer,
    segmento text,
    "cursoCodigo" text,
    exercicio text,
    "idadeMin" integer,
    "idadeMax" integer,
    mencao text,
    "valorMin" double precision,
    "valorMax" double precision,
    "createdAt" timestamp(3) without time zone
);


ALTER TABLE public."IndiceTAF_backup_20260625" OWNER TO postgres;

--
-- Name: IndiceTAF_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."IndiceTAF_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IndiceTAF_id_seq" OWNER TO postgres;

--
-- Name: IndiceTAF_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."IndiceTAF_id_seq" OWNED BY public."IndiceTAF".id;


--
-- Name: Militar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Militar" (
    id integer NOT NULL,
    "nomeCompleto" text NOT NULL,
    "nomeGuerra" text NOT NULL,
    segmento text NOT NULL,
    "dataNascimento" timestamp(3) without time zone NOT NULL,
    "omId" integer NOT NULL,
    "subunidadeId" integer NOT NULL,
    "postoGraduacaoId" integer NOT NULL,
    "cursoId" integer NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Militar" OWNER TO postgres;

--
-- Name: Militar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Militar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Militar_id_seq" OWNER TO postgres;

--
-- Name: Militar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Militar_id_seq" OWNED BY public."Militar".id;


--
-- Name: OM; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OM" (
    id integer NOT NULL,
    sigla text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    codom text NOT NULL
);


ALTER TABLE public."OM" OWNER TO postgres;

--
-- Name: OM_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OM_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OM_id_seq" OWNER TO postgres;

--
-- Name: OM_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OM_id_seq" OWNED BY public."OM".id;


--
-- Name: PostoGraduacao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PostoGraduacao" (
    id integer NOT NULL,
    nome text NOT NULL,
    abreviacao text NOT NULL,
    ordem integer NOT NULL
);


ALTER TABLE public."PostoGraduacao" OWNER TO postgres;

--
-- Name: PostoGraduacao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PostoGraduacao_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PostoGraduacao_id_seq" OWNER TO postgres;

--
-- Name: PostoGraduacao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PostoGraduacao_id_seq" OWNED BY public."PostoGraduacao".id;


--
-- Name: Subunidade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subunidade" (
    id integer NOT NULL,
    nome text NOT NULL,
    "omId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Subunidade" OWNER TO postgres;

--
-- Name: Subunidade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Subunidade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Subunidade_id_seq" OWNER TO postgres;

--
-- Name: Subunidade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Subunidade_id_seq" OWNED BY public."Subunidade".id;


--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Usuario" (
    id integer NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    perfil text DEFAULT 'OPERADOR'::text NOT NULL,
    "omId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Usuario" OWNER TO postgres;

--
-- Name: Usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Usuario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Usuario_id_seq" OWNER TO postgres;

--
-- Name: Usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Usuario_id_seq" OWNED BY public."Usuario".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: AvaliacaoTAF id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AvaliacaoTAF" ALTER COLUMN id SET DEFAULT nextval('public."AvaliacaoTAF_id_seq"'::regclass);


--
-- Name: CampanhaTAF id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampanhaTAF" ALTER COLUMN id SET DEFAULT nextval('public."CampanhaTAF_id_seq"'::regclass);


--
-- Name: ChamadaTAF id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChamadaTAF" ALTER COLUMN id SET DEFAULT nextval('public."ChamadaTAF_id_seq"'::regclass);


--
-- Name: Curso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Curso" ALTER COLUMN id SET DEFAULT nextval('public."Curso_id_seq"'::regclass);


--
-- Name: IndiceTAF id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IndiceTAF" ALTER COLUMN id SET DEFAULT nextval('public."IndiceTAF_id_seq"'::regclass);


--
-- Name: Militar id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Militar" ALTER COLUMN id SET DEFAULT nextval('public."Militar_id_seq"'::regclass);


--
-- Name: OM id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OM" ALTER COLUMN id SET DEFAULT nextval('public."OM_id_seq"'::regclass);


--
-- Name: PostoGraduacao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostoGraduacao" ALTER COLUMN id SET DEFAULT nextval('public."PostoGraduacao_id_seq"'::regclass);


--
-- Name: Subunidade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subunidade" ALTER COLUMN id SET DEFAULT nextval('public."Subunidade_id_seq"'::regclass);


--
-- Name: Usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario" ALTER COLUMN id SET DEFAULT nextval('public."Usuario_id_seq"'::regclass);


--
-- Name: AvaliacaoTAF AvaliacaoTAF_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AvaliacaoTAF"
    ADD CONSTRAINT "AvaliacaoTAF_pkey" PRIMARY KEY (id);


--
-- Name: CampanhaTAF CampanhaTAF_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampanhaTAF"
    ADD CONSTRAINT "CampanhaTAF_pkey" PRIMARY KEY (id);


--
-- Name: ChamadaTAF ChamadaTAF_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChamadaTAF"
    ADD CONSTRAINT "ChamadaTAF_pkey" PRIMARY KEY (id);


--
-- Name: Curso Curso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Curso"
    ADD CONSTRAINT "Curso_pkey" PRIMARY KEY (id);


--
-- Name: IndiceTAF IndiceTAF_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IndiceTAF"
    ADD CONSTRAINT "IndiceTAF_pkey" PRIMARY KEY (id);


--
-- Name: Militar Militar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Militar"
    ADD CONSTRAINT "Militar_pkey" PRIMARY KEY (id);


--
-- Name: OM OM_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OM"
    ADD CONSTRAINT "OM_pkey" PRIMARY KEY (id);


--
-- Name: PostoGraduacao PostoGraduacao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostoGraduacao"
    ADD CONSTRAINT "PostoGraduacao_pkey" PRIMARY KEY (id);


--
-- Name: Subunidade Subunidade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subunidade"
    ADD CONSTRAINT "Subunidade_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AvaliacaoTAF_militarId_chamadaId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AvaliacaoTAF_militarId_chamadaId_key" ON public."AvaliacaoTAF" USING btree ("militarId", "chamadaId");


--
-- Name: CampanhaTAF_ano_numeroTAF_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CampanhaTAF_ano_numeroTAF_key" ON public."CampanhaTAF" USING btree (ano, "numeroTAF");


--
-- Name: ChamadaTAF_campanhaId_numeroChamada_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChamadaTAF_campanhaId_numeroChamada_key" ON public."ChamadaTAF" USING btree ("campanhaId", "numeroChamada");


--
-- Name: Curso_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Curso_codigo_key" ON public."Curso" USING btree (codigo);


--
-- Name: OM_codom_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OM_codom_key" ON public."OM" USING btree (codom);


--
-- Name: PostoGraduacao_abreviacao_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PostoGraduacao_abreviacao_key" ON public."PostoGraduacao" USING btree (abreviacao);


--
-- Name: PostoGraduacao_ordem_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PostoGraduacao_ordem_key" ON public."PostoGraduacao" USING btree (ordem);


--
-- Name: Subunidade_nome_omId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subunidade_nome_omId_key" ON public."Subunidade" USING btree (nome, "omId");


--
-- Name: Usuario_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Usuario_email_key" ON public."Usuario" USING btree (email);


--
-- Name: AvaliacaoTAF AvaliacaoTAF_chamadaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AvaliacaoTAF"
    ADD CONSTRAINT "AvaliacaoTAF_chamadaId_fkey" FOREIGN KEY ("chamadaId") REFERENCES public."ChamadaTAF"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AvaliacaoTAF AvaliacaoTAF_militarId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AvaliacaoTAF"
    ADD CONSTRAINT "AvaliacaoTAF_militarId_fkey" FOREIGN KEY ("militarId") REFERENCES public."Militar"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChamadaTAF ChamadaTAF_campanhaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChamadaTAF"
    ADD CONSTRAINT "ChamadaTAF_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES public."CampanhaTAF"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Militar Militar_cursoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Militar"
    ADD CONSTRAINT "Militar_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES public."Curso"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Militar Militar_omId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Militar"
    ADD CONSTRAINT "Militar_omId_fkey" FOREIGN KEY ("omId") REFERENCES public."OM"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Militar Militar_postoGraduacaoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Militar"
    ADD CONSTRAINT "Militar_postoGraduacaoId_fkey" FOREIGN KEY ("postoGraduacaoId") REFERENCES public."PostoGraduacao"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Militar Militar_subunidadeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Militar"
    ADD CONSTRAINT "Militar_subunidadeId_fkey" FOREIGN KEY ("subunidadeId") REFERENCES public."Subunidade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subunidade Subunidade_omId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subunidade"
    ADD CONSTRAINT "Subunidade_omId_fkey" FOREIGN KEY ("omId") REFERENCES public."OM"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Usuario Usuario_omId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_omId_fkey" FOREIGN KEY ("omId") REFERENCES public."OM"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict WZKgOL4FrOVT58vvtEduuWYeAZDw5crgPf8MopvCewMhcAgwHtS9Vw4z9BypsG0

