SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict iob90mwTjIDY7eKth3KFL9Avul7BlJFHWVoolCZj0RiTOZ75Rdnxfa9kqP3PPdc

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at", "custom_claims_allowlist") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
0ab83840-65a0-4c2c-8d5b-34c215d0648f	ec8e2ef4-d76f-40e7-b668-0d15f4f347a8	fcc2c016-bf52-419b-972d-8c5ce5df1128	s256	5afj7iySaGAXEwUE_RIA5SywsfeYsNMSw3cKFs8G-Hs	email			2026-10-12 17:03:15.333663+00	2026-10-12 17:03:38.558405+00	email/signup	2026-10-12 17:03:38.558322+00	\N	\N	\N	\N	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	ec8e2ef4-d76f-40e7-b668-0d15f4f347a8	authenticated	authenticated	sadek5182@gmail.com	$2a$10$m3RdFe0QG8GpADAVHgzyT.yBhwEDHNqJzezxh6bFLuVbzOeUKhrVW	2026-10-12 17:03:38.552293+00	\N		2026-10-12 17:03:15.348299+00		2026-10-12 17:14:44.542098+00			\N	2026-10-12 17:15:08.950219+00	{"provider": "email", "providers": ["email"]}	{"sub": "ec8e2ef4-d76f-40e7-b668-0d15f4f347a8", "email": "sadek5182@gmail.com", "full_name": "Fahim", "email_verified": true, "phone_verified": false}	\N	2026-10-12 17:03:15.246017+00	2026-10-12 17:15:08.967747+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	29a1258f-1247-4ed0-8087-5ecfdaa942aa	authenticated	authenticated	fahim618900@gmail.com	$2a$10$H1aX0Sa.lIXkozJP98.R1uur/R9K7dkDxMgfN689sHkmblklrV4Me	2026-10-12 17:17:13.30874+00	\N		\N		\N			\N	2026-10-14 16:48:28.126301+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-10-12 17:17:13.296626+00	2026-10-17 04:29:11.857566+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1740c62f-4d87-4331-863e-7fcfc69dde86	authenticated	authenticated	sadik618900@gmail.com	$2a$10$ClY.v2uQTREUQg0fJ5K/YOO3fIgCFjMicllHS98dGX0FkVL8oGrHu	2026-10-12 18:03:41.144829+00	\N		2026-10-12 18:03:17.520226+00		\N			\N	2026-10-13 11:56:13.87783+00	{"provider": "email", "providers": ["email"]}	{"sub": "1740c62f-4d87-4331-863e-7fcfc69dde86", "email": "sadik618900@gmail.com", "full_name": "Sadik ex", "email_verified": true, "phone_verified": false}	\N	2026-10-12 18:03:17.508113+00	2026-10-13 13:29:24.577668+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
ec8e2ef4-d76f-40e7-b668-0d15f4f347a8	ec8e2ef4-d76f-40e7-b668-0d15f4f347a8	{"sub": "ec8e2ef4-d76f-40e7-b668-0d15f4f347a8", "email": "sadek5182@gmail.com", "full_name": "Fahim", "email_verified": true, "phone_verified": false}	email	2026-10-12 17:03:15.324844+00	2026-10-12 17:03:15.324894+00	2026-10-12 17:03:15.324894+00	15ce67fa-6c6f-4a00-969c-8be62f713872
29a1258f-1247-4ed0-8087-5ecfdaa942aa	29a1258f-1247-4ed0-8087-5ecfdaa942aa	{"sub": "29a1258f-1247-4ed0-8087-5ecfdaa942aa", "email": "fahim618900@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-10-12 17:17:13.304986+00	2026-10-12 17:17:13.30504+00	2026-10-12 17:17:13.30504+00	f54e51f7-29c2-4d5d-aca6-94ec60b85d9e
1740c62f-4d87-4331-863e-7fcfc69dde86	1740c62f-4d87-4331-863e-7fcfc69dde86	{"sub": "1740c62f-4d87-4331-863e-7fcfc69dde86", "email": "sadik618900@gmail.com", "full_name": "Sadik ex", "email_verified": true, "phone_verified": false}	email	2026-10-12 18:03:17.515591+00	2026-10-12 18:03:17.51564+00	2026-10-12 18:03:17.51564+00	ed08f3a5-64f5-4501-aa17-6d681fd293d5
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
f32af805-15f2-4f7e-80b1-6d9ce92b6d99	ec8e2ef4-d76f-40e7-b668-0d15f4f347a8	2026-10-12 17:15:08.950973+00	2026-10-12 17:15:08.950973+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36	103.153.48.249	\N	\N	\N	\N	\N
677a7bd5-fbda-44d8-b5da-c4754b7da108	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-14 11:04:06.040381+00	2026-10-16 19:15:55.39291+00	\N	aal1	\N	2026-10-16 19:15:55.392771	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36	103.60.204.104	\N	\N	\N	\N	\N
38434868-5073-4cfe-ad80-2fe83c3e23a9	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-13 16:20:42.042366+00	2026-10-17 04:29:11.875439+00	\N	aal1	\N	2026-10-17 04:29:11.87533	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36	104.28.208.83	\N	\N	\N	\N	\N
b66a313c-ea59-477c-a428-9ad69d77b07c	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-13 13:29:51.606338+00	2026-10-13 15:50:18.594979+00	\N	aal1	\N	2026-10-13 15:50:18.594871	Vercel Edge Functions	15.207.101.246	\N	\N	\N	\N	\N
9bae22a8-4111-46b4-8a52-8493f1c90a30	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-13 16:37:14.3629+00	2026-10-13 16:37:14.3629+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36	103.60.204.104	\N	\N	\N	\N	\N
5c7f6c16-aefc-48fa-a81a-a31c65b7e4e5	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-14 01:25:49.013111+00	2026-10-14 01:25:49.013111+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36	103.60.204.104	\N	\N	\N	\N	\N
82d03a38-a345-493b-bb18-2055c59fb8a0	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-14 11:03:10.421201+00	2026-10-14 11:03:10.421201+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36	103.60.204.104	\N	\N	\N	\N	\N
bc13a170-25ce-4fa2-9403-f68d218a35b3	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-14 16:48:28.131077+00	2026-10-15 04:06:55.36308+00	\N	aal1	\N	2026-10-15 04:06:55.36299	Vercel Edge Functions	3.111.54.188	\N	\N	\N	\N	\N
33b1cc3d-5ec9-41d4-a6ea-7323eb28a154	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-13 11:42:25.806473+00	2026-10-15 12:29:08.430072+00	\N	aal1	\N	2026-10-15 12:29:08.429908	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36	103.52.135.25	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
f32af805-15f2-4f7e-80b1-6d9ce92b6d99	2026-10-12 17:15:08.968333+00	2026-10-12 17:15:08.968333+00	otp	133ae962-d374-4a73-b752-394a4cf089dd
33b1cc3d-5ec9-41d4-a6ea-7323eb28a154	2026-10-13 11:42:25.860859+00	2026-10-13 11:42:25.860859+00	password	5d7843ad-432a-407a-b44f-1636b0a3959d
b66a313c-ea59-477c-a428-9ad69d77b07c	2026-10-13 13:29:51.63141+00	2026-10-13 13:29:51.63141+00	password	f808651f-54c1-49bc-a931-d4d90989a964
38434868-5073-4cfe-ad80-2fe83c3e23a9	2026-10-13 16:20:42.084987+00	2026-10-13 16:20:42.084987+00	password	fa43ed88-2636-41ef-883c-1af35342f69c
9bae22a8-4111-46b4-8a52-8493f1c90a30	2026-10-13 16:37:14.396789+00	2026-10-13 16:37:14.396789+00	password	be72820b-161c-43b8-afce-2991635afd2f
5c7f6c16-aefc-48fa-a81a-a31c65b7e4e5	2026-10-14 01:25:49.053188+00	2026-10-14 01:25:49.053188+00	password	d977fdc3-04f4-4898-9286-9d4383c077d1
82d03a38-a345-493b-bb18-2055c59fb8a0	2026-10-14 11:03:10.508345+00	2026-10-14 11:03:10.508345+00	password	2f002c19-d90a-45bd-8186-b17db64466be
677a7bd5-fbda-44d8-b5da-c4754b7da108	2026-10-14 11:04:06.047447+00	2026-10-14 11:04:06.047447+00	password	2a021964-0d35-43a7-8266-71221405498a
bc13a170-25ce-4fa2-9403-f68d218a35b3	2026-10-14 16:48:28.170078+00	2026-10-14 16:48:28.170078+00	password	dc1661eb-440a-4b25-9772-78160f04e727
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_code_sets" ("id", "user_id", "mfa_factor_id", "failed_verification_count", "verification_locked_until", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_codes" ("id", "mfa_recovery_code_set_id", "code_hash", "consumed_at", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	1	svdvdukqdyqv	ec8e2ef4-d76f-40e7-b668-0d15f4f347a8	f	2026-10-12 17:15:08.956657+00	2026-10-12 17:15:08.956657+00	\N	f32af805-15f2-4f7e-80b1-6d9ce92b6d99
00000000-0000-0000-0000-000000000000	48	4pit7vcidohq	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 05:13:07.619593+00	2026-10-14 06:26:58.867075+00	gs2kk2ys2af2	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	49	bwnafmfxbmdz	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 06:26:58.889345+00	2026-10-14 07:25:01.197275+00	4pit7vcidohq	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	50	hmaoqotauw2i	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 07:25:01.208167+00	2026-10-14 09:06:53.138376+00	bwnafmfxbmdz	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	52	7dpdarz6rp7z	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-14 11:03:10.463721+00	2026-10-14 11:03:10.463721+00	\N	82d03a38-a345-493b-bb18-2055c59fb8a0
00000000-0000-0000-0000-000000000000	51	cuqfhg7d2s74	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 09:06:53.154297+00	2026-10-14 11:26:11.066351+00	hmaoqotauw2i	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	54	rmcftcwj4uro	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 11:26:11.086204+00	2026-10-14 12:24:18.777807+00	cuqfhg7d2s74	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	55	vzahuv76ftlk	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 12:24:18.790143+00	2026-10-14 13:43:41.01602+00	rmcftcwj4uro	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	53	s3kkd5dujhzc	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 11:04:06.045191+00	2026-10-14 16:47:08.525565+00	\N	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	57	wczvonysdsvs	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 16:47:08.543129+00	2026-10-15 01:12:15.828998+00	s3kkd5dujhzc	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	59	grczpiuibtjm	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 01:12:15.845578+00	2026-10-15 02:12:31.606274+00	wczvonysdsvs	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	60	542kpfbog2dj	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 02:12:31.625546+00	2026-10-15 03:35:25.965191+00	grczpiuibtjm	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	58	buw6qyl2unhf	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 16:48:28.160608+00	2026-10-15 04:06:55.322195+00	\N	bc13a170-25ce-4fa2-9403-f68d218a35b3
00000000-0000-0000-0000-000000000000	62	5wnf5rdqnr6d	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-15 04:06:55.339608+00	2026-10-15 04:06:55.339608+00	buw6qyl2unhf	bc13a170-25ce-4fa2-9403-f68d218a35b3
00000000-0000-0000-0000-000000000000	56	lyusqvqqn35u	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 13:43:41.034166+00	2026-10-15 09:14:03.976569+00	vzahuv76ftlk	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	37	6wv4g7oeppet	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-13 12:41:00.023367+00	2026-10-15 10:32:29.193484+00	fyr2xolyctlb	33b1cc3d-5ec9-41d4-a6ea-7323eb28a154
00000000-0000-0000-0000-000000000000	64	ql5vzbdfhplc	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 10:32:29.217305+00	2026-10-15 11:30:53.917686+00	6wv4g7oeppet	33b1cc3d-5ec9-41d4-a6ea-7323eb28a154
00000000-0000-0000-0000-000000000000	63	fx5hhceo66ry	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 09:14:03.998733+00	2026-10-15 11:52:00.184114+00	lyusqvqqn35u	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	65	ndhuqdtx7v2t	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 11:30:54.019873+00	2026-10-15 12:29:08.393161+00	ql5vzbdfhplc	33b1cc3d-5ec9-41d4-a6ea-7323eb28a154
00000000-0000-0000-0000-000000000000	67	6liqcdwi64uj	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-15 12:29:08.409602+00	2026-10-15 12:29:08.409602+00	ndhuqdtx7v2t	33b1cc3d-5ec9-41d4-a6ea-7323eb28a154
00000000-0000-0000-0000-000000000000	61	wytrda5jajig	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 03:35:25.98323+00	2026-10-15 17:38:54.393609+00	542kpfbog2dj	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	66	y332sesovnm3	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 11:52:00.199108+00	2026-10-16 14:17:51.450158+00	fx5hhceo66ry	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	69	s6r7h2oelo6u	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-16 14:17:51.4744+00	2026-10-16 16:46:10.775741+00	y332sesovnm3	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	68	6jz6bw44kq6q	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-15 17:38:54.413989+00	2026-10-16 17:09:41.956489+00	wytrda5jajig	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	34	fyr2xolyctlb	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-13 11:42:25.839195+00	2026-10-13 12:41:00.012001+00	\N	33b1cc3d-5ec9-41d4-a6ea-7323eb28a154
00000000-0000-0000-0000-000000000000	71	kwgmr72sjvzu	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-16 17:09:41.962228+00	2026-10-16 18:08:03.427578+00	6jz6bw44kq6q	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	72	2drwmshl3fpz	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-16 18:08:03.441412+00	2026-10-16 19:15:55.341631+00	kwgmr72sjvzu	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	39	mtjgcd4rqpmy	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-13 13:29:51.62391+00	2026-10-13 15:50:18.558421+00	\N	b66a313c-ea59-477c-a428-9ad69d77b07c
00000000-0000-0000-0000-000000000000	40	pn5nzyszndan	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-13 15:50:18.571844+00	2026-10-13 15:50:18.571844+00	mtjgcd4rqpmy	b66a313c-ea59-477c-a428-9ad69d77b07c
00000000-0000-0000-0000-000000000000	73	elwbmw3qr4vl	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-16 19:15:55.362055+00	2026-10-16 19:15:55.362055+00	2drwmshl3fpz	677a7bd5-fbda-44d8-b5da-c4754b7da108
00000000-0000-0000-0000-000000000000	42	gnfb5fmes67x	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-13 16:37:14.380809+00	2026-10-13 16:37:14.380809+00	\N	9bae22a8-4111-46b4-8a52-8493f1c90a30
00000000-0000-0000-0000-000000000000	41	oqtejyevfvbf	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-13 16:20:42.068178+00	2026-10-13 17:19:19.017768+00	\N	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	70	dup4qn2xgjmj	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-16 16:46:10.791103+00	2026-10-17 04:29:11.823384+00	s6r7h2oelo6u	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	43	frt63k7vpv6k	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-13 17:19:19.039766+00	2026-10-13 18:19:06.246403+00	oqtejyevfvbf	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	74	wa2o2pxc4czr	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-17 04:29:11.840107+00	2026-10-17 04:29:11.840107+00	dup4qn2xgjmj	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	44	oelohbcyg67c	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-13 18:19:06.261582+00	2026-10-14 01:18:19.539941+00	frt63k7vpv6k	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	46	z2wpzel6m63q	29a1258f-1247-4ed0-8087-5ecfdaa942aa	f	2026-10-14 01:25:49.039771+00	2026-10-14 01:25:49.039771+00	\N	5c7f6c16-aefc-48fa-a81a-a31c65b7e4e5
00000000-0000-0000-0000-000000000000	45	zxs6ihs6i3y5	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 01:18:19.560073+00	2026-10-14 02:18:07.733228+00	oelohbcyg67c	38434868-5073-4cfe-ad80-2fe83c3e23a9
00000000-0000-0000-0000-000000000000	47	gs2kk2ys2af2	29a1258f-1247-4ed0-8087-5ecfdaa942aa	t	2026-10-14 02:18:07.754471+00	2026-10-14 05:13:07.600857+00	zxs6ihs6i3y5	38434868-5073-4cfe-ad80-2fe83c3e23a9
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_tokens" ("id", "sso_provider_id", "token_hash", "prefix", "created_at", "expires_at", "revoked_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_users" ("id", "sso_provider_id", "user_id", "resource", "created_at", "updated_at", "deleted_at") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."app_settings" ("key", "value", "updated_at") FROM stdin;
signup_enabled	true	2026-10-15 11:53:57.81+00
student_portal_enabled	true	2026-10-15 11:53:58.177+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."audit_logs" ("id", "user_id", "user_email", "user_role", "action", "table_name", "record_id", "old_data", "new_data", "description", "created_at") FROM stdin;
1	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	profiles	1740c62f-4d87-4331-863e-7fcfc69dde86	{"id": "1740c62f-4d87-4331-863e-7fcfc69dde86", "role": "accountant", "held_at": "2026-10-13T08:43:46.304+00:00", "is_held": true, "full_name": "Sadik ex", "created_at": "2026-10-12T18:03:17.507794+00:00", "held_reason": "সাময়িক সময়ের জন্য বন্ধ"}	{"id": "1740c62f-4d87-4331-863e-7fcfc69dde86", "role": "accountant", "held_at": null, "is_held": false, "full_name": "Sadik ex", "created_at": "2026-10-12T18:03:17.507794+00:00", "held_reason": null}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-13 08:53:47.338367+00
2	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	fee_payments	2	\N	{"id": 2, "note": "", "year": 2026, "month": 10, "amount": 450.00, "created_at": "2026-10-13T09:36:55.987068+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-212099", "student_id": 3, "payment_date": "2026-10-13", "monthly_fee_id": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-13 09:36:55.987068+00
3	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	signup_enabled	{"key": "signup_enabled", "value": "false", "updated_at": "2026-10-13T08:31:02.13+00:00"}	{"key": "signup_enabled", "value": "true", "updated_at": "2026-10-13T11:46:02.155+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-13 11:46:06.27167+00
4	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	student_portal_enabled	{"key": "student_portal_enabled", "value": "false", "updated_at": "2026-10-13T08:31:02.423+00:00"}	{"key": "student_portal_enabled", "value": "true", "updated_at": "2026-10-13T11:46:02.65+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-13 11:46:06.563138+00
5	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	students	5	\N	{"id": 5, "name": "Faham", "roll": "01", "status": "active", "address": "Phulpur ", "section": "A", "discount": 0.00, "class_name": "প্রথম", "created_at": "2026-10-13T18:06:11.491658+00:00", "deleted_at": null, "is_deleted": false, "student_id": "202701", "monthly_fee": 500.00, "guardian_name": "Sadek", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": ""}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-13 18:06:11.491658+00
6	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	fee_payments	7	\N	{"id": 7, "note": "", "year": 2026, "month": 10, "amount": 250.00, "created_at": "2026-10-13T18:11:41.163884+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-101592", "student_id": 5, "payment_date": "2026-10-13", "monthly_fee_id": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-13 18:11:41.163884+00
7	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	signup_enabled	{"key": "signup_enabled", "value": "true", "updated_at": "2026-10-13T11:46:02.155+00:00"}	{"key": "signup_enabled", "value": "false", "updated_at": "2026-10-14T02:23:56.076+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-14 02:23:55.54579+00
8	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	student_portal_enabled	{"key": "student_portal_enabled", "value": "true", "updated_at": "2026-10-13T11:46:02.65+00:00"}	{"key": "student_portal_enabled", "value": "false", "updated_at": "2026-10-14T02:23:56.449+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-14 02:23:55.860527+00
9	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	fee_payments	11	\N	{"id": 11, "note": "", "year": 2026, "month": 10, "amount": 250.00, "created_at": "2026-10-14T02:36:49.382095+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-409930", "student_id": 5, "payment_date": "2026-10-14", "monthly_fee_id": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-14 02:36:49.382095+00
10	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	students	3	{"id": 3, "name": "Hussain ", "roll": "01", "status": "active", "address": "Phulpur ", "section": "", "discount": 50.00, "photo_url": null, "class_name": "ষষ্ঠ", "created_at": "2026-10-13T00:27:01.093573+00:00", "deleted_at": null, "is_deleted": false, "student_id": "20260330", "monthly_fee": 500.00, "guardian_name": "Sadekul Islam ", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": "মেধাবী"}	{"id": 3, "name": "Hussain ", "roll": "01", "status": "active", "address": "Phulpur ", "section": "", "discount": 50.00, "photo_url": null, "class_name": "ষষ্ঠ", "created_at": "2026-10-13T00:27:01.093573+00:00", "deleted_at": null, "is_deleted": false, "student_id": "20260330", "monthly_fee": 500.00, "guardian_name": "Sadekul Islam ", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": "মেধাবী"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-14 06:44:39.4474+00
11	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	students	5	{"id": 5, "name": "Faham", "roll": "01", "status": "active", "address": "Phulpur ", "section": "A", "discount": 0.00, "photo_url": null, "class_name": "প্রথম", "created_at": "2026-10-13T18:06:11.491658+00:00", "deleted_at": null, "is_deleted": false, "student_id": "202701", "monthly_fee": 500.00, "guardian_name": "Sadek", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": ""}	{"id": 5, "name": "Faham", "roll": "01", "status": "active", "address": "Phulpur ", "section": "A", "discount": 0.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1791960998176-co9k3e.jpg", "class_name": "প্রথম", "created_at": "2026-10-13T18:06:11.491658+00:00", "deleted_at": null, "is_deleted": false, "student_id": "202701", "monthly_fee": 500.00, "guardian_name": "Sadek", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": ""}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-14 06:56:55.514082+00
12	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	signup_enabled	{"key": "signup_enabled", "value": "false", "updated_at": "2026-10-14T02:23:56.076+00:00"}	{"key": "signup_enabled", "value": "false", "updated_at": "2026-10-14T07:28:05.745+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-14 07:28:05.900792+00
13	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	student_portal_enabled	{"key": "student_portal_enabled", "value": "false", "updated_at": "2026-10-14T02:23:56.449+00:00"}	{"key": "student_portal_enabled", "value": "true", "updated_at": "2026-10-14T07:28:06.276+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-14 07:28:06.467333+00
26	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	profiles	ec8e2ef4-d76f-40e7-b668-0d15f4f347a8	{"id": "ec8e2ef4-d76f-40e7-b668-0d15f4f347a8", "role": "viewer", "held_at": null, "is_held": false, "full_name": "Fahim", "created_at": "2026-10-12T17:03:15.244761+00:00", "held_reason": null}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 12:13:47.45152+00
14	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	students	3	{"id": 3, "name": "Hussain ", "roll": "01", "status": "active", "address": "Phulpur ", "section": "", "discount": 50.00, "photo_url": null, "class_name": "ষষ্ঠ", "created_at": "2026-10-13T00:27:01.093573+00:00", "deleted_at": null, "is_deleted": false, "student_id": "20260330", "monthly_fee": 500.00, "guardian_name": "Sadekul Islam ", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": "মেধাবী"}	{"id": 3, "name": "Hussain ", "roll": "01", "status": "active", "address": "Phulpur ", "section": "", "discount": 50.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1791969983923-acv20s.jpg", "class_name": "ষষ্ঠ", "created_at": "2026-10-13T00:27:01.093573+00:00", "deleted_at": null, "is_deleted": false, "student_id": "20260330", "monthly_fee": 500.00, "guardian_name": "Sadekul Islam ", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": "মেধাবী"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-14 09:26:29.603006+00
15	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	students	4	{"id": 4, "name": "hh", "roll": "30", "status": "inactive", "address": "Phulpur.", "section": "", "discount": 400.00, "photo_url": null, "class_name": "চতুর্থ", "created_at": "2026-10-13T06:20:35.094535+00:00", "deleted_at": null, "is_deleted": false, "student_id": "2026054", "monthly_fee": 500.00, "guardian_name": "Sadek", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": "এতিম"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 09:35:25.889157+00
16	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	fee_payments	2	{"id": 2, "note": "", "year": 2026, "month": 10, "amount": 450.00, "created_at": "2026-10-13T09:36:55.987068+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-212099", "student_id": 3, "payment_date": "2026-10-13", "monthly_fee_id": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 11:03:56.987834+00
17	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	fee_payments	7	{"id": 7, "note": "", "year": 2026, "month": 10, "amount": 250.00, "created_at": "2026-10-13T18:11:41.163884+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-101592", "student_id": 5, "payment_date": "2026-10-13", "monthly_fee_id": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 11:03:56.987834+00
18	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	fee_payments	11	{"id": 11, "note": "", "year": 2026, "month": 10, "amount": 250.00, "created_at": "2026-10-14T02:36:49.382095+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-409930", "student_id": 5, "payment_date": "2026-10-14", "monthly_fee_id": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 11:03:56.987834+00
19	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	incomes	1	{"id": 1, "amount": 100.00, "created_at": "2026-10-13T05:18:35.762482+00:00", "created_by": null, "deleted_at": null, "entry_date": "2026-10-13", "is_deleted": false, "receipt_no": "3r", "student_id": null, "category_id": 4, "description": "R3", "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 11:03:57.370618+00
20	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	expenses	1	{"id": 1, "amount": 100.00, "created_at": "2026-10-13T05:19:22.288406+00:00", "created_by": null, "deleted_at": null, "entry_date": "2026-10-13", "is_deleted": false, "voucher_no": "4e", "category_id": 8, "description": "Hh", "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 11:03:57.498761+00
21	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	students	5	{"id": 5, "name": "Faham", "roll": "01", "status": "active", "address": "Phulpur ", "section": "A", "discount": 0.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1791960998176-co9k3e.jpg", "class_name": "প্রথম", "created_at": "2026-10-13T18:06:11.491658+00:00", "deleted_at": null, "is_deleted": false, "student_id": "202701", "monthly_fee": 500.00, "guardian_name": "Sadek", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": ""}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 11:03:57.631167+00
22	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	students	3	{"id": 3, "name": "Hussain ", "roll": "01", "status": "active", "address": "Phulpur ", "section": "", "discount": 50.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1791969983923-acv20s.jpg", "class_name": "ষষ্ঠ", "created_at": "2026-10-13T00:27:01.093573+00:00", "deleted_at": null, "is_deleted": false, "student_id": "20260330", "monthly_fee": 500.00, "guardian_name": "Sadekul Islam ", "admission_date": "2026-10-13", "guardian_phone": "01728517544", "discount_reason": "মেধাবী"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 11:03:57.631167+00
23	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	students	6	\N	{"id": 6, "name": "খাতুনে জান্নাত নাবা", "roll": "", "status": "active", "address": "শেরপুর রোড,ফুলপুর, ময়মনসিংহ ", "section": "", "discount": 0.00, "photo_url": null, "class_name": "নার্সারি", "created_at": "2026-10-14T11:11:43.396486+00:00", "deleted_at": null, "is_deleted": false, "student_id": "", "monthly_fee": 700.00, "guardian_name": "নাজমুল হাসান রাজন", "admission_date": "2025-01-01", "guardian_phone": "01711361586", "discount_reason": ""}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-14 11:11:43.396486+00
24	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	students	7	\N	{"id": 7, "name": "হোসাইন আহমদ ", "roll": "", "status": "active", "address": "উপজেলা পরিষদ কোয়ার্টার (কাজলী) ফুলপুর, ময়মনসিংহ ", "section": "", "discount": 0.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1791976718713-m6saa3.jpg", "class_name": "তৃতীয়", "created_at": "2026-10-14T11:24:00.640138+00:00", "deleted_at": null, "is_deleted": false, "student_id": "20260301", "monthly_fee": 1000.00, "guardian_name": "সাদেকুল ইসলাম ", "admission_date": "2026-01-01", "guardian_phone": "01728517544", "discount_reason": ""}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-14 11:24:00.640138+00
25	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	profiles	1740c62f-4d87-4331-863e-7fcfc69dde86	{"id": "1740c62f-4d87-4331-863e-7fcfc69dde86", "role": "accountant", "held_at": null, "is_held": false, "full_name": "Sadik ex", "created_at": "2026-10-12T18:03:17.507794+00:00", "held_reason": null}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-14 12:13:41.280228+00
27	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	expenses	2	\N	{"id": 2, "amount": 10000.00, "created_at": "2026-10-14T12:16:38.576574+00:00", "created_by": null, "deleted_at": null, "entry_date": "2026-10-14", "is_deleted": false, "voucher_no": null, "category_id": 7, "description": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-14 12:16:38.576574+00
28	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	fee_payments	12	\N	{"id": 12, "note": "", "year": 2026, "month": 10, "amount": 1000.00, "created_at": "2026-10-14T12:17:54.231517+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-273983", "student_id": 7, "payment_date": "2026-10-14", "monthly_fee_id": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-14 12:17:54.231517+00
29	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	fee_payments	13	\N	{"id": 13, "note": "", "year": 2026, "month": 10, "amount": 700.00, "created_at": "2026-10-14T12:19:30.654465+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-370484", "student_id": 6, "payment_date": "2026-10-14", "monthly_fee_id": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-14 12:19:30.654465+00
30	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	fee_payments	14	\N	{"id": 14, "note": "", "year": 2026, "month": 11, "amount": 700.00, "created_at": "2026-10-15T02:06:19.249276+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202611-978462", "student_id": 6, "payment_date": "2026-10-15", "monthly_fee_id": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-15 02:06:19.249276+00
31	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	expenses	2	{"id": 2, "amount": 10000.00, "created_at": "2026-10-14T12:16:38.576574+00:00", "created_by": null, "deleted_at": null, "entry_date": "2026-10-14", "is_deleted": false, "voucher_no": null, "category_id": 7, "description": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-15 10:39:23.874462+00
32	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	signup_enabled	{"key": "signup_enabled", "value": "false", "updated_at": "2026-10-14T07:28:05.745+00:00"}	{"key": "signup_enabled", "value": "true", "updated_at": "2026-10-15T11:53:57.81+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-15 11:54:07.391929+00
33	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	update	app_settings	student_portal_enabled	{"key": "student_portal_enabled", "value": "true", "updated_at": "2026-10-14T07:28:06.276+00:00"}	{"key": "student_portal_enabled", "value": "true", "updated_at": "2026-10-15T11:53:58.177+00:00"}	রেকর্ড পরিবর্তন করা হয়েছে	2026-10-15 11:54:07.667603+00
34	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	students	8	\N	{"id": 8, "name": "Fahim", "roll": "", "gender": "male", "status": "active", "address": "phulpur, mymensing.", "section": "", "discount": 0.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1792067141270-b5523.jpg", "class_name": "প্রথম", "created_at": "2026-10-15T12:27:15.757317+00:00", "deleted_at": null, "is_deleted": false, "student_id": "202601", "blood_group": "O+", "monthly_fee": 20.00, "guardian_name": "sadekul islam", "admission_date": "2026-10-15", "guardian_phone": "01728517544", "discount_reason": "", "emergency_contact": "+8801710569808"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-15 12:27:15.757317+00
35	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	fee_payments	15	\N	{"id": 15, "note": "", "year": 2026, "month": 10, "amount": 40.00, "created_at": "2026-10-15T12:28:23.769727+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-294908", "student_id": 8, "payment_date": "2026-10-15", "monthly_fee_id": null, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-15 12:28:23.769727+00
36	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	fee_payments	12	{"id": 12, "note": "", "year": 2026, "month": 10, "amount": 1000.00, "created_at": "2026-10-14T12:17:54.231517+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-273983", "student_id": 7, "payment_date": "2026-10-14", "monthly_fee_id": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-16 14:18:28.465978+00
37	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	fee_payments	13	{"id": 13, "note": "", "year": 2026, "month": 10, "amount": 700.00, "created_at": "2026-10-14T12:19:30.654465+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-370484", "student_id": 6, "payment_date": "2026-10-14", "monthly_fee_id": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-16 14:18:28.465978+00
38	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	fee_payments	14	{"id": 14, "note": "", "year": 2026, "month": 11, "amount": 700.00, "created_at": "2026-10-15T02:06:19.249276+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202611-978462", "student_id": 6, "payment_date": "2026-10-15", "monthly_fee_id": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-16 14:18:28.465978+00
39	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	fee_payments	15	{"id": 15, "note": "", "year": 2026, "month": 10, "amount": 40.00, "created_at": "2026-10-15T12:28:23.769727+00:00", "created_by": null, "deleted_at": null, "is_deleted": false, "receipt_no": "R-202610-294908", "student_id": 8, "payment_date": "2026-10-15", "monthly_fee_id": null, "payment_method": "cash"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-16 14:18:28.465978+00
40	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	students	6	{"id": 6, "name": "খাতুনে জান্নাত নাবা", "roll": "", "gender": null, "status": "active", "address": "শেরপুর রোড,ফুলপুর, ময়মনসিংহ ", "section": "", "discount": 0.00, "photo_url": null, "class_name": "নার্সারি", "created_at": "2026-10-14T11:11:43.396486+00:00", "deleted_at": null, "is_deleted": false, "student_id": "", "blood_group": null, "monthly_fee": 700.00, "guardian_name": "নাজমুল হাসান রাজন", "admission_date": "2025-01-01", "guardian_phone": "01711361586", "discount_reason": "", "emergency_contact": null}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-16 14:18:29.752178+00
41	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	students	7	{"id": 7, "name": "হোসাইন আহমদ ", "roll": "", "gender": null, "status": "active", "address": "উপজেলা পরিষদ কোয়ার্টার (কাজলী) ফুলপুর, ময়মনসিংহ ", "section": "", "discount": 0.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1791976718713-m6saa3.jpg", "class_name": "তৃতীয়", "created_at": "2026-10-14T11:24:00.640138+00:00", "deleted_at": null, "is_deleted": false, "student_id": "20260301", "blood_group": null, "monthly_fee": 1000.00, "guardian_name": "সাদেকুল ইসলাম ", "admission_date": "2026-01-01", "guardian_phone": "01728517544", "discount_reason": "", "emergency_contact": null}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-16 14:18:29.752178+00
42	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	delete	students	8	{"id": 8, "name": "Fahim", "roll": "", "gender": "male", "status": "active", "address": "phulpur, mymensing.", "section": "", "discount": 0.00, "photo_url": "https://tbnupbhqgiospgrfecgu.supabase.co/storage/v1/object/public/student-photos/1792067141270-b5523.jpg", "class_name": "প্রথম", "created_at": "2026-10-15T12:27:15.757317+00:00", "deleted_at": null, "is_deleted": false, "student_id": "202601", "blood_group": "O+", "monthly_fee": 20.00, "guardian_name": "sadekul islam", "admission_date": "2026-10-15", "guardian_phone": "01728517544", "discount_reason": "", "emergency_contact": "+8801710569808"}	\N	রেকর্ড ডিলিট করা হয়েছে	2026-10-16 14:18:29.752178+00
43	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	incomes	2	\N	{"id": 2, "amount": 500.00, "created_at": "2026-10-16T17:42:07.822809+00:00", "created_by": null, "deleted_at": null, "entry_date": "2026-10-16", "is_deleted": false, "receipt_no": "জম", "student_id": null, "category_id": 4, "description": null, "extra_fields": {}, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-16 17:42:07.822809+00
44	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	students	9	\N	{"id": 9, "name": "fahim", "roll": "", "gender": "male", "status": "active", "address": "Phulpur", "section": "", "discount": 0.00, "photo_url": null, "class_name": "প্রথম", "created_at": "2026-10-16T17:51:30.9247+00:00", "deleted_at": null, "is_deleted": false, "student_id": "", "blood_group": "O+", "monthly_fee": 100.00, "guardian_name": "Sadek", "admission_date": "2026-10-16", "guardian_phone": "01728517544", "discount_reason": "", "emergency_contact": "01728517566"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-16 17:51:30.9247+00
45	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	students	12	\N	{"id": 12, "name": "Mahmud", "roll": "", "gender": "male", "status": "active", "address": "Phulhgj", "section": "", "discount": 50.00, "photo_url": null, "class_name": "দ্বিতীয়", "created_at": "2026-10-16T17:52:53.697479+00:00", "deleted_at": null, "is_deleted": false, "student_id": "Fa69", "blood_group": "AB-", "monthly_fee": 100.00, "guardian_name": "Sadej", "admission_date": "2026-10-16", "guardian_phone": "01728517544", "discount_reason": "", "emergency_contact": null}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-16 17:52:53.697479+00
46	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	expenses	3	\N	{"id": 3, "amount": 200.00, "created_at": "2026-10-17T04:31:27.226691+00:00", "created_by": "29a1258f-1247-4ed0-8087-5ecfdaa942aa", "deleted_at": null, "entry_date": "2026-10-17", "is_deleted": false, "voucher_no": null, "category_id": 1, "description": null, "extra_fields": {}, "extra_columns": {}, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-17 04:31:27.226691+00
47	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	expenses	4	\N	{"id": 4, "amount": 200.00, "created_at": "2026-10-17T04:31:27.226691+00:00", "created_by": "29a1258f-1247-4ed0-8087-5ecfdaa942aa", "deleted_at": null, "entry_date": "2026-10-17", "is_deleted": false, "voucher_no": null, "category_id": 7, "description": null, "extra_fields": {}, "extra_columns": {}, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-17 04:31:27.226691+00
48	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	expenses	5	\N	{"id": 5, "amount": 30.00, "created_at": "2026-10-17T04:31:27.226691+00:00", "created_by": "29a1258f-1247-4ed0-8087-5ecfdaa942aa", "deleted_at": null, "entry_date": "2026-10-17", "is_deleted": false, "voucher_no": null, "category_id": 2, "description": null, "extra_fields": {}, "extra_columns": {}, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-17 04:31:27.226691+00
49	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	expenses	6	\N	{"id": 6, "amount": 1000.00, "created_at": "2026-10-17T04:32:49.745212+00:00", "created_by": "29a1258f-1247-4ed0-8087-5ecfdaa942aa", "deleted_at": null, "entry_date": "2026-10-17", "is_deleted": false, "voucher_no": null, "category_id": 1, "description": null, "extra_fields": {}, "extra_columns": {}, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-17 04:32:49.745212+00
50	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	insert	expenses	7	\N	{"id": 7, "amount": 60.00, "created_at": "2026-10-17T04:35:25.754264+00:00", "created_by": null, "deleted_at": null, "entry_date": "2026-10-17", "is_deleted": false, "voucher_no": null, "category_id": 1, "description": null, "extra_fields": {}, "extra_columns": {}, "payment_method": "cash"}	নতুন রেকর্ড যোগ করা হয়েছে	2026-10-17 04:35:25.754264+00
\.


--
-- Data for Name: closed_months; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."closed_months" ("id", "month", "year", "closed_by", "closed_by_name", "closed_at", "note") FROM stdin;
1	9	2026	29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	2026-10-14 02:26:31.754916+00	\N
\.


--
-- Data for Name: madrasah_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."madrasah_events" ("id", "name", "description", "start_date", "end_date", "default_fee", "fee_mode", "class_fees", "applies_to", "applies_to_value", "is_closed", "created_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."students" ("id", "name", "class_name", "section", "guardian_name", "guardian_phone", "monthly_fee", "status", "created_at", "student_id", "roll", "address", "admission_date", "discount", "discount_reason", "is_deleted", "deleted_at", "photo_url", "gender", "blood_group", "emergency_contact") FROM stdin;
9	fahim	প্রথম		Sadek	01728517544	100.00	active	2026-10-16 17:51:30.9247+00			Phulpur	2026-10-16	0.00		f	\N	\N	male	O+	01728517566
12	Mahmud	দ্বিতীয়		Sadej	01728517544	100.00	active	2026-10-16 17:52:53.697479+00	Fa69		Phulhgj	2026-10-16	50.00		f	\N	\N	male	AB-	\N
\.


--
-- Data for Name: event_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."event_payments" ("id", "event_id", "student_id", "amount", "payment_date", "payment_method", "receipt_no", "note", "created_by", "created_at") FROM stdin;
\.


--
-- Data for Name: event_student_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."event_student_fees" ("id", "event_id", "student_id", "payable_amount", "created_at", "discount", "discount_reason") FROM stdin;
\.


--
-- Data for Name: excel_column_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."excel_column_templates" ("id", "page_type", "column_key", "column_label", "column_type", "column_order", "is_default", "is_active", "created_by", "created_at") FROM stdin;
40	income	voucher_no	ভাউচার	text	1	t	t	\N	2026-10-16 19:34:23.198908+00
41	income	receipt_no	রসিদ	text	2	t	t	\N	2026-10-16 19:34:23.198908+00
42	income	salary	বেতন	text	3	t	t	\N	2026-10-16 19:34:23.198908+00
43	income	donation	দান	text	4	t	t	\N	2026-10-16 19:34:23.198908+00
44	income	admission_fee	ভর্তি ফি	text	5	t	t	\N	2026-10-16 19:34:23.198908+00
45	income	session_fee	সেশন ফি	text	6	t	t	\N	2026-10-16 19:34:23.198908+00
46	income	exam_fee	পরীক্ষার ফি	text	7	t	t	\N	2026-10-16 19:34:23.198908+00
47	income	book_sale	বই বিক্রি	text	8	t	t	\N	2026-10-16 19:34:23.198908+00
48	income	other_income	অন্যান্য	text	9	t	t	\N	2026-10-16 19:34:23.198908+00
50	expense	voucher_no	ভাউচার	text	1	t	t	\N	2026-10-16 19:36:07.421066+00
51	expense	teacher_salary	শিক্ষক বেতন	text	2	t	t	\N	2026-10-16 19:36:07.421066+00
52	expense	staff_salary	কর্মচারী বেতন	text	3	t	t	\N	2026-10-16 19:36:07.421066+00
53	expense	rent	ভবন ভাড়া	text	4	t	t	\N	2026-10-16 19:36:07.421066+00
54	expense	utilities	বিদ্যুৎ/পানি	text	5	t	t	\N	2026-10-16 19:36:07.421066+00
55	expense	internet	ইন্টারনেট	text	6	t	t	\N	2026-10-16 19:36:07.421066+00
56	expense	supplies	শিক্ষা উপকরণ	text	7	t	t	\N	2026-10-16 19:36:07.421066+00
57	expense	exam_cost	পরীক্ষার খরচ	text	8	t	t	\N	2026-10-16 19:36:07.421066+00
58	expense	food	আবাসিক খাবার	text	9	t	t	\N	2026-10-16 19:36:07.421066+00
59	expense	transport	পরিবহন	text	10	t	t	\N	2026-10-16 19:36:07.421066+00
60	expense	repair	মেরামত	text	11	t	t	\N	2026-10-16 19:36:07.421066+00
61	expense	other_expense	অন্যান্য	text	12	t	t	\N	2026-10-16 19:36:07.421066+00
\.


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."expense_categories" ("id", "name", "description", "created_at") FROM stdin;
1	শিক্ষক বেতন	শিক্ষকদের মাসিক বেতন	2026-10-12 12:59:52.105317+00
2	ভবন ভাড়া	ভবন ভাড়া ও রক্ষণাবেক্ষণ	2026-10-12 12:59:52.105317+00
3	বিদ্যুৎ/পানি/গ্যাস	ইউটিলিটি বিল	2026-10-12 12:59:52.105317+00
4	শিক্ষা উপকরণ	বই, খাতা, কলম ইত্যাদি	2026-10-12 12:59:52.105317+00
5	আবাসিক খাবার	হোস্টেলের খাবারের খরচ	2026-10-12 12:59:52.105317+00
6	পরিবহন	যাতায়াত খরচ	2026-10-12 12:59:52.105317+00
7	কর্মচারী বেতন	পিয়ন, নিরাপত্তা কর্মী ইত্যাদি	2026-10-12 12:59:52.105317+00
8	অন্যান্য ব্যয়	অন্যান্য সকল ব্যয়	2026-10-12 12:59:52.105317+00
9	ইন্টারনেট বিল	ইন্টারনেট সংযোগ	2026-10-12 18:52:27.056638+00
10	পরীক্ষা পরিচালনা	পরীক্ষার খরচ	2026-10-12 18:52:27.056638+00
11	ভবন মেরামত	মেরামত ও রক্ষণাবেক্ষণ	2026-10-12 18:52:27.056638+00
12	যাতায়াত	যাতায়াত ও পরিবহন	2026-10-12 18:52:27.056638+00
38	বিদ্যুৎ/পানি	ইউটিলিটি বিল	2026-10-17 04:41:03.522978+00
39	ইন্টারনেট	ইন্টারনেট	2026-10-17 04:41:03.522978+00
41	পরীক্ষার খরচ	পরীক্ষার খরচ	2026-10-17 04:41:03.522978+00
44	মেরামত	মেরামত	2026-10-17 04:41:03.522978+00
45	অন্যান্য	অন্যান্য ব্যয়	2026-10-17 04:41:03.522978+00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."expenses" ("id", "category_id", "amount", "entry_date", "payment_method", "description", "created_by", "created_at", "voucher_no", "is_deleted", "deleted_at", "extra_fields", "extra_columns") FROM stdin;
3	1	200.00	2026-10-17	cash	\N	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-17 04:31:27.226691+00	\N	f	\N	{}	{}
4	7	200.00	2026-10-17	cash	\N	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-17 04:31:27.226691+00	\N	f	\N	{}	{}
5	2	30.00	2026-10-17	cash	\N	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-17 04:31:27.226691+00	\N	f	\N	{}	{}
6	1	1000.00	2026-10-17	cash	\N	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-17 04:32:49.745212+00	\N	f	\N	{}	{}
7	1	60.00	2026-10-17	cash	\N	\N	2026-10-17 04:35:25.754264+00	\N	f	\N	{}	{}
\.


--
-- Data for Name: monthly_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."monthly_fees" ("id", "student_id", "month", "year", "payable_amount", "is_deleted", "created_at", "deleted_at") FROM stdin;
9	9	10	2026	100.00	f	2026-10-16 17:51:30.9247+00	\N
10	12	10	2026	50.00	f	2026-10-16 17:52:53.697479+00	\N
\.


--
-- Data for Name: fee_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fee_payments" ("id", "student_id", "month", "year", "amount", "payment_method", "receipt_no", "payment_date", "note", "is_deleted", "created_by", "created_at", "monthly_fee_id", "deleted_at", "extra_fields") FROM stdin;
\.


--
-- Data for Name: income_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."income_categories" ("id", "name", "description", "created_at") FROM stdin;
1	বেতন	শিক্ষার্থীদের মাসিক বেতন	2026-10-12 12:59:52.105317+00
2	ভর্তি ফি	নতুন শিক্ষার্থীর ভর্তি ফি	2026-10-12 12:59:52.105317+00
3	দান/অনুদান	দাতাদের কাছ থেকে প্রাপ্ত	2026-10-12 12:59:52.105317+00
4	অন্যান্য আয়	অন্যান্য সকল আয়	2026-10-12 12:59:52.105317+00
5	সেশন ফি	বার্ষিক সেশন ফি	2026-10-12 18:52:27.056638+00
6	পরীক্ষার ফি	পরীক্ষার জন্য ফি	2026-10-12 18:52:27.056638+00
7	বই বিক্রি	বই ও শিক্ষা উপকরণ বিক্রি	2026-10-12 18:52:27.056638+00
9	দান	দান ও অনুদান	2026-10-16 18:54:07.116333+00
23	অন্যান্য	অন্যান্য আয়	2026-10-17 04:41:03.522978+00
\.


--
-- Data for Name: incomes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."incomes" ("id", "category_id", "student_id", "amount", "entry_date", "payment_method", "description", "created_by", "created_at", "receipt_no", "is_deleted", "deleted_at", "extra_fields", "voucher_no", "extra_columns") FROM stdin;
2	4	\N	500.00	2026-10-16	cash	\N	\N	2026-10-16 17:42:07.822809+00	জম	f	\N	{}	\N	{}
\.


--
-- Data for Name: keep_alive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."keep_alive" ("id", "pinged_at") FROM stdin;
1	2026-10-14 02:59:11+00
2	2026-10-15 02:39:07+00
3	2026-10-16 02:34:30+00
4	2026-10-17 02:26:59+00
\.


--
-- Data for Name: notification_reads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."notification_reads" ("id", "user_id", "notification_key", "read_at") FROM stdin;
1	29a1258f-1247-4ed0-8087-5ecfdaa942aa	due-2026-10	2026-10-13 09:26:27.006969+00
2	29a1258f-1247-4ed0-8087-5ecfdaa942aa	discount-1	2026-10-13 09:37:41.630915+00
3	29a1258f-1247-4ed0-8087-5ecfdaa942aa	new-2026-10	2026-10-14 06:57:09.311617+00
4	29a1258f-1247-4ed0-8087-5ecfdaa942aa	today-2026-10-14	2026-10-14 06:57:17.545186+00
14	29a1258f-1247-4ed0-8087-5ecfdaa942aa	today-2026-10-15	2026-10-15 02:06:26.739547+00
\.


--
-- Data for Name: print_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."print_templates" ("id", "name", "class_name", "columns", "show_qr", "show_photo", "orientation", "created_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("id", "full_name", "role", "created_at", "is_held", "held_at", "held_reason") FROM stdin;
29a1258f-1247-4ed0-8087-5ecfdaa942aa	fahim618900@gmail.com	admin	2026-10-12 17:17:13.295432+00	f	\N	\N
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status", "lifecycle_configuration", "lifecycle_configuration_generation") FROM stdin;
student-photos	student-photos	\N	2026-10-14 06:53:21.508604+00	2026-10-14 06:53:21.508604+00	t	f	\N	\N	\N	STANDARD	DISABLED	\N	\N
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") FROM stdin;
dd3b702c-045a-4558-9dff-f07ea7c74320	student-photos	1791960998176-co9k3e.jpg	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-14 06:56:40.207715+00	2026-10-14 06:56:40.207715+00	2026-10-14 06:56:40.207715+00	{"eTag": "\\"70b5a9c4f61e3e32873147f8b38c26ee\\"", "size": 2072431, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-10-14T06:56:41.000Z", "contentLength": 2072431, "httpStatusCode": 200}	5282a048-ce84-4c87-8aa1-f797b8c75f16	29a1258f-1247-4ed0-8087-5ecfdaa942aa	{}	\N	f	f
7eacf7b8-e794-4711-9dd0-55eca002cc10	student-photos	1791969983923-acv20s.jpg	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-14 09:26:25.006979+00	2026-10-14 09:26:25.006979+00	2026-10-14 09:26:25.006979+00	{"eTag": "\\"643c0aa485b44aa4c3a9f6fc75bf1ed7\\"", "size": 1561983, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-10-14T09:26:25.000Z", "contentLength": 1561983, "httpStatusCode": 200}	688fca0b-26f5-4a1a-9b0c-922ed5721cbc	29a1258f-1247-4ed0-8087-5ecfdaa942aa	{}	\N	f	f
bb928bfd-fdb2-4473-ac74-340164030fdf	student-photos	1791976718713-m6saa3.jpg	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-14 11:18:39.711633+00	2026-10-14 11:18:39.711633+00	2026-10-14 11:18:39.711633+00	{"eTag": "\\"6f3ee3ced94ae5fbdb49dea003348737\\"", "size": 923332, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-10-14T11:18:40.000Z", "contentLength": 923332, "httpStatusCode": 200}	7e2269e9-65cb-4bad-b3cb-8a0ab898a120	29a1258f-1247-4ed0-8087-5ecfdaa942aa	{}	\N	f	f
052ea04b-8f5c-429b-97c4-5470e15de226	student-photos	1792067141270-b5523.jpg	29a1258f-1247-4ed0-8087-5ecfdaa942aa	2026-10-15 12:25:50.524637+00	2026-10-15 12:25:50.524637+00	2026-10-15 12:25:50.524637+00	{"eTag": "\\"ac7c301b8ec9b340ff4694cede2595e1\\"", "size": 17731, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-10-15T12:25:51.000Z", "contentLength": 17731, "httpStatusCode": 200}	3df77fcc-cd03-4456-ae6b-9e156e2f1795	29a1258f-1247-4ed0-8087-5ecfdaa942aa	{}	\N	f	f
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 74, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."audit_logs_id_seq"', 50, true);


--
-- Name: closed_months_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."closed_months_id_seq"', 1, true);


--
-- Name: event_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_payments_id_seq"', 5, true);


--
-- Name: event_student_fees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_student_fees_id_seq"', 2, true);


--
-- Name: excel_column_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."excel_column_templates_id_seq"', 61, true);


--
-- Name: expense_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."expense_categories_id_seq"', 45, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."expenses_id_seq"', 7, true);


--
-- Name: fee_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."fee_payments_id_seq"', 15, true);


--
-- Name: income_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."income_categories_id_seq"', 23, true);


--
-- Name: incomes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."incomes_id_seq"', 2, true);


--
-- Name: keep_alive_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."keep_alive_id_seq"', 4, true);


--
-- Name: madrasah_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."madrasah_events_id_seq"', 1, true);


--
-- Name: monthly_fees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."monthly_fees_id_seq"', 10, true);


--
-- Name: notification_reads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."notification_reads_id_seq"', 15, true);


--
-- Name: print_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."print_templates_id_seq"', 1, false);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."students_id_seq"', 12, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict iob90mwTjIDY7eKth3KFL9Avul7BlJFHWVoolCZj0RiTOZ75Rdnxfa9kqP3PPdc

RESET ALL;
