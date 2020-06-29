--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.17
-- Dumped by pg_dump version 9.5.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE nanjang;
--
-- Name: nanjang; Type: DATABASE; Schema: -; Owner: nanjang
--

CREATE DATABASE nanjang WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'ko_KR.UTF8' LC_CTYPE = 'ko_KR.UTF8';


ALTER DATABASE nanjang OWNER TO nanjang;

\connect nanjang

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: sha256(text); Type: FUNCTION; Schema: public; Owner: nanjang
--

CREATE FUNCTION public.sha256(text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
    SELECT encode(digest($1, 'sha256'), 'hex')
$_$;


ALTER FUNCTION public.sha256(text) OWNER TO nanjang;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: nanjangpan; Type: TABLE; Schema: public; Owner: nanjang
--

CREATE TABLE public.nanjangpan (
    id integer NOT NULL,
    passwd character varying(128) NOT NULL,
    at timestamp with time zone,
    title character varying(128) NOT NULL,
    body text NOT NULL
);


ALTER TABLE public.nanjangpan OWNER TO nanjang;

--
-- Name: nanjangpan_id_seq; Type: SEQUENCE; Schema: public; Owner: nanjang
--

CREATE SEQUENCE public.nanjangpan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nanjangpan_id_seq OWNER TO nanjang;

--
-- Name: nanjangpan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nanjang
--

ALTER SEQUENCE public.nanjangpan_id_seq OWNED BY public.nanjangpan.id;


--
-- Name: reply; Type: TABLE; Schema: public; Owner: nanjang
--

CREATE TABLE public.reply (
    id integer NOT NULL,
    nid integer NOT NULL,
    body character varying(256) NOT NULL,
    at timestamp with time zone
);


ALTER TABLE public.reply OWNER TO nanjang;

--
-- Name: reply_id_seq; Type: SEQUENCE; Schema: public; Owner: nanjang
--

CREATE SEQUENCE public.reply_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reply_id_seq OWNER TO nanjang;

--
-- Name: reply_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nanjang
--

ALTER SEQUENCE public.reply_id_seq OWNED BY public.reply.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: nanjang
--

ALTER TABLE ONLY public.nanjangpan ALTER COLUMN id SET DEFAULT nextval('public.nanjangpan_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: nanjang
--

ALTER TABLE ONLY public.reply ALTER COLUMN id SET DEFAULT nextval('public.reply_id_seq'::regclass);


--
-- Name: nanjangpan_pkey; Type: CONSTRAINT; Schema: public; Owner: nanjang
--

ALTER TABLE ONLY public.nanjangpan
    ADD CONSTRAINT nanjangpan_pkey PRIMARY KEY (id);


--
-- Name: reply_pkey; Type: CONSTRAINT; Schema: public; Owner: nanjang
--

ALTER TABLE ONLY public.reply
    ADD CONSTRAINT reply_pkey PRIMARY KEY (id, nid);


--
-- Name: at_index; Type: INDEX; Schema: public; Owner: nanjang
--

CREATE INDEX at_index ON public.nanjangpan USING btree (at DESC);


--
-- Name: rpl_at_index; Type: INDEX; Schema: public; Owner: nanjang
--

CREATE INDEX rpl_at_index ON public.reply USING btree (at DESC);


--
-- Name: reply_nid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nanjang
--

ALTER TABLE ONLY public.reply
    ADD CONSTRAINT reply_nid_fkey FOREIGN KEY (nid) REFERENCES public.nanjangpan(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

