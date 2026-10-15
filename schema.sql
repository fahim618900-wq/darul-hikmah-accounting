


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_monthly_fee_for_student"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  current_month integer := extract(month from current_date);
  current_year integer := extract(year from current_date);
begin
  insert into public.monthly_fees (student_id, month, year, payable_amount)
  values (new.id, current_month, current_year, coalesce(new.monthly_fee, 0) - coalesce(new.discount, 0))
  on conflict do nothing;
  return new;
end;
$$;


ALTER FUNCTION "public"."create_monthly_fee_for_student"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select role from public.profiles where id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'pending'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_month_closed"("p_month" integer, "p_year" integer) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists(
    select 1 from closed_months
    where month = p_month and year = p_year
  );
$$;


ALTER FUNCTION "public"."is_month_closed"("p_month" integer, "p_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_audit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid;
  v_user_email text;
  v_user_role text;
  v_action text;
  v_record_id text;
  v_desc text;
  v_new jsonb;
  v_old jsonb;
begin
  v_user_id := auth.uid();
  v_user_email := coalesce(
    (select email from auth.users where id = v_user_id),
    'system'
  );
  v_user_role := coalesce(public.get_my_role(), 'anon');

  if (TG_OP = 'INSERT') then
    v_action := 'insert';
    v_new := to_jsonb(new);
    v_old := null;
    -- id থাকলে সেটা নাও, নাহলে key নাও, নাহলে খালি
    v_record_id := coalesce(
      v_new->>'id',
      v_new->>'key',
      ''
    );
    v_desc := 'নতুন রেকর্ড যোগ করা হয়েছে';
  elsif (TG_OP = 'UPDATE') then
    v_action := 'update';
    v_new := to_jsonb(new);
    v_old := to_jsonb(old);
    v_record_id := coalesce(
      v_new->>'id',
      v_new->>'key',
      ''
    );
    v_desc := 'রেকর্ড পরিবর্তন করা হয়েছে';
  elsif (TG_OP = 'DELETE') then
    v_action := 'delete';
    v_new := null;
    v_old := to_jsonb(old);
    v_record_id := coalesce(
      v_old->>'id',
      v_old->>'key',
      ''
    );
    v_desc := 'রেকর্ড ডিলিট করা হয়েছে';
  end if;

  insert into audit_logs (
    user_id, user_email, user_role, action,
    table_name, record_id, old_data, new_data, description
  ) values (
    v_user_id, v_user_email, v_user_role, v_action,
    TG_TABLE_NAME, v_record_id, v_old, v_new, v_desc
  );

  if (TG_OP = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."log_audit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_closed_month_expense"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_date date;
  v_month integer;
  v_year integer;
begin
  if (TG_OP = 'DELETE') then
    v_date := OLD.entry_date;
  else
    v_date := NEW.entry_date;
  end if;

  v_month := extract(month from v_date);
  v_year := extract(year from v_date);

  if public.is_month_closed(v_month, v_year) then
    raise exception 'এই মাস বন্ধ করা হয়েছে। পরিবর্তন করা যাবে না।';
  end if;

  if (TG_OP = 'DELETE') then
    return OLD;
  end if;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."prevent_closed_month_expense"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_closed_month_income"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_date date;
  v_month integer;
  v_year integer;
begin
  if (TG_OP = 'DELETE') then
    v_date := OLD.entry_date;
  else
    v_date := NEW.entry_date;
  end if;

  v_month := extract(month from v_date);
  v_year := extract(year from v_date);

  if public.is_month_closed(v_month, v_year) then
    raise exception 'এই মাস বন্ধ করা হয়েছে। পরিবর্তন করা যাবে না।';
  end if;

  if (TG_OP = 'DELETE') then
    return OLD;
  end if;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."prevent_closed_month_income"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_closed_month_payment"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_month integer;
  v_year integer;
begin
  if (TG_OP = 'DELETE') then
    v_month := OLD.month;
    v_year := OLD.year;
  else
    v_month := NEW.month;
    v_year := NEW.year;
  end if;

  if public.is_month_closed(v_month, v_year) then
    raise exception 'এই মাস বন্ধ করা হয়েছে। পরিবর্তন করা যাবে না।';
  end if;

  if (TG_OP = 'DELETE') then
    return OLD;
  end if;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."prevent_closed_month_payment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
        EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "key" "text" NOT NULL,
    "value" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."app_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "user_email" "text",
    "user_role" "text",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "text",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."audit_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."audit_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."audit_logs_id_seq" OWNED BY "public"."audit_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."closed_months" (
    "id" bigint NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "closed_by" "uuid",
    "closed_by_name" "text",
    "closed_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "note" "text",
    CONSTRAINT "closed_months_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."closed_months" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."closed_months_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."closed_months_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."closed_months_id_seq" OWNED BY "public"."closed_months"."id";



CREATE TABLE IF NOT EXISTS "public"."expense_categories" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."expense_categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."expense_categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."expense_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."expense_categories_id_seq" OWNED BY "public"."expense_categories"."id";



CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" bigint NOT NULL,
    "category_id" bigint,
    "amount" numeric(12,2) NOT NULL,
    "entry_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "payment_method" "text" DEFAULT 'cash'::"text",
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "voucher_no" "text",
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "expenses_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['cash'::"text", 'bkash'::"text", 'nagad'::"text", 'bank'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."expenses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."expenses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."expenses_id_seq" OWNED BY "public"."expenses"."id";



CREATE TABLE IF NOT EXISTS "public"."fee_payments" (
    "id" bigint NOT NULL,
    "student_id" bigint,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "payment_method" "text" DEFAULT 'cash'::"text",
    "receipt_no" "text",
    "payment_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "note" "text",
    "is_deleted" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "monthly_fee_id" bigint,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "fee_payments_month_check" CHECK ((("month" >= 1) AND ("month" <= 12))),
    CONSTRAINT "fee_payments_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['cash'::"text", 'bkash'::"text", 'nagad'::"text", 'bank'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."fee_payments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."fee_payments_detail" AS
 SELECT "id",
    "student_id",
    "month",
    "year",
    "amount",
    "payment_date",
    "receipt_no",
    "payment_method",
    "note",
    "created_at"
   FROM "public"."fee_payments" "fp";


ALTER VIEW "public"."fee_payments_detail" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."fee_payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fee_payments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fee_payments_id_seq" OWNED BY "public"."fee_payments"."id";



CREATE OR REPLACE VIEW "public"."fee_payments_public" AS
 SELECT "id",
    "student_id",
    "month",
    "year",
    "amount",
    "payment_date",
    "receipt_no",
    "payment_method"
   FROM "public"."fee_payments";


ALTER VIEW "public"."fee_payments_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."income_categories" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."income_categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."income_categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."income_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."income_categories_id_seq" OWNED BY "public"."income_categories"."id";



CREATE TABLE IF NOT EXISTS "public"."incomes" (
    "id" bigint NOT NULL,
    "category_id" bigint,
    "student_id" bigint,
    "amount" numeric(12,2) NOT NULL,
    "entry_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "payment_method" "text" DEFAULT 'cash'::"text",
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "receipt_no" "text",
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "incomes_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['cash'::"text", 'bkash'::"text", 'nagad'::"text", 'bank'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."incomes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."incomes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."incomes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."incomes_id_seq" OWNED BY "public"."incomes"."id";



CREATE TABLE IF NOT EXISTS "public"."keep_alive" (
    "id" bigint NOT NULL,
    "pinged_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."keep_alive" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."keep_alive_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."keep_alive_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."keep_alive_id_seq" OWNED BY "public"."keep_alive"."id";



CREATE TABLE IF NOT EXISTS "public"."monthly_fees" (
    "id" bigint NOT NULL,
    "student_id" bigint,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "payable_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "monthly_fees_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."monthly_fees" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."monthly_fees_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."monthly_fees_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."monthly_fees_id_seq" OWNED BY "public"."monthly_fees"."id";



CREATE TABLE IF NOT EXISTS "public"."notification_reads" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "notification_key" "text" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."notification_reads" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notification_reads_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."notification_reads_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notification_reads_id_seq" OWNED BY "public"."notification_reads"."id";



CREATE TABLE IF NOT EXISTS "public"."print_templates" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "class_name" "text",
    "columns" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "show_qr" boolean DEFAULT true,
    "show_photo" boolean DEFAULT false,
    "orientation" "text" DEFAULT 'portrait'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "print_templates_orientation_check" CHECK (("orientation" = ANY (ARRAY['portrait'::"text", 'landscape'::"text"])))
);


ALTER TABLE "public"."print_templates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."print_templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."print_templates_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."print_templates_id_seq" OWNED BY "public"."print_templates"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_held" boolean DEFAULT false,
    "held_at" timestamp with time zone,
    "held_reason" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['pending'::"text", 'admin'::"text", 'accountant'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "class_name" "text" NOT NULL,
    "section" "text",
    "guardian_name" "text",
    "guardian_phone" "text",
    "monthly_fee" numeric(10,2) DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "student_id" "text",
    "roll" "text",
    "address" "text",
    "admission_date" "date" DEFAULT CURRENT_DATE,
    "discount" numeric(10,2) DEFAULT 0,
    "discount_reason" "text",
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    "photo_url" "text",
    "gender" "text",
    "blood_group" "text",
    "emergency_contact" "text",
    CONSTRAINT "students_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text"]))),
    CONSTRAINT "students_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."student_public" AS
 SELECT "id",
    "name",
    "class_name",
    "roll",
    "section",
    "photo_url"
   FROM "public"."students"
  WHERE ("status" = 'active'::"text");


ALTER VIEW "public"."student_public" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."students_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."students_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."students_id_seq" OWNED BY "public"."students"."id";



CREATE OR REPLACE VIEW "public"."transactions_all" AS
 SELECT 'income'::"text" AS "type",
    "i"."id",
    "i"."entry_date" AS "date",
    "ic"."name" AS "category",
    "i"."amount",
    "i"."receipt_no" AS "ref_no",
    "i"."description",
    "i"."payment_method",
    "i"."created_by",
    "i"."created_at"
   FROM ("public"."incomes" "i"
     LEFT JOIN "public"."income_categories" "ic" ON (("ic"."id" = "i"."category_id")))
  WHERE ((("i"."is_deleted" = false) OR ("i"."is_deleted" IS NULL)) AND ("i"."deleted_at" IS NULL))
UNION ALL
 SELECT 'income'::"text" AS "type",
    "fp"."id",
    "fp"."payment_date" AS "date",
    'শিক্ষার্থীদের বেতন/ফি'::"text" AS "category",
    "fp"."amount",
    "fp"."receipt_no" AS "ref_no",
    COALESCE(NULLIF("fp"."note", ''), CASE WHEN "s"."name" IS NOT NULL THEN 'শিক্ষার্থী: ' || "s"."name" ELSE 'শিক্ষার্থীর ফি আদায়' END) AS "description",
    "fp"."payment_method",
    "fp"."created_by",
    "fp"."created_at"
   FROM ("public"."fee_payments" "fp"
     LEFT JOIN "public"."students" "s" ON (("s"."id" = "fp"."student_id")))
  WHERE ((("fp"."is_deleted" = false) OR ("fp"."is_deleted" IS NULL)) AND ("fp"."deleted_at" IS NULL))
UNION ALL
 SELECT 'expense'::"text" AS "type",
    "e"."id",
    "e"."entry_date" AS "date",
    "ec"."name" AS "category",
    "e"."amount",
    "e"."voucher_no" AS "ref_no",
    "e"."description",
    "e"."payment_method",
    "e"."created_by",
    "e"."created_at"
   FROM ("public"."expenses" "e"
     LEFT JOIN "public"."expense_categories" "ec" ON (("ec"."id" = "e"."category_id")))
  WHERE ((("e"."is_deleted" = false) OR ("e"."is_deleted" IS NULL)) AND ("e"."deleted_at" IS NULL));


ALTER VIEW "public"."transactions_all" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."audit_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."closed_months" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."closed_months_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."expense_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."expense_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."expenses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."expenses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fee_payments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fee_payments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."income_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."income_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."incomes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."incomes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."keep_alive" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."keep_alive_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."monthly_fees" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."monthly_fees_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notification_reads" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notification_reads_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."print_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."print_templates_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."students" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."students_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."closed_months"
    ADD CONSTRAINT "closed_months_month_year_key" UNIQUE ("month", "year");



ALTER TABLE ONLY "public"."closed_months"
    ADD CONSTRAINT "closed_months_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_payments"
    ADD CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."income_categories"
    ADD CONSTRAINT "income_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."income_categories"
    ADD CONSTRAINT "income_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incomes"
    ADD CONSTRAINT "incomes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."keep_alive"
    ADD CONSTRAINT "keep_alive_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_fees"
    ADD CONSTRAINT "monthly_fees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_reads"
    ADD CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_reads"
    ADD CONSTRAINT "notification_reads_user_id_notification_key_key" UNIQUE ("user_id", "notification_key");



ALTER TABLE ONLY "public"."print_templates"
    ADD CONSTRAINT "print_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_student_id_key" UNIQUE ("student_id");



CREATE UNIQUE INDEX "fee_payments_unique_idx_v2" ON "public"."fee_payments" USING "btree" ("student_id", "month", "year", "amount", "payment_date") WHERE ("is_deleted" = false);



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_table" ON "public"."audit_logs" USING "btree" ("table_name");



CREATE INDEX "idx_audit_logs_user" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_closed_months" ON "public"."closed_months" USING "btree" ("year", "month");



CREATE UNIQUE INDEX "monthly_fees_unique_idx" ON "public"."monthly_fees" USING "btree" ("student_id", "month", "year") WHERE ("is_deleted" = false);



CREATE OR REPLACE TRIGGER "audit_app_settings" AFTER INSERT OR DELETE OR UPDATE ON "public"."app_settings" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "audit_expenses" AFTER INSERT OR DELETE OR UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "audit_fee_payments" AFTER INSERT OR DELETE OR UPDATE ON "public"."fee_payments" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "audit_incomes" AFTER INSERT OR DELETE OR UPDATE ON "public"."incomes" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "audit_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "audit_students" AFTER INSERT OR DELETE OR UPDATE ON "public"."students" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "on_student_created" AFTER INSERT ON "public"."students" FOR EACH ROW EXECUTE FUNCTION "public"."create_monthly_fee_for_student"();



CREATE OR REPLACE TRIGGER "prevent_closed_month_expense" BEFORE INSERT OR DELETE OR UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_closed_month_expense"();



CREATE OR REPLACE TRIGGER "prevent_closed_month_income" BEFORE INSERT OR DELETE OR UPDATE ON "public"."incomes" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_closed_month_income"();



CREATE OR REPLACE TRIGGER "prevent_closed_month_payment" BEFORE INSERT OR DELETE OR UPDATE ON "public"."fee_payments" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_closed_month_payment"();



ALTER TABLE ONLY "public"."closed_months"
    ADD CONSTRAINT "closed_months_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."fee_payments"
    ADD CONSTRAINT "fee_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."fee_payments"
    ADD CONSTRAINT "fee_payments_monthly_fee_id_fkey" FOREIGN KEY ("monthly_fee_id") REFERENCES "public"."monthly_fees"("id");



ALTER TABLE ONLY "public"."fee_payments"
    ADD CONSTRAINT "fee_payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incomes"
    ADD CONSTRAINT "incomes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."income_categories"("id");



ALTER TABLE ONLY "public"."incomes"
    ADD CONSTRAINT "incomes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."incomes"
    ADD CONSTRAINT "incomes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."monthly_fees"
    ADD CONSTRAINT "monthly_fees_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_reads"
    ADD CONSTRAINT "notification_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."print_templates"
    ADD CONSTRAINT "print_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "admin delete expenses" ON "public"."expenses" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin delete fee_payments" ON "public"."fee_payments" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin delete incomes" ON "public"."incomes" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin delete profiles" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin delete students" ON "public"."students" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin insert app_settings" ON "public"."app_settings" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin manage closed_months" ON "public"."closed_months" TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin manage print_templates" ON "public"."print_templates" TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin read all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin read audit_logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin read deleted students" ON "public"."students" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin update all profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin update app_settings" ON "public"."app_settings" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "admin/accountant can insert expenses" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin/accountant can insert incomes" ON "public"."incomes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin/accountant can insert students" ON "public"."students" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin/accountant insert fee_payments" ON "public"."fee_payments" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin/accountant insert monthly_fees" ON "public"."monthly_fees" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin/accountant update fee_payments" ON "public"."fee_payments" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "admin/accountant update monthly_fees" ON "public"."monthly_fees" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "admin/accountant update students" ON "public"."students" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'accountant'::"text"])));



CREATE POLICY "anon can insert keep_alive" ON "public"."keep_alive" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "anyone insert audit_logs" ON "public"."audit_logs" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."closed_months" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."income_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."incomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."keep_alive" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "logged in read monthly_fees" ON "public"."monthly_fees" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "logged in users can read expense_categories" ON "public"."expense_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "logged in users can read expenses" ON "public"."expenses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "logged in users can read income_categories" ON "public"."income_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "logged in users can read incomes" ON "public"."incomes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "logged in users read fee_payments" ON "public"."fee_payments" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."monthly_fees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_reads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."print_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public read app_settings" ON "public"."app_settings" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "public read student basic info" ON "public"."students" FOR SELECT TO "anon" USING (true);



CREATE POLICY "read closed_months" ON "public"."closed_months" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "read print_templates" ON "public"."print_templates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "read students" ON "public"."students" FOR SELECT TO "authenticated" USING ((("is_deleted" = false) OR ("public"."get_my_role"() = 'admin'::"text")));



ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "users manage own notification reads" ON "public"."notification_reads" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "users update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."create_monthly_fee_for_student"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_monthly_fee_for_student"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_monthly_fee_for_student"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_month_closed"("p_month" integer, "p_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_month_closed"("p_month" integer, "p_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_month_closed"("p_month" integer, "p_year" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."log_audit"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_audit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_audit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_closed_month_expense"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_closed_month_expense"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_closed_month_expense"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_closed_month_income"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_closed_month_income"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_closed_month_income"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_closed_month_payment"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_closed_month_payment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_closed_month_payment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT ALL ON TABLE "public"."app_settings" TO "anon";
GRANT ALL ON TABLE "public"."app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."app_settings" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."closed_months" TO "anon";
GRANT ALL ON TABLE "public"."closed_months" TO "authenticated";
GRANT ALL ON TABLE "public"."closed_months" TO "service_role";



GRANT ALL ON SEQUENCE "public"."closed_months_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."closed_months_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."closed_months_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expense_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expense_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expense_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fee_payments" TO "anon";
GRANT ALL ON TABLE "public"."fee_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_payments" TO "service_role";



GRANT ALL ON TABLE "public"."fee_payments_detail" TO "anon";
GRANT ALL ON TABLE "public"."fee_payments_detail" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_payments_detail" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fee_payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fee_payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fee_payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fee_payments_public" TO "anon";
GRANT ALL ON TABLE "public"."fee_payments_public" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_payments_public" TO "service_role";



GRANT ALL ON TABLE "public"."income_categories" TO "anon";
GRANT ALL ON TABLE "public"."income_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."income_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."income_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."income_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."income_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."incomes" TO "anon";
GRANT ALL ON TABLE "public"."incomes" TO "authenticated";
GRANT ALL ON TABLE "public"."incomes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."incomes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."incomes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."incomes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."keep_alive" TO "anon";
GRANT ALL ON TABLE "public"."keep_alive" TO "authenticated";
GRANT ALL ON TABLE "public"."keep_alive" TO "service_role";



GRANT ALL ON SEQUENCE "public"."keep_alive_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."keep_alive_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."keep_alive_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_fees" TO "anon";
GRANT ALL ON TABLE "public"."monthly_fees" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_fees" TO "service_role";



GRANT ALL ON SEQUENCE "public"."monthly_fees_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."monthly_fees_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."monthly_fees_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notification_reads" TO "anon";
GRANT ALL ON TABLE "public"."notification_reads" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_reads" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notification_reads_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notification_reads_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notification_reads_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."print_templates" TO "anon";
GRANT ALL ON TABLE "public"."print_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."print_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."print_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."print_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."print_templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON TABLE "public"."student_public" TO "anon";
GRANT ALL ON TABLE "public"."student_public" TO "authenticated";
GRANT ALL ON TABLE "public"."student_public" TO "service_role";



GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."transactions_all" TO "anon";
GRANT ALL ON TABLE "public"."transactions_all" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions_all" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































