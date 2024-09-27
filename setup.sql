CREATE TABLE users
(
    id serial NOT NULL,
    login character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS users
    OWNER to postgres;


CREATE TABLE blogs
(
    id serial NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    "websiteUrl" character varying NOT NULL,
    "isMembership" boolean NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS blogs
    OWNER to postgres;


CREATE TABLE posts
(
    id serial NOT NULL,
    title character varying NOT NULL,
    "shortDescription" character varying NOT NULL,
    content text NOT NULL,
    "blogId" integer NOT NULL,
    "likesCount" integer NOT NULL,
    "dislikesCount" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS posts
    OWNER to postgres;



CREATE TABLE user_confirmation
(
    id serial NOT NULL,
    "userId" integer NOT NULL,
    "isConfirm" boolean NOT NULL,
    "confirmationCode" text NOT NULL,
    "dataExpire" timestamp with time zone NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS user_confirmation
    OWNER to postgres;



CREATE TABLE auth_session
(
    id serial NOT NULL,
    "userId" integer NOT NULL,
    "deviceId" character varying NOT NULL,
    "deviceName" text NOT NULL,
    ip character varying NOT NULL,
    "issueAt" timestamp with time zone NOT NULL,
    "expAt" timestamp with time zone NOT NULL,
    "isActive" boolean NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS auth_session
    OWNER to postgres;



CREATE TABLE likes
(
    id serial NOT NULL,
    "userId" integer NOT NULL,
    "parentId" integer NOT NULL,
    "entityType" character varying NOT NULL,
    status character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "lastUpdateAt" timestamp with time zone NOT NULL,
    "isActive" boolean NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS likes
    OWNER to postgres;



CREATE TABLE comments
(
    id serial NOT NULL,
    "userId" integer NOT NULL,
    "blogId" integer NOT NULL,
    "postId" integer NOT NULL,
    "likesCount" integer NOT NULL,
    "dislikesCount" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "isActive" boolean NOT NULL,
    content text NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS comments
    OWNER to postgres;


CREATE TABLE recovery_password_session
(
    id serial NOT NULL,
    email character varying NOT NULL,
    code character varying NOT NULL,
    "expAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS recovery_password_session
    OWNER to postgres;