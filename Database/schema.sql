--
-- PostgreSQL database dump
--

\restrict L72QB7aXuMgWeM4uEz8y3EaleOVbDwGvKrHbxIsZ5IT0tOxYTNEELzJ9RRyUDU7

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-07-07 20:38:31

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 230 (class 1259 OID 49336)
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    user_id integer,
    candidate_id integer,
    job_id integer,
    tailored_cv_id integer,
    cv_id integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    applied_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 49335)
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 229
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- TOC entry 222 (class 1259 OID 49256)
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    user_id integer,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    resume_path text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 49255)
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidates_id_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 221
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- TOC entry 226 (class 1259 OID 49296)
-- Name: cvs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cvs (
    id integer NOT NULL,
    candidate_id integer,
    file_url text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cvs OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 49295)
-- Name: cvs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cvs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cvs_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 225
-- Name: cvs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cvs_id_seq OWNED BY public.cvs.id;


--
-- TOC entry 224 (class 1259 OID 49278)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    location character varying(255),
    company character varying(255),
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 49277)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 223
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 228 (class 1259 OID 49313)
-- Name: tailored_cvs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tailored_cvs (
    id integer NOT NULL,
    candidate_id integer,
    job_id integer,
    file_url text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tailored_cvs OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 49312)
-- Name: tailored_cvs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tailored_cvs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tailored_cvs_id_seq OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 227
-- Name: tailored_cvs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tailored_cvs_id_seq OWNED BY public.tailored_cvs.id;


--
-- TOC entry 220 (class 1259 OID 49240)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 49239)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4895 (class 2604 OID 49339)
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- TOC entry 4884 (class 2604 OID 49259)
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 49299)
-- Name: cvs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs ALTER COLUMN id SET DEFAULT nextval('public.cvs_id_seq'::regclass);


--
-- TOC entry 4887 (class 2604 OID 49281)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 49316)
-- Name: tailored_cvs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tailored_cvs ALTER COLUMN id SET DEFAULT nextval('public.tailored_cvs_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 49243)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5083 (class 0 OID 49336)
-- Dependencies: 230
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, user_id, candidate_id, job_id, tailored_cv_id, cv_id, status, applied_at, updated_at) FROM stdin;
1	1	1	1	1	1	pending	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
\.


--
-- TOC entry 5075 (class 0 OID 49256)
-- Dependencies: 222
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, user_id, first_name, last_name, email, phone, resume_path, created_at, updated_at) FROM stdin;
1	1	Akin	Oladejo	kola@gmail.com	08012345678	\N	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
2	2	Bola	Oguns	bola@gmail.com	08087654321	\N	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
\.


--
-- TOC entry 5079 (class 0 OID 49296)
-- Dependencies: 226
-- Data for Name: cvs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cvs (id, candidate_id, file_url, uploaded_at) FROM stdin;
1	1	https://example.com/cv1.pdf	2026-02-15 11:15:20.293666
2	2	https://example.com/cv2.pdf	2026-02-15 11:15:20.293666
\.


--
-- TOC entry 5077 (class 0 OID 49278)
-- Dependencies: 224
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, description, location, company, created_by, created_at, updated_at) FROM stdin;
1	Frontend Developer	Build React apps	Lagos	TechCorp	1	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
2	Backend Developer	Node.js APIs	Abuja	DevInc	2	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
\.


--
-- TOC entry 5081 (class 0 OID 49313)
-- Dependencies: 228
-- Data for Name: tailored_cvs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tailored_cvs (id, candidate_id, job_id, file_url, created_at, updated_at) FROM stdin;
1	1	1	https://example.com/tailored_cv1.pdf	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
\.


--
-- TOC entry 5073 (class 0 OID 49240)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, created_at, updated_at) FROM stdin;
1	kola@gmail.com	hashed_password_here	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
2	bola@gmail.com	hashed_password_here	2026-02-15 11:15:20.293666	2026-02-15 11:15:20.293666
\.


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 229
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 1, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 221
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidates_id_seq', 2, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 225
-- Name: cvs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cvs_id_seq', 2, true);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 223
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 2, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 227
-- Name: tailored_cvs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tailored_cvs_id_seq', 1, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4914 (class 2606 OID 49345)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 49271)
-- Name: candidates candidates_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_email_key UNIQUE (email);


--
-- TOC entry 4906 (class 2606 OID 49269)
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 49306)
-- Name: cvs cvs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs
    ADD CONSTRAINT cvs_pkey PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 49289)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 49324)
-- Name: tailored_cvs tailored_cvs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tailored_cvs
    ADD CONSTRAINT tailored_cvs_pkey PRIMARY KEY (id);


--
-- TOC entry 4900 (class 2606 OID 49254)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4902 (class 2606 OID 49252)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 49351)
-- Name: applications applications_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE SET NULL;


--
-- TOC entry 4921 (class 2606 OID 49366)
-- Name: applications applications_cv_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_cv_id_fkey FOREIGN KEY (cv_id) REFERENCES public.cvs(id) ON DELETE SET NULL;


--
-- TOC entry 4922 (class 2606 OID 49356)
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 49361)
-- Name: applications applications_tailored_cv_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_tailored_cv_id_fkey FOREIGN KEY (tailored_cv_id) REFERENCES public.tailored_cvs(id) ON DELETE SET NULL;


--
-- TOC entry 4924 (class 2606 OID 49346)
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4915 (class 2606 OID 49272)
-- Name: candidates candidates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4917 (class 2606 OID 49307)
-- Name: cvs cvs_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs
    ADD CONSTRAINT cvs_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 4916 (class 2606 OID 49290)
-- Name: jobs jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4918 (class 2606 OID 49325)
-- Name: tailored_cvs tailored_cvs_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tailored_cvs
    ADD CONSTRAINT tailored_cvs_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 4919 (class 2606 OID 49330)
-- Name: tailored_cvs tailored_cvs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tailored_cvs
    ADD CONSTRAINT tailored_cvs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


-- Completed on 2026-07-07 20:38:32

--
-- PostgreSQL database dump complete
--

\unrestrict L72QB7aXuMgWeM4uEz8y3EaleOVbDwGvKrHbxIsZ5IT0tOxYTNEELzJ9RRyUDU7

