CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100),
    "avatar_url" TEXT,
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "mixtapes" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "mood" VARCHAR(50),
    "shell_theme" VARCHAR(50) DEFAULT 'neon-blue',
    "cover_url" TEXT,
    "author_id" UUID NOT NULL,
    "is_collaborative" BOOLEAN NOT NULL DEFAULT false,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "remix_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mixtapes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "mixtapes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_mixtapes_author" ON "mixtapes"("author_id");
CREATE INDEX IF NOT EXISTS "idx_mixtapes_mood" ON "mixtapes"("mood");
CREATE INDEX IF NOT EXISTS "idx_mixtapes_year" ON "mixtapes"("year");
CREATE INDEX IF NOT EXISTS "idx_mixtapes_created" ON "mixtapes"("created_at");

CREATE TABLE IF NOT EXISTS "tracks" (
    "id" UUID NOT NULL,
    "mixtape_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "artist" VARCHAR(200) NOT NULL,
    "album" VARCHAR(200),
    "duration" INTEGER NOT NULL DEFAULT 180,
    "audio_url" TEXT,
    "cover_url" TEXT,
    "side" CHAR(1) NOT NULL,
    "track_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tracks_mixtape_id_fkey" FOREIGN KEY ("mixtape_id") REFERENCES "mixtapes"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_tracks_mixtape" ON "tracks"("mixtape_id");

CREATE TABLE IF NOT EXISTS "comments" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "mixtape_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "comments_mixtape_id_fkey" FOREIGN KEY ("mixtape_id") REFERENCES "mixtapes"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_comments_mixtape" ON "comments"("mixtape_id");

CREATE TABLE IF NOT EXISTS "likes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mixtape_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "likes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "likes_mixtape_id_fkey" FOREIGN KEY ("mixtape_id") REFERENCES "mixtapes"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_id_mixtape_id_key" ON "likes"("user_id", "mixtape_id");
CREATE INDEX IF NOT EXISTS "idx_likes_mixtape" ON "likes"("mixtape_id");

CREATE TABLE IF NOT EXISTS "mixtape_collaborators" (
    "mixtape_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(50) DEFAULT 'editor',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mixtape_collaborators_pkey" PRIMARY KEY ("mixtape_id","user_id"),
    CONSTRAINT "mixtape_collaborators_mixtape_id_fkey" FOREIGN KEY ("mixtape_id") REFERENCES "mixtapes"("id") ON DELETE CASCADE,
    CONSTRAINT "mixtape_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
