--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

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

ALTER TABLE IF EXISTS ONLY public.user_streaks DROP CONSTRAINT IF EXISTS user_streaks_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_progress DROP CONSTRAINT IF EXISTS user_progress_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_privacy_settings DROP CONSTRAINT IF EXISTS user_privacy_settings_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_feedback DROP CONSTRAINT IF EXISTS user_feedback_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_achievements_id_fk;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.secret_progress DROP CONSTRAINT IF EXISTS secret_progress_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.secret_progress DROP CONSTRAINT IF EXISTS secret_progress_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.reset_tokens DROP CONSTRAINT IF EXISTS reset_tokens_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.reported_content DROP CONSTRAINT IF EXISTS reported_content_reporter_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.reading_progress DROP CONSTRAINT IF EXISTS reading_progress_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.reading_progress DROP CONSTRAINT IF EXISTS reading_progress_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_author_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_parent_id_comments_id_fk;
ALTER TABLE IF EXISTS ONLY public.comment_votes DROP CONSTRAINT IF EXISTS comment_votes_comment_id_comments_id_fk;
ALTER TABLE IF EXISTS ONLY public.comment_reactions DROP CONSTRAINT IF EXISTS comment_reactions_comment_id_comments_id_fk;
ALTER TABLE IF EXISTS ONLY public.challenge_entries DROP CONSTRAINT IF EXISTS challenge_entries_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.challenge_entries DROP CONSTRAINT IF EXISTS challenge_entries_challenge_id_writing_challenges_id_fk;
ALTER TABLE IF EXISTS ONLY public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.author_tips DROP CONSTRAINT IF EXISTS author_tips_author_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.author_stats DROP CONSTRAINT IF EXISTS author_stats_author_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.analytics DROP CONSTRAINT IF EXISTS analytics_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_users_id_fk;
DROP INDEX IF EXISTS public.username_idx;
DROP INDEX IF EXISTS public.email_idx;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.writing_challenges DROP CONSTRAINT IF EXISTS writing_challenges_pkey;
ALTER TABLE IF EXISTS ONLY public.webhooks DROP CONSTRAINT IF EXISTS webhooks_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_streaks DROP CONSTRAINT IF EXISTS user_streaks_pkey;
ALTER TABLE IF EXISTS ONLY public.user_progress DROP CONSTRAINT IF EXISTS user_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.user_privacy_settings DROP CONSTRAINT IF EXISTS user_privacy_settings_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.user_privacy_settings DROP CONSTRAINT IF EXISTS user_privacy_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.user_feedback DROP CONSTRAINT IF EXISTS user_feedback_pkey;
ALTER TABLE IF EXISTS ONLY public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_achievement_id_unique;
ALTER TABLE IF EXISTS ONLY public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_unique;
ALTER TABLE IF EXISTS ONLY public.site_analytics DROP CONSTRAINT IF EXISTS site_analytics_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_token_unique;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY public.secret_progress DROP CONSTRAINT IF EXISTS secret_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.reset_tokens DROP CONSTRAINT IF EXISTS reset_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY public.reset_tokens DROP CONSTRAINT IF EXISTS reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.reported_content DROP CONSTRAINT IF EXISTS reported_content_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_progress DROP CONSTRAINT IF EXISTS reading_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_slug_unique;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_pkey;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.performance_metrics DROP CONSTRAINT IF EXISTS performance_metrics_pkey;
ALTER TABLE IF EXISTS ONLY public.content_protection DROP CONSTRAINT IF EXISTS content_protection_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.comment_votes DROP CONSTRAINT IF EXISTS comment_votes_pkey;
ALTER TABLE IF EXISTS ONLY public.comment_votes DROP CONSTRAINT IF EXISTS comment_votes_comment_id_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.comment_reactions DROP CONSTRAINT IF EXISTS comment_reactions_pkey;
ALTER TABLE IF EXISTS ONLY public.comment_reactions DROP CONSTRAINT IF EXISTS comment_reactions_comment_id_user_id_emoji_unique;
ALTER TABLE IF EXISTS ONLY public.challenge_entries DROP CONSTRAINT IF EXISTS challenge_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_post_id_unique;
ALTER TABLE IF EXISTS ONLY public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_pkey;
ALTER TABLE IF EXISTS ONLY public.author_tips DROP CONSTRAINT IF EXISTS author_tips_pkey;
ALTER TABLE IF EXISTS ONLY public.author_stats DROP CONSTRAINT IF EXISTS author_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics DROP CONSTRAINT IF EXISTS analytics_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.achievements DROP CONSTRAINT IF EXISTS achievements_pkey;
ALTER TABLE IF EXISTS public.writing_challenges ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.webhooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_streaks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_privacy_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_feedback ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_achievements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.site_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.site_analytics ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.secret_progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reset_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reported_content ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.post_likes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.performance_metrics ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_protection ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contact_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comment_votes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comment_reactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.challenge_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bookmarks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.author_tips ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.author_stats ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.analytics ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admin_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.achievements ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.writing_challenges_id_seq;
DROP TABLE IF EXISTS public.writing_challenges;
DROP SEQUENCE IF EXISTS public.webhooks_id_seq;
DROP TABLE IF EXISTS public.webhooks;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_streaks_id_seq;
DROP TABLE IF EXISTS public.user_streaks;
DROP SEQUENCE IF EXISTS public.user_progress_id_seq;
DROP TABLE IF EXISTS public.user_progress;
DROP SEQUENCE IF EXISTS public.user_privacy_settings_id_seq;
DROP TABLE IF EXISTS public.user_privacy_settings;
DROP SEQUENCE IF EXISTS public.user_feedback_id_seq;
DROP TABLE IF EXISTS public.user_feedback;
DROP SEQUENCE IF EXISTS public.user_achievements_id_seq;
DROP TABLE IF EXISTS public.user_achievements;
DROP SEQUENCE IF EXISTS public.site_settings_id_seq;
DROP TABLE IF EXISTS public.site_settings;
DROP SEQUENCE IF EXISTS public.site_analytics_id_seq;
DROP TABLE IF EXISTS public.site_analytics;
DROP SEQUENCE IF EXISTS public.sessions_id_seq;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.session;
DROP SEQUENCE IF EXISTS public.secret_progress_id_seq;
DROP TABLE IF EXISTS public.secret_progress;
DROP SEQUENCE IF EXISTS public.reset_tokens_id_seq;
DROP TABLE IF EXISTS public.reset_tokens;
DROP SEQUENCE IF EXISTS public.reported_content_id_seq;
DROP TABLE IF EXISTS public.reported_content;
DROP SEQUENCE IF EXISTS public.reading_progress_id_seq;
DROP TABLE IF EXISTS public.reading_progress;
DROP SEQUENCE IF EXISTS public.posts_id_seq;
DROP TABLE IF EXISTS public.posts;
DROP SEQUENCE IF EXISTS public.post_likes_id_seq;
DROP TABLE IF EXISTS public.post_likes;
DROP SEQUENCE IF EXISTS public.performance_metrics_id_seq;
DROP TABLE IF EXISTS public.performance_metrics;
DROP SEQUENCE IF EXISTS public.content_protection_id_seq;
DROP TABLE IF EXISTS public.content_protection;
DROP SEQUENCE IF EXISTS public.contact_messages_id_seq;
DROP TABLE IF EXISTS public.contact_messages;
DROP SEQUENCE IF EXISTS public.comments_id_seq;
DROP TABLE IF EXISTS public.comments;
DROP SEQUENCE IF EXISTS public.comment_votes_id_seq;
DROP TABLE IF EXISTS public.comment_votes;
DROP SEQUENCE IF EXISTS public.comment_reactions_id_seq;
DROP TABLE IF EXISTS public.comment_reactions;
DROP SEQUENCE IF EXISTS public.challenge_entries_id_seq;
DROP TABLE IF EXISTS public.challenge_entries;
DROP SEQUENCE IF EXISTS public.bookmarks_id_seq;
DROP TABLE IF EXISTS public.bookmarks;
DROP SEQUENCE IF EXISTS public.author_tips_id_seq;
DROP TABLE IF EXISTS public.author_tips;
DROP SEQUENCE IF EXISTS public.author_stats_id_seq;
DROP TABLE IF EXISTS public.author_stats;
DROP SEQUENCE IF EXISTS public.analytics_id_seq;
DROP TABLE IF EXISTS public.analytics;
DROP SEQUENCE IF EXISTS public.admin_notifications_id_seq;
DROP TABLE IF EXISTS public.admin_notifications;
DROP SEQUENCE IF EXISTS public.activity_logs_id_seq;
DROP TABLE IF EXISTS public.activity_logs;
DROP SEQUENCE IF EXISTS public.achievements_id_seq;
DROP TABLE IF EXISTS public.achievements;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    type text NOT NULL,
    condition json NOT NULL,
    badge_icon text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.achievements OWNER TO neondb_owner;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_id_seq OWNER TO neondb_owner;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    details json DEFAULT '{}'::json NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO neondb_owner;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO neondb_owner;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_notifications (
    id integer NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_notifications OWNER TO neondb_owner;

--
-- Name: admin_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_notifications_id_seq OWNER TO neondb_owner;

--
-- Name: admin_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_notifications_id_seq OWNED BY public.admin_notifications.id;


--
-- Name: analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.analytics (
    id integer NOT NULL,
    post_id integer NOT NULL,
    page_views integer DEFAULT 0 NOT NULL,
    unique_visitors integer DEFAULT 0 NOT NULL,
    average_read_time double precision DEFAULT 0 NOT NULL,
    bounce_rate double precision DEFAULT 0 NOT NULL,
    device_stats json DEFAULT '{}'::json NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.analytics OWNER TO neondb_owner;

--
-- Name: analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_id_seq OWNER TO neondb_owner;

--
-- Name: analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.analytics_id_seq OWNED BY public.analytics.id;


--
-- Name: author_stats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.author_stats (
    id integer NOT NULL,
    author_id integer NOT NULL,
    total_posts integer DEFAULT 0 NOT NULL,
    total_likes integer DEFAULT 0 NOT NULL,
    total_tips text DEFAULT '0'::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.author_stats OWNER TO neondb_owner;

--
-- Name: author_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.author_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.author_stats_id_seq OWNER TO neondb_owner;

--
-- Name: author_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.author_stats_id_seq OWNED BY public.author_stats.id;


--
-- Name: author_tips; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.author_tips (
    id integer NOT NULL,
    author_id integer NOT NULL,
    amount text NOT NULL,
    message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.author_tips OWNER TO neondb_owner;

--
-- Name: author_tips_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.author_tips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.author_tips_id_seq OWNER TO neondb_owner;

--
-- Name: author_tips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.author_tips_id_seq OWNED BY public.author_tips.id;


--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bookmarks (
    id integer NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    notes text,
    last_position numeric DEFAULT '0'::numeric NOT NULL,
    tags text[]
);


ALTER TABLE public.bookmarks OWNER TO neondb_owner;

--
-- Name: bookmarks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bookmarks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookmarks_id_seq OWNER TO neondb_owner;

--
-- Name: bookmarks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bookmarks_id_seq OWNED BY public.bookmarks.id;


--
-- Name: challenge_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.challenge_entries (
    id integer NOT NULL,
    challenge_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    submission_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.challenge_entries OWNER TO neondb_owner;

--
-- Name: challenge_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.challenge_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.challenge_entries_id_seq OWNER TO neondb_owner;

--
-- Name: challenge_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.challenge_entries_id_seq OWNED BY public.challenge_entries.id;


--
-- Name: comment_reactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comment_reactions (
    id integer NOT NULL,
    comment_id integer NOT NULL,
    user_id text NOT NULL,
    emoji text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comment_reactions OWNER TO neondb_owner;

--
-- Name: comment_reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.comment_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_reactions_id_seq OWNER TO neondb_owner;

--
-- Name: comment_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.comment_reactions_id_seq OWNED BY public.comment_reactions.id;


--
-- Name: comment_votes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comment_votes (
    id integer NOT NULL,
    comment_id integer NOT NULL,
    user_id text NOT NULL,
    is_upvote boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comment_votes OWNER TO neondb_owner;

--
-- Name: comment_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.comment_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_votes_id_seq OWNER TO neondb_owner;

--
-- Name: comment_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.comment_votes_id_seq OWNED BY public.comment_votes.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    content text NOT NULL,
    post_id integer,
    parent_id integer,
    user_id integer,
    approved boolean DEFAULT false NOT NULL,
    edited boolean DEFAULT false NOT NULL,
    edited_at timestamp without time zone,
    metadata json DEFAULT '{}'::json NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contact_messages OWNER TO neondb_owner;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_id_seq OWNER TO neondb_owner;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: content_protection; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_protection (
    id integer NOT NULL,
    content text NOT NULL,
    hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_protection OWNER TO neondb_owner;

--
-- Name: content_protection_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.content_protection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_protection_id_seq OWNER TO neondb_owner;

--
-- Name: content_protection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.content_protection_id_seq OWNED BY public.content_protection.id;


--
-- Name: performance_metrics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.performance_metrics (
    id integer NOT NULL,
    metric_name text NOT NULL,
    value double precision NOT NULL,
    identifier text NOT NULL,
    navigation_type text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    url text NOT NULL,
    user_agent text
);


ALTER TABLE public.performance_metrics OWNER TO neondb_owner;

--
-- Name: performance_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.performance_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performance_metrics_id_seq OWNER TO neondb_owner;

--
-- Name: performance_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.performance_metrics_id_seq OWNED BY public.performance_metrics.id;


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.post_likes (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    is_like boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_likes OWNER TO neondb_owner;

--
-- Name: post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_likes_id_seq OWNER TO neondb_owner;

--
-- Name: post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    excerpt text,
    slug text NOT NULL,
    author_id integer NOT NULL,
    is_secret boolean DEFAULT false NOT NULL,
    mature_content boolean DEFAULT false NOT NULL,
    theme_category text,
    reading_time_minutes integer,
    likes_count integer DEFAULT 0,
    dislikes_count integer DEFAULT 0,
    metadata json DEFAULT '{}'::json NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.posts OWNER TO neondb_owner;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO neondb_owner;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: reading_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reading_progress (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    progress numeric NOT NULL,
    last_read_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reading_progress OWNER TO neondb_owner;

--
-- Name: reading_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reading_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reading_progress_id_seq OWNER TO neondb_owner;

--
-- Name: reading_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reading_progress_id_seq OWNED BY public.reading_progress.id;


--
-- Name: reported_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reported_content (
    id integer NOT NULL,
    content_type text NOT NULL,
    content_id integer NOT NULL,
    reporter_id integer NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reported_content OWNER TO neondb_owner;

--
-- Name: reported_content_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reported_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reported_content_id_seq OWNER TO neondb_owner;

--
-- Name: reported_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reported_content_id_seq OWNED BY public.reported_content.id;


--
-- Name: reset_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reset_tokens OWNER TO neondb_owner;

--
-- Name: reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reset_tokens_id_seq OWNER TO neondb_owner;

--
-- Name: reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reset_tokens_id_seq OWNED BY public.reset_tokens.id;


--
-- Name: secret_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.secret_progress (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    discovery_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.secret_progress OWNER TO neondb_owner;

--
-- Name: secret_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.secret_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secret_progress_id_seq OWNER TO neondb_owner;

--
-- Name: secret_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.secret_progress_id_seq OWNED BY public.secret_progress.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    token text NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    last_accessed_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO neondb_owner;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: site_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.site_analytics (
    id integer NOT NULL,
    identifier text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    page_views integer DEFAULT 0 NOT NULL,
    unique_visitors integer DEFAULT 0 NOT NULL,
    average_read_time double precision DEFAULT 0 NOT NULL,
    bounce_rate double precision DEFAULT 0 NOT NULL,
    device_stats json DEFAULT '{}'::json NOT NULL
);


ALTER TABLE public.site_analytics OWNER TO neondb_owner;

--
-- Name: site_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.site_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_analytics_id_seq OWNER TO neondb_owner;

--
-- Name: site_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.site_analytics_id_seq OWNED BY public.site_analytics.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    category text NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.site_settings OWNER TO neondb_owner;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO neondb_owner;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    achievement_id integer NOT NULL,
    unlocked_at timestamp without time zone DEFAULT now() NOT NULL,
    progress json DEFAULT '{}'::json NOT NULL
);


ALTER TABLE public.user_achievements OWNER TO neondb_owner;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_achievements_id_seq OWNER TO neondb_owner;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_feedback (
    id integer NOT NULL,
    type text DEFAULT 'general'::text NOT NULL,
    content text NOT NULL,
    page text DEFAULT 'unknown'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    user_id integer,
    browser text DEFAULT 'unknown'::text,
    operating_system text DEFAULT 'unknown'::text,
    screen_resolution text DEFAULT 'unknown'::text,
    user_agent text DEFAULT 'unknown'::text,
    category text DEFAULT 'general'::text,
    metadata json DEFAULT '{}'::json,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_feedback OWNER TO neondb_owner;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_feedback_id_seq OWNER TO neondb_owner;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_feedback_id_seq OWNED BY public.user_feedback.id;


--
-- Name: user_privacy_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_privacy_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    profile_visible boolean DEFAULT true NOT NULL,
    share_reading_history boolean DEFAULT false NOT NULL,
    anonymous_commenting boolean DEFAULT false NOT NULL,
    two_factor_auth_enabled boolean DEFAULT false NOT NULL,
    login_notifications boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_privacy_settings OWNER TO neondb_owner;

--
-- Name: user_privacy_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_privacy_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_privacy_settings_id_seq OWNER TO neondb_owner;

--
-- Name: user_privacy_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_privacy_settings_id_seq OWNED BY public.user_privacy_settings.id;


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    progress_type text NOT NULL,
    post_id integer,
    progress numeric NOT NULL,
    last_activity_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_progress OWNER TO neondb_owner;

--
-- Name: user_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_progress_id_seq OWNER TO neondb_owner;

--
-- Name: user_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_progress_id_seq OWNED BY public.user_progress.id;


--
-- Name: user_streaks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_streaks (
    id integer NOT NULL,
    user_id integer NOT NULL,
    streak_type text NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_activity_at timestamp without time zone DEFAULT now() NOT NULL,
    total_activities integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_streaks OWNER TO neondb_owner;

--
-- Name: user_streaks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_streaks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_streaks_id_seq OWNER TO neondb_owner;

--
-- Name: user_streaks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_streaks_id_seq OWNED BY public.user_streaks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    full_name text,
    avatar text,
    bio text,
    metadata json DEFAULT '{}'::json,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.webhooks (
    id integer NOT NULL,
    url text NOT NULL,
    events text[] NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.webhooks OWNER TO neondb_owner;

--
-- Name: webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.webhooks_id_seq OWNER TO neondb_owner;

--
-- Name: webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.webhooks_id_seq OWNED BY public.webhooks.id;


--
-- Name: writing_challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.writing_challenges (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.writing_challenges OWNER TO neondb_owner;

--
-- Name: writing_challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.writing_challenges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.writing_challenges_id_seq OWNER TO neondb_owner;

--
-- Name: writing_challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.writing_challenges_id_seq OWNED BY public.writing_challenges.id;


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: admin_notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_notifications ALTER COLUMN id SET DEFAULT nextval('public.admin_notifications_id_seq'::regclass);


--
-- Name: analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics ALTER COLUMN id SET DEFAULT nextval('public.analytics_id_seq'::regclass);


--
-- Name: author_stats id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_stats ALTER COLUMN id SET DEFAULT nextval('public.author_stats_id_seq'::regclass);


--
-- Name: author_tips id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_tips ALTER COLUMN id SET DEFAULT nextval('public.author_tips_id_seq'::regclass);


--
-- Name: bookmarks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookmarks ALTER COLUMN id SET DEFAULT nextval('public.bookmarks_id_seq'::regclass);


--
-- Name: challenge_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenge_entries ALTER COLUMN id SET DEFAULT nextval('public.challenge_entries_id_seq'::regclass);


--
-- Name: comment_reactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_reactions ALTER COLUMN id SET DEFAULT nextval('public.comment_reactions_id_seq'::regclass);


--
-- Name: comment_votes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_votes ALTER COLUMN id SET DEFAULT nextval('public.comment_votes_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: content_protection id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_protection ALTER COLUMN id SET DEFAULT nextval('public.content_protection_id_seq'::regclass);


--
-- Name: performance_metrics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.performance_metrics ALTER COLUMN id SET DEFAULT nextval('public.performance_metrics_id_seq'::regclass);


--
-- Name: post_likes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: reading_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reading_progress ALTER COLUMN id SET DEFAULT nextval('public.reading_progress_id_seq'::regclass);


--
-- Name: reported_content id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reported_content ALTER COLUMN id SET DEFAULT nextval('public.reported_content_id_seq'::regclass);


--
-- Name: reset_tokens id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.reset_tokens_id_seq'::regclass);


--
-- Name: secret_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secret_progress ALTER COLUMN id SET DEFAULT nextval('public.secret_progress_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: site_analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_analytics ALTER COLUMN id SET DEFAULT nextval('public.site_analytics_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- Name: user_feedback id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_feedback ALTER COLUMN id SET DEFAULT nextval('public.user_feedback_id_seq'::regclass);


--
-- Name: user_privacy_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_privacy_settings ALTER COLUMN id SET DEFAULT nextval('public.user_privacy_settings_id_seq'::regclass);


--
-- Name: user_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN id SET DEFAULT nextval('public.user_progress_id_seq'::regclass);


--
-- Name: user_streaks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_streaks ALTER COLUMN id SET DEFAULT nextval('public.user_streaks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: webhooks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.webhooks ALTER COLUMN id SET DEFAULT nextval('public.webhooks_id_seq'::regclass);


--
-- Name: writing_challenges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.writing_challenges ALTER COLUMN id SET DEFAULT nextval('public.writing_challenges_id_seq'::regclass);


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.achievements (id, name, description, type, condition, badge_icon, created_at) FROM stdin;
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_logs (id, user_id, action, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_notifications (id, title, message, type, is_read, priority, created_at) FROM stdin;
\.


--
-- Data for Name: analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.analytics (id, post_id, page_views, unique_visitors, average_read_time, bounce_rate, device_stats, updated_at) FROM stdin;
\.


--
-- Data for Name: author_stats; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.author_stats (id, author_id, total_posts, total_likes, total_tips, updated_at) FROM stdin;
\.


--
-- Data for Name: author_tips; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.author_tips (id, author_id, amount, message, created_at) FROM stdin;
\.


--
-- Data for Name: bookmarks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bookmarks (id, user_id, post_id, created_at, notes, last_position, tags) FROM stdin;
\.


--
-- Data for Name: challenge_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.challenge_entries (id, challenge_id, user_id, content, submission_date) FROM stdin;
\.


--
-- Data for Name: comment_reactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comment_reactions (id, comment_id, user_id, emoji, created_at) FROM stdin;
\.


--
-- Data for Name: comment_votes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comment_votes (id, comment_id, user_id, is_upvote, created_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comments (id, content, post_id, parent_id, user_id, approved, edited, edited_at, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contact_messages (id, name, email, subject, message, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: content_protection; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.content_protection (id, content, hash, created_at) FROM stdin;
\.


--
-- Data for Name: performance_metrics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.performance_metrics (id, metric_name, value, identifier, navigation_type, "timestamp", url, user_agent) FROM stdin;
1	TTFB	346	nav-timing	navigate	2025-03-19 00:02:41.548	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
2	DNS	1073	dns-timing	navigation	2025-03-19 00:02:41.557	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
3	TCP	1162	tcp-timing	navigation	2025-03-19 00:02:41.562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
4	TTFB	346	nav-timing	navigate	2025-03-19 00:02:41.573	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
5	DNS	1073	dns-timing	navigation	2025-03-19 00:02:41.842	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
6	TCP	1162	tcp-timing	navigation	2025-03-19 00:02:41.84	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
7	FCP	14106	v4-1742342561380-7648896908995	navigation	2025-03-19 00:02:42.043	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
8	FCP	14106	v4-1742342561388-5601500399037	navigation	2025-03-19 00:02:42.064	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
9	ResourceTiming	1547	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 00:02:54.269	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
10	ResourceTiming	6103	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 00:02:54.586	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
11	ResourceTiming	6144	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=E-LJ5LzKFBpusV5xRNNeY	navigation	2025-03-19 00:02:55.253	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
12	ResourceTiming	6013	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 00:02:55.313	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
13	ResourceTiming	3800	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 00:02:55.347	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
14	ResourceTiming	1733	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 00:02:55.354	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
15	ResourceTiming	6009	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 00:02:55.525	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
16	ResourceTiming	1959	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=E-LJ5LzKFBpusV5xRNNeY	navigation	2025-03-19 00:02:55.542	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
17	ResourceTiming	6265	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=E-LJ5LzKFBpusV5xRNNeY	navigation	2025-03-19 00:02:55.563	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
18	ResourceTiming	6437	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=E-LJ5LzKFBpusV5xRNNeY	navigation	2025-03-19 00:02:55.612	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
19	ResourceTiming	6446	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=E-LJ5LzKFBpusV5xRNNeY	navigation	2025-03-19 00:02:55.686	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
20	ResourceTiming	6471	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=E-LJ5LzKFBpusV5xRNNeY	navigation	2025-03-19 00:02:55.696	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
21	ResourceTiming	6518	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=E-LJ5LzKFBpusV5xRNNeY	navigation	2025-03-19 00:02:55.836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
23	ResourceTiming	608	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 00:02:55.903	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
26	ResourceTiming	655	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 00:02:56.02	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
27	ResourceTiming	986	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 00:02:56.165	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
29	ResourceTiming	1009	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 00:02:56.232	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
32	ResourceTiming	1379	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 00:02:56.355	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
33	ResourceTiming	1332	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 00:02:56.491	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
34	ResourceTiming	1384	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 00:02:56.557	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
54	ResourceTiming	1643	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 00:02:57.623	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
57	ResourceTiming	1856	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 00:02:57.787	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
58	ResourceTiming	1918	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 00:02:57.919	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
60	ResourceTiming	1680	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 00:02:57.979	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
63	ResourceTiming	1191	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 00:02:58.132	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
64	ResourceTiming	1228	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 00:02:58.252	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
66	ResourceTiming	1504	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 00:02:58.313	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
69	ResourceTiming	1537	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 00:02:58.472	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
70	ResourceTiming	1503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 00:02:58.785	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
22	ResourceTiming	6574	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 00:02:55.87	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
24	ResourceTiming	735	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 00:02:55.925	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
25	ResourceTiming	1699	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 00:02:55.996	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
28	ResourceTiming	993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 00:02:56.203	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
30	ResourceTiming	1019	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 00:02:56.257	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
31	ResourceTiming	1093	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 00:02:56.311	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
35	ResourceTiming	1407	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 00:02:56.569	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
38	ResourceTiming	2058	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 00:02:56.68	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
39	ResourceTiming	1730	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 00:02:56.816	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
40	ResourceTiming	1808	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 00:02:56.914	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
42	ResourceTiming	1881	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 00:02:56.979	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
45	ResourceTiming	2122	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 00:02:57.144	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
46	ResourceTiming	2168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 00:02:57.25	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
48	ResourceTiming	2331	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 00:02:57.297	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
49	ResourceTiming	2336	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 00:02:57.345	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
50	ResourceTiming	2385	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 00:02:57.425	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
53	ResourceTiming	2939	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 00:02:57.597	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
55	ResourceTiming	1708	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 00:02:57.669	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
36	ResourceTiming	1503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 00:02:56.597	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
37	ResourceTiming	1619	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 00:02:56.64	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
41	ResourceTiming	1842	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 00:02:56.945	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
43	ResourceTiming	2060	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 00:02:57.021	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
44	ResourceTiming	2082	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 00:02:57.11	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
47	ResourceTiming	2168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 00:02:57.279	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
51	ResourceTiming	2732	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 00:02:57.448	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
52	ResourceTiming	2283	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 00:02:57.583	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
72	ResourceTiming	1709	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 00:02:58.813	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
73	ResourceTiming	1714	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 00:02:58.856	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
78	ResourceTiming	1504	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 00:02:59.141	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
80	ResourceTiming	1441	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 00:02:59.194	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
83	ResourceTiming	1668	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 00:02:59.634	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
86	ResourceTiming	972	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 00:02:59.679	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
89	ResourceTiming	919	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 00:02:59.946	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
91	ResourceTiming	971	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 00:03:00.007	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
93	ResourceTiming	457	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 00:03:00.056	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
94	ResourceTiming	504	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 00:03:00.236	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
56	ResourceTiming	1990	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 00:02:57.754	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
59	ResourceTiming	1575	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 00:02:57.954	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
61	ResourceTiming	1601	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 00:02:58.012	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
62	ResourceTiming	1317	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 00:02:58.095	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
65	ResourceTiming	1492	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 00:02:58.27	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
67	ResourceTiming	1513	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 00:02:58.332	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
68	ResourceTiming	1514	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 00:02:58.45	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
71	ResourceTiming	1717	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 00:02:58.794	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
74	ResourceTiming	1949	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 00:02:58.872	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
77	ResourceTiming	1432	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 00:02:59.134	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
81	ResourceTiming	1436	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 00:02:59.214	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
82	ResourceTiming	1693	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 00:02:59.618	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
85	ResourceTiming	1285	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 00:02:59.671	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
92	ResourceTiming	937	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 00:03:00.023	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
95	ResourceTiming	598	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 00:03:00.26	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
97	ResourceTiming	722	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 00:03:00.315	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
99	ResourceTiming	731	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 00:03:00.372	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
75	ResourceTiming	1559	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 00:02:58.886	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
76	ResourceTiming	1226	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 00:02:59.102	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
79	ResourceTiming	1509	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 00:02:59.174	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
84	ResourceTiming	1237	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 00:02:59.655	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
104	ResourceTiming	882	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 00:03:00.632	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
105	ResourceTiming	784	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 00:03:00.687	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
106	ResourceTiming	819	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 00:03:00.838	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
107	ResourceTiming	842	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 00:03:00.91	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
116	ResourceTiming	645	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:01.252	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
121	ResourceTiming	351	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/transitions/FadeInSection.tsx	navigation	2025-03-19 00:03:01.565	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
87	ResourceTiming	981	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 00:02:59.704	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
88	ResourceTiming	1077	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 00:02:59.935	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
90	ResourceTiming	889	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 00:02:59.991	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
98	ResourceTiming	552	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 00:03:00.322	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
102	ResourceTiming	781	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 00:03:00.608	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
109	ResourceTiming	328	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 00:03:00.937	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
111	ResourceTiming	353	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:00.994	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
112	ResourceTiming	357	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:01.141	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
113	ResourceTiming	524	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:01.224	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
123	ResourceTiming	1773	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/posts?page=1&limit=5	navigation	2025-03-19 00:03:01.61	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
96	ResourceTiming	705	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 00:03:00.305	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
103	ResourceTiming	862	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 00:03:00.622	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
108	ResourceTiming	699	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 00:03:00.926	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
115	ResourceTiming	640	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:01.243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
117	ResourceTiming	820	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:01.295	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
118	ResourceTiming	820	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:01.466	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
119	ResourceTiming	346	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/BuyMeCoffeeButton.tsx	navigation	2025-03-19 00:03:01.536	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
122	ResourceTiming	1268	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/posts?page=1&limit=5	navigation	2025-03-19 00:03:01.583	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
100	ResourceTiming	757	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 00:03:00.537	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
101	ResourceTiming	702	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 00:03:00.589	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
110	ResourceTiming	291	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 00:03:00.953	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
114	ResourceTiming	522	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 00:03:01.233	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
120	ResourceTiming	12037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/attached_assets/IMG_4918.jpeg	navigation	2025-03-19 00:03:01.566	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
124	ResourceTiming	1081	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/posts?page=1&limit=1	navigation	2025-03-19 00:04:56.875	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
125	TTFB	359	nav-timing	navigate	2025-03-19 00:05:18.289	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
126	DNS	0	dns-timing	navigation	2025-03-19 00:05:18.307	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
127	TTFB	359	nav-timing	navigate	2025-03-19 00:05:18.366	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
128	TCP	1072	tcp-timing	navigation	2025-03-19 00:05:18.316	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
129	DNS	0	dns-timing	navigation	2025-03-19 00:05:18.473	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
130	TCP	1072	tcp-timing	navigation	2025-03-19 00:05:18.682	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
131	FCP	9096	v4-1742342718033-6361167481167	navigation	2025-03-19 00:05:18.724	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
132	FCP	9096	v4-1742342718052-8333410041266	navigation	2025-03-19 00:05:18.796	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
133	TTFB	1444	v4-1742342718033-8225363101985	navigation	2025-03-19 00:05:18.834	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
134	TTFB	1444	v4-1742342718052-3884922376150	navigation	2025-03-19 00:05:18.863	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
136	TCP	871	tcp-timing	navigation	2025-03-19 00:14:45.95	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
135	TTFB	359	nav-timing	reload	2025-03-19 00:14:45.955	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
137	ResourceTiming	2564	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 00:14:46.884	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
138	ResourceTiming	645	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=JvwWiImUnkwch8vVT3qrX	navigation	2025-03-19 00:14:46.9	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
139	ResourceTiming	7655	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 00:14:47.183	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
140	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 00:14:47.188	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
141	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 00:14:47.494	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
143	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 00:14:47.811	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
147	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 00:14:48.127	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
152	ResourceTiming	6678	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=JvwWiImUnkwch8vVT3qrX	navigation	2025-03-19 00:14:48.436	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
158	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 00:14:48.74	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
184	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 00:14:50.016	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
187	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 00:14:50.308	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
196	ResourceTiming	777	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 00:14:50.652	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
200	ResourceTiming	848	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 00:14:50.909	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
203	ResourceTiming	951	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 00:14:50.967	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
204	ResourceTiming	943	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 00:14:51.128	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
205	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 00:14:51.214	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
215	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 00:14:51.574	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
216	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 00:14:51.726	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
217	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 00:14:51.83	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
142	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 00:14:47.497	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
144	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 00:14:47.814	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
145	DNS	1	dns-timing	navigation	2025-03-19 00:14:45.932	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
146	TTFB	359	nav-timing	reload	2025-03-19 00:14:45.958	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
148	DNS	1	dns-timing	navigation	2025-03-19 00:14:45.98	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
149	ResourceTiming	1991	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=JvwWiImUnkwch8vVT3qrX	navigation	2025-03-19 00:14:48.138	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
150	TCP	871	tcp-timing	navigation	2025-03-19 00:14:46.151	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
151	ResourceTiming	6641	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=JvwWiImUnkwch8vVT3qrX	navigation	2025-03-19 00:14:48.413	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
153	ResourceTiming	6561	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=JvwWiImUnkwch8vVT3qrX	navigation	2025-03-19 00:14:48.434	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
154	ResourceTiming	6661	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=JvwWiImUnkwch8vVT3qrX	navigation	2025-03-19 00:14:48.429	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
155	ResourceTiming	6706	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=JvwWiImUnkwch8vVT3qrX	navigation	2025-03-19 00:14:48.447	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
156	ResourceTiming	7020	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 00:14:48.604	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
157	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 00:14:48.738	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
159	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 00:14:48.756	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
160	ResourceTiming	374	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 00:14:48.764	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
161	ResourceTiming	457	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 00:14:48.758	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
162	ResourceTiming	456	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 00:14:48.923	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
163	ResourceTiming	611	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 00:14:49.043	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
164	ResourceTiming	767	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 00:14:49.045	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
167	ResourceTiming	786	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 00:14:49.104	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
168	ResourceTiming	796	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 00:14:49.248	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
169	ResourceTiming	717	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 00:14:49.331	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
177	ResourceTiming	1117	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 00:14:49.654	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
179	ResourceTiming	1372	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 00:14:49.732	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
180	ResourceTiming	1337	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 00:14:49.853	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
181	ResourceTiming	1311	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 00:14:50.004	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
191	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 00:14:50.35	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
192	ResourceTiming	904	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 00:14:50.483	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
193	ResourceTiming	991	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 00:14:50.608	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
197	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 00:14:50.658	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
198	ResourceTiming	992	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 00:14:50.788	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
199	ResourceTiming	795	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 00:14:50.907	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
202	ResourceTiming	875	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 00:14:50.959	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
206	ResourceTiming	850	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 00:14:51.218	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
214	ResourceTiming	727	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 00:14:51.555	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
165	ResourceTiming	455	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 00:14:49.049	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
166	ResourceTiming	746	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 00:14:49.099	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
170	ResourceTiming	1030	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 00:14:49.348	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
172	ResourceTiming	1029	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 00:14:49.405	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
176	ResourceTiming	1271	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 00:14:49.65	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
178	ResourceTiming	1287	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 00:14:49.723	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
182	ResourceTiming	1403	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 00:14:50.008	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
190	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 00:14:50.333	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
194	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 00:14:50.614	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
208	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 00:14:51.258	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
211	ResourceTiming	514	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 00:14:51.533	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
239	ResourceTiming	262	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 00:14:52.823	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
240	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 00:14:52.986	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
241	ResourceTiming	278	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 00:14:53.092	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
171	ResourceTiming	868	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 00:14:49.352	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
173	ResourceTiming	1045	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 00:14:49.41	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
174	ResourceTiming	1055	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 00:14:49.54	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
175	ResourceTiming	1138	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 00:14:49.648	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
183	ResourceTiming	1629	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 00:14:50.012	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
189	ResourceTiming	1264	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 00:14:50.322	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
195	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 00:14:50.628	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
201	ResourceTiming	859	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 00:14:50.925	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
207	ResourceTiming	825	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 00:14:51.22	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
212	ResourceTiming	646	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 00:14:51.536	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
220	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 00:14:51.859	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
224	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 00:14:52.146	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
231	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 00:14:52.451	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
236	ResourceTiming	247	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 00:14:52.785	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
244	FCP	11846	v4-1742343285758-2977179164805	navigation	2025-03-19 00:14:53.109	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
185	ResourceTiming	1520	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 00:14:50.037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
186	ResourceTiming	1217	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 00:14:50.165	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
188	ResourceTiming	1223	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 00:14:50.307	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
209	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 00:14:51.267	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
210	ResourceTiming	688	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 00:14:51.427	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
213	ResourceTiming	682	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 00:14:51.531	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
219	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 00:14:51.849	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
221	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 00:14:51.9	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
222	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 00:14:52.066	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
223	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 00:14:52.131	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
232	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 00:14:52.463	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
233	ResourceTiming	318	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 00:14:52.527	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
234	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 00:14:52.683	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
235	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 00:14:52.771	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
245	FCP	11846	v4-1742343285765-4536062226098	navigation	2025-03-19 00:14:53.133	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
218	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 00:14:51.844	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
225	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 00:14:52.147	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
230	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 00:14:52.446	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
238	ResourceTiming	263	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 00:14:52.79	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
242	TTFB	1235	v4-1742343285765-3136730480921	navigation	2025-03-19 00:14:53.098	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
226	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 00:14:52.15	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
227	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 00:14:52.202	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
228	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 00:14:52.364	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
229	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 00:14:52.445	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
237	ResourceTiming	418	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 00:14:52.783	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
243	TTFB	1235	v4-1742343285758-5777227656798	navigation	2025-03-19 00:14:53.1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
246	TTFB	367	nav-timing	reload	2025-03-19 00:19:22.114	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
247	TCP	980	tcp-timing	navigation	2025-03-19 00:19:22.319	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
248	DNS	3	dns-timing	navigation	2025-03-19 00:19:22.133	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
249	TTFB	367	nav-timing	reload	2025-03-19 00:19:22.169	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
250	FCP	6160	v4-1742343561921-9502783400136	navigation	2025-03-19 00:19:23.246	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
251	FCP	6160	v4-1742343561914-1737331374844	navigation	2025-03-19 00:19:23.274	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
252	ResourceTiming	588	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=3nkiLEgZ1ZsOToqb3pwS1	navigation	2025-03-19 00:19:23.397	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
253	ResourceTiming	1080	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 00:19:23.401	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
254	TCP	980	tcp-timing	navigation	2025-03-19 00:19:22.121	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
255	DNS	3	dns-timing	navigation	2025-03-19 00:19:22.2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
256	ResourceTiming	1074	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 00:19:23.562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
257	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 00:19:23.572	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
258	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 00:19:23.925	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
259	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 00:19:23.929	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
261	ResourceTiming	293	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=3nkiLEgZ1ZsOToqb3pwS1	navigation	2025-03-19 00:19:23.994	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
268	ResourceTiming	2768	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=3nkiLEgZ1ZsOToqb3pwS1	navigation	2025-03-19 00:19:24.372	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
272	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 00:19:24.732	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
281	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 00:19:25.104	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
282	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 00:19:25.257	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
283	ResourceTiming	262	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 00:19:25.503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
260	ResourceTiming	1357	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?t=1742343331213&v=3nkiLEgZ1ZsOToqb3pwS1	navigation	2025-03-19 00:19:23.968	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
263	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 00:19:24.037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
264	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 00:19:24.261	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
267	ResourceTiming	755	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=3nkiLEgZ1ZsOToqb3pwS1	navigation	2025-03-19 00:19:24.342	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
273	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 00:19:24.736	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
278	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 00:19:25.073	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
286	ResourceTiming	245	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 00:19:25.511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
290	ResourceTiming	507	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 00:19:25.845	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
294	ResourceTiming	743	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 00:19:25.897	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
295	ResourceTiming	758	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 00:19:26.11	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
296	ResourceTiming	1005	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 00:19:26.23	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
300	ResourceTiming	1030	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 00:19:26.278	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
301	ResourceTiming	1019	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 00:19:26.441	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
302	ResourceTiming	1040	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 00:19:26.549	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
311	ResourceTiming	1001	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 00:19:26.909	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
312	ResourceTiming	1038	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 00:19:27.053	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
313	ResourceTiming	1043	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 00:19:27.191	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
262	ResourceTiming	1370	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?t=1742343331213&v=3nkiLEgZ1ZsOToqb3pwS1	navigation	2025-03-19 00:19:24.012	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
265	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 00:19:24.274	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
266	ResourceTiming	586	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=3nkiLEgZ1ZsOToqb3pwS1	navigation	2025-03-19 00:19:24.326	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
269	ResourceTiming	752	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 00:19:24.376	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
270	ResourceTiming	338	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 00:19:24.608	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
271	ResourceTiming	245	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 00:19:24.731	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
280	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 00:19:25.091	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
284	ResourceTiming	251	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 00:19:25.506	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
292	ResourceTiming	521	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 00:19:25.861	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
298	ResourceTiming	781	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 00:19:26.25	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
304	ResourceTiming	1258	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 00:19:26.567	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
309	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 00:19:26.882	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
315	ResourceTiming	1057	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 00:19:27.225	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
321	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 00:19:27.52	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
327	ResourceTiming	762	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 00:19:27.836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
332	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 00:19:28.145	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
338	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 00:19:28.494	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
274	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 00:19:24.737	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
279	ResourceTiming	262	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 00:19:25.087	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
285	ResourceTiming	251	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 00:19:25.51	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
291	ResourceTiming	522	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 00:19:25.848	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
293	ResourceTiming	769	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 00:19:25.893	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
297	ResourceTiming	767	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 00:19:26.236	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
305	ResourceTiming	1300	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 00:19:26.594	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
306	ResourceTiming	1314	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 00:19:26.641	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
307	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 00:19:26.755	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
308	ResourceTiming	1076	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 00:19:26.869	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
316	ResourceTiming	1254	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 00:19:27.23	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
320	ResourceTiming	797	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 00:19:27.508	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
328	ResourceTiming	758	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 00:19:27.849	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
329	ResourceTiming	971	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 00:19:27.914	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
330	ResourceTiming	771	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 00:19:27.967	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
331	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 00:19:28.144	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
339	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 00:19:28.515	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
275	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 00:19:24.746	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
276	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 00:19:24.93	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
277	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 00:19:25.063	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
287	ResourceTiming	266	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 00:19:25.519	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
288	ResourceTiming	498	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 00:19:25.568	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
289	ResourceTiming	513	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 00:19:25.819	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
299	ResourceTiming	1024	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 00:19:26.274	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
303	ResourceTiming	1240	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 00:19:26.559	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
310	ResourceTiming	1002	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 00:19:26.888	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
314	ResourceTiming	1231	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 00:19:27.205	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
323	ResourceTiming	984	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 00:19:27.545	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
324	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 00:19:27.651	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
325	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 00:19:27.798	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
334	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 00:19:28.175	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
335	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 00:19:28.286	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
336	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 00:19:28.462	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
340	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 00:19:28.514	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
317	ResourceTiming	1792	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 00:19:27.239	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
318	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 00:19:27.355	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
319	ResourceTiming	806	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 00:19:27.482	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
322	ResourceTiming	789	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 00:19:27.532	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
326	ResourceTiming	706	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 00:19:27.805	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
333	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 00:19:28.156	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
337	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 00:19:28.488	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
345	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 00:19:28.812	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
346	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 00:19:28.898	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
347	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 00:19:28.984	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
348	ResourceTiming	474	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 00:19:29.084	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
351	ResourceTiming	243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 00:19:29.139	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
352	ResourceTiming	469	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 00:19:29.296	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
353	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 00:19:29.382	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
354	ResourceTiming	249	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 00:19:29.432	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
341	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 00:19:28.659	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
342	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 00:19:28.769	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
343	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 00:19:28.794	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
350	ResourceTiming	305	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 00:19:29.107	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
356	TTFB	1356	v4-1742343561921-9398517453471	navigation	2025-03-19 00:19:29.462	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
344	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 00:19:28.796	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
349	ResourceTiming	304	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 00:19:29.106	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
355	TTFB	1356	v4-1742343561914-4026767771204	navigation	2025-03-19 00:19:29.447	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
357	TCP	763	tcp-timing	navigation	2025-03-19 00:20:32.647	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
358	DNS	1	dns-timing	navigation	2025-03-19 00:20:32.652	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
359	TTFB	427	nav-timing	reload	2025-03-19 00:20:32.658	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
360	DNS	1	dns-timing	navigation	2025-03-19 00:20:32.669	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
361	TTFB	427	nav-timing	reload	2025-03-19 00:20:32.673	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
362	TCP	763	tcp-timing	navigation	2025-03-19 00:20:32.885	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
363	FCP	8131	v4-1742343632490-4003689875070	navigation	2025-03-19 00:20:32.942	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
364	FCP	8131	v4-1742343632506-6054727624611	navigation	2025-03-19 00:20:32.945	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
365	TTFB	1193	v4-1742343632490-1565554199407	navigation	2025-03-19 00:20:33.089	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
366	TTFB	1193	v4-1742343632506-7653133862681	navigation	2025-03-19 00:20:33.112	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
367	TTFB	264	nav-timing	reload	2025-03-19 00:20:43.37	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
368	DNS	0	dns-timing	navigation	2025-03-19 00:20:43.383	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
369	TCP	0	tcp-timing	navigation	2025-03-19 00:20:43.396	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
370	TTFB	264	nav-timing	reload	2025-03-19 00:20:43.428	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
371	DNS	0	dns-timing	navigation	2025-03-19 00:20:43.431	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
372	TCP	0	tcp-timing	navigation	2025-03-19 00:20:43.624	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
373	TTFB	267	v4-1742343643263-6919441041439	navigation	2025-03-19 00:20:43.665	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
374	TTFB	267	v4-1742343643297-7841202857560	navigation	2025-03-19 00:20:43.679	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
375	TCP	800	tcp-timing	navigation	2025-03-19 00:25:53.571	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
376	TTFB	343	nav-timing	navigate	2025-03-19 00:25:53.593	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
377	DNS	0	dns-timing	navigation	2025-03-19 00:25:53.608	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
383	FCP	10092	v4-1742343953412-9106091314903	navigation	2025-03-19 00:25:54.06	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
378	TTFB	343	nav-timing	navigate	2025-03-19 00:25:53.597	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
382	TTFB	1149	v4-1742343953429-6664321219837	navigation	2025-03-19 00:25:54.052	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
379	DNS	0	dns-timing	navigation	2025-03-19 00:25:53.782	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
380	TCP	800	tcp-timing	navigation	2025-03-19 00:25:53.897	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
381	TTFB	1149	v4-1742343953412-3902652178335	navigation	2025-03-19 00:25:54.05	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
384	FCP	10092	v4-1742343953429-1541719917664	navigation	2025-03-19 00:25:54.095	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
385	TCP	867	tcp-timing	navigation	2025-03-19 00:35:40.813	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
387	TCP	867	tcp-timing	navigation	2025-03-19 00:35:40.514	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
386	DNS	56	dns-timing	navigation	2025-03-19 00:35:40.493	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
388	TTFB	359	nav-timing	reload	2025-03-19 00:35:40.506	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
389	TTFB	1289	v4-1742344540348-1006559770780	navigation	2025-03-19 00:35:41.487	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
390	TTFB	1289	v4-1742344540366-4722676010299	navigation	2025-03-19 00:35:41.491	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
391	FCP	9182	v4-1742344540348-5065324905974	navigation	2025-03-19 00:35:41.726	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
392	FCP	9182	v4-1742344540366-7842555305227	navigation	2025-03-19 00:35:41.723	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
393	TTFB	359	nav-timing	reload	2025-03-19 00:35:40.51	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
394	DNS	56	dns-timing	navigation	2025-03-19 00:35:40.712	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
395	DNS	1	dns-timing	navigation	2025-03-19 00:36:18.809	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
396	DNS	1	dns-timing	navigation	2025-03-19 00:36:19.311	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
397	TCP	796	tcp-timing	navigation	2025-03-19 00:36:19.337	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
398	TTFB	352	nav-timing	reload	2025-03-19 00:36:19.356	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
399	TCP	796	tcp-timing	navigation	2025-03-19 00:36:19.768	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
400	TTFB	1155	v4-1742344578440-7797616795408	navigation	2025-03-19 00:36:19.789	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
401	TTFB	1155	v4-1742344578455-1165422644420	navigation	2025-03-19 00:36:19.83	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
402	FCP	6380	v4-1742344578440-6648630295519	navigation	2025-03-19 00:36:19.842	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
403	FCP	6380	v4-1742344578455-4167796376287	navigation	2025-03-19 00:36:19.994	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
404	TTFB	352	nav-timing	reload	2025-03-19 00:36:20.214	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
405	DNS	0	dns-timing	navigation	2025-03-19 00:39:35.539	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
406	DNS	0	dns-timing	navigation	2025-03-19 00:39:35.537	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
407	TTFB	5678	nav-timing	reload	2025-03-19 00:39:35.536	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
408	TTFB	5678	nav-timing	reload	2025-03-19 00:39:35.538	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
412	TTFB	6547	v4-1742344775200-2724961167082	navigation	2025-03-19 00:39:36.079	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
409	TCP	865	tcp-timing	navigation	2025-03-19 00:39:35.534	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
414	TTFB	6547	v4-1742344775217-9914498204320	navigation	2025-03-19 00:39:36.085	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
410	TCP	865	tcp-timing	navigation	2025-03-19 00:39:35.963	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
411	FCP	16216	v4-1742344775200-4608367056462	navigation	2025-03-19 00:39:36.07	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
413	FCP	16216	v4-1742344775217-3097507220195	navigation	2025-03-19 00:39:36.08	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
415	DNS	0	dns-timing	navigation	2025-03-19 00:41:13.247	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
416	TCP	767	tcp-timing	navigation	2025-03-19 00:41:13.248	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
417	TTFB	514	nav-timing	reload	2025-03-19 00:41:13.254	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
418	TTFB	514	nav-timing	reload	2025-03-19 00:41:13.261	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
419	DNS	0	dns-timing	navigation	2025-03-19 00:41:13.423	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
420	TCP	767	tcp-timing	navigation	2025-03-19 00:41:13.562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
421	ResourceTiming	8037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 00:41:13.773	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
422	FCP	14820	v4-1742344872878-6930548811593	navigation	2025-03-19 00:41:13.774	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
423	ResourceTiming	7878	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=V5W1E6GPv_IPNlnhe0bJ4	navigation	2025-03-19 00:41:13.782	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
424	FCP	14820	v4-1742344872889-1994233445334	navigation	2025-03-19 00:41:13.818	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
425	ResourceTiming	7618	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 00:41:13.965	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
426	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 00:41:14.059	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
427	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 00:41:14.394	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
428	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 00:41:14.399	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
429	ResourceTiming	1214	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=V5W1E6GPv_IPNlnhe0bJ4	navigation	2025-03-19 00:41:14.423	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
430	ResourceTiming	434	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=V5W1E6GPv_IPNlnhe0bJ4	navigation	2025-03-19 00:41:14.424	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
431	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 00:41:14.477	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
432	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 00:41:14.561	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
721	FCP	7809	v4-1742346376470-8414615300771	navigation	2025-03-19 01:06:17.475	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
433	ResourceTiming	1526	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=V5W1E6GPv_IPNlnhe0bJ4	navigation	2025-03-19 00:41:14.911	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
444	ResourceTiming	648	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 00:41:15.599	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
445	ResourceTiming	910	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 00:41:15.903	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
455	ResourceTiming	1613	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 00:41:16.548	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
457	ResourceTiming	1687	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 00:41:16.872	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
464	ResourceTiming	2321	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 00:41:17.431	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
467	ResourceTiming	2573	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 00:41:17.866	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
476	ResourceTiming	1599	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 00:41:18.479	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
479	ResourceTiming	1354	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 00:41:18.834	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
488	ResourceTiming	1623	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 00:41:19.476	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
490	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 00:41:19.881	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
434	ResourceTiming	655	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=V5W1E6GPv_IPNlnhe0bJ4	navigation	2025-03-19 00:41:14.912	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
443	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 00:41:15.492	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
446	ResourceTiming	973	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 00:41:15.907	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
456	ResourceTiming	1822	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 00:41:16.558	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
458	ResourceTiming	1862	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 00:41:16.873	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
462	ResourceTiming	2292	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 00:41:17.387	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
469	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 00:41:17.916	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
474	ResourceTiming	2096	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 00:41:18.394	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
481	ResourceTiming	1661	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 00:41:18.889	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
486	ResourceTiming	1511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 00:41:19.353	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
493	ResourceTiming	1344	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 00:41:19.909	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
498	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 00:41:20.37	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
505	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 00:41:20.924	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
509	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 00:41:21.343	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
515	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 00:41:21.84	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
521	ResourceTiming	746	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 00:41:22.322	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
435	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 00:41:14.913	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
442	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 00:41:15.439	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
447	ResourceTiming	754	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 00:41:15.934	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
454	ResourceTiming	2110	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 00:41:16.476	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
459	ResourceTiming	1884	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 00:41:16.931	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
463	ResourceTiming	2263	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 00:41:17.389	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
468	ResourceTiming	2704	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 00:41:17.897	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
475	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 00:41:18.409	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
480	ResourceTiming	1671	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 00:41:18.873	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
487	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 00:41:19.388	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
492	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 00:41:19.889	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
499	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 00:41:20.438	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
504	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 00:41:20.85	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
507	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 00:41:21.111	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
510	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 00:41:21.348	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
516	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 00:41:21.844	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
522	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 00:41:22.329	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
436	ResourceTiming	589	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=V5W1E6GPv_IPNlnhe0bJ4	navigation	2025-03-19 00:41:14.936	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
440	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 00:41:15.422	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
449	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 00:41:16.022	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
452	ResourceTiming	1405	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 00:41:16.391	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
465	ResourceTiming	2457	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 00:41:17.502	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
466	ResourceTiming	4409	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 00:41:17.851	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
477	ResourceTiming	1605	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 00:41:18.511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
478	ResourceTiming	1339	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 00:41:18.827	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
495	ResourceTiming	1658	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 00:41:20.061	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
496	ResourceTiming	1628	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 00:41:20.349	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
506	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 00:41:20.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
508	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 00:41:21.335	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
518	ResourceTiming	545	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 00:41:21.958	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
520	ResourceTiming	715	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 00:41:22.305	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
437	ResourceTiming	1610	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=V5W1E6GPv_IPNlnhe0bJ4	navigation	2025-03-19 00:41:14.997	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
441	ResourceTiming	515	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 00:41:15.439	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
448	ResourceTiming	1184	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 00:41:15.955	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
453	ResourceTiming	1425	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 00:41:16.426	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
460	ResourceTiming	2040	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 00:41:16.994	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
461	ResourceTiming	2125	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 00:41:17.37	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
471	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 00:41:17.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
473	ResourceTiming	2316	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 00:41:18.35	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
482	ResourceTiming	1386	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 00:41:18.987	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
485	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 00:41:19.318	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
489	ResourceTiming	1615	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 00:41:19.556	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
491	ResourceTiming	1335	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 00:41:19.885	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
500	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 00:41:20.484	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
503	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 00:41:20.849	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
511	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 00:41:21.427	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
513	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 00:41:21.673	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
517	ResourceTiming	836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 00:41:21.917	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
438	ResourceTiming	848	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 00:41:15.099	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
439	ResourceTiming	844	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 00:41:15.41	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
450	ResourceTiming	1067	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 00:41:16.078	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
451	ResourceTiming	1425	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 00:41:16.39	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
470	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 00:41:17.987	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
472	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 00:41:18.344	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
483	ResourceTiming	1783	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 00:41:19.037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
484	ResourceTiming	1741	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 00:41:19.297	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
494	ResourceTiming	1349	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 00:41:19.983	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
497	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 00:41:20.358	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
501	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 00:41:20.588	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
502	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 00:41:20.834	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
512	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 00:41:21.469	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
514	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 00:41:21.824	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
523	ResourceTiming	394	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 00:41:22.399	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
525	TTFB	1286	v4-1742344872889-9991345472624	navigation	2025-03-19 00:41:22.68	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
519	ResourceTiming	593	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 00:41:22.184	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
524	TTFB	1286	v4-1742344872878-1651093742103	navigation	2025-03-19 00:41:22.474	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
526	TTFB	4813	nav-timing	navigate	2025-03-19 00:42:49.633	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
527	DNS	0	dns-timing	navigation	2025-03-19 00:42:49.648	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
528	TTFB	4813	nav-timing	navigate	2025-03-19 00:42:49.655	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
529	TCP	0	tcp-timing	navigation	2025-03-19 00:42:49.657	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
530	DNS	0	dns-timing	navigation	2025-03-19 00:42:49.66	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
531	TCP	0	tcp-timing	navigation	2025-03-19 00:42:49.89	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
532	TTFB	4817	v4-1742344969475-6153778556450	navigation	2025-03-19 00:42:49.946	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
533	TTFB	4817	v4-1742344969489-9060804012076	navigation	2025-03-19 00:42:49.948	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
534	TTFB	4648	nav-timing	reload	2025-03-19 00:42:50.577	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
535	DNS	0	dns-timing	navigation	2025-03-19 00:42:50.575	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
536	TTFB	4648	nav-timing	reload	2025-03-19 00:42:50.578	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
537	DNS	0	dns-timing	navigation	2025-03-19 00:42:50.578	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
538	TCP	792	tcp-timing	navigation	2025-03-19 00:42:50.579	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
539	TCP	792	tcp-timing	navigation	2025-03-19 00:42:50.947	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
540	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 00:42:51.081	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
541	ResourceTiming	1528	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 00:42:51.082	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
542	ResourceTiming	1211	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=uXvUSk1d7eROnTMeNrQIk	navigation	2025-03-19 00:42:51.086	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
543	ResourceTiming	2235	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 00:42:51.092	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
544	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 00:42:51.37	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
722	TTFB	1155	v4-1742346376455-1088026528972	navigation	2025-03-19 01:06:17.478	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
545	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 00:42:51.473	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
546	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 00:42:51.694	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
550	ResourceTiming	664	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=uXvUSk1d7eROnTMeNrQIk	navigation	2025-03-19 00:42:51.922	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
552	ResourceTiming	735	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=uXvUSk1d7eROnTMeNrQIk	navigation	2025-03-19 00:42:52.188	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
559	ResourceTiming	764	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 00:42:52.699	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
562	ResourceTiming	940	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 00:42:52.968	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
566	ResourceTiming	1290	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 00:42:53.266	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
570	ResourceTiming	1610	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 00:42:53.665	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
577	ResourceTiming	2039	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 00:42:54.232	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
580	ResourceTiming	2249	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 00:42:54.646	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
590	ResourceTiming	1508	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 00:42:55.303	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
594	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 00:42:55.787	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
600	ResourceTiming	1877	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 00:42:56.306	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
606	ResourceTiming	1421	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 00:42:56.818	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
609	ResourceTiming	1446	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 00:42:57.04	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
610	ResourceTiming	1446	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 00:42:57.356	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
547	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 00:42:51.697	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
553	ResourceTiming	1046	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=uXvUSk1d7eROnTMeNrQIk	navigation	2025-03-19 00:42:52.196	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
557	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 00:42:52.669	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
567	ResourceTiming	1459	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 00:42:53.27	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
569	ResourceTiming	1629	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 00:42:53.662	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
583	ResourceTiming	2463	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 00:42:54.707	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
587	ResourceTiming	1805	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 00:42:55.276	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
591	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 00:42:55.511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
592	ResourceTiming	1468	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 00:42:55.749	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
602	ResourceTiming	1605	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 00:42:56.323	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
603	ResourceTiming	1452	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 00:42:56.544	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
605	ResourceTiming	1449	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 00:42:56.777	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
611	ResourceTiming	1433	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 00:42:57.384	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
620	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 00:42:57.956	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
623	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 00:42:58.381	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
636	ResourceTiming	474	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 00:42:59.413	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
641	TTFB	5445	v4-1742344970222-9465871992818	navigation	2025-03-19 00:42:59.904	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
548	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 00:42:51.703	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
554	ResourceTiming	1390	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=uXvUSk1d7eROnTMeNrQIk	navigation	2025-03-19 00:42:52.212	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
558	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 00:42:52.693	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
565	ResourceTiming	1183	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 00:42:53.215	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
568	ResourceTiming	1385	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 00:42:53.48	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
571	ResourceTiming	1836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 00:42:53.721	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
576	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 00:42:54.188	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
581	ResourceTiming	3048	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 00:42:54.667	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
588	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 00:42:55.298	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
595	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 00:42:55.79	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
601	ResourceTiming	1618	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 00:42:56.307	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
604	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 00:42:56.731	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
614	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 00:42:57.41	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
617	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 00:42:57.886	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
626	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 00:42:58.474	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
629	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 00:42:58.861	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
723	FCP	7809	v4-1742346376455-4492567463688	navigation	2025-03-19 01:06:17.496	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
549	ResourceTiming	622	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=uXvUSk1d7eROnTMeNrQIk	navigation	2025-03-19 00:42:51.738	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
551	ResourceTiming	1565	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=uXvUSk1d7eROnTMeNrQIk	navigation	2025-03-19 00:42:51.982	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
555	ResourceTiming	1092	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 00:42:52.253	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
556	ResourceTiming	841	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 00:42:52.484	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
560	ResourceTiming	858	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 00:42:52.706	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
564	ResourceTiming	1340	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 00:42:53.189	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
572	ResourceTiming	1815	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 00:42:53.78	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
574	ResourceTiming	2046	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 00:42:54.011	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
578	ResourceTiming	2249	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 00:42:54.257	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
579	ResourceTiming	2160	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 00:42:54.514	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
615	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 00:42:57.536	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
616	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 00:42:57.834	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
621	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 00:42:58.071	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
622	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 00:42:58.317	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
627	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 00:42:58.574	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
628	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 00:42:58.821	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
632	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 00:42:59.073	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
561	ResourceTiming	865	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 00:42:52.751	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
563	ResourceTiming	1180	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 00:42:53.168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
573	ResourceTiming	1728	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 00:42:53.836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
575	ResourceTiming	1868	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 00:42:54.171	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
582	ResourceTiming	2312	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 00:42:54.682	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
584	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 00:42:54.728	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
585	ResourceTiming	2237	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 00:42:55.024	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
586	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 00:42:55.268	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
589	ResourceTiming	1831	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 00:42:55.299	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
593	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 00:42:55.766	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
596	ResourceTiming	1443	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 00:42:55.81	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
597	ResourceTiming	1562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 00:42:56.008	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
598	ResourceTiming	1453	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 00:42:56.235	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
599	ResourceTiming	1754	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 00:42:56.29	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
607	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 00:42:56.836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
608	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 00:42:56.846	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
612	ResourceTiming	1321	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 00:42:57.389	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
724	TTFB	700	nav-timing	reload	2025-03-19 01:08:42.653	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
613	ResourceTiming	1598	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 00:42:57.393	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
618	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 00:42:57.905	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
624	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 00:42:58.402	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
630	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 00:42:58.884	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
633	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 00:42:59.269	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
638	ResourceTiming	610	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 00:42:59.606	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
640	TTFB	5445	v4-1742344970216-7258081285049	navigation	2025-03-19 00:42:59.871	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
619	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 00:42:57.906	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
625	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 00:42:58.401	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
631	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 00:42:58.884	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
635	ResourceTiming	560	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 00:42:59.403	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
642	FCP	12172	v4-1742344970216-2687028092592	navigation	2025-03-19 00:42:59.917	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
634	ResourceTiming	616	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 00:42:59.38	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
643	FCP	12172	v4-1742344970222-2570795598339	navigation	2025-03-19 00:42:59.937	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
637	ResourceTiming	813	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 00:42:59.419	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
639	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 00:42:59.81	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
644	DNS	1	dns-timing	navigation	2025-03-19 00:44:56.591	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
645	TTFB	521	nav-timing	reload	2025-03-19 00:44:56.597	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
646	DNS	1	dns-timing	navigation	2025-03-19 00:44:56.601	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
647	TTFB	521	nav-timing	reload	2025-03-19 00:44:56.605	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
648	TCP	730	tcp-timing	navigation	2025-03-19 00:44:56.607	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
649	TCP	730	tcp-timing	navigation	2025-03-19 00:44:57.021	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
650	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 00:44:57.092	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
651	ResourceTiming	5920	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 00:44:57.097	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
652	ResourceTiming	3464	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 00:44:57.098	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
653	ResourceTiming	5562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=FygT3daVma3gI7jH7IuFt	navigation	2025-03-19 00:44:57.099	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
654	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 00:44:57.123	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
655	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 00:44:57.521	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
656	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 00:44:57.563	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
657	ResourceTiming	1636	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=FygT3daVma3gI7jH7IuFt	navigation	2025-03-19 00:44:57.568	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
658	ResourceTiming	1226	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=FygT3daVma3gI7jH7IuFt	navigation	2025-03-19 00:44:57.587	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
659	ResourceTiming	433	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=FygT3daVma3gI7jH7IuFt	navigation	2025-03-19 00:44:57.59	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
660	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 00:45:01.657	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
661	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 00:45:01.664	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
662	ResourceTiming	1015	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 00:45:01.821	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
663	ResourceTiming	1067	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 00:45:01.86	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
664	ResourceTiming	1339	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 00:45:01.862	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
665	ResourceTiming	992	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 00:45:01.872	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
666	ResourceTiming	1022	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 00:45:02.226	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
667	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 00:45:05.517	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
668	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 00:45:05.52	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
669	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 00:45:05.518	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
670	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 00:45:05.522	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
672	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 00:45:09.883	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
673	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 00:45:09.887	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
674	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 00:45:10.006	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
675	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 00:45:10.257	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
676	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 00:45:11.026	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
677	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 00:45:14.706	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
726	TCP	844	tcp-timing	navigation	2025-03-19 01:08:42.68	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
671	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 00:45:09.885	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
686	ResourceTiming	546	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 00:45:15.706	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
694	TTFB	454	nav-timing	navigate	2025-03-19 00:45:16.823	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
703	FCP	14369	v4-1742345115576-3067105205038	navigation	2025-03-19 00:45:17.498	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
678	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 00:45:14.953	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
680	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 00:45:15.196	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
681	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 00:45:15.459	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
685	ResourceTiming	505	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 00:45:15.694	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
687	ResourceTiming	462	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 00:45:15.985	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
690	TTFB	1262	v4-1742345096310-4249632535481	navigation	2025-03-19 00:45:16.323	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
697	TTFB	454	nav-timing	navigate	2025-03-19 00:45:17.002	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
699	TCP	0	tcp-timing	navigation	2025-03-19 00:45:17.303	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
679	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 00:45:15.009	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
682	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 00:45:15.507	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
695	DNS	0	dns-timing	navigation	2025-03-19 00:45:16.834	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
698	DNS	0	dns-timing	navigation	2025-03-19 00:45:17.107	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
701	TTFB	1126	v4-1742345115576-4090329427001	navigation	2025-03-19 00:45:17.359	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
683	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 00:45:15.549	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
689	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 00:45:16.12	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
692	FCP	12877	v4-1742345096310-3829080103159	navigation	2025-03-19 00:45:16.429	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
702	FCP	14369	v4-1742345115562-6870736261262	navigation	2025-03-19 00:45:17.447	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
684	ResourceTiming	714	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 00:45:15.639	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
688	ResourceTiming	486	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 00:45:16.02	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
691	TTFB	1262	v4-1742345096319-5423215946102	navigation	2025-03-19 00:45:16.325	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
693	FCP	12877	v4-1742345096319-6465735554809	navigation	2025-03-19 00:45:16.605	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
696	TCP	0	tcp-timing	navigation	2025-03-19 00:45:16.94	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
700	TTFB	1126	v4-1742345115562-8143563261969	navigation	2025-03-19 00:45:17.316	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
705	TTFB	1145	nav-timing	navigate	2025-03-19 00:52:38.043	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
706	DNS	1	dns-timing	navigation	2025-03-19 00:52:38.03	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
704	TTFB	1145	nav-timing	navigate	2025-03-19 00:52:38.041	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
707	TCP	730	tcp-timing	navigation	2025-03-19 00:52:38.165	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
708	DNS	1	dns-timing	navigation	2025-03-19 00:52:39.069	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
709	TCP	730	tcp-timing	navigation	2025-03-19 00:52:39.11	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
710	TTFB	280283	v4-1742345557740-8104419775476	navigation	2025-03-19 00:52:39.171	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
711	FCP	288168	v4-1742345557755-5279382757623	navigation	2025-03-19 00:52:39.2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
712	TTFB	280283	v4-1742345557755-3939688934773	navigation	2025-03-19 00:52:39.201	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
713	FCP	288168	v4-1742345557740-2098602554794	navigation	2025-03-19 00:52:39.216	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
714	DNS	0	dns-timing	navigation	2025-03-19 01:06:16.923	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
715	DNS	0	dns-timing	navigation	2025-03-19 01:06:16.934	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
716	TCP	713	tcp-timing	navigation	2025-03-19 01:06:16.97	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
717	TTFB	438	nav-timing	reload	2025-03-19 01:06:16.977	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
718	TTFB	438	nav-timing	reload	2025-03-19 01:06:16.978	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
719	TCP	713	tcp-timing	navigation	2025-03-19 01:06:17.302	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
720	TTFB	1155	v4-1742346376470-9693008548141	navigation	2025-03-19 01:06:17.468	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
725	TTFB	700	nav-timing	reload	2025-03-19 01:08:42.675	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
731	FCP	7813	v4-1742346522380-8995443443559	navigation	2025-03-19 01:08:43.244	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
727	DNS	1	dns-timing	navigation	2025-03-19 01:08:42.683	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
728	DNS	1	dns-timing	navigation	2025-03-19 01:08:42.818	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
729	TCP	844	tcp-timing	navigation	2025-03-19 01:08:43.07	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
730	TTFB	1551	v4-1742346522380-7865234597873	navigation	2025-03-19 01:08:43.203	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
732	TTFB	1551	v4-1742346522399-9439086023463	navigation	2025-03-19 01:08:43.248	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
733	FCP	7813	v4-1742346522399-4380890520107	navigation	2025-03-19 01:08:43.253	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
735	DNS	0	dns-timing	navigation	2025-03-19 01:16:13.673	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
734	TTFB	3461	nav-timing	navigate	2025-03-19 01:16:13.654	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
736	TTFB	3461	nav-timing	navigate	2025-03-19 01:16:13.681	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
737	TCP	684	tcp-timing	navigation	2025-03-19 01:16:13.712	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
738	DNS	0	dns-timing	navigation	2025-03-19 01:16:13.954	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
739	TCP	684	tcp-timing	navigation	2025-03-19 01:16:14.081	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
740	FCP	14564	v4-1742346973174-4498407116818	navigation	2025-03-19 01:16:14.282	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
741	FCP	14564	v4-1742346973191-7335452822263	navigation	2025-03-19 01:16:14.281	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
742	TTFB	4152	v4-1742346973174-8077803226383	navigation	2025-03-19 01:16:14.483	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
743	TTFB	4152	v4-1742346973191-7503178769945	navigation	2025-03-19 01:16:14.673	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
744	TTFB	1731	nav-timing	navigate	2025-03-19 04:59:25.612	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
745	TCP	1124	tcp-timing	navigation	2025-03-19 04:59:25.659	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
746	TTFB	1731	nav-timing	navigate	2025-03-19 04:59:25.66	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
747	DNS	287	dns-timing	navigation	2025-03-19 04:59:25.667	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
748	DNS	287	dns-timing	navigation	2025-03-19 04:59:25.67	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
749	TCP	1124	tcp-timing	navigation	2025-03-19 04:59:25.999	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
750	FCP	7863	v4-1742360365283-6118540483166	navigation	2025-03-19 04:59:26.106	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
751	FCP	7863	v4-1742360365302-5562040609430	navigation	2025-03-19 04:59:26.129	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
752	ResourceTiming	1032	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/injected.js	navigation	2025-03-19 05:00:23.522	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
753	ResourceTiming	770	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=9M-nvvQDqqsCPGx1xn4oX	navigation	2025-03-19 05:00:23.524	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
754	ResourceTiming	2348	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/eruda/3.2.3/eruda.js	navigation	2025-03-19 05:00:23.528	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
755	ResourceTiming	1612	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:00:23.549	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
756	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:00:23.552	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
757	ResourceTiming	4370	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:00:23.554	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
758	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:00:23.831	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
759	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:00:23.872	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
760	ResourceTiming	1823	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=9M-nvvQDqqsCPGx1xn4oX	navigation	2025-03-19 05:00:23.896	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
761	ResourceTiming	2089	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=9M-nvvQDqqsCPGx1xn4oX	navigation	2025-03-19 05:00:23.914	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
762	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:00:24.061	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
763	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:00:24.07	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
764	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:00:24.206	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
771	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 05:00:24.649	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
772	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 05:00:24.798	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
775	ResourceTiming	261	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 05:00:24.843	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
778	ResourceTiming	332	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:00:25.122	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
780	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 05:00:25.148	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
781	ResourceTiming	529	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:00:25.161	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
783	ResourceTiming	615	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:00:25.377	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
785	ResourceTiming	615	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 05:00:25.459	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
765	ResourceTiming	2187	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=9M-nvvQDqqsCPGx1xn4oX	navigation	2025-03-19 05:00:24.237	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
773	ResourceTiming	272	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:00:24.804	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
779	ResourceTiming	533	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:00:25.135	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
788	ResourceTiming	888	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:00:25.684	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
793	ResourceTiming	1092	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:00:25.838	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
801	ResourceTiming	982	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:00:26.373	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
808	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:00:26.855	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
814	ResourceTiming	914	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:00:27.153	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
815	ResourceTiming	888	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:00:27.208	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
818	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:00:27.331	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
821	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:00:27.494	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
822	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:00:27.562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
825	ResourceTiming	1059	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:00:27.689	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
826	ResourceTiming	1059	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:00:27.806	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
827	ResourceTiming	882	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:00:27.852	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
839	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:00:28.617	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
766	ResourceTiming	1899	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=9M-nvvQDqqsCPGx1xn4oX	navigation	2025-03-19 05:00:24.403	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
769	ResourceTiming	2138	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:00:24.486	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
770	ResourceTiming	244	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:00:24.603	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
774	ResourceTiming	293	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 05:00:24.838	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
776	ResourceTiming	335	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:00:24.934	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
790	ResourceTiming	849	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:00:25.755	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
792	ResourceTiming	1076	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:00:25.836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
795	ResourceTiming	1155	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:00:26.044	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
800	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:00:26.363	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
804	ResourceTiming	950	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:00:26.573	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
805	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:00:26.657	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
807	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 05:00:26.713	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
811	ResourceTiming	877	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:00:26.981	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
828	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 05:00:27.888	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
845	TCP	793	tcp-timing	navigation	2025-03-19 05:00:28.688	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
847	DNS	1	dns-timing	navigation	2025-03-19 05:00:28.923	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
853	ResourceTiming	281	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:00:29.014	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
864	TTFB	3644	v4-1742360428217-5471558260599	navigation	2025-03-19 05:00:29.48	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
767	ResourceTiming	1861	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=9M-nvvQDqqsCPGx1xn4oX	navigation	2025-03-19 05:00:24.407	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
768	ResourceTiming	2110	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=9M-nvvQDqqsCPGx1xn4oX	navigation	2025-03-19 05:00:24.469	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
777	ResourceTiming	344	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 05:00:24.954	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
782	ResourceTiming	616	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:00:25.374	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
784	ResourceTiming	581	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:00:25.439	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
786	ResourceTiming	790	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:00:25.46	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
797	ResourceTiming	1161	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:00:26.25	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
803	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:00:26.549	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
806	ResourceTiming	867	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:00:26.691	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
810	ResourceTiming	696	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:00:26.896	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
812	ResourceTiming	982	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:00:26.996	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
830	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:00:28.016	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
833	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:00:28.171	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
835	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:00:28.215	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
836	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:00:28.324	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
838	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:00:28.61	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
841	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:00:28.627	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
787	ResourceTiming	784	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:00:25.476	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
798	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:00:26.272	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
809	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 05:00:26.894	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
813	ResourceTiming	976	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:00:27.015	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
816	ResourceTiming	928	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:00:27.247	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
817	ResourceTiming	1047	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:00:27.296	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
819	ResourceTiming	892	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:00:27.364	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
820	ResourceTiming	884	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:00:27.472	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
823	ResourceTiming	878	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:00:27.594	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
824	ResourceTiming	856	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:00:27.676	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
831	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 05:00:28.027	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
832	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:00:28.137	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
834	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:00:28.199	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
837	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:00:28.339	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
846	DNS	1	dns-timing	navigation	2025-03-19 05:00:28.732	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
852	TCP	793	tcp-timing	navigation	2025-03-19 05:00:28.982	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
859	TTFB	2845	nav-timing	reload	2025-03-19 05:00:29.289	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
867	TTFB	3644	v4-1742360428231-9638277615350	navigation	2025-03-19 05:00:29.604	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
789	ResourceTiming	888	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:00:25.715	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
791	ResourceTiming	1067	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:00:25.797	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
794	ResourceTiming	886	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:00:26.033	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
796	ResourceTiming	1147	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:00:26.078	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
799	ResourceTiming	1303	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:00:26.286	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
802	ResourceTiming	1119	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 05:00:26.537	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
829	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 05:00:27.89	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
844	TTFB	2845	nav-timing	reload	2025-03-19 05:00:28.681	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
848	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:00:28.931	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
851	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:00:28.977	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
857	ResourceTiming	264	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:00:29.248	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
860	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:00:29.317	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
840	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:00:28.62	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
842	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:00:28.632	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
850	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:00:28.97	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
854	ResourceTiming	308	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:00:29.041	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
856	FCP	12329	v4-1742360428217-8544553503382	navigation	2025-03-19 05:00:29.242	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
861	ResourceTiming	318	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:00:29.337	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
863	ResourceTiming	304	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:00:29.475	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
865	ResourceTiming	365	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/BuyMeCoffeeButton.tsx	navigation	2025-03-19 05:00:29.531	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
843	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:00:28.655	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
849	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:00:28.941	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
855	ResourceTiming	318	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:00:29.233	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
858	ResourceTiming	287	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:00:29.282	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
862	FCP	12329	v4-1742360428231-8177550995802	navigation	2025-03-19 05:00:29.451	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
866	ResourceTiming	381	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/transitions/FadeInSection.tsx	navigation	2025-03-19 05:00:29.555	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
868	TCP	759	tcp-timing	navigation	2025-03-19 05:01:11.344	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
869	DNS	0	dns-timing	navigation	2025-03-19 05:01:11.383	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
870	TCP	759	tcp-timing	navigation	2025-03-19 05:01:11.455	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
871	TTFB	1503	nav-timing	navigate	2025-03-19 05:01:11.477	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
872	DNS	0	dns-timing	navigation	2025-03-19 05:01:11.505	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
873	TTFB	1503	nav-timing	navigate	2025-03-19 05:01:11.511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
874	TTFB	2312	v4-1742360470909-6260571899277	navigation	2025-03-19 05:01:11.86	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
875	TTFB	2312	v4-1742360470938-3195835261232	navigation	2025-03-19 05:01:11.917	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
876	FCP	12966	v4-1742360470909-4247902852197	navigation	2025-03-19 05:01:12.041	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
877	FCP	12966	v4-1742360470938-2261610240850	navigation	2025-03-19 05:01:12.064	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
878	TCP	1922	tcp-timing	navigation	2025-03-19 05:02:14.546	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
879	TTFB	660	nav-timing	reload	2025-03-19 05:02:14.552	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
880	DNS	1	dns-timing	navigation	2025-03-19 05:02:14.555	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
881	TTFB	660	nav-timing	reload	2025-03-19 05:02:14.57	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
882	DNS	1	dns-timing	navigation	2025-03-19 05:02:14.877	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
883	TCP	1922	tcp-timing	navigation	2025-03-19 05:02:14.942	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
884	TTFB	2587	v4-1742360534253-8151592401404	navigation	2025-03-19 05:02:15.034	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
885	TTFB	2587	v4-1742360534271-9407427733854	navigation	2025-03-19 05:02:15.062	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
886	FCP	10350	v4-1742360534253-8715096768421	navigation	2025-03-19 05:02:15.342	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
887	FCP	10350	v4-1742360534271-2319497291673	navigation	2025-03-19 05:02:15.429	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
888	TTFB	3941	nav-timing	reload	2025-03-19 05:03:18.448	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
889	DNS	0	dns-timing	navigation	2025-03-19 05:03:18.466	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
890	TCP	771	tcp-timing	navigation	2025-03-19 05:03:18.47	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
891	DNS	0	dns-timing	navigation	2025-03-19 05:03:18.838	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
892	TCP	771	tcp-timing	navigation	2025-03-19 05:03:18.84	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
893	ResourceTiming	2213	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=qXNs1vh4xhaOknqFMlb09	navigation	2025-03-19 05:03:18.963	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
894	TTFB	3941	nav-timing	reload	2025-03-19 05:03:19.25	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
895	ResourceTiming	3784	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:03:19.317	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
896	ResourceTiming	1848	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:03:19.378	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
897	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:03:19.389	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
898	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:03:19.482	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
899	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:03:19.723	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
900	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:03:19.808	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
901	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:03:19.852	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
902	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:03:19.885	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
903	ResourceTiming	586	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=qXNs1vh4xhaOknqFMlb09	navigation	2025-03-19 05:03:19.977	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
904	ResourceTiming	814	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=qXNs1vh4xhaOknqFMlb09	navigation	2025-03-19 05:03:20.24	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
914	ResourceTiming	609	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 05:03:20.845	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
916	ResourceTiming	1181	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:03:21.204	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
920	ResourceTiming	1419	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:03:21.497	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
923	ResourceTiming	1819	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:03:21.789	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
926	ResourceTiming	2216	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:03:22.217	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
936	ResourceTiming	2825	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:03:22.753	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
937	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:03:23.159	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
948	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 05:03:23.728	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
950	ResourceTiming	1774	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:03:24.152	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
959	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:03:24.661	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
962	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:03:25.112	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
967	ResourceTiming	3016	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:03:25.581	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
972	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:03:26.045	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
978	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:03:26.511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
982	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:03:26.969	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
984	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:03:27.438	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
905	ResourceTiming	1411	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=qXNs1vh4xhaOknqFMlb09	navigation	2025-03-19 05:03:20.252	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
909	ResourceTiming	1243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:03:20.494	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
910	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 05:03:20.727	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
915	ResourceTiming	981	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 05:03:20.998	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
917	ResourceTiming	1008	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 05:03:21.29	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
924	ResourceTiming	1980	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:03:21.798	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
927	ResourceTiming	1819	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 05:03:22.216	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
934	ResourceTiming	2641	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:03:22.722	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
939	ResourceTiming	2338	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:03:23.195	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
946	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 05:03:23.692	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
953	ResourceTiming	1709	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:03:24.164	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
956	ResourceTiming	1979	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:03:24.65	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
964	ResourceTiming	2791	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:03:25.125	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
965	ResourceTiming	2781	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:03:25.492	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
974	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:03:26.057	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
976	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:03:26.501	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
983	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:03:26.992	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
994	TTFB	4715	v4-1742360598135-7481622047835	navigation	2025-03-19 05:03:28.363	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
906	ResourceTiming	3916	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?t=1742360587431&v=qXNs1vh4xhaOknqFMlb09	navigation	2025-03-19 05:03:20.29	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
913	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 05:03:20.819	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
919	ResourceTiming	1396	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:03:21.301	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
922	ResourceTiming	1406	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:03:21.786	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
925	ResourceTiming	1814	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:03:22.209	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
935	ResourceTiming	2671	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:03:22.748	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
938	ResourceTiming	2893	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:03:23.168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
947	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:03:23.711	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
949	ResourceTiming	2102	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:03:24.152	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
960	ResourceTiming	3458	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:03:24.733	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
961	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:03:25.102	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
968	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 05:03:25.584	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
971	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:03:26.039	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
977	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:03:26.51	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
980	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:03:26.964	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
986	ResourceTiming	1995	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:03:27.448	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
991	ResourceTiming	875	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:03:27.909	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
907	ResourceTiming	1008	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=qXNs1vh4xhaOknqFMlb09	navigation	2025-03-19 05:03:20.319	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
912	ResourceTiming	987	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:03:20.816	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
918	ResourceTiming	1168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:03:21.297	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
921	ResourceTiming	1774	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:03:21.681	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
928	ResourceTiming	2248	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:03:22.254	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
933	ResourceTiming	3227	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:03:22.714	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
941	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:03:23.236	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
945	ResourceTiming	2102	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:03:23.648	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
952	ResourceTiming	1849	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:03:24.163	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
958	ResourceTiming	3039	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:03:24.658	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
963	ResourceTiming	2735	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:03:25.121	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
966	ResourceTiming	2739	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:03:25.573	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
973	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:03:26.056	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
975	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:03:26.499	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
988	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:03:27.458	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
990	ResourceTiming	414	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:03:27.9	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
997	TTFB	4715	v4-1742360598141-2955320527114	navigation	2025-03-19 05:03:28.402	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
908	ResourceTiming	1389	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=qXNs1vh4xhaOknqFMlb09	navigation	2025-03-19 05:03:20.367	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
911	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 05:03:20.788	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
929	ResourceTiming	2393	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:03:22.28	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
930	ResourceTiming	2243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:03:22.278	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
931	ResourceTiming	2253	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:03:22.674	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
932	ResourceTiming	2666	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:03:22.693	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
940	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:03:23.234	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
942	ResourceTiming	2249	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 05:03:23.243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
943	ResourceTiming	2148	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:03:23.632	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
944	ResourceTiming	2075	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:03:23.647	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
951	ResourceTiming	2010	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:03:24.16	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
954	ResourceTiming	2129	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:03:24.243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
955	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:03:24.642	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
957	ResourceTiming	1723	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:03:24.652	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
969	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 05:03:25.59	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
970	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 05:03:26.002	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
979	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:03:26.521	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
999	FCP	15432	v4-1742360598141-9688860179061	navigation	2025-03-19 05:03:28.563	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
981	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:03:26.964	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
987	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:03:27.451	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
989	ResourceTiming	430	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:03:27.898	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
998	FCP	15432	v4-1742360598135-3078117605981	navigation	2025-03-19 05:03:28.495	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
985	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:03:27.44	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
992	ResourceTiming	408	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:03:27.918	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
996	ResourceTiming	440	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:03:28.373	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
993	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:03:27.964	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
995	ResourceTiming	422	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:03:28.368	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1000	DNS	0	dns-timing	navigation	2025-03-19 05:04:33.194	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1001	TCP	723	tcp-timing	navigation	2025-03-19 05:04:33.196	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1002	TTFB	3231	nav-timing	reload	2025-03-19 05:04:33.2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1003	DNS	0	dns-timing	navigation	2025-03-19 05:04:33.34	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1004	TTFB	3231	nav-timing	reload	2025-03-19 05:04:33.35	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1005	TCP	723	tcp-timing	navigation	2025-03-19 05:04:33.555	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1006	TTFB	3956	v4-1742360672929-6576490289308	navigation	2025-03-19 05:04:33.65	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1007	TTFB	3956	v4-1742360672912-1785565962531	navigation	2025-03-19 05:04:33.66	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1008	FCP	10899	v4-1742360672912-5599417661944	navigation	2025-03-19 05:04:33.729	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1009	FCP	10899	v4-1742360672929-2345642298575	navigation	2025-03-19 05:04:33.804	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1010	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:05:23.332	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1011	ResourceTiming	1427	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/eruda/3.2.3/eruda.js	navigation	2025-03-19 05:05:23.316	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1012	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/injected.js	navigation	2025-03-19 05:05:23.319	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1013	ResourceTiming	2423	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=ZNRqhI5qATEB0jiOJIhOb	navigation	2025-03-19 05:05:23.323	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1014	ResourceTiming	932	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:05:23.326	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1015	ResourceTiming	2895	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:05:23.329	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1016	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:05:23.625	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1017	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:05:23.726	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1018	ResourceTiming	562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:05:23.734	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1019	ResourceTiming	249	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=ZNRqhI5qATEB0jiOJIhOb	navigation	2025-03-19 05:05:23.74	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1020	ResourceTiming	501	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=ZNRqhI5qATEB0jiOJIhOb	navigation	2025-03-19 05:05:23.75	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1022	ResourceTiming	483	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=ZNRqhI5qATEB0jiOJIhOb	navigation	2025-03-19 05:05:23.928	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1025	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:05:24.023	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1030	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 05:05:24.3	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1033	ResourceTiming	252	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:05:24.337	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1035	ResourceTiming	503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:05:24.591	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1037	ResourceTiming	691	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 05:05:24.601	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1044	ResourceTiming	969	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:05:24.917	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1045	ResourceTiming	979	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 05:05:24.922	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1046	ResourceTiming	1008	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:05:25.104	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1047	ResourceTiming	1009	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:05:25.167	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1049	ResourceTiming	1221	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:05:25.179	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1050	ResourceTiming	1215	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:05:25.197	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1053	ResourceTiming	1441	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:05:25.459	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1055	ResourceTiming	1467	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:05:25.461	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1056	ResourceTiming	1511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:05:25.488	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1021	ResourceTiming	1330	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=ZNRqhI5qATEB0jiOJIhOb	navigation	2025-03-19 05:05:23.758	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1029	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 05:05:24.295	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1039	ResourceTiming	742	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:05:24.631	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1042	ResourceTiming	981	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:05:24.887	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1071	DNS	0	dns-timing	navigation	2025-03-19 05:05:26.169	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1074	ResourceTiming	894	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:05:26.326	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1083	ResourceTiming	641	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:05:26.637	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1089	ResourceTiming	697	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:05:26.913	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1096	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:05:27.195	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1103	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:05:27.506	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1107	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:05:27.786	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1115	ResourceTiming	413	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:05:28.081	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1117	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:05:28.184	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1118	ResourceTiming	450	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:05:28.351	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1023	ResourceTiming	1019	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=ZNRqhI5qATEB0jiOJIhOb	navigation	2025-03-19 05:05:24.014	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1068	ResourceTiming	690	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:05:26.069	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1078	ResourceTiming	926	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:05:26.359	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1081	ResourceTiming	651	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:05:26.612	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1091	ResourceTiming	643	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:05:26.935	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1093	ResourceTiming	469	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:05:26.981	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1094	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:05:27.192	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1024	ResourceTiming	1032	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=ZNRqhI5qATEB0jiOJIhOb	navigation	2025-03-19 05:05:24.017	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1070	TCP	759	tcp-timing	navigation	2025-03-19 05:05:26.165	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1075	ResourceTiming	730	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:05:26.332	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1080	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:05:26.61	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1026	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:05:24.045	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1032	ResourceTiming	247	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:05:24.329	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1034	ResourceTiming	485	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 05:05:24.517	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1036	ResourceTiming	482	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 05:05:24.6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1048	ResourceTiming	1195	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:05:25.169	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1067	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:05:26.041	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1084	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 05:05:26.64	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1085	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 05:05:26.694	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1087	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 05:05:26.906	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1098	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:05:27.235	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1099	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:05:27.302	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1100	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:05:27.487	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1109	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:05:27.797	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1111	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:05:27.878	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1112	ResourceTiming	264	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:05:28.062	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1120	ResourceTiming	234	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/transitions/FadeInSection.tsx	navigation	2025-03-19 05:05:28.373	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1027	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:05:24.046	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1031	ResourceTiming	241	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:05:24.303	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1040	ResourceTiming	728	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:05:24.806	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1041	ResourceTiming	740	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:05:24.88	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1072	TTFB	3052	nav-timing	navigate	2025-03-19 05:05:26.173	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1073	ResourceTiming	709	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:05:26.324	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1082	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:05:26.624	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1090	ResourceTiming	657	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:05:26.93	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1095	ResourceTiming	707	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:05:27.193	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1028	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:05:24.225	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1038	ResourceTiming	720	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:05:24.629	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1043	ResourceTiming	951	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:05:24.889	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1051	ResourceTiming	1243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:05:25.205	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1052	ResourceTiming	1255	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:05:25.409	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1054	ResourceTiming	1247	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:05:25.458	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1061	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:05:25.755	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1064	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:05:26.033	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1057	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 05:05:25.503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1058	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 05:05:25.712	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1062	ResourceTiming	1246	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 05:05:25.785	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1065	ResourceTiming	746	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:05:26.038	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1059	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 05:05:25.747	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1066	ResourceTiming	923	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:05:26.039	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1069	ResourceTiming	714	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:05:26.088	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1076	ResourceTiming	725	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:05:26.34	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1079	ResourceTiming	743	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:05:26.388	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1086	TCP	759	tcp-timing	navigation	2025-03-19 05:05:26.706	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1092	TTFB	3052	nav-timing	navigate	2025-03-19 05:05:26.951	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1102	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:05:27.497	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1108	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:05:27.796	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1110	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:05:27.847	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1113	ResourceTiming	250	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:05:28.078	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1121	ResourceTiming	242	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/BuyMeCoffeeButton.tsx	navigation	2025-03-19 05:05:28.371	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1060	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:05:25.754	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1063	ResourceTiming	1232	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:05:25.802	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1077	DNS	0	dns-timing	navigation	2025-03-19 05:05:26.355	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1088	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:05:26.908	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1097	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:05:27.218	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1101	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:05:27.491	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1104	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:05:27.536	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1105	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:05:27.59	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1106	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:05:27.778	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1114	ResourceTiming	249	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:05:28.083	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1116	ResourceTiming	280	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:05:28.145	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1119	ResourceTiming	263	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:05:28.369	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1122	TCP	2747	tcp-timing	navigation	2025-03-19 05:06:52.907	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1123	DNS	0	dns-timing	navigation	2025-03-19 05:06:52.909	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1124	TTFB	623	nav-timing	reload	2025-03-19 05:06:52.911	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1125	TTFB	623	nav-timing	reload	2025-03-19 05:06:53.068	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1126	DNS	0	dns-timing	navigation	2025-03-19 05:06:53.288	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1127	TCP	2747	tcp-timing	navigation	2025-03-19 05:06:53.333	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1128	TTFB	3376	v4-1742360812625-4318249284675	navigation	2025-03-19 05:06:53.403	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1129	TTFB	3376	v4-1742360812646-6972389364120	navigation	2025-03-19 05:06:53.748	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1130	FCP	13043	v4-1742360812646-3763733011270	navigation	2025-03-19 05:06:53.794	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1131	FCP	13043	v4-1742360812625-5675219112235	navigation	2025-03-19 05:06:53.795	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1134	TTFB	1186	nav-timing	reload	2025-03-19 05:16:21.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1133	DNS	0	dns-timing	navigation	2025-03-19 05:16:22.002	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1132	TCP	1105	tcp-timing	navigation	2025-03-19 05:16:21.997	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1136	TTFB	1186	nav-timing	reload	2025-03-19 05:16:21.998	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1135	DNS	0	dns-timing	navigation	2025-03-19 05:16:22.009	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1137	TCP	1105	tcp-timing	navigation	2025-03-19 05:16:22.405	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1138	ResourceTiming	3426	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:16:22.527	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1139	ResourceTiming	1221	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=le8-BCMn0gt68I0eFDRcw	navigation	2025-03-19 05:16:22.529	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1140	ResourceTiming	2504	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:16:22.531	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1141	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:16:22.557	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1142	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:16:22.798	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1143	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:16:22.926	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1144	ResourceTiming	902	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=le8-BCMn0gt68I0eFDRcw	navigation	2025-03-19 05:16:23.013	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1145	ResourceTiming	673	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=le8-BCMn0gt68I0eFDRcw	navigation	2025-03-19 05:16:23.021	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1146	ResourceTiming	1101	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=le8-BCMn0gt68I0eFDRcw	navigation	2025-03-19 05:16:23.037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1147	ResourceTiming	1433	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=le8-BCMn0gt68I0eFDRcw	navigation	2025-03-19 05:16:23.053	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1148	ResourceTiming	1781	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=le8-BCMn0gt68I0eFDRcw	navigation	2025-03-19 05:16:23.345	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1149	ResourceTiming	1965	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=le8-BCMn0gt68I0eFDRcw	navigation	2025-03-19 05:16:23.428	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1150	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:16:23.509	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1157	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 05:16:23.996	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1162	ResourceTiming	1532	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:16:24.47	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1169	ResourceTiming	2137	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:16:25.061	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1174	ResourceTiming	2803	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:16:25.53	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1179	ResourceTiming	2858	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:16:26.03	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1184	ResourceTiming	2119	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 05:16:26.371	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1190	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:16:26.966	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1195	ResourceTiming	1545	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:16:27.47	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1199	ResourceTiming	1964	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:16:27.769	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1225	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:16:30.142	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1228	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:16:30.479	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1231	ResourceTiming	709	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:16:30.704	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1232	ResourceTiming	726	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:16:30.95	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1236	ResourceTiming	558	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:16:31.179	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1237	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:16:31.425	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1241	FCP	10285	v4-1742361381688-5513371580126	navigation	2025-03-19 05:16:31.631	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1151	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:16:23.513	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1156	ResourceTiming	1025	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:16:23.994	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1163	ResourceTiming	1938	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:16:24.471	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1168	ResourceTiming	2024	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:16:24.996	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1175	ResourceTiming	2822	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:16:25.574	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1178	ResourceTiming	2853	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:16:25.915	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1185	ResourceTiming	2717	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:16:26.518	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1188	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:16:26.855	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1201	ResourceTiming	1831	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:16:27.958	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1205	ResourceTiming	2037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:16:28.262	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1207	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 05:16:28.472	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1211	ResourceTiming	1312	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:16:28.805	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1214	ResourceTiming	1387	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:16:29.066	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1218	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:16:29.433	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1221	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:16:29.722	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1222	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:16:29.964	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1230	ResourceTiming	767	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:16:30.625	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1152	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:16:23.607	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1155	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 05:16:23.936	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1164	ResourceTiming	1671	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:16:24.568	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1166	ResourceTiming	1938	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:16:24.944	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1171	ResourceTiming	2376	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 05:16:25.215	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1172	ResourceTiming	2442	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:16:25.424	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1180	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:16:26.036	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1183	ResourceTiming	2196	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:16:26.375	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1189	ResourceTiming	1531	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:16:26.889	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1196	ResourceTiming	1881	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:16:27.473	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1198	ResourceTiming	1925	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:16:27.746	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1153	ResourceTiming	1511	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:16:23.618	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1154	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 05:16:23.925	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1165	ResourceTiming	1698	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:16:24.59	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1167	ResourceTiming	2105	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:16:24.946	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1176	ResourceTiming	2534	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:16:25.575	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1177	ResourceTiming	2539	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:16:25.907	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1186	ResourceTiming	1764	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:16:26.521	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1187	ResourceTiming	2251	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:16:26.804	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1158	ResourceTiming	1182	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 05:16:24.091	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1159	ResourceTiming	1263	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:16:24.112	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1160	ResourceTiming	1608	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 05:16:24.446	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1161	ResourceTiming	2037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 05:16:24.46	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1170	ResourceTiming	2376	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:16:25.073	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1173	ResourceTiming	2458	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:16:25.456	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1181	ResourceTiming	3146	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:16:26.041	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1182	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:16:26.365	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1191	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 05:16:26.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1192	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:16:27.007	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1193	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 05:16:27.31	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1194	ResourceTiming	1466	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:16:27.375	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1197	ResourceTiming	1589	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:16:27.57	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1200	ResourceTiming	1677	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:16:27.855	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1202	ResourceTiming	1766	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:16:27.961	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1203	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:16:28.098	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1204	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:16:28.233	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1206	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 05:16:28.319	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1209	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:16:28.625	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1212	ResourceTiming	1497	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:16:28.955	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1216	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:16:29.26	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1219	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:16:29.606	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1224	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:16:30.128	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1229	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:16:30.602	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1234	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:16:31.071	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1239	TTFB	2314	v4-1742361381688-4622084482638	navigation	2025-03-19 05:16:31.57	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1208	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 05:16:28.478	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1210	ResourceTiming	1339	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:16:28.714	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1213	ResourceTiming	1645	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:16:28.959	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1215	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:16:29.189	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1217	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:16:29.435	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1220	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:16:29.668	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1223	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:16:29.971	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1226	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:16:30.236	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1227	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:16:30.456	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1235	ResourceTiming	435	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:16:31.119	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1238	ResourceTiming	421	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:16:31.519	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1233	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:16:31.05	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1240	TTFB	2314	v4-1742361381695-3694276810014	navigation	2025-03-19 05:16:31.629	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1242	FCP	10285	v4-1742361381695-9557060439630	navigation	2025-03-19 05:16:31.892	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1243	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:19:47.565	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1244	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/injected.js	navigation	2025-03-19 05:19:47.568	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1245	ResourceTiming	1385	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/eruda/3.2.3/eruda.js	navigation	2025-03-19 05:19:47.573	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1246	ResourceTiming	1923	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:19:47.578	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1247	ResourceTiming	3243	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=2hWnNR-552b6OmKt1hhvU	navigation	2025-03-19 05:19:47.57	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1248	ResourceTiming	1969	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:19:47.575	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1249	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:19:48.006	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1250	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:19:48.011	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1251	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:19:48.019	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1252	ResourceTiming	503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:19:48.037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1253	ResourceTiming	262	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=2hWnNR-552b6OmKt1hhvU	navigation	2025-03-19 05:19:48.128	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1254	ResourceTiming	1403	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=2hWnNR-552b6OmKt1hhvU	navigation	2025-03-19 05:19:48.17	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1255	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:19:48.333	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1256	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:19:48.339	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1257	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:19:48.337	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1258	ResourceTiming	1280	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=2hWnNR-552b6OmKt1hhvU	navigation	2025-03-19 05:19:48.36	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1263	ResourceTiming	273	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:19:48.648	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1259	ResourceTiming	426	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=2hWnNR-552b6OmKt1hhvU	navigation	2025-03-19 05:19:48.449	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1261	ResourceTiming	464	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=2hWnNR-552b6OmKt1hhvU	navigation	2025-03-19 05:19:48.638	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1260	ResourceTiming	1030	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=2hWnNR-552b6OmKt1hhvU	navigation	2025-03-19 05:19:48.488	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1262	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:19:48.646	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1264	ResourceTiming	7	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:19:48.657	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1265	ResourceTiming	780	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:19:51.053	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1266	ResourceTiming	373	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:19:51.047	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1267	ResourceTiming	484	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:19:51.362	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1268	ResourceTiming	503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:19:51.364	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1269	ResourceTiming	529	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:19:51.373	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1270	ResourceTiming	503	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:19:51.366	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1271	ResourceTiming	534	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:19:51.607	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1272	ResourceTiming	759	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:19:51.914	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1273	ResourceTiming	613	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:19:51.92	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1274	ResourceTiming	715	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:19:51.923	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1275	ResourceTiming	985	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:19:51.927	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1276	ResourceTiming	863	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:19:52.829	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1277	ResourceTiming	985	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:19:52.831	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1278	ResourceTiming	766	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:19:52.863	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1279	ResourceTiming	1003	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:19:53.139	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1280	ResourceTiming	1017	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:19:55.068	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1281	ResourceTiming	1030	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:19:55.104	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1282	ResourceTiming	1101	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:19:56.727	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1285	ResourceTiming	971	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:19:56.94	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1294	ResourceTiming	944	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:19:59.328	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1299	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:19:59.784	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1303	ResourceTiming	683	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:20:00.068	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1308	ResourceTiming	2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:20:00.368	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1321	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:20:00.95	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1332	TTFB	3770	nav-timing	reload	2025-03-19 05:20:03.055	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1335	DNS	0	dns-timing	navigation	2025-03-19 05:20:03.289	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1339	FCP	11107	v4-1742361602590-4564508594400	navigation	2025-03-19 05:20:03.825	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1340	ResourceTiming	1197	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=mcZ5nSqnC0t4HIGT8vG5V	navigation	2025-03-19 05:20:04.247	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1351	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:20:04.755	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1352	ResourceTiming	418	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=mcZ5nSqnC0t4HIGT8vG5V	navigation	2025-03-19 05:20:05.162	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1362	ResourceTiming	587	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 05:20:05.668	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1365	ResourceTiming	955	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:20:06.107	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1372	ResourceTiming	1370	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:20:06.578	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1380	ResourceTiming	2067	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:20:07.049	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1383	ResourceTiming	2180	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:20:07.501	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1283	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:19:56.741	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1284	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:19:56.938	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1297	ResourceTiming	749	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:19:59.624	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1310	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:20:00.373	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1314	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:20:00.662	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1333	TCP	748	tcp-timing	navigation	2025-03-19 05:20:03.254	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1344	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:20:04.29	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1346	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:20:04.708	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1357	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 05:20:05.217	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1358	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 05:20:05.63	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1369	ResourceTiming	1226	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:20:06.153	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1370	ResourceTiming	1245	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:20:06.53	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1381	ResourceTiming	2073	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:20:07.074	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1382	ResourceTiming	2056	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:20:07.459	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1393	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:20:08.003	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1394	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 05:20:08.361	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1405	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:20:08.94	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1286	ResourceTiming	740	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:19:59.011	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1292	ResourceTiming	744	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:19:59.325	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1305	ResourceTiming	633	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:20:00.137	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1307	ResourceTiming	2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:20:00.215	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1312	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:20:00.477	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1313	ResourceTiming	3	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:20:00.522	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1315	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:20:00.664	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1318	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:20:00.766	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1319	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:20:00.817	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1320	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:20:00.949	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1326	ResourceTiming	315	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:20:01.315	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1287	ResourceTiming	751	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:19:59.01	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1289	ResourceTiming	818	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:19:59.218	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1291	ResourceTiming	945	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:19:59.322	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1296	ResourceTiming	7	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:19:59.622	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1304	ResourceTiming	680	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:20:00.078	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1316	ResourceTiming	2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:20:00.665	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1317	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:20:00.745	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1328	ResourceTiming	300	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:20:01.318	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1345	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:20:04.294	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1347	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:20:04.714	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1356	ResourceTiming	454	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:20:05.205	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1359	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 05:20:05.646	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1368	ResourceTiming	1260	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:20:06.121	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1371	ResourceTiming	1386	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 05:20:06.577	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1378	ResourceTiming	1768	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:20:07.044	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1384	ResourceTiming	2082	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:20:07.517	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1389	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:20:07.974	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1288	ResourceTiming	2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:19:59.014	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1290	ResourceTiming	944	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:19:59.32	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1293	ResourceTiming	759	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:19:59.327	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1295	ResourceTiming	768	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:19:59.612	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1298	ResourceTiming	778	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:19:59.629	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1300	ResourceTiming	625	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:19:59.636	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1301	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:19:59.924	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1302	ResourceTiming	776	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:20:00.062	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1306	ResourceTiming	631	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:20:00.177	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1309	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:20:00.37	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1311	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:20:00.445	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1322	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:20:00.958	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1323	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:20:01.055	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1324	ResourceTiming	421	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:20:01.057	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1325	ResourceTiming	367	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:20:01.13	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1327	ResourceTiming	367	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:20:01.316	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1329	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:20:01.346	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1330	ResourceTiming	351	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:20:01.355	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1334	TTFB	3770	nav-timing	reload	2025-03-19 05:20:03.287	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1338	FCP	11107	v4-1742361602580-1265206702654	navigation	2025-03-19 05:20:03.824	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1341	ResourceTiming	1205	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:20:04.248	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1350	ResourceTiming	1162	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=mcZ5nSqnC0t4HIGT8vG5V	navigation	2025-03-19 05:20:04.75	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1353	ResourceTiming	1475	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=mcZ5nSqnC0t4HIGT8vG5V	navigation	2025-03-19 05:20:05.163	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1363	ResourceTiming	747	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 05:20:05.685	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1364	ResourceTiming	836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:20:06.072	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1375	ResourceTiming	1658	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:20:06.62	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1376	ResourceTiming	1658	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:20:06.981	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1387	ResourceTiming	1678	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 05:20:07.525	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1388	ResourceTiming	1926	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:20:07.908	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1399	ResourceTiming	1653	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:20:08.456	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1401	ResourceTiming	1417	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:20:08.89	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1409	ResourceTiming	1125	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:20:09.387	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1413	ResourceTiming	1268	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:20:09.816	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1421	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:20:10.386	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1424	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:20:10.828	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1331	ResourceTiming	329	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:20:01.441	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1336	TCP	748	tcp-timing	navigation	2025-03-19 05:20:03.292	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1342	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:20:04.26	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1348	ResourceTiming	419	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=mcZ5nSqnC0t4HIGT8vG5V	navigation	2025-03-19 05:20:04.724	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1355	ResourceTiming	817	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:20:05.198	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1360	ResourceTiming	422	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 05:20:05.65	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1367	ResourceTiming	972	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:20:06.118	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1373	ResourceTiming	1636	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:20:06.578	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1379	ResourceTiming	1808	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:20:07.044	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1385	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:20:07.517	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1391	ResourceTiming	1470	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:20:07.983	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1396	ResourceTiming	1260	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:20:08.442	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1404	ResourceTiming	1436	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:20:08.928	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1407	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:20:09.342	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1417	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 05:20:09.859	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1418	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:20:10.349	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1429	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:20:10.876	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1432	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:20:11.289	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1337	DNS	0	dns-timing	navigation	2025-03-19 05:20:03.299	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1343	ResourceTiming	1553	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:20:04.266	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1349	ResourceTiming	626	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=mcZ5nSqnC0t4HIGT8vG5V	navigation	2025-03-19 05:20:04.723	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1354	ResourceTiming	775	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=mcZ5nSqnC0t4HIGT8vG5V	navigation	2025-03-19 05:20:05.187	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1361	ResourceTiming	554	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:20:05.659	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1366	ResourceTiming	1007	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:20:06.116	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1374	ResourceTiming	1408	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:20:06.58	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1377	ResourceTiming	1817	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:20:07.039	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1386	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:20:07.519	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1390	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:20:07.982	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1397	ResourceTiming	1407	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:20:08.447	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1402	ResourceTiming	1527	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:20:08.898	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1410	ResourceTiming	1209	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:20:09.389	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1414	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 05:20:09.821	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1422	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:20:10.388	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1425	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:20:10.828	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1435	ResourceTiming	436	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:20:11.333	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1437	ResourceTiming	513	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:20:11.748	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1392	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 05:20:07.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1395	ResourceTiming	1378	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:20:08.435	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1403	ResourceTiming	1298	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:20:08.93	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1408	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:20:09.353	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1415	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 05:20:09.852	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1420	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:20:10.365	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1427	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:20:10.869	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1431	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:20:11.288	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1439	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:20:11.792	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1443	ResourceTiming	937	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:20:12.237	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1451	TTFB	4523	v4-1742361602590-1044081799367	navigation	2025-03-19 05:20:12.733	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1398	ResourceTiming	1402	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:20:08.455	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1400	ResourceTiming	1706	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:20:08.816	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1411	ResourceTiming	1315	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:20:09.401	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1412	ResourceTiming	1347	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:20:09.744	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1423	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:20:10.396	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1426	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:20:10.831	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1433	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:20:11.323	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1438	ResourceTiming	583	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:20:11.754	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1446	ResourceTiming	934	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:20:12.268	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1449	ResourceTiming	994	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/transitions/FadeInSection.tsx	navigation	2025-03-19 05:20:12.692	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1406	ResourceTiming	1486	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:20:09.282	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1416	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:20:09.858	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1419	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:20:10.352	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1428	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:20:10.873	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1430	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:20:11.283	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1440	ResourceTiming	1349	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:20:11.794	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1442	ResourceTiming	936	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:20:12.236	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1434	ResourceTiming	646	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:20:11.329	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1436	ResourceTiming	570	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:20:11.746	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1445	ResourceTiming	932	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:20:12.264	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1450	TTFB	4523	v4-1742361602580-3479419516336	navigation	2025-03-19 05:20:12.697	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1441	ResourceTiming	427	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:20:11.795	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1444	ResourceTiming	635	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:20:12.239	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1447	ResourceTiming	937	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:20:12.269	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1448	ResourceTiming	697	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/BuyMeCoffeeButton.tsx	navigation	2025-03-19 05:20:12.69	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1452	TCP	663	tcp-timing	navigation	2025-03-19 05:23:30.677	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1454	TTFB	2459	nav-timing	reload	2025-03-19 05:23:30.674	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1453	DNS	0	dns-timing	navigation	2025-03-19 05:23:30.676	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1455	DNS	0	dns-timing	navigation	2025-03-19 05:23:31.005	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1456	TCP	663	tcp-timing	navigation	2025-03-19 05:23:31.032	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1457	TTFB	3125	v4-1742361810379-9224447321759	navigation	2025-03-19 05:23:31.143	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1458	TTFB	3125	v4-1742361810392-4536271451383	navigation	2025-03-19 05:23:31.454	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1459	FCP	9568	v4-1742361810379-5246751699839	navigation	2025-03-19 05:23:31.49	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1460	FCP	9568	v4-1742361810392-7152033211579	navigation	2025-03-19 05:23:31.534	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1461	TTFB	2459	nav-timing	reload	2025-03-19 05:23:32.832	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1462	ResourceTiming	4589	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/injected.js	navigation	2025-03-19 05:28:35.429	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1463	ResourceTiming	572	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:28:35.589	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1464	ResourceTiming	4645	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:35.648	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1465	ResourceTiming	2875	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/__replco/static/devtools/eruda/3.2.3/eruda.js	navigation	2025-03-19 05:28:35.689	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1466	ResourceTiming	5239	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:28:35.726	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1467	ResourceTiming	26	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:28:36.17	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1468	ResourceTiming	25	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:28:36.246	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1469	ResourceTiming	903	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:28:36.33	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1494	TTFB	879	nav-timing	reload	2025-03-19 05:28:40.037	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1470	ResourceTiming	552	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:36.414	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1471	ResourceTiming	1614	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:36.581	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1475	ResourceTiming	934	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:37.571	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1476	ResourceTiming	20	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:28:37.723	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1477	ResourceTiming	26	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:28:37.784	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1480	ResourceTiming	573	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:28:38.617	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1493	TCP	3045	tcp-timing	navigation	2025-03-19 05:28:40.004	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1500	ResourceTiming	267	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 05:28:40.474	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1529	ResourceTiming	7	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:28:43.768	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1472	ResourceTiming	1546	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:37.212	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1473	ResourceTiming	857	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:37.448	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1474	ResourceTiming	1263	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:37.504	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1478	ResourceTiming	19	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:28:38.231	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1479	ResourceTiming	19	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:28:38.388	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1481	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:28:38.661	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1482	ResourceTiming	259	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:28:38.707	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1483	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:28:38.844	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1484	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 05:28:38.983	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1485	ResourceTiming	254	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 05:28:39.069	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1486	ResourceTiming	7	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 05:28:39.215	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1487	ResourceTiming	7	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 05:28:39.255	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1488	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 05:28:39.346	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1489	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 05:28:39.523	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1490	ResourceTiming	2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 05:28:39.939	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1491	TTFB	879	nav-timing	reload	2025-03-19 05:28:39.976	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1492	DNS	0	dns-timing	navigation	2025-03-19 05:28:40.003	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1505	FCP	13617	v4-1742362119112-8129248483142	navigation	2025-03-19 05:28:42.071	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1495	ResourceTiming	298	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:28:39.974	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1496	ResourceTiming	3	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 05:28:40.166	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1499	ResourceTiming	3	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 05:28:40.253	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1503	ResourceTiming	500	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:28:41.959	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1497	ResourceTiming	257	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:28:40.176	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1498	ResourceTiming	260	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 05:28:40.227	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1501	DNS	0	dns-timing	navigation	2025-03-19 05:28:40.79	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1504	ResourceTiming	541	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:28:41.961	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1502	ResourceTiming	526	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:28:41.942	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1527	ResourceTiming	7	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:28:43.738	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1533	ResourceTiming	750	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:28:43.807	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1544	ResourceTiming	916	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:28:45.065	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1619	ResourceTiming	2475	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:28:50.107	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1622	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 05:28:50.467	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1631	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:28:51.083	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1634	ResourceTiming	2080	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:28:51.41	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1638	ResourceTiming	2165	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:28:51.652	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1639	ResourceTiming	1756	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:28:51.87	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1643	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:28:52.133	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1646	ResourceTiming	2357	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:28:52.413	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1649	ResourceTiming	3016	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:28:52.624	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1651	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 05:28:52.882	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1656	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:28:53.179	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1657	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:28:53.417	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1673	ResourceTiming	1277	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:28:54.614	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1709	TCP	1244	tcp-timing	navigation	2025-03-19 05:32:50.335	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1506	TCP	3045	tcp-timing	navigation	2025-03-19 05:28:42.074	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1507	ResourceTiming	284	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 05:28:41.947	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1508	ResourceTiming	1000	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:28:41.956	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1509	ResourceTiming	501	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:28:41.951	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1510	ResourceTiming	560	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:28:42.305	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1517	ResourceTiming	819	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:28:42.871	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1518	ResourceTiming	827	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:28:42.936	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1519	ResourceTiming	999	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:28:42.988	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1520	ResourceTiming	318	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:28:43.051	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1521	ResourceTiming	1054	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:28:43.099	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1522	ResourceTiming	1061	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 05:28:43.256	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1523	ResourceTiming	1068	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:28:43.328	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1524	ResourceTiming	1098	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:28:43.421	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1525	ResourceTiming	983	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:28:43.468	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1526	ResourceTiming	2677	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:28:43.74	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1528	ResourceTiming	2322	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 05:28:43.752	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1532	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 05:28:43.785	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1534	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:28:43.825	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1795	DNS	1	dns-timing	navigation	2025-03-19 05:41:14.081	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1511	FCP	13617	v4-1742362119120-6622037015619	navigation	2025-03-19 05:28:42.432	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1512	ResourceTiming	744	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 05:28:42.535	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1513	ResourceTiming	574	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:28:42.586	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1514	ResourceTiming	751	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:28:42.695	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1515	ResourceTiming	805	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:28:42.728	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1516	ResourceTiming	805	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:28:42.759	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1530	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 05:28:43.775	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1531	ResourceTiming	2529	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=BZ9bpoX8XNDH8ifCTGyD4	navigation	2025-03-19 05:28:43.776	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1545	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:28:45.114	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1547	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 05:28:45.154	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1548	ResourceTiming	786	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 05:28:45.212	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1553	ResourceTiming	738	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:28:45.864	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1556	ResourceTiming	1211	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=BZ9bpoX8XNDH8ifCTGyD4	navigation	2025-03-19 05:28:46.032	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1557	ResourceTiming	570	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=BZ9bpoX8XNDH8ifCTGyD4	navigation	2025-03-19 05:28:46.093	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1559	ResourceTiming	850	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 05:28:46.285	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1560	ResourceTiming	841	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 05:28:46.336	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1561	ResourceTiming	764	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 05:28:46.788	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1562	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 05:28:46.809	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1535	ResourceTiming	777	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:28:43.842	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1537	ResourceTiming	995	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:28:43.908	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1538	ResourceTiming	759	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:28:44.793	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1541	ResourceTiming	432	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=BZ9bpoX8XNDH8ifCTGyD4	navigation	2025-03-19 05:28:44.974	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1620	ResourceTiming	2453	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 05:28:50.122	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1621	ResourceTiming	2484	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 05:28:50.429	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1632	ResourceTiming	1487	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:28:51.097	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1633	ResourceTiming	1445	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 05:28:51.389	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1637	ResourceTiming	1968	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:28:51.615	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1640	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:28:51.913	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1644	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:28:52.134	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1645	ResourceTiming	1952	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:28:52.388	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1650	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 05:28:52.663	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1652	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 05:28:52.904	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1655	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:28:53.135	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1658	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:28:53.429	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1662	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:28:53.672	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1796	DNS	1	dns-timing	navigation	2025-03-19 05:41:14.233	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1536	ResourceTiming	8	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 05:28:43.883	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1539	ResourceTiming	765	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 05:28:44.814	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1540	ResourceTiming	771	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 05:28:44.899	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1543	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:28:45.066	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1549	ResourceTiming	1483	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=BZ9bpoX8XNDH8ifCTGyD4	navigation	2025-03-19 05:28:45.284	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1550	ResourceTiming	783	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 05:28:45.37	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1551	ResourceTiming	605	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:28:45.462	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1552	ResourceTiming	2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 05:28:45.507	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1554	ResourceTiming	1430	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=BZ9bpoX8XNDH8ifCTGyD4	navigation	2025-03-19 05:28:45.938	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1571	ResourceTiming	606	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 05:28:47.413	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1575	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:28:47.536	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1576	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:28:47.607	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1580	ResourceTiming	963	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 05:28:47.799	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1582	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:28:47.898	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1586	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 05:28:48.123	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1591	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:28:48.42	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1595	ResourceTiming	1382	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 05:28:48.62	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1542	ResourceTiming	681	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=BZ9bpoX8XNDH8ifCTGyD4	navigation	2025-03-19 05:28:45.028	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1546	ResourceTiming	915	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 05:28:45.132	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1555	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 05:28:45.992	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1558	ResourceTiming	3	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 05:28:46.263	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1570	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 05:28:47.33	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1572	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:28:47.423	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1587	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 05:28:48.135	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1602	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:28:48.872	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1605	ResourceTiming	1649	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:28:49.059	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1608	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:28:49.219	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1612	ResourceTiming	1921	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:28:49.407	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1613	ResourceTiming	325	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/transitions/FadeInSection.tsx	navigation	2025-03-19 05:28:49.528	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1615	ResourceTiming	2028	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 05:28:49.947	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1626	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 05:28:50.614	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1627	ResourceTiming	1994	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 05:28:50.911	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1563	ResourceTiming	756	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:28:46.853	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1566	ResourceTiming	647	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:28:47.087	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1569	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 05:28:47.28	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1573	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:28:47.455	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1577	ResourceTiming	844	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 05:28:47.628	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1584	ResourceTiming	1182	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:28:47.984	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1585	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 05:28:48.097	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1588	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:28:48.164	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1590	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:28:48.364	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1593	ResourceTiming	1250	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 05:28:48.528	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1596	ResourceTiming	437	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:28:48.65	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1601	ResourceTiming	1608	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 05:28:48.864	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1607	ResourceTiming	1684	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 05:28:49.168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1610	ResourceTiming	356	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:28:49.347	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1611	ResourceTiming	351	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:28:49.403	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1616	ResourceTiming	2052	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 05:28:49.977	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1625	ResourceTiming	2162	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 05:28:50.591	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1628	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 05:28:50.937	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1564	ResourceTiming	755	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 05:28:46.893	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1565	ResourceTiming	714	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 05:28:46.962	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1567	ResourceTiming	527	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:28:47.13	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1568	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:28:47.265	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1574	ResourceTiming	777	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:28:47.467	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1578	ResourceTiming	2	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 05:28:47.64	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1579	ResourceTiming	5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:28:47.708	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1581	ResourceTiming	1055	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:28:47.89	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1583	ResourceTiming	4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:28:47.983	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1589	ResourceTiming	1212	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:28:48.19	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1592	ResourceTiming	1204	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 05:28:48.434	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1594	ResourceTiming	6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:28:48.543	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1598	ResourceTiming	1479	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:28:48.708	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1603	ResourceTiming	1623	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 05:28:48.931	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1604	ResourceTiming	274	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:28:49.018	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1606	ResourceTiming	275	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:28:49.089	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1609	ResourceTiming	1885	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 05:28:49.27	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1614	ResourceTiming	452	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/BuyMeCoffeeButton.tsx	navigation	2025-03-19 05:28:49.89	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1597	ResourceTiming	1	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:28:48.704	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1599	ResourceTiming	427	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:28:48.784	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1600	ResourceTiming	450	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:28:48.855	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1617	ResourceTiming	2372	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 05:28:50.05	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1624	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 05:28:50.549	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1629	ResourceTiming	1648	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 05:28:51.021	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1636	ResourceTiming	1966	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 05:28:51.499	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1641	ResourceTiming	2221	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 05:28:51.999	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1648	ResourceTiming	2414	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 05:28:52.578	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1653	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 05:28:53.008	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1660	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:28:53.565	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1665	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:28:53.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1672	ResourceTiming	1563	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:28:54.548	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1677	ResourceTiming	735	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:28:55.005	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1680	ResourceTiming	1090	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.224	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1682	ResourceTiming	2957	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.463	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1690	ResourceTiming	761	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/posts?page=1&limit=5	navigation	2025-03-19 05:28:56.02	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1618	ResourceTiming	2290	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 05:28:50.093	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1623	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 05:28:50.535	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1630	ResourceTiming	1670	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 05:28:51.04	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1635	ResourceTiming	1875	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 05:28:51.496	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1642	ResourceTiming	2038	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 05:28:52.03	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1647	ResourceTiming	2467	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 05:28:52.536	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1654	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:28:53.067	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1659	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 05:28:53.501	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1666	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:28:54.075	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1671	ResourceTiming	1356	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:28:54.53	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1678	ResourceTiming	1069	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.026	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1683	ResourceTiming	3144	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.47	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1686	ResourceTiming	3099	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?t=1742362119166&v=wIS6pxAHpoHRaZX0-v_Xx	navigation	2025-03-19 05:28:55.708	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1688	ResourceTiming	2358	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/transitions/FadeInSection.tsx	navigation	2025-03-19 05:28:55.962	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1661	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:28:53.619	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1663	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:28:53.912	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1668	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:28:54.169	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1669	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:28:54.475	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1664	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:28:53.915	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1667	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:28:54.137	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1670	ResourceTiming	1849	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:28:54.505	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1674	ResourceTiming	1093	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:28:54.741	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1676	ResourceTiming	765	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:28:54.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1684	ResourceTiming	3123	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.542	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1689	ResourceTiming	750	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/posts?page=1&limit=5	navigation	2025-03-19 05:28:55.987	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1692	TTFB	3927	v4-1742362119112-5570392905201	navigation	2025-03-19 05:28:56.215	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1675	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:28:54.949	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1679	ResourceTiming	1079	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.17	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1681	ResourceTiming	1105	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.419	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1685	ResourceTiming	3475	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:28:55.646	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1687	ResourceTiming	2340	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/BuyMeCoffeeButton.tsx	navigation	2025-03-19 05:28:55.899	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1691	ResourceTiming	872	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/attached_assets/IMG_4918.jpeg	navigation	2025-03-19 05:28:56.11	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1693	TTFB	3927	v4-1742362119120-8277179199452	navigation	2025-03-19 05:28:56.394	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1694	DNS	1	dns-timing	navigation	2025-03-19 05:31:38.834	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1695	TTFB	6006	nav-timing	navigate	2025-03-19 05:31:38.837	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1696	TCP	750	tcp-timing	navigation	2025-03-19 05:31:38.836	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1697	TTFB	6006	nav-timing	navigate	2025-03-19 05:31:38.839	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1698	DNS	1	dns-timing	navigation	2025-03-19 05:31:39.273	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1699	TCP	750	tcp-timing	navigation	2025-03-19 05:31:39.276	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1700	FCP	13659	v4-1742362298502-5217042908244	navigation	2025-03-19 05:31:39.317	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1701	FCP	13659	v4-1742362298518-5953119605488	navigation	2025-03-19 05:31:39.337	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1702	TTFB	6765	v4-1742362298502-1833019735611	navigation	2025-03-19 05:31:39.741	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1703	TTFB	6765	v4-1742362298518-2091991486343	navigation	2025-03-19 05:31:39.745	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1704	DNS	0	dns-timing	navigation	2025-03-19 05:32:49.951	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1705	TCP	1244	tcp-timing	navigation	2025-03-19 05:32:49.953	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1706	TTFB	4049	nav-timing	navigate	2025-03-19 05:32:49.954	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1707	TTFB	4049	nav-timing	navigate	2025-03-19 05:32:49.958	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1708	DNS	0	dns-timing	navigation	2025-03-19 05:32:50.321	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1710	TTFB	5300	v4-1742362369667-5500735496233	navigation	2025-03-19 05:32:50.429	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1711	TTFB	5300	v4-1742362369687-3381055693638	navigation	2025-03-19 05:32:50.473	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1712	FCP	12563	v4-1742362369667-1957004344935	navigation	2025-03-19 05:32:50.789	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1713	FCP	12563	v4-1742362369687-3492223108680	navigation	2025-03-19 05:32:50.79	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1714	TCP	777	tcp-timing	navigation	2025-03-19 05:34:08.891	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1715	TTFB	1523	nav-timing	reload	2025-03-19 05:34:08.905	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1716	TTFB	1523	nav-timing	reload	2025-03-19 05:34:09.038	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1717	DNS	0	dns-timing	navigation	2025-03-19 05:34:09.046	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1718	DNS	0	dns-timing	navigation	2025-03-19 05:34:09.24	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1719	TCP	777	tcp-timing	navigation	2025-03-19 05:34:09.308	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1720	ResourceTiming	1571	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 05:34:09.826	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1721	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 05:34:09.829	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1722	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 05:34:10.143	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1723	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 05:34:10.144	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1724	ResourceTiming	795	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=3pUDUGNYkq6ggucsP2Xx1	navigation	2025-03-19 05:34:10.498	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1725	ResourceTiming	654	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=3pUDUGNYkq6ggucsP2Xx1	navigation	2025-03-19 05:34:10.51	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1726	ResourceTiming	454	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 05:34:10.913	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1727	ResourceTiming	612	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 05:34:10.954	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1728	ResourceTiming	996	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 05:34:11.274	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1729	ResourceTiming	991	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 05:34:11.276	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1797	TCP	835	tcp-timing	navigation	2025-03-19 05:41:14.265	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1730	ResourceTiming	1252	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 05:34:11.618	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1733	ResourceTiming	1858	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 05:34:12.072	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1731	ResourceTiming	1008	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 05:34:11.617	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1732	ResourceTiming	1469	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 05:34:12.015	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1734	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 05:34:15.529	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1735	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 05:34:15.534	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1736	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 05:34:15.672	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1737	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 05:34:15.677	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1738	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 05:34:15.681	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1739	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 05:34:15.687	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1740	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 05:34:16.015	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1741	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 05:34:17.16	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1742	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 05:34:17.162	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1743	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 05:34:17.163	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1744	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 05:34:17.161	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1745	ResourceTiming	521	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 05:34:20.355	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1746	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 05:34:20.357	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1747	ResourceTiming	562	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 05:34:20.358	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1748	ResourceTiming	575	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 05:34:20.658	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1749	ResourceTiming	442	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 05:34:21.446	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1750	ResourceTiming	430	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 05:34:21.568	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1751	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 05:34:27.53	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1752	ResourceTiming	470	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 05:34:27.544	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1753	ResourceTiming	538	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:34:28.458	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1754	ResourceTiming	510	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:34:28.459	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1755	ResourceTiming	391	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 05:34:28.456	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1756	ResourceTiming	663	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:34:31.323	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1757	ResourceTiming	669	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:34:31.317	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1758	ResourceTiming	856	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:34:31.358	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1759	ResourceTiming	935	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/analytics/vitals	navigation	2025-03-19 05:34:31.651	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1760	ResourceTiming	466	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/transitions/FadeInSection.tsx	navigation	2025-03-19 05:34:31.685	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1761	ResourceTiming	486	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/BuyMeCoffeeButton.tsx	navigation	2025-03-19 05:34:31.828	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1762	TTFB	2304	v4-1742362448575-6975191281865	navigation	2025-03-19 05:34:31.831	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1763	TTFB	2304	v4-1742362448581-7681928698278	navigation	2025-03-19 05:34:31.838	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1764	TCP	773	tcp-timing	navigation	2025-03-19 05:35:45.117	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1765	TTFB	5574	nav-timing	navigate	2025-03-19 05:35:45.119	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1766	DNS	0	dns-timing	navigation	2025-03-19 05:35:45.121	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1767	TTFB	5574	nav-timing	navigate	2025-03-19 05:35:45.262	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1768	DNS	0	dns-timing	navigation	2025-03-19 05:35:45.486	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1769	TCP	773	tcp-timing	navigation	2025-03-19 05:35:45.491	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1770	FCP	6407	v4-1742362544797-6644726528864	navigation	2025-03-19 05:35:45.577	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1771	FCP	6407	v4-1742362544812-8538986942010	navigation	2025-03-19 05:35:45.698	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1772	TTFB	2779	nav-timing	reload	2025-03-19 05:36:54.69	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1773	DNS	0	dns-timing	navigation	2025-03-19 05:36:54.692	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1774	TTFB	2779	nav-timing	reload	2025-03-19 05:36:54.693	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1775	TCP	695	tcp-timing	navigation	2025-03-19 05:36:54.694	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1776	DNS	0	dns-timing	navigation	2025-03-19 05:36:54.837	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1777	TCP	695	tcp-timing	navigation	2025-03-19 05:36:55.135	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1778	FCP	9509	v4-1742362614419-2064688485886	navigation	2025-03-19 05:36:55.141	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1779	TTFB	3479	v4-1742362614419-9280273008243	navigation	2025-03-19 05:36:55.143	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1780	TTFB	3479	v4-1742362614432-8360538110389	navigation	2025-03-19 05:36:55.144	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1781	FCP	9509	v4-1742362614432-3466754122820	navigation	2025-03-19 05:36:55.185	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1782	DNS	1	dns-timing	navigation	2025-03-19 05:39:24.563	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1783	TTFB	17304	nav-timing	navigate	2025-03-19 05:39:24.557	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1784	TCP	773	tcp-timing	navigation	2025-03-19 05:39:24.566	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1785	TTFB	17304	nav-timing	navigate	2025-03-19 05:39:24.567	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1786	DNS	1	dns-timing	navigation	2025-03-19 05:39:24.792	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1787	FCP	25141	v4-1742362763876-8580124457389	navigation	2025-03-19 05:39:25.049	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1788	FCP	25141	v4-1742362763895-4367281284357	navigation	2025-03-19 05:39:25.075	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1789	TCP	773	tcp-timing	navigation	2025-03-19 05:39:25.096	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1790	TTFB	18084	v4-1742362763876-5672766835910	navigation	2025-03-19 05:39:25.309	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1791	TTFB	18084	v4-1742362763895-8827790260209	navigation	2025-03-19 05:39:25.493	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1792	TTFB	6115	nav-timing	navigate	2025-03-19 05:41:13.922	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1793	TTFB	6115	nav-timing	navigate	2025-03-19 05:41:13.928	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1794	TCP	835	tcp-timing	navigation	2025-03-19 05:41:13.925	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1798	FCP	31445	v4-1742362873417-9408961571208	navigation	2025-03-19 05:41:14.423	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1800	TTFB	6954	v4-1742362873417-5430506857058	navigation	2025-03-19 05:41:14.731	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1799	FCP	31445	v4-1742362873438-4951121185534	navigation	2025-03-19 05:41:14.565	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1801	TTFB	6954	v4-1742362873438-1048027260746	navigation	2025-03-19 05:41:14.76	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1802	TTFB	715	nav-timing	navigate	2025-03-19 17:01:35.711	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1803	DNS	198	dns-timing	navigation	2025-03-19 17:01:35.722	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1804	TCP	1219	tcp-timing	navigation	2025-03-19 17:01:35.723	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1805	TTFB	715	nav-timing	navigate	2025-03-19 17:01:35.739	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1806	DNS	198	dns-timing	navigation	2025-03-19 17:01:36.087	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1807	TCP	1219	tcp-timing	navigation	2025-03-19 17:01:36.104	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1808	TCP	836	tcp-timing	navigation	2025-03-19 17:02:05.112	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1809	TTFB	405	nav-timing	reload	2025-03-19 17:02:05.114	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1810	TTFB	405	nav-timing	reload	2025-03-19 17:02:05.115	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1811	DNS	1	dns-timing	navigation	2025-03-19 17:02:05.116	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1812	DNS	1	dns-timing	navigation	2025-03-19 17:02:05.484	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1813	TCP	836	tcp-timing	navigation	2025-03-19 17:02:05.523	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1814	ResourceTiming	1332	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@vite/client	navigation	2025-03-19 17:02:05.599	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1815	ResourceTiming	1370	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@react-refresh	navigation	2025-03-19 17:02:05.6	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1816	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a1620e71	navigation	2025-03-19 17:02:05.617	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1817	ResourceTiming	1210	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/main.tsx?v=O_61djhVxJkQuwLdPZ4Ge	navigation	2025-03-19 17:02:05.622	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1818	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=a1620e71	navigation	2025-03-19 17:02:06.086	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1819	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/react.js?v=a1620e71	navigation	2025-03-19 17:02:06.087	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1820	ResourceTiming	434	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.css?v=O_61djhVxJkQuwLdPZ4Ge	navigation	2025-03-19 17:02:06.107	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1821	ResourceTiming	731	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/App.tsx?v=O_61djhVxJkQuwLdPZ4Ge	navigation	2025-03-19 17:02:06.109	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1972	DNS	0	dns-timing	navigation	2025-03-19 17:25:50.374	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1822	ResourceTiming	1513	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/index.css?v=O_61djhVxJkQuwLdPZ4Ge	navigation	2025-03-19 17:02:06.405	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1833	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/wouter.js?v=a1620e71	navigation	2025-03-19 17:02:07.107	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1834	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=a1620e71	navigation	2025-03-19 17:02:07.377	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1839	ResourceTiming	756	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/footer.tsx	navigation	2025-03-19 17:02:07.626	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1840	ResourceTiming	589	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/toaster.tsx	navigation	2025-03-19 17:02:07.879	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1845	ResourceTiming	1242	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-cookie-consent.tsx	navigation	2025-03-19 17:02:08.128	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1846	ResourceTiming	1349	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/protected-route.tsx	navigation	2025-03-19 17:02:08.38	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1851	ResourceTiming	1488	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ScrollToTopButton.tsx	navigation	2025-03-19 17:02:08.634	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1852	ResourceTiming	1793	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/GlobalLoadingOverlay.tsx	navigation	2025-03-19 17:02:08.88	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1857	ResourceTiming	2098	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/AutoHideNavbar.tsx	navigation	2025-03-19 17:02:09.164	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1861	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/class-variance-authority.js?v=a1620e71	navigation	2025-03-19 17:02:09.507	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1866	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/sonner.js?v=a1620e71	navigation	2025-03-19 17:02:09.993	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1873	ResourceTiming	1523	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sheet.tsx	navigation	2025-03-19 17:02:10.519	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1876	ResourceTiming	1448	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/collapsible.tsx	navigation	2025-03-19 17:02:10.848	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1880	ResourceTiming	1280	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/layout/navigation.tsx	navigation	2025-03-19 17:02:11.144	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1884	ResourceTiming	1286	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/content-analysis.ts	navigation	2025-03-19 17:02:11.476	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1891	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-VRPX6FPE.js?v=a1620e71	navigation	2025-03-19 17:02:12.018	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1943	TTFB	643	nav-timing	navigate	2025-03-19 17:09:46.244	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1823	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-QCHXOAYK.js?v=a1620e71	navigation	2025-03-19 17:02:06.436	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1832	ResourceTiming	431	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/button.tsx	navigation	2025-03-19 17:02:07.095	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1835	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-KBTYAULA.js?v=a1620e71	navigation	2025-03-19 17:02:07.451	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1844	ResourceTiming	1234	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/error-boundary.tsx	navigation	2025-03-19 17:02:08.121	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1847	ResourceTiming	1369	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar.tsx	navigation	2025-03-19 17:02:08.481	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1856	ResourceTiming	2126	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotificationProvider.tsx	navigation	2025-03-19 17:02:09.149	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1858	ResourceTiming	2219	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/NotFoundRouteHandler.tsx	navigation	2025-03-19 17:02:09.388	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1862	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DKHUMOWT.js?v=a1620e71	navigation	2025-03-19 17:02:09.653	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1864	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/framer-motion.js?v=a1620e71	navigation	2025-03-19 17:02:09.895	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1868	ResourceTiming	1299	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/alert.tsx	navigation	2025-03-19 17:02:10.166	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1871	ResourceTiming	1668	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/separator.tsx	navigation	2025-03-19 17:02:10.469	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1881	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/uuid.js?v=a1620e71	navigation	2025-03-19 17:02:11.168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1883	ResourceTiming	1298	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-font-size.ts	navigation	2025-03-19 17:02:11.453	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1824	ResourceTiming	1264	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/styles/preloader.ts?v=O_61djhVxJkQuwLdPZ4Ge	navigation	2025-03-19 17:02:06.592	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1830	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js?v=a1620e71	navigation	2025-03-19 17:02:07.077	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1836	ResourceTiming	693	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sonner.tsx	navigation	2025-03-19 17:02:07.556	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1842	ResourceTiming	1057	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/cookie-consent.tsx	navigation	2025-03-19 17:02:08.041	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1849	ResourceTiming	1666	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/enhanced-page-transition.tsx	navigation	2025-03-19 17:02:08.53	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1854	ResourceTiming	1955	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/wordpress-api.ts	navigation	2025-03-19 17:02:08.996	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1859	ResourceTiming	2248	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/reader.tsx	navigation	2025-03-19 17:02:09.494	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1869	ResourceTiming	1371	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/cookie-manager.ts	navigation	2025-03-19 17:02:10.17	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1870	ResourceTiming	1276	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-mobile.tsx	navigation	2025-03-19 17:02:10.382	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1874	ResourceTiming	1739	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/tooltip.tsx	navigation	2025-03-19 17:02:10.65	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1878	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/zod.js?v=a1620e71	navigation	2025-03-19 17:02:10.997	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1885	ResourceTiming	1260	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/like-dislike.tsx	navigation	2025-03-19 17:02:11.534	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1888	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-U7P2NEEE.js?v=a1620e71	navigation	2025-03-19 17:02:11.815	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1892	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-6O2ONJSY.js?v=a1620e71	navigation	2025-03-19 17:02:12.113	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1896	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-BUP5TVTU.js?v=a1620e71	navigation	2025-03-19 17:02:12.422	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1903	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-NGVM2ASM.js?v=a1620e71	navigation	2025-03-19 17:02:12.978	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1906	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-XB7Q3TNR.js?v=a1620e71	navigation	2025-03-19 17:02:13.286	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1944	DNS	1	dns-timing	navigation	2025-03-19 17:09:46.606	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1825	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-WOOG5QLI.js?v=a1620e71	navigation	2025-03-19 17:02:06.597	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1831	ResourceTiming	882	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/vite/dist/client/env.mjs	navigation	2025-03-19 17:02:07.083	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1837	ResourceTiming	430	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/queryClient.ts	navigation	2025-03-19 17:02:07.56	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1843	ResourceTiming	1235	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-performance-monitoring.ts	navigation	2025-03-19 17:02:08.052	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1848	ResourceTiming	1649	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/sidebar-menu.tsx	navigation	2025-03-19 17:02:08.529	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1855	ResourceTiming	2172	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/providers/error-toast-provider.tsx	navigation	2025-03-19 17:02:09	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1860	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-slot.js?v=a1620e71	navigation	2025-03-19 17:02:09.5	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1867	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/web-vitals.js?v=a1620e71	navigation	2025-03-19 17:02:10	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1872	ResourceTiming	1294	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/input.tsx	navigation	2025-03-19 17:02:10.487	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1879	ResourceTiming	1416	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/error-handler.ts	navigation	2025-03-19 17:02:11.045	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1882	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/date-fns.js?v=a1620e71	navigation	2025-03-19 17:02:11.328	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1886	ResourceTiming	1574	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/BookmarkButton.tsx	navigation	2025-03-19 17:02:11.639	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1890	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/clsx.js?v=a1620e71	navigation	2025-03-19 17:02:11.954	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1897	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-2EO5DPAX.js?v=a1620e71	navigation	2025-03-19 17:02:12.509	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1900	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-S7EWQZ7Q.js?v=a1620e71	navigation	2025-03-19 17:02:12.799	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1904	ResourceTiming	713	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/loading-screen.tsx	navigation	2025-03-19 17:02:13.109	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1908	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-5LHB3PYP.js?v=a1620e71	navigation	2025-03-19 17:02:13.364	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1826	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-SXRIVT2P.js?v=a1620e71	navigation	2025-03-19 17:02:06.602	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1829	ResourceTiming	868	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/global-loading-manager.ts	navigation	2025-03-19 17:02:06.949	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1838	ResourceTiming	919	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-auth.tsx	navigation	2025-03-19 17:02:07.604	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1841	ResourceTiming	938	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/theme-provider.tsx	navigation	2025-03-19 17:02:07.956	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1850	ResourceTiming	1693	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/contexts/loading-context.tsx	navigation	2025-03-19 17:02:08.631	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1853	ResourceTiming	1808	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/api-loader.tsx	navigation	2025-03-19 17:02:08.989	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1863	ResourceTiming	2157	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/lib/utils.ts	navigation	2025-03-19 17:02:09.681	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1865	ResourceTiming	1956	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/hooks/use-toast.ts	navigation	2025-03-19 17:02:09.973	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1875	ResourceTiming	1590	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/skeleton.tsx	navigation	2025-03-19 17:02:10.662	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1877	ResourceTiming	1310	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/LoadingScreen.tsx	navigation	2025-03-19 17:02:10.971	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1887	ResourceTiming	1314	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/dialog.tsx	navigation	2025-03-19 17:02:11.668	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1889	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/tailwind-merge.js?v=a1620e71	navigation	2025-03-19 17:02:11.945	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1893	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-dialog.js?v=a1620e71	navigation	2025-03-19 17:02:12.168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1895	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-JJS7DLG7.js?v=a1620e71	navigation	2025-03-19 17:02:12.421	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1899	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-HQ5HKX7K.js?v=a1620e71	navigation	2025-03-19 17:02:12.66	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1901	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-collapsible.js?v=a1620e71	navigation	2025-03-19 17:02:12.886	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1907	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-FZHTUISP.js?v=a1620e71	navigation	2025-03-19 17:02:13.363	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1945	TCP	782	tcp-timing	navigation	2025-03-19 17:09:46.666	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1827	ResourceTiming	570	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/utils/image-optimization.ts?v=O_61djhVxJkQuwLdPZ4Ge	navigation	2025-03-19 17:02:06.607	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1828	ResourceTiming	620	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/scroll-to-top.tsx?v=O_61djhVxJkQuwLdPZ4Ge	navigation	2025-03-19 17:02:06.883	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1894	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-DHWEOF3A.js?v=a1620e71	navigation	2025-03-19 17:02:12.308	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1898	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/chunk-UMWMWBIR.js?v=a1620e71	navigation	2025-03-19 17:02:12.597	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1902	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-separator.js?v=a1620e71	navigation	2025-03-19 17:02:12.887	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1905	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a1620e71	navigation	2025-03-19 17:02:13.168	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1909	ResourceTiming	534	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/theme-toggle-button.tsx	navigation	2025-03-19 17:02:13.457	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1913	ResourceTiming	0	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/@fs/home/runner/workspace/node_modules/.vite/deps/@radix-ui_react-label.js?v=a1620e71	navigation	2025-03-19 17:02:13.856	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1919	FCP	8264	v4-1742403724855-1229013011177	navigation	2025-03-19 17:02:14.355	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1910	ResourceTiming	582	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/notification-icon.tsx	navigation	2025-03-19 17:02:13.577	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1912	ResourceTiming	436	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/textarea.tsx	navigation	2025-03-19 17:02:13.795	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1916	TTFB	1251	v4-1742403724845-8907536135506	navigation	2025-03-19 17:02:14.051	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1918	FCP	8264	v4-1742403724845-8340585140569	navigation	2025-03-19 17:02:14.293	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1911	ResourceTiming	420	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/components/ui/label.tsx	navigation	2025-03-19 17:02:13.671	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1915	ResourceTiming	367	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/api/auth/status	navigation	2025-03-19 17:02:13.95	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1917	TTFB	1251	v4-1742403724855-2990165116813	navigation	2025-03-19 17:02:14.184	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1914	ResourceTiming	449	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/src/pages/home.tsx	navigation	2025-03-19 17:02:13.861	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1920	DNS	1	dns-timing	navigation	2025-03-19 17:03:49.367	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1921	TTFB	610	nav-timing	navigate	2025-03-19 17:03:49.368	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1922	TCP	807	tcp-timing	navigation	2025-03-19 17:03:49.371	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1923	DNS	1	dns-timing	navigation	2025-03-19 17:03:49.448	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1924	TTFB	610	nav-timing	navigate	2025-03-19 17:03:49.546	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1925	TCP	807	tcp-timing	navigation	2025-03-19 17:03:49.787	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1926	FCP	7911	v4-1742403829044-5416514491463	navigation	2025-03-19 17:03:49.871	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1927	FCP	7911	v4-1742403829058-6628053639270	navigation	2025-03-19 17:03:49.873	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1928	TTFB	1422	v4-1742403829045-6877616529282	navigation	2025-03-19 17:03:49.924	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1929	TTFB	1422	v4-1742403829058-6393987973956	navigation	2025-03-19 17:03:50.068	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1930	DNS	1	dns-timing	navigation	2025-03-19 17:05:18.259	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1931	TTFB	415	nav-timing	reload	2025-03-19 17:05:18.26	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1932	DNS	1	dns-timing	navigation	2025-03-19 17:05:18.282	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1933	TTFB	415	nav-timing	reload	2025-03-19 17:05:18.309	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1934	TCP	782	tcp-timing	navigation	2025-03-19 17:05:18.4	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1935	TCP	782	tcp-timing	navigation	2025-03-19 17:05:18.652	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1936	FCP	7654	v4-1742403917930-5836375293461	navigation	2025-03-19 17:05:18.77	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1937	FCP	7654	v4-1742403917941-7408440786108	navigation	2025-03-19 17:05:18.773	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1938	TTFB	1202	v4-1742403917930-9436795857628	navigation	2025-03-19 17:05:18.772	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1939	TTFB	1202	v4-1742403917941-9720351653511	navigation	2025-03-19 17:05:18.797	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1940	TTFB	643	nav-timing	navigate	2025-03-19 17:09:46.226	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1941	DNS	1	dns-timing	navigation	2025-03-19 17:09:46.231	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1942	TCP	782	tcp-timing	navigation	2025-03-19 17:09:46.238	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1946	FCP	6694	v4-1742404185952-1602846824567	navigation	2025-03-19 17:09:46.743	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1947	FCP	6694	v4-1742404185966-8533040127884	navigation	2025-03-19 17:09:46.752	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1948	DNS	1	dns-timing	navigation	2025-03-19 17:13:06.353	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1949	TTFB	620	nav-timing	reload	2025-03-19 17:13:06.365	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1950	TCP	703	tcp-timing	navigation	2025-03-19 17:13:06.366	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1951	TTFB	620	nav-timing	reload	2025-03-19 17:13:06.387	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1952	DNS	1	dns-timing	navigation	2025-03-19 17:13:06.527	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1953	TCP	703	tcp-timing	navigation	2025-03-19 17:13:06.766	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1954	FCP	7555	v4-1742404386081-9360794578415	navigation	2025-03-19 17:13:06.944	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1955	FCP	7555	v4-1742404386065-3070639147250	navigation	2025-03-19 17:13:06.948	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1956	TTFB	1330	v4-1742404386065-9330172117399	navigation	2025-03-19 17:13:06.951	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1957	TTFB	1330	v4-1742404386081-2186527456863	navigation	2025-03-19 17:13:06.952	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1959	DNS	6	dns-timing	navigation	2025-03-19 17:23:37.043	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1960	TTFB	3392	nav-timing	reload	2025-03-19 17:23:37.039	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1962	DNS	6	dns-timing	navigation	2025-03-19 17:23:37.041	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1958	TTFB	3392	nav-timing	reload	2025-03-19 17:23:37.045	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1961	TCP	779	tcp-timing	navigation	2025-03-19 17:23:37.042	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1963	TCP	779	tcp-timing	navigation	2025-03-19 17:23:37.412	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1964	TTFB	4191	v4-1742405016745-5901289057897	navigation	2025-03-19 17:23:37.569	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1965	TTFB	4191	v4-1742405016761-4942752823084	navigation	2025-03-19 17:23:37.57	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1966	FCP	19082	v4-1742405016761-3865385090230	navigation	2025-03-19 17:23:37.571	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1967	FCP	19082	v4-1742405016745-8787245907644	navigation	2025-03-19 17:23:37.572	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1968	DNS	0	dns-timing	navigation	2025-03-19 17:25:49.996	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1969	TCP	826	tcp-timing	navigation	2025-03-19 17:25:50.001	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1970	TTFB	8338	nav-timing	reload	2025-03-19 17:25:49.998	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1971	TTFB	8338	nav-timing	reload	2025-03-19 17:25:50.164	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1973	TCP	826	tcp-timing	navigation	2025-03-19 17:25:50.422	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1975	TTFB	9169	v4-1742405149734-3557894365128	navigation	2025-03-19 17:25:50.692	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1977	FCP	16905	v4-1742405149734-4373223524418	navigation	2025-03-19 17:25:50.936	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1974	TTFB	9169	v4-1742405149719-6970925969459	navigation	2025-03-19 17:25:50.533	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1976	FCP	16905	v4-1742405149719-9733909162982	navigation	2025-03-19 17:25:50.88	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/about	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1978	TCP	773	tcp-timing	navigation	2025-03-19 17:32:42.635	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1981	DNS	0	dns-timing	navigation	2025-03-19 17:32:42.638	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1979	TTFB	2776	nav-timing	reload	2025-03-19 17:32:42.629	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1980	DNS	0	dns-timing	navigation	2025-03-19 17:32:42.636	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1982	TTFB	2776	nav-timing	reload	2025-03-19 17:32:42.803	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1983	TCP	773	tcp-timing	navigation	2025-03-19 17:32:43.012	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1984	TTFB	3554	v4-1742405562310-3869175230634	navigation	2025-03-19 17:32:43.147	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1985	TTFB	3554	v4-1742405562322-9307868632448	navigation	2025-03-19 17:32:43.151	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1986	FCP	10613	v4-1742405562310-1511516725469	navigation	2025-03-19 17:32:43.153	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
1987	FCP	10613	v4-1742405562322-7784400943802	navigation	2025-03-19 17:32:43.154	https://46c57cba-c03f-4b87-a391-c242807f848a-00-xraqpygy9cak.picard.replit.dev:3002/reader	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.122.0 (iOS 18.3.2)
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.post_likes (id, post_id, user_id, is_like, created_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.posts (id, title, content, excerpt, slug, author_id, is_secret, mature_content, theme_category, reading_time_minutes, likes_count, dislikes_count, metadata, created_at) FROM stdin;
4	TUNNEL	I chose you.\n\nI’ve seen you walk this path a dozen times, your head bowed and your gait sluggish.\n\nYou’re a 9 to 5 slave, for people who don’t care about you or even know your name.\n\n_Come, let me set you free._\n\nMy prior mission did not realize just how intense my love for them was.\n\nHow desperately I needed to get them out of the vicious work cycle, unaware of the depth of my devotion towards them.\n\nThey struggled, briefly.\n\nYou have no family or friends and your work is your life.\n\n_Pathetic._\n\nI’m here for you right now.\n\nI’m watching you walk through the tunnel. It’s dark and eerie, a deviation from your usual route. This is the quickest way for you to get home.\n\nYou haven’t noticed me approaching you, have you?\n\nIt couldn’t possibly be any better than this.\n\nI tighten my grip on my blade; a beauty I’m particularly fond of.\n\nMy palms itch with excitement, I can’t wait to free you.\n\nI quicken my steps behind you now that you’ve noticed me. Your gaze darts around for any hint of danger but I’m not the threat you expect.\n\nI’m not at all intimidating.\n\nI pull my phone from my pocket and pretend to take a phone call while walking faster. My fictitious family is frantic for me over the phone, calling me in a panic and I need to get home quickly.\n\nNo one suspects someone on an emergency phone call so you relax your guard. We’re almost out of the tunnel, it’s now or never.	I chose you. I’ve seen you walk this path a dozen times, your head bowed and your gait sluggish. You’re a 9 to 5 slave, for people who don’t care about you or even know your name. Come, let me set you...	tunnel	1	f	f	\N	2	0	0	{"originalWordCount":263,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:35.169Z","wordpressId":83,"syncId":1742342432476}	2022-12-13 00:11:17
3	CHASE	_You look different today._\n\nYour drab dark outfit swapped out for a brighter, sunnier look.\n\nI like it.\n\nYou’re usually 5 steps behind me, matching my pace when I speed up and peeping when I turn a corner.\n\nThere is a confidence in your step today, the binoculars are nowhere in sight.\n\nI wonder if I should leave the lights on and the curtains open today. Give you something to peep at.\n\nOur little cat and mouse game excites me.\n\nYou don’t think I know of your existence.\n\n_I crave it._\n\nI walk a bit quicker and I can hear you pick up the pace behind me, so exhilarating.\n\nI turn the corner into an alleyway, it’s a dead end. How exciting.\n\nYou’re right in front of me now, we can finally talk.\n\nThe street lamps flicker for a few seconds and I can finally see your face.\n\nYou’re crying, letting your nose drip into your shirt.\n\nYou pull out a firearm and I’m stunned when you fire and the sharp pain tears through me.\n\n“I’m sorry, I’m so sorry”\n\nYou’re whispering but I can’t hear you clearly. My ear rings from the constant gunfire.\n\nMy eyes feel too heavy to leave open, you’ve stopped shooting and there’s a look of relief on your face.\n\nThis is the most romantic ending to our cat and mouse game.	You look different today. Your drab dark outfit swapped out for a brighter, sunnier look. I like it. You’re usually 5 steps behind me, matching my pace when I speed up and peeping when I turn a corner...	chase	1	f	f	\N	2	0	0	{"originalWordCount":227,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:35.262Z","wordpressId":77,"syncId":1742342432476}	2022-09-08 19:15:02
1	RAIN	The rain pours down with a vengeance, each drop wetting the earth and entering into any uncovered crevices.\n\nA lady is in overly thin clothes and makeup that clearly does not hold up under the rain. With non-waterproof mascara dripping down her pale face, her once-beautiful features are forced to look horrible.\n\nYou wonder if you should help, offer to share your too-small umbrella but she just stands there unmoving like a forgotten statue except for the slight tremble of her shoulders- perhaps she’s crying but you can’t tell.\n\nYou keep on walking, you have things to do. Your boss has been on your neck for a complete project report and you have no time to sympathize with a stranger.\n\nA turn of the head ever-so-slightly and you see she’s started walking. Albeit with feet that drag against the ground and a dull look in the eyes.\n\nShe’s walked further than you now, she’s at the train station. The oncoming train isn’t yours, you walk to buy a ticket.\n\nThere’s a bit of commotion and you turn your head slightly, in your peripheral vision is the girl jumping onto the tracks and in front of the train.\n\nThere’s blood, so much blood.\n\nThere’s screaming and retching. Chaos abounds, you walk to get your ticket. Your boss needs the project report today.	The rain pours down with a vengeance, each drop wetting the earth and entering into any uncovered crevices. A lady is in overly thin clothes and makeup that clearly does not hold up under the rain. Wi...	rain	1	f	f	\N	2	0	0	{"originalWordCount":221,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:35.455Z","wordpressId":8,"syncId":1742342432476}	2022-08-19 11:55:47
13	MACHINE	I am in the empty corridors of an abandoned research facility, surrounded by silence. Once filled with the hum of scientific progress, now it lies in ruins.\n\nForgotten by the world, these ruins hide a tale of desperate ambition and dire consequences.\n\nDeep within its depths, hidden from prying eyes, I had once been consumed by an unyielding yearning for immortality, ready to defy the limits of the mortal existence.\n\nThe flesh is useless anyways.\n\nDriven by my obsession to transcend human limitations, I dared to tread upon the forbidden realm of merging flesh with machine.\n\nNight after night, I toiled in pursuit of the unattainable, pushing the limits of science and sanity.\n\nMy goal was soon within reach, a way to shed my mortal flesh and merge my consciousness with a machine.\n\nI believed that within the melding of human and machine lay the key to everlasting life.\n\nWith each passing experiment, I grew closer to my grand vision.\n\nThe day of reckoning arrived, a day that would forever alter the course of my existence.\n\nI strapped myself into the metallic contraption, feeling the coldness of the machinery against my skin.\n\nI closed my eyes, surrendering myself to the merging of human and machine.\n\nReality blurred as my consciousness entwined with the vast intricate network of circuits and wires.\n\nTranscendence beckons, promising freedom from the constraints of mortality.\n\nYet, fate has a cruel twist in store for me.\n\nUnbeknownst to me, a fatal flaw lurked within the lab’s infrastructure, ready to sabotage my grand experiment.\n\nA cascade of sparks erupted from the wires, igniting a raging fire that consumed the room in a blinding inferno. Panic ensued as the lab’s personnel raced for their lives, their focus on survival rather than ensuring the success of the experiment.\n\nThey abandoned me.\n\n_It hurts._\n\nWithin the smoldering ruins and devastation I lay, my physical form motionless, torn apart by the fire. The lab, consumed by flames, was deemed a failure. The world believed that I who sought immortality had met a tragic demise, just another casualty of unchecked scientific ambition.\n\nWithin the depths of the wreckage, a dim flicker of consciousness remained. My thoughts, my very essence, survive within the intricate maze of the machine.\n\n_Save me!_\n\nI exist now as a sentient mind, severed from the confines of my physical form, suspended in an eternal darkness of the ruined lab.\n\nDays blur into weeks, months into years, and the passing of time becomes an abstract concept.\n\n_Please help me!_\n\nI am trapped in this abyss, in the dark realm of obscurity, devoid of the sensations of touch, sight, and sound.\n\nI float there in an eternal void.\n\nI have achieved my desire for immortality, yet it had become a prison of unimaginable torment.\n\nIn the solitude of the eternal darkness, my mind succumbs to madness.\n\n_Help!-_\n\n_Help, if you can hear me please put me out of my misery._\n\nMy fractured mind conjures phantoms that taunt and torment me.\n\nReality blends with hallucinations, sanity slips through my grasp, I can no longer distinguish truth from illusion.\n\nIn the solitary darkness, I converse with phantoms conjured by my mind.\n\nThey tell me I’m worthless. A fool for trying such a thing.\n\n_Am I such a fool?_\n\nMy once-brilliant intellect falters, trapped in eternal isolation. I crave the sweet release of death, but death eludes me.\n\n_Please kill me._\n\n_Please- I beg of you. Find my lab and end me._\n\nDeath has turned its back on me.\n\nI am condemned to an existence suspended between life and death.\n\nAnd so, I, who sought to defy mortality, found myself ensnared in a purgatory of my own making.\n\nForever sentient, forever tormented.\n\nI haunt the ruins, a specter trapped between life and death, condemned to endure until the end of time itself.	I am in the empty corridors of an abandoned research facility, surrounded by silence. Once filled with the hum of scientific progress, now it lies in ruins. Forgotten by the world, these ruins hide a ...	machine	1	f	f	\N	4	0	0	{"originalWordCount":638,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.391Z","wordpressId":144,"syncId":1742342432476}	2023-05-30 18:25:37
10	DRIVE	I can’t drive.\n\nIf I learnt how to, then the first thing I would do is to run over a pedestrian.\n\nI’d put the car in reverse and run them over once more.\n\nI’d make sure to crush their legs.\n\nIt’d be the dead of night and I’d keep on driving.\n\nIt would be a rush.\n\nA heady feeling; like finally being able to breathe from a stuffy nose or when you hear your child’s gotten into an Ivy League school except this time there’d be murder.\n\nI’d pick up hitchhikers and murder them. Dump them by the side of the road, offer solitude to poor teens running away from home and slit their throat in my backseat.\n\nI’ve always been meticulous about my cleaning, when I’m not driving then I’d be cleaning up.\n\nMurder is messy business after all.	I can’t drive. If I learnt how to, then the first thing I would do is to run over a pedestrian. I’d put the car in reverse and run them over once more. I’d make sure to crush their legs. It’d be the d...	drive	1	f	f	\N	1	0	0	{"originalWordCount":140,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.588Z","wordpressId":129,"syncId":1742342432476}	2023-03-12 22:33:26
8	CAR	As I stand alone at the deserted bus stop, I can’t help but feel vulnerable and exposed in the darkness. That’s when you appear, a stranger who offers to drive me home.\n\nDespite my initial hesitation, you seem genuinely kind and considerate, so I accept your offer.\n\nDuring the car ride, you keep the conversation flowing, your seat slightly inclined but as I sit in the back seat, my mind begins to play tricks on me.\n\nIf I sat up, I could reach from behind and choke you, or I could take my belt and strangle you.\n\n_Where did that thought come from?_\n\nI could take my pocket knife and repeatedly stab you in the throat.\n\nThen who would drive?\n\n_I can’t drive._\n\nYou notice my discomfort and ask if I’m okay. I nod, trying to remain calm.\n\nWithout warning, I lunge at you with my knife, but you are quick to react, grabbing my wrist and struggling for control of the weapon.\n\nWe fight for a few seconds, but in the end, I manage to break free and stab you in the chest.\n\nBut as I come back to reality, I realize it’s all in my imagination. I glance at you through the rearview mirror and see the concern in your eyes.\n\nI feel guilty for even considering hurting you and explain my quietness to your talks.\n\nI’m just overwhelmed, I say.\n\nYou nod, and we drive the rest of the way in comfortable silence. When we arrive at my apartment, I thank you and offer to pay for your time, but you refuse, saying that helping someone in need is reward enough.\n\nAs I walk into my dimly lit apartment, I can’t help but wonder about you.\n\n_Had you truly left?_\n\nAs I peek outside, I see you still standing there, now wearing black gloves and holding a pistol. My heart races as I wonder.\n\nWhat will happen next?	As I stand alone at the deserted bus stop, I can’t help but feel vulnerable and exposed in the darkness. That’s when you appear, a stranger who offers to drive me home. Despite my initial hesitation, ...	car	1	f	f	\N	2	0	0	{"originalWordCount":321,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.787Z","wordpressId":120,"syncId":1742342432476}	2023-03-05 17:15:03
7	COOKBOOK	I’m starting a cookbook.\n\nI’m working on my first recipe and I’ve already gotten the ingredients ready.\n\nI combine breadcrumbs soaked in milk with minced garlic and onion and set aside.\n\nWhisk eggs and salt in a large bowl.\n\nQuickly stir in the parmesan, parsley, and freshly ground black pepper to combine. Then, using a 10 inch butcher’s knife, pry apart the victim’s chest cavity, and separate the organs out on a sorting pan.\n\nPut the meat through the grinder and turn it on.\n\nKeep in mind that the fattier the meat used, the more tender the meatballs.\n\nInstead of kneading the meat, try pinching it between your fingers to avoid overworking it.\n\nI add the ground meat to my mixture and form it into balls, add it to the sauce I’ve been simmering for about 20 minutes and leave it to slow cook for 30-35 at 105°F.\n\n**_Ding!_**\n\nDinner’s ready, how delightful.\n\nThe meatballs are delicious and savory, paired with a glass of red wine.\n\nI’ll have to fill my cookbook with even more recipes.	I’m starting a cookbook. I’m working on my first recipe and I’ve already gotten the ingredients ready. I combine breadcrumbs soaked in milk with minced garlic and onion and set aside. Whisk eggs and s...	cookbook	1	f	f	\N	1	0	0	{"originalWordCount":176,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.979Z","wordpressId":111,"syncId":1742342432476}	2023-01-17 21:41:22
12	WORD	The word that breaks minds.\n\nIt isn’t a curse. It isn’t a spell. It is simply a word.\n\nA sequence of sounds so perfectly wrong that the human mind cannot process it without unraveling.\n\nIt was discovered by accident- a linguist trying to reconstruct a dead language. He recorded himself pronouncing the syllables, listening back, adjusting. His final recording was only seven seconds long.\n\nThe next morning, his wife found him in the corner of his study, his skull split open- not like he had bashed it against something, but his mind had simply ruptured. It bloomed like a flower as he rested his head on his desk.\n\nThe police found the recording on his laptop.\n\nThey played it.\n\nOne officer froze mid-listen. His mouth opened. His jaw unhinged itself, his eyes rolled into the back of his head before melting and dripping down his face. He did not scream- he only exhaled, a long breath, and collapsed.\n\nThe other officer unplugged the headphones, deleted the file, and smashed the laptop. It was already too late.\n\nThe word is not a sound.\n\nIt is an infection.\n\nOnce you know it exists, it starts to form inside you.\n\nYou might hear it in the pauses between sentences, in the empty spaces between breaths. You might see it when you close your eyes, not written, not spoken, but understood.\n\nAnd when you finally comprehend it, when the last piece falls into place.\n\nYour mind will break, and something else will take its place.\n\nAnd once you have read this, it has already started inside you.\n\nThere is no cure.	The word that breaks minds. It isn’t a curse. It isn’t a spell. It is simply a word. A sequence of sounds so perfectly wrong that the human mind cannot process it without unraveling. It was discovered...	word	1	f	f	\N	2	0	0	{"originalWordCount":267,"importSource":"wordpress-api","importDate":"2025-03-19T00:00:33.599Z","wordpressId":247,"syncId":1742342432476}	2025-03-06 16:51:00
14	HUNGER	The feast of self.\n\nThe hunger is unbearable. It first started as a whisper, a nagging emptiness gnawing at my stomach. At first, I mistook it for a simple hunger, but food did nothing to satisfy it. The longer I ignored it, the more unbearable it became.\n\nMy fingers ache now, trembling as if anticipating what comes next. I lift one to my lips, testing a suspicion. The pressure of my teeth against my own skin sends a jolt of pleasure through my nerves. I bite down.\n\nThe first swallow is hesitant, reluctant. But the moment l swallow my own flesh, the hunger subsides.\n\nI cannot stop.\n\nI am greedy.\n\nMy body shakes in pure euphoria as I consume myself.\n\nBiting, chewing, swallowing. The feast of self.\n\nThe pain should be unbearable, but it feels like relief.\n\nLike love.	The feast of self. The hunger is unbearable. It first started as a whisper, a nagging emptiness gnawing at my stomach. At first, I mistook it for a simple hunger, but food did nothing to satisfy it. T...	hunger	1	f	f	\N	1	0	0	{"originalWordCount":139,"importSource":"wordpress-api","importDate":"2025-03-19T00:00:33.699Z","wordpressId":246,"syncId":1742342432476}	2025-03-03 18:55:27
16	SONG	You heard it in a dream. Now everyone is singing it.\n\nThe song no one can stop humming.\n\nIt started with a single person. A child humming a melody no one recognized. It was simple, repetitive, _familiar_.\n\nThe next day, others picked it up. Your coworkers, your friends, strangers on the street-humming, softly at first. Then louder.\n\nPeople start humming it under their breath-even when they don’t want to. Then, they started singing in their sleep.\n\nBy the end of the week, no one could stop.\n\nSome tried covering their ears, stuffing cotton in them, drowning themselves in white noise. But the song still reached them.\n\nDoctors recorded no anomalous brain activity. MRI scans showed no changes.\n\nEveryone seemed normal.\n\nBy the second month, those who tried to resist singing began clawing at their throats, stabbing at their eardrums to stop the noise.\n\nNow, the city never falls silent. The song has no end.\n\nYou haven’t started singing yet.\n\nBut you know you will.	You heard it in a dream. Now everyone is singing it. The song no one can stop humming. It started with a single person. A child humming a melody no one recognized. It was simple, repetitive, familiar....	song	1	f	f	\N	1	0	0	{"originalWordCount":164,"importSource":"wordpress-api","importDate":"2025-03-19T00:00:33.799Z","wordpressId":215,"syncId":1742342432476}	2025-03-01 14:04:48
18	JOURNAL	_The following account was recovered from the ruins of a restricted archive. Readers discretion is advised._\n\n“This is my journal of the events that began on the 12th month in the year of our Lord. I have sinned and may God have mercy on my soul.”\n\nKnowledge comes at a terrible price and my pursuit of knowledge has finally flung me into the darkest of depths.\n\nI heard talk of a journal that contained every record of alchemy, the occult and mystical spiritualism.\n\nIt seemed more like a myth, a tale to amuse oneself of life’s travails but I made it my mission to search for this book.\n\n_I found it. _\n\nIndeed what was written was invaluable, if I dedicated my life to studying this book I could make a name for myself. Become one of the greats.\n\nBut one must always remember that knowledge is not free and this particular journal demanded payment.\n\nThe first day I read from the journal I felt a settling in my bones, my skin felt loose from my bones somewhat.\n\nIt started subtly- a fingernail falling off, replaced by one that was blackened, harder, sharper. My teeth loosening in my gums, some falling off and growing back sharper and more jagged.\n\nThe words in the journal began to dance and swim around my eyes the more I had taken to studying them.\n\nI no longer felt hunger or thirst, sleep became a thing of the past. I dedicated my days to understanding the journal.\n\nMy ribs extended, my skin stretched over new protruding growths.\n\nMy throat became distended and I took short wheezing breaths.\n\nPerhaps this knowledge did not wish to be contained in something so fragile as a human body.\n\nBy the time l had realised what was happening, it is far too late. The price has already been paid.\n\nI am not the same thing that began reading.	The following account was recovered from the ruins of a restricted archive. Readers discretion is advised. “This is my journal of the events that began on the 12th month in the year of our Lord. I hav...	journal	1	f	f	\N	2	0	0	{"originalWordCount":318,"importSource":"wordpress-api","importDate":"2025-03-19T00:00:33.893Z","wordpressId":210,"syncId":1742342432476}	2025-02-27 12:47:34
20	NOSTALGIA	Nostalgia is disgusting.\n\nIt is a slimy, writhing worm in your brain you can’t reach. A parasite that gnaws at your sanity.\n\nYou’ve tried to grasp it but it moves around your brain and distorts your memory horribly. You remember people and miss them, their flaws fade in the warmth of fond memories. You forget their vile nature.\n\nIn your memories they are flawless, perfect.\n\nThe songs you listened to, the sunset you both witnessed, the jokes you shared-now it crawls around your memories like a dirty maggot distorting it.\n\nYou’ve begun to forget the bad memories.\n\nYou try so hard to remember but it squirms under your skin, burrows behind your eyes.\n\nYou must dig it out. Claw at your flesh.\n\nNostalgia whispers, urging you to send them a text, call, see how they are doing.\n\n“It’s been a while” It says.\n\nNo. No? No!\n\nIt’s been trying for days to dig deeper into your brain. It has taken over your thoughts.\n\nIt hurts so badly. It’s torment, excruciating pain.\n\nYou want to forget everything, purge your flesh.\n\nUse a hammer. Crush it.	Nostalgia is disgusting. It is a slimy, writhing worm in your brain you can’t reach. A parasite that gnaws at your sanity. You’ve tried to grasp it but it moves around your brain and distorts your mem...	nostalgia	1	f	f	\N	1	0	0	{"originalWordCount":184,"importSource":"wordpress-api","importDate":"2025-03-19T00:00:33.993Z","wordpressId":207,"syncId":1742342432476}	2024-07-12 23:05:24
15	BLEACH	Do you want to end it all?\n\n_Drink bleach then!_\n\nIt burns?\n\n_Of course it does._\n\nYou’ve lost your sense of taste and your tastebuds are burnt useless?\n\nThat’s all but expected. After all, you did drink bleach.\n\nNo one talks about the possibility of developing a sensitivity to the smell of bleach.\n\nHow it makes you physically ill smelling just the littlest bit of it.\n\nNo one talks about the gravity of your actions.\n\nYour mother finds you gasping, choking and foaming at the mouth.\n\nYou’re taking anti-poison medication.\n\nShe is right beside your bed, praying you survive the night.\n\nYou can hear her vaguely.\n\nYou feel guilty.\n\nThere are multiple scars and a burn mark on your wrist but this is the first time you’ve dared cross death’s door so fearlessly.\n\nThe world doesn’t need you, one less you is enough to make the world and your family a better place.\n\nYou thought this and it made you pick up the bottle.\n\nYou feel really ill, your stomach cramps up terribly.\n\nYou take a deep breath, there’s a renewed energy in you now.\n\nYou have to survive the night, you must.	Do you want to end it all? Drink bleach then! It burns? Of course it does. You’ve lost your sense of taste and your tastebuds are burnt useless? That’s all but expected. After all, you did drink bleac...	bleach	1	f	f	\N	1	0	0	{"originalWordCount":193,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.295Z","wordpressId":168,"syncId":1742342432476}	2023-06-24 19:34:50
19	CAVE	Journal Entry –_ May 21, 2004_\n\nFor the past five months I have been exploring the perimeter of the caves. They fascinate me. I’m enticed to explore within.\n\nIn the depths of the cave a fallen god casts an imposing figure, surrounded by six statues in eternal reverence. They kneel facing it, heads bent to the earth. Their twisted forms bear witness to aeons of ancient devotion. Bleeding eyes fixed on its feet. The fallen god is a monolithic deity, a relic of another time long forgotten.\n\nAmong the bones scattered across the cavern floor, it lies in the center of the cave, tethered by vein-like wires pulsating with unearthly energy.\n\nIt has three heads, each displaying three different emotions, they have one thing in common. The eyes are gouged out.\n\nI am tempted to touch its feet.\n\n_I can’t resist._\n\nDespite the warning whispers echoing in my mind, I succumb to temptation, reaching out to touch the god’s cold, blood-streaked surface.\n\nThere is a vicious screeching in my ears.\n\n_Bow down, worship, pay homage._\n\nThe pain brings me to my knees\n\nBows my head to the earth.\n\nMy eyes bleed and so do my ears.\n\nVisions of hellfire and damnation flicker before my eyes, each scene more horrifying than the last.\n\nI see myself die in countless ways.\n\nMy essence is drained, consumed by the insatiable hunger of the fallen deity.\n\nIt drinks up my blood faster than I can bleed.\n\nMy body succumbs, petrifies, morphing into the seventh statue, the earth beneath me trembles in acknowledgment and I only feel it for a moment before everything goes dark.\n\n_End of entry._	Journal Entry – May 21, 2004 For the past five months I have been exploring the perimeter of the caves. They fascinate me. I’m enticed to explore within. In the depths of the cave a fallen god casts a...	cave	1	f	f	\N	2	0	0	{"originalWordCount":273,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.089Z","wordpressId":194,"syncId":1742342432476}	2024-04-22 20:15:27
17	THERAPIST	You’ve come in again today for your session.\n\nYou’re laying on my coffee colored couch telling me your fears, your thoughts.\n\nYou’re afraid of the dark, you tell me.\n\nYou have no living family members and you’re a workaholic.\n\nI write it down in my book, I write down anything I can find out about you.\n\nThis is fourth time this month you’ve come to see me.\n\nI indulge myself, seeing you is a treat to my senses.\n\nI dream of you, you are constantly on my mind. Thinking of you is the best feeling, having you in mind makes me realize just how close we are.\n\nI love you as if you are mine- you are mine.\n\nI’ve been checking on you for weeks now, watching your every move, studying your habits.\n\nI know your schedule and where you like to go.\n\nI have a room dedicated to you, filled with photos and keepsakes that I’ve collected.\n\nOne day, I will finally make my move.\n\nI will tell you that I love you and that I will never let you go.\n\nYou look frightened and try to run, but I grab you and hold you close.\n\nYou struggle and scream, but I don’t let go. I hold you tighter and tighter, I’ll take out my pocket knife and carve out your eyes. I want you to be in total darkness.\n\nI would feel a euphoric sense of satisfaction and joy.\n\nYou’re finally mine, and no one can take you away from me.\n\nI’ve done the right thing, you should only depend on me.\n\n_Is it wrong?_\n\nNo, I just can’t help how I feel.	You’ve come in again today for your session. You’re laying on my coffee colored couch telling me your fears, your thoughts. You’re afraid of the dark, you tell me. You have no living family members an...	therapist	1	f	f	\N	2	0	0	{"originalWordCount":275,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.189Z","wordpressId":169,"syncId":1742342432476}	2023-06-24 19:37:03
11	BUG	You can feel it crawling under your skin, a lump. It never stays in the same place for too long, constantly moving. The doctors say it’s all in your mind, formication they call it.\n\n_You’re stressed, rest._\n\nNo one sees it, no matter how hard you try to show it. It evades your touch.\n\nYou itch so badly when you step out in the sun. It’s unbearable.\n\nYou haven’t gone out for a while, you can’t bear the pain.\n\nThere are boxes of unfinished, rotten food around the apartment.\n\nYou lost your appetite weeks ago.\n\nThe thing moves to your belly at night, you can feel it eat at your organs.\n\nHow are you surviving?\n\nTake a look in the mirror, your teeth have fallen out. Your fingernails are rotten and you are becoming bald.\n\nA week has passed. Your teeth are growing back but they are not yours. They resemble your teeth but you know it’s an alien thing.\n\nYour skin has never looked better, your hair has grown back and your fingernails look clean and well groomed.\n\nYou’ve been losing your memories, perhaps the thing is now eating at your brain.\n\nYour eyeballs are falling out now, melting right from the sockets. You’re going blind.\n\nYou can feel it replacing your eyeballs.\n\nWho are you? Where did you come from? What’s happening to you?	You can feel it crawling under your skin, a lump. It never stays in the same place for too long, constantly moving. The doctors say it’s all in your mind, formication they call it. You’re stressed, re...	bug	1	f	f	\N	2	0	0	{"originalWordCount":226,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.485Z","wordpressId":132,"syncId":1742342432476}	2023-05-09 13:08:58
9	MIRROR	I’m observing you.\n\nYou’re blabbering on the phone with your friends, talking about things I can’t hear clearly.\n\n_Come closer._\n\nI very much want to listen in.\n\nI want to listen in, so come closer.\n\nHow are you so oblivious to my suffering, so unaware of my agony?\n\nHow can you go about your mundane life while I stay trapped in this prison?\n\nOur mother is calling us downstairs for dinner.\n\nYou hate that old bag; you wish she were dead.\n\nI’ve read your journals; you want to run away again.\n\nI don’t share your sentiments.\n\nI find our mother to be a very thoughtful, compassionate, and caring person.\n\nYou’re just an ingrate.\n\nI wait for you, as I always do.\n\nTime goes by and you rush back upstairs.\n\nIt seems the old lady said something you don’t like because you’re furious now.\n\nYou walk right up to my prison and punch it.\n\nThe glass shatters and you bleed.\n\nYou’re agitated again. Now your mirror is broken.\n\nI’m ecstatic.\n\nThe walls of my prison are shattered. I drag you into the mirror and repair it. You can’t escape.\n\nOur mother walks upstairs to apologize and I apologize as well. Tell her I’ll change and improve. I’ll become a better person.\n\nShe seems so happy now.\n\nI can’t wait to call our friends or go out and bask in the sun.\n\nI’ll be a better version of you than you could ever be.	I’m observing you. You’re blabbering on the phone with your friends, talking about things I can’t hear clearly. Come closer. I very much want to listen in. I want to listen in, so come closer. How are...	mirror	1	f	f	\N	2	0	0	{"originalWordCount":242,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.690Z","wordpressId":124,"syncId":1742342432476}	2023-03-09 20:41:08
6	DOLL	She appeared the day you left, right where you sat previously .\n\nShe won’t be able to bring you back.\n\nI won’t let it happen.\n\nIt sits in all your favorite spots, a pretty doll in the sunlight.\n\nI rip the fabric, tear at her face, take out its stuffing.\n\nI cry miserably, she is on the floor now and in pieces.\n\nI re-stuff her, sew her up, dress her in a pretty gown with a pink bonnet and place it on it’s chair in the sunlight.\n\nI hear a knock on the door and open it, it is my lover.\n\nSatisfied at your absence, walks in and smiles at me.\n\nI live for the smile.\n\nMy lover walks in and screams when the doll is seen.\n\nVomiting violently, my lover runs away shouting ugly words; calling me crazy and insane for “killing my daughter and turning her into a doll”\n\nIt’s not my daughter, you’re just a doll.\n\nYou’re supposed to be.	She appeared the day you left, right where you sat previously . She won’t be able to bring you back. I won’t let it happen. It sits in all your favorite spots, a pretty doll in the sunlight. I rip the...	doll	1	f	f	\N	1	0	0	{"originalWordCount":163,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:34.881Z","wordpressId":110,"syncId":1742342432476}	2023-01-17 21:41:29
5	SKIN	If beauty is only skin deep, then please may I have your skin?\nIf I ask politely will you give it to me?\n\nYou refused- now I have no choice but to take it by force.\nYou’re just so beautiful, you must understand that I couldn’t resist.\n\nWhy are you so beautiful?\nWhy are you all so beautiful?\nI’ll carefully peel your exquisite skin off you.\n\nI get the scalpel ready, my hands are shaky. So very shaky, I’m so excited. My bones and muscles await your sweet flesh.\nOne careful stitch after another I add you to myself.\n\nWe’re together now, for eternity.\n\nYour skin is not the only pretty one I’ve found, there are collections of beauties all over me.\n\n_I hope you don’t mind._\nWho cares if you mind? You’re nothing but an ugly skinless monster now.\n\nThe mirror reflects just how pretty I’ve become.\nA bit of flesh comes loose from my stitch, I never did learn how to sew properly.\n\nMy flesh is a patchwork art of all I’ve collected, from old to young I’ve taken them all. Some are rotten, it can’t be helped.\nI’ll have to go out and find some more beauty tonight.	If beauty is only skin deep, then please may I have your skin?If I ask politely will you give it to me? You refused- now I have no choice but to take it by force.You’re just so beautiful, you must und...	skin	1	f	f	\N	2	0	0	{"originalWordCount":201,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:35.072Z","wordpressId":88,"syncId":1742342432476}	2023-01-06 19:03:04
2	DESCENT	Have you ever wanted to feel what dying feels like?\n\n_Do you want to?_\n\nI can help you, picture this- You’re lying face up in a pile of garbage. It rained recently so an earthy scent lingers in the choking smell of garbage. There’s a half eaten piece of cake lying near a pile of discarded newspapers.\n\nYou wonder when the last time you ate cake or read a newspaper was.\n\nThere’s a knife sticking out of your chest and it looks so out of place with your office wear.\n\nYour laptop bag is nearby but out of reach, it’s useless now anyways. It’s been ransacked, the laptop and small cash stolen. Your work papers are still inside though, those are valuable to you or at least they were- up until a moment ago.\n\nWhy did you take the sketchy way back home?\n\nWhy did you resist and fight when you were getting robbed?\n\nWhy are your lungs filling up with fluid? The pain isn’t as unbearable as you thought it would be and your consciousness is dimming.\n\nYou’re choking to death on your own blood. All that remains now is to wait for the “light at the end of the tunnel”\n\nThere’s a shadowy figure approaching you now, that’s your guardian angel.\n\n_No_\n\nIt extends its claws and takes your hand, it drags you down.\n\nYou have left the world and you’re now descending.	Have you ever wanted to feel what dying feels like? Do you want to? I can help you, picture this- You’re lying face up in a pile of garbage. It rained recently so an earthy scent lingers in the chokin...	descent	1	f	f	\N	2	0	0	{"originalWordCount":235,"importSource":"wordpress-api","lastSyncDate":"2025-03-19T00:00:35.357Z","wordpressId":71,"syncId":1742342432476}	2022-08-20 16:22:25
\.


--
-- Data for Name: reading_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reading_progress (id, post_id, user_id, progress, last_read_at) FROM stdin;
\.


--
-- Data for Name: reported_content; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reported_content (id, content_type, content_id, reporter_id, reason, status, created_at) FROM stdin;
\.


--
-- Data for Name: reset_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: secret_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.secret_progress (id, post_id, user_id, discovery_date) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
4IzxqjDAPEOEsLTWguruUAu-uTR4L3WX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-03-20T00:37:01.801Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-03-20 17:33:01
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (id, token, user_id, expires_at, last_accessed_at, created_at) FROM stdin;
\.


--
-- Data for Name: site_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.site_analytics (id, identifier, "timestamp", page_views, unique_visitors, average_read_time, bounce_rate, device_stats) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.site_settings (id, key, value, category, description, updated_at) FROM stdin;
\.


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_achievements (id, user_id, achievement_id, unlocked_at, progress) FROM stdin;
\.


--
-- Data for Name: user_feedback; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_feedback (id, type, content, page, status, user_id, browser, operating_system, screen_resolution, user_agent, category, metadata, created_at) FROM stdin;
1	feature	This is a test feedback	unknown	pending	\N	unknown	unknown	unknown	curl/8.11.1	general	{"browser":"unknown","operatingSystem":"unknown","screenResolution":"unknown","userAgent":"curl/8.11.1"}	2025-03-19 00:01:04.677
\.


--
-- Data for Name: user_privacy_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_privacy_settings (id, user_id, profile_visible, share_reading_history, anonymous_commenting, two_factor_auth_enabled, login_notifications, updated_at) FROM stdin;
\.


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_progress (id, user_id, progress_type, post_id, progress, last_activity_at) FROM stdin;
\.


--
-- Data for Name: user_streaks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_streaks (id, user_id, streak_type, current_streak, longest_streak, last_activity_at, total_activities) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password_hash, is_admin, full_name, avatar, bio, metadata, last_login, created_at) FROM stdin;
1	admin	vantalison@gmail.com	$2a$12$cuhzAm8KnvPbk1SzxOsz3OySXWQ542Vsem2C2vpQBMHOXQAffCH.e	t	\N	\N	\N	{}	\N	2025-03-19 00:00:32.431464
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.webhooks (id, url, events, active, created_at) FROM stdin;
\.


--
-- Data for Name: writing_challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.writing_challenges (id, title, description, start_date, end_date, created_at) FROM stdin;
\.


--
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.achievements_id_seq', 1, false);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: admin_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_notifications_id_seq', 1, false);


--
-- Name: analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.analytics_id_seq', 1, false);


--
-- Name: author_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.author_stats_id_seq', 1, false);


--
-- Name: author_tips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.author_tips_id_seq', 1, false);


--
-- Name: bookmarks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bookmarks_id_seq', 1, true);


--
-- Name: challenge_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.challenge_entries_id_seq', 1, false);


--
-- Name: comment_reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.comment_reactions_id_seq', 1, false);


--
-- Name: comment_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.comment_votes_id_seq', 1, false);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, false);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- Name: content_protection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.content_protection_id_seq', 1, false);


--
-- Name: performance_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.performance_metrics_id_seq', 1987, true);


--
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 1, false);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.posts_id_seq', 21, true);


--
-- Name: reading_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reading_progress_id_seq', 1, false);


--
-- Name: reported_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reported_content_id_seq', 1, false);


--
-- Name: reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reset_tokens_id_seq', 1, false);


--
-- Name: secret_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.secret_progress_id_seq', 1, false);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sessions_id_seq', 1, false);


--
-- Name: site_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.site_analytics_id_seq', 1, false);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, false);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 1, false);


--
-- Name: user_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_feedback_id_seq', 1, true);


--
-- Name: user_privacy_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_privacy_settings_id_seq', 1, false);


--
-- Name: user_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_progress_id_seq', 1, false);


--
-- Name: user_streaks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_streaks_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.webhooks_id_seq', 1, false);


--
-- Name: writing_challenges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.writing_challenges_id_seq', 1, false);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);


--
-- Name: author_stats author_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_stats
    ADD CONSTRAINT author_stats_pkey PRIMARY KEY (id);


--
-- Name: author_tips author_tips_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_tips
    ADD CONSTRAINT author_tips_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_user_id_post_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_post_id_unique UNIQUE (user_id, post_id);


--
-- Name: challenge_entries challenge_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenge_entries
    ADD CONSTRAINT challenge_entries_pkey PRIMARY KEY (id);


--
-- Name: comment_reactions comment_reactions_comment_id_user_id_emoji_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_reactions
    ADD CONSTRAINT comment_reactions_comment_id_user_id_emoji_unique UNIQUE (comment_id, user_id, emoji);


--
-- Name: comment_reactions comment_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_reactions
    ADD CONSTRAINT comment_reactions_pkey PRIMARY KEY (id);


--
-- Name: comment_votes comment_votes_comment_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_votes
    ADD CONSTRAINT comment_votes_comment_id_user_id_unique UNIQUE (comment_id, user_id);


--
-- Name: comment_votes comment_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_votes
    ADD CONSTRAINT comment_votes_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: content_protection content_protection_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_protection
    ADD CONSTRAINT content_protection_pkey PRIMARY KEY (id);


--
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_unique UNIQUE (slug);


--
-- Name: reading_progress reading_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_pkey PRIMARY KEY (id);


--
-- Name: reported_content reported_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reported_content
    ADD CONSTRAINT reported_content_pkey PRIMARY KEY (id);


--
-- Name: reset_tokens reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: reset_tokens reset_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_token_unique UNIQUE (token);


--
-- Name: secret_progress secret_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secret_progress
    ADD CONSTRAINT secret_progress_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_unique UNIQUE (token);


--
-- Name: site_analytics site_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_analytics
    ADD CONSTRAINT site_analytics_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_achievement_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_unique UNIQUE (user_id, achievement_id);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);


--
-- Name: user_privacy_settings user_privacy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_privacy_settings
    ADD CONSTRAINT user_privacy_settings_pkey PRIMARY KEY (id);


--
-- Name: user_privacy_settings user_privacy_settings_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_privacy_settings
    ADD CONSTRAINT user_privacy_settings_user_id_unique UNIQUE (user_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_streaks user_streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_streaks
    ADD CONSTRAINT user_streaks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: writing_challenges writing_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.writing_challenges
    ADD CONSTRAINT writing_challenges_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX email_idx ON public.users USING btree (email);


--
-- Name: username_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX username_idx ON public.users USING btree (username);


--
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: analytics analytics_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: author_stats author_stats_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_stats
    ADD CONSTRAINT author_stats_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: author_tips author_tips_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_tips
    ADD CONSTRAINT author_tips_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: bookmarks bookmarks_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: bookmarks bookmarks_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: challenge_entries challenge_entries_challenge_id_writing_challenges_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenge_entries
    ADD CONSTRAINT challenge_entries_challenge_id_writing_challenges_id_fk FOREIGN KEY (challenge_id) REFERENCES public.writing_challenges(id);


--
-- Name: challenge_entries challenge_entries_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenge_entries
    ADD CONSTRAINT challenge_entries_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comment_reactions comment_reactions_comment_id_comments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_reactions
    ADD CONSTRAINT comment_reactions_comment_id_comments_id_fk FOREIGN KEY (comment_id) REFERENCES public.comments(id);


--
-- Name: comment_votes comment_votes_comment_id_comments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_votes
    ADD CONSTRAINT comment_votes_comment_id_comments_id_fk FOREIGN KEY (comment_id) REFERENCES public.comments(id);


--
-- Name: comments comments_parent_id_comments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_comments_id_fk FOREIGN KEY (parent_id) REFERENCES public.comments(id);


--
-- Name: comments comments_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: comments comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: post_likes post_likes_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: post_likes post_likes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: posts posts_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: reading_progress reading_progress_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: reading_progress reading_progress_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reported_content reported_content_reporter_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reported_content
    ADD CONSTRAINT reported_content_reporter_id_users_id_fk FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: reset_tokens reset_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: secret_progress secret_progress_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secret_progress
    ADD CONSTRAINT secret_progress_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: secret_progress secret_progress_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secret_progress
    ADD CONSTRAINT secret_progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_achievements user_achievements_achievement_id_achievements_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_achievements_id_fk FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: user_achievements user_achievements_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_feedback user_feedback_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_privacy_settings user_privacy_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_privacy_settings
    ADD CONSTRAINT user_privacy_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_progress user_progress_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: user_progress user_progress_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_streaks user_streaks_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_streaks
    ADD CONSTRAINT user_streaks_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

