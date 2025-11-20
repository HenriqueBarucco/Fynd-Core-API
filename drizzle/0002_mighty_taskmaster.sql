CREATE TABLE "user_tastes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"label" text NOT NULL,
	"normalized_label" text NOT NULL,
	"embedding_model" text NOT NULL,
	"qdrant_point_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_tastes" ADD CONSTRAINT "user_tastes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_tastes_user_label_unique" ON "user_tastes" USING btree ("user_id","normalized_label");