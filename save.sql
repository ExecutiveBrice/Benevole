

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
    OWNER to spjaautoglbjjg;



    -- Table: public."Creneaus"

-- DROP TABLE public."Creneaus";

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
    OWNER to spjaautoglbjjg;





    -- Table: public."Croisements"

-- DROP TABLE public."Croisements";

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
    OWNER to spjaautoglbjjg;




    -- Table: public."ResaBenevoles"

-- DROP TABLE public."ResaBenevoles";

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
    OWNER to spjaautoglbjjg;



    -- Table: public."Stands"

-- DROP TABLE public."Stands";

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
    OWNER to spjaautoglbjjg;




id,"nom","description","createdAt","updatedAt","bulle","ordre"
1,"tous","dqsdqd","","","",8
3,"Buvette","","","","Servir et vendre des boissons",5
9,"Preparatif","","","","Temps convivial pour prÃ©parer 1 tonne de crÃ¨pes",1
8,"Jeux","","","","Encadrement des stands jeux assistÃ© par des CM1-CM2",6
4,"Restauration","","","","Vente de gÃ¢teaux, confiseries et repas chauds",4
6,"Montage","","","","Aider au montage des stands et Ã  la mise en place",2
7,"DÃ©montage","","","","Pliage des stands, rangement des tables et nettoyage",7
2,"Frite","","","","Bienvenue dans le monde de la frite: prÃ©paration ou conditionnement",3



id,"createdAt","updatedAt","plage","ordre","groupe"
9,"","","8H15-11H",2,3
18,"","","8H15-10H30",1,1
1,"","","9H30-10H30",3,1
2,"","","10H30-11H30",4,1
3,"","","11H30-12H30",5,1
4,"","","12H30-13H30",6,2
5,"","","13H30-14H30",7,2
6,"","","14h30-15H30",11,2
7,"","","15H30-16H30",14,3
10,"","","16H30-18H00",16,4
12,"","","13H30-14H15",8,1
13,"","","14H15-15H00",10,1
14,"","","15H00-15H45",13,1
15,"","","15H45-16H30",15,1
16,"","","13H30-15H00",9,1
17,"","","15H00-16H30",12,1
8,"","","16H30-17H30",17,3
19,"","","Vendredi 28 Ã  partir de 18h",0,1




param,"value","createdAt","updatedAt"
validation2,"Vous pouvez revenir Ã  tout moment pour modifier vos choix en vous connectant Ã  l'aide de votre adresse e-mail.","",""
rappel1,"Ce 29 juin se dÃ©roule la fÃªte de l'Ã©cole de l'Ouche Dinier. Vous vous Ãªtes inscrit en tant que bÃ©nÃ©vole pour:","","2019-04-02"
validation1,"Votre participation Ã  bien Ã©tÃ© prise en compte","",""
erreur1,"Le site est bloquÃ© pour le moment","",""
erreur2,"Veuillez revenir ultÃ©rieurement","",""
lock,"false","","2019-04-04"
dateRappel,"5/3/2019 Ã  21:30","","2019-04-05"
rappel2," ","","2019-04-02"
titleText,"FÃªte de l'Ã©cole de l'Ouche Dinier","",""
titleDate,"Planning du 29 Juin 2019","",""



id,"limite","createdAt","updatedAt","creneau","stand","besoin","selected"
7,2,"","",2,2,True,""
11,2,"","",3,3,"",""
5,100,"","",3,1,"",""
21,100,"","",4,1,"",""
22,100,"","",10,1,"",""
2,100,"","",16,1,"",""
1,100,"","",18,1,"",""
3,100,"","",17,1,"",""
4,100,"","",2,1,"",""
31,100,"","",19,9,"",""
8,5,"","",12,8,False,""
29,5,"","",13,8,False,""
16,5,"","",14,8,False,""
18,5,"","",15,8,False,""
26,5,"","",5,4,True,""
28,5,"","",9,6,True,""
30,5,"","",10,7,True,""
19,5,"","",2,4,True,""
20,5,"","",3,4,True,""
14,5,"","",7,4,True,""
27,5,"","",6,4,True,""
25,5,"","",4,4,True,""
23,5,"","",1,2,True,""
6,5,"","",3,2,True,""
9,5,"","",4,2,True,""
10,5,"","",5,2,True,""
12,5,"","",4,3,"",""
13,5,"","",5,3,"",""
15,5,"","",6,3,"",""
17,5,"","",7,3,"",""







    -- Table: public."Users"

-- DROP TABLE public."Users";

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
    OWNER to spjaautoglbjjg;