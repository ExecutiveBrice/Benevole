

CREATE SEQUENCE public."Benevoles_id_seq";

ALTER SEQUENCE public."Benevoles_id_seq"
    OWNER TO ylsnechbtzagbz;


CREATE TABLE public."Benevoles"
(
    id integer NOT NULL DEFAULT nextval('"Benevoles_id_seq"'::regclass),
    prenom character varying COLLATE pg_catalog."default",
    nom character varying COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    telephone character varying COLLATE pg_catalog."default",
    "createdAt" date,
    "updatedAt" date,
    commentaire character varying COLLATE pg_catalog."default",
    reponse character varying COLLATE pg_catalog."default",
    gateaux character varying COLLATE pg_catalog."default",
    CONSTRAINT "Benevoles_pkey" PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."Benevoles"
    OWNER to ylsnechbtzagbz;








    -- Table: public."Configs"

-- DROP TABLE public."Configs";

CREATE TABLE public."Configs"
(
    param character varying COLLATE pg_catalog."default" NOT NULL,
    value character varying COLLATE pg_catalog."default",
    "createdAt" date,
    "updatedAt" date,
    CONSTRAINT "Config_pkey" PRIMARY KEY (param)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."Configs"
    OWNER to ylsnechbtzagbz;



    -- Table: public."Creneaus"

-- DROP TABLE public."Creneaus";
CREATE SEQUENCE public.creneau_id_seq;

ALTER SEQUENCE public.creneau_id_seq
    OWNER TO ylsnechbtzagbz;
CREATE TABLE public."Creneaus"
(
    id integer NOT NULL DEFAULT nextval('creneau_id_seq'::regclass),
    "createdAt" date,
    "updatedAt" date,
    plage character varying COLLATE pg_catalog."default",
    ordre integer,
    groupe integer,
    CONSTRAINT creneau_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."Creneaus"
    OWNER to ylsnechbtzagbz;





    -- Table: public."Stands"

-- DROP TABLE public."Stands";
CREATE SEQUENCE public.stand_id_seq;

ALTER SEQUENCE public.stand_id_seq
    OWNER TO ylsnechbtzagbz;
CREATE TABLE public."Stands"
(
    id integer NOT NULL DEFAULT nextval('stand_id_seq'::regclass),
    nom character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    "createdAt" date,
    "updatedAt" date,
    bulle character varying COLLATE pg_catalog."default",
    ordre integer,
    CONSTRAINT stand_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."Stands"
    OWNER to ylsnechbtzagbz;


    -- Table: public."Croisements"

-- DROP TABLE public."Croisements";
-- DROP SEQUENCE public.croisement_id_seq;

CREATE SEQUENCE public.croisement_id_seq;

ALTER SEQUENCE public.croisement_id_seq
    OWNER TO ylsnechbtzagbz;
CREATE TABLE public."Croisements"
(
    id integer NOT NULL DEFAULT nextval('croisement_id_seq'::regclass),
    limite integer,
    "createdAt" date,
    "updatedAt" date,
    creneau integer,
    stand integer,
    besoin boolean,
    selected boolean,
    CONSTRAINT croisement_pkey PRIMARY KEY (id),
    CONSTRAINT "Creneau" FOREIGN KEY (creneau)
        REFERENCES public."Creneaus" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Stand" FOREIGN KEY (stand)
        REFERENCES public."Stands" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."Croisements"
    OWNER to ylsnechbtzagbz;




    -- Table: public."ResaBenevoles"

-- DROP TABLE public."ResaBenevoles";
CREATE SEQUENCE public."ResaBenevoles_id_seq";

ALTER SEQUENCE public."ResaBenevoles_id_seq"
    OWNER TO ylsnechbtzagbz;

CREATE TABLE public."ResaBenevoles"
(
    id integer NOT NULL DEFAULT nextval('"ResaBenevoles_id_seq"'::regclass),
    benevole integer,
    croisement integer,
    "createdAt" date,
    "updatedAt" date,
    CONSTRAINT "ResaBenevoles_pkey" PRIMARY KEY (id),
    CONSTRAINT "Benevoles" FOREIGN KEY (benevole)
        REFERENCES public."Benevoles" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Croisements" FOREIGN KEY (croisement)
        REFERENCES public."Croisements" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."ResaBenevoles"
    OWNER to ylsnechbtzagbz;








    -- Table: public."Users"

-- DROP TABLE public."Users";
CREATE SEQUENCE public."Users_id_seq";

ALTER SEQUENCE public."Users_id_seq"
    OWNER TO ylsnechbtzagbz;
CREATE TABLE public."Users"
(
    id integer NOT NULL DEFAULT nextval('"Users_id_seq"'::regclass),
    email character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default",
    "createdAt" date,
    "updatedAt" date,
    telephone character varying COLLATE pg_catalog."default",
    firstname character varying COLLATE pg_catalog."default",
    CONSTRAINT "Users_pkey" PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."Users"
    OWNER to ylsnechbtzagbz;