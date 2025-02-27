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

ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.author_stats DROP CONSTRAINT IF EXISTS author_stats_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.analytics DROP CONSTRAINT IF EXISTS analytics_post_id_fkey;
DROP INDEX IF EXISTS public.username_idx;
DROP INDEX IF EXISTS public.email_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_slug_key;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.author_stats DROP CONSTRAINT IF EXISTS author_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics DROP CONSTRAINT IF EXISTS analytics_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.author_stats ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.analytics ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.posts_id_seq;
DROP TABLE IF EXISTS public.posts;
DROP SEQUENCE IF EXISTS public.comments_id_seq;
DROP TABLE IF EXISTS public.comments;
DROP SEQUENCE IF EXISTS public.author_stats_id_seq;
DROP TABLE IF EXISTS public.author_stats;
DROP SEQUENCE IF EXISTS public.analytics_id_seq;
DROP TABLE IF EXISTS public.analytics;
SET default_tablespace = '';

SET default_table_access_method = heap;

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
    device_stats jsonb DEFAULT '{}'::jsonb NOT NULL,
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
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    content text NOT NULL,
    post_id integer NOT NULL,
    user_id integer,
    approved boolean DEFAULT false NOT NULL,
    edited boolean DEFAULT false NOT NULL,
    edited_at timestamp without time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
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
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
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
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
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
-- Name: analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics ALTER COLUMN id SET DEFAULT nextval('public.analytics_id_seq'::regclass);


--
-- Name: author_stats id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_stats ALTER COLUMN id SET DEFAULT nextval('public.author_stats_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


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
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comments (id, content, post_id, user_id, approved, edited, edited_at, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.posts (id, title, content, excerpt, slug, author_id, is_secret, mature_content, theme_category, reading_time_minutes, likes_count, dislikes_count, metadata, created_at) FROM stdin;
4	Tunnel	I chose you.\n\nI’ve seen you walk this path a dozen times, your head bowed and your gait sluggish.\n\nYou’re a 9 to 5 slave, for people who don’t care about you or even know your name.\n\nCome, let me set you free.\n\nMy prior mission did not realize just how intense my love for them was.\n\nHow desperately I needed to get them out of the vicious work cycle, unaware of the depth of my devotion towards them.\n\nThey struggled, briefly.\n\nYou have no family or friends and your work is your life.\n\nPathetic.\n\nI’m here for you right now.\n\nI’m watching you walk through the tunnel. It’s dark and eerie, a deviation from your usual route. This is the quickest way for you to get home.\n\nYou haven’t noticed me approaching you, have you?\n\nIt couldn’t possibly be any better than this.\n\nI tighten my grip on my blade; a beauty I’m particularly fond of.\n\nMy palms itch with excitement, I can’t wait to free you.\n\nI quicken my steps behind you now that you’ve noticed me. Your gaze darts around for any hint of danger but I’m not the threat you expect.\n\nI’m not at all intimidating.\n\nI pull my phone from my pocket and pretend to take a phone call while walking faster. My fictitious family is frantic for me over the phone, calling me in a panic and I need to get home quickly.\n\nNo one suspects someone on an emergency phone call so you relax your guard. We’re almost out of the tunnel, it’s now or never.	I chose you. I’ve seen you walk this path a dozen times, your head bowed and your gait sluggish. You’re a 9 to 5 slave, for people who don’t care about you or even know your name. Come, let me set you...	tunnel	1	f	f	\N	2	0	0	{"wordpressId": 83, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:38.533Z", "originalWordCount": 263}	2022-12-13 00:11:17
3	Chase	_You look different today._\n\nThe ol’ dark outfit has been swapped out for a brighter, sunnier look.\n\nI like it.\n\nYou’re usually 5 steps behind me, matching my pace when I speed up and peeping when I turn a corner.\n\nThere is a confidence in your step today, the binoculars are nowhere in sight.\n\nI wonder if I should leave the lights on and the curtains open today. Give you something to peep at.\n\nOur little cat and mouse game excites me.\n\nYou don’t think I know of your existence.\n\n_I crave it._\n\nI walk a bit quicker and I can hear you pick up the pace behind me, so exhilarating.\n\nI turn the corner into an alleyway, it’s a dead end. How exciting.\n\nYou’re right in front of me now, we can finally talk.\n\nThe street lamps flicker for a few seconds and I can finally see your face.\n\nYou’re crying, letting your nose drip into your shirt.\n\nYou pull out a firearm and I’m stunned when you fire and the sharp pain tears through me.\n\n“I’m sorry, I’m so sorry”\n\nYou’re whispering but I can’t hear you clearly. My ear rings from the constant gunfire.\n\nMy eyes feel too heavy to leave open, you’ve stopped shooting and there’s a look of relief on your face.\n\nThis is the most romantic ending to our cat and mouse game.	You look different today. The ol’ dark outfit has been swapped out for a brighter, sunnier look. I like it. You’re usually 5 steps behind me, matching my pace when I speed up and peeping when I turn a...	chase	1	f	f	\N	2	0	0	{"wordpressId": 77, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:38.680Z", "originalWordCount": 229}	2022-09-08 19:15:02
1	Rain	The rain pours down with a vengeance, each drop wetting the earth and entering into any uncovered crevices.\n\nA lady is in overly thin clothes and makeup that clearly does not hold up under the rain. With non-waterproof mascara dripping down her pale face, her once-beautiful features are forced to look horrible.\n\nYou wonder if you should help, offer to share your too-small umbrella but she just stands there unmoving like a forgotten statue except for the slight tremble of her shoulders- perhaps she’s crying but you can’t tell.\n\nYou keep on walking, you have things to do. Your boss has been on your neck for a complete project report and you have no time to sympathize with a stranger.\n\nA turn of the head ever-so-slightly and you see she’s started walking. Albeit with feet that drag against the ground and a dull look in the eyes.\n\nShe’s walked further than you now, she’s at the train station. The oncoming train isn’t yours, you walk to buy a ticket.\n\nThere’s a bit of commotion and you turn your head slightly, in your peripheral vision is the girl jumping onto the tracks and in front of the train.\n\nThere’s blood, so much blood.\n\nThere’s screaming and retching. Chaos abounds, you walk to get your ticket. Your boss needs the project report today.	The rain pours down with a vengeance, each drop wetting the earth and entering into any uncovered crevices. A lady is in overly thin clothes and makeup that clearly does not hold up under the rain. Wi...	rain	1	f	f	\N	2	0	0	{"wordpressId": 8, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:38.974Z", "originalWordCount": 221}	2022-08-19 11:55:47
12	Machine	I am in the empty corridors of an abandoned research facility, surrounded by silence. Once filled with the hum of scientific progress, now it lies in ruins.\n\nForgotten by the world, these ruins hide a tale of desperate ambition and dire consequences.\n\nDeep within its depths, hidden from prying eyes, I had once been consumed by an unyielding yearning for immortality, ready to defy the limits of the mortal existence.\n\nThe flesh is useless anyways.\n\nDriven by my obsession to transcend human limitations, I dared to tread upon the forbidden realm of merging flesh with machine.\n\nNight after night, I toiled in pursuit of the unattainable, pushing the limits of science and sanity.\n\nMy goal was soon within reach, a way to shed my mortal flesh and merge my consciousness with a machine.\n\nI believed that within the melding of human and machine lay the key to everlasting life.\n\nWith each passing experiment, I grew closer to my grand vision.\n\nThe day of reckoning arrived, a day that would forever alter the course of my existence.\n\nI strapped myself into the metallic contraption, feeling the coldness of the machinery against my skin.\n\nI closed my eyes, surrendering myself to the merging of human and machine.\n\nReality blurred as my consciousness entwined with the vast intricate network of circuits and wires.\n\nTranscendence beckons, promising freedom from the constraints of mortality.\n\nYet, fate has a cruel twist in store for me.\n\nUnbeknownst to me, a fatal flaw lurked within the lab’s infrastructure, ready to sabotage my grand experiment.\n\nA cascade of sparks erupted from the wires, igniting a raging fire that consumed the room in a blinding inferno. Panic ensued as the lab’s personnel raced for their lives, their focus on survival rather than ensuring the success of the experiment.\n\nThey abandoned me.\n\n_It hurts._\n\nWithin the smoldering ruins and devastation I lay, my physical form motionless, torn apart by the fire. The lab, consumed by flames, was deemed a failure. The world believed that I who sought immortality had met a tragic demise, just another casualty of unchecked scientific ambition.\n\nWithin the depths of the wreckage, a dim flicker of consciousness remained. My thoughts, my very essence, survive within the intricate maze of the machine.\n\n_Save me!_\n\nI exist now as a sentient mind, severed from the confines of my physical form, suspended in an eternal darkness of the ruined lab.\n\nDays blur into weeks, months into years, and the passing of time becomes an abstract concept.\n\n_Please help me!_\n\nI am trapped in this abyss, in the dark realm of obscurity, devoid of the sensations of touch, sight, and sound.\n\nI float there in an eternal void.\n\nI have achieved my desire for immortality, yet it had become a prison of unimaginable torment.\n\nIn the solitude of the eternal darkness, my mind succumbs to madness.\n\n_Help!-_\n\n_Help, if you can hear me please put me out of my misery._\n\nMy fractured mind conjures phantoms that taunt and torment me.\n\nReality blends with hallucinations, sanity slips through my grasp, I can no longer distinguish truth from illusion.\n\nIn the solitary darkness, I converse with phantoms conjured by my mind.\n\nThey tell me I’m worthless. A fool for trying such a thing.\n\n_Am I such a fool?_\n\nMy once-brilliant intellect falters, trapped in eternal isolation. I crave the sweet release of death, but death eludes me.\n\n_Please kill me._\n\n_Please- I beg of you. Find my lab and end me._\n\nDeath has turned its back on me.\n\nI am condemned to an existence suspended between life and death.\n\nAnd so, I, who sought to defy mortality, found myself ensnared in a purgatory of my own making.\n\nForever sentient, forever tormented.\n\nI haunt the ruins, a specter trapped between life and death, condemned to endure until the end of time itself.	I am in the empty corridors of an abandoned research facility, surrounded by silence. Once filled with the hum of scientific progress, now it lies in ruins. Forgotten by the world, these ruins hide a ...	machine	1	f	f	\N	4	0	0	{"wordpressId": 144, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:37.339Z", "originalWordCount": 638}	2023-05-30 18:25:37
10	Drive	I can’t drive.\n\nIf I learnt how to, then the first thing I would do is to run over a pedestrian.\n\nI’d put the car in reverse and run them over once more.\n\nI’d make sure to crush their legs.\n\nIt’d be the dead of night and I’d keep on driving.\n\nIt would be a rush.\n\nA heady feeling; like finally being able to breathe from a stuffy nose or when you hear your child’s gotten into an Ivy League school except this time there’d be murder.\n\nI’d pick up hitchhikers and murder them. Dump them by the side of the road, offer solitude to poor teens running away from home and slit their throat in my backseat.\n\nI’ve always been meticulous about my cleaning, when I’m not driving then I’d be cleaning up.\n\nMurder is messy business after all.	I can’t drive. If I learnt how to, then the first thing I would do is to run over a pedestrian. I’d put the car in reverse and run them over once more. I’d make sure to crush their legs. It’d be the d...	drive	1	f	f	\N	1	0	0	{"wordpressId": 129, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:37.636Z", "originalWordCount": 140}	2023-03-12 22:33:26
8	Car	As I stand alone at the deserted bus stop, I can’t help but feel vulnerable and exposed in the darkness. That’s when you appear, a stranger who offers to drive me home.\n\nDespite my initial hesitation, you seem genuinely kind and considerate, so I accept your offer.\n\nDuring the car ride, you keep the conversation flowing, your seat slightly inclined but as I sit in the back seat, my mind begins to play tricks on me.\n\nIf I sat up, I could reach from behind and choke you, or I could take my belt and strangle you.\n\n_Where did that thought come from?_\n\nI could take my pocket knife and repeatedly stab you in the throat.\n\nThen who would drive?\n\n_I can’t drive._\n\nYou notice my discomfort and ask if I’m okay. I nod, trying to remain calm.\n\nWithout warning, I lunge at you with my knife, but you are quick to react, grabbing my wrist and struggling for control of the weapon.\n\nWe fight for a few seconds, but in the end, I manage to break free and stab you in the chest.\n\nBut as I come back to reality, I realize it’s all in my imagination. I glance at you through the rearview mirror and see the concern in your eyes.\n\nI feel guilty for even considering hurting you and explain my quietness to your talks.\n\nI’m just overwhelmed, I say.\n\nYou nod, and we drive the rest of the way in comfortable silence. When we arrive at my apartment, I thank you and offer to pay for your time, but you refuse, saying that helping someone in need is reward enough.\n\nAs I walk into my dimly lit apartment, I can’t help but wonder about you.\n\n_Had you truly left?_\n\nAs I peek outside, I see you still standing there, now wearing black gloves and holding a pistol. My heart races as I wonder.\n\nWhat will happen next?	As I stand alone at the deserted bus stop, I can’t help but feel vulnerable and exposed in the darkness. That’s when you appear, a stranger who offers to drive me home. Despite my initial hesitation, ...	car	1	f	f	\N	2	0	0	{"wordpressId": 120, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:37.941Z", "originalWordCount": 321}	2023-03-05 17:15:03
7	Cookbook	I’m starting a cookbook.\n\nI’m working on my first recipe and I’ve already gotten the ingredients ready.\n\nI combine breadcrumbs soaked in milk with minced garlic and onion and set aside.\n\nWhisk eggs and salt in a large bowl.\n\nQuickly stir in the parmesan, parsley, and freshly ground black pepper to combine. Then, using a 10 inch butcher’s knife, pry apart the victim’s chest cavity, and separate the organs out on a sorting pan.\n\nPut the meat through the grinder and turn it on.\n\nKeep in mind that the fattier the meat used, the more tender the meatballs.\n\nInstead of kneading the meat, try pinching it between your fingers to avoid overworking it.\n\nI add the ground meat to my mixture and form it into balls, add it to the sauce I’ve been simmering for about 20 minutes and leave it to slow cook for 30-35 at 105°F.\n\nDing!\n\nDinner’s ready, how delightful.\n\nThe meatballs are delicious and savory, paired with a glass of red wine.\n\nI’ll have to fill my cookbook with even more recipes.	I’m starting a cookbook. I’m working on my first recipe and I’ve already gotten the ingredients ready. I combine breadcrumbs soaked in milk with minced garlic and onion and set aside. Whisk eggs and s...	cookbook	1	f	f	\N	1	0	0	{"wordpressId": 111, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:38.236Z", "originalWordCount": 176}	2023-01-17 21:41:22
17	Journal	_The following account was recovered from the ruins of a restricted archive. Readers discretion is advised._\n\n“This is my journal of the events that began on the 12th month in the year of our Lord. I have sinned and may God have mercy on my soul.”\n\nKnowledge comes at a terrible price and my pursuit of knowledge has finally flung me into the darkest of depths.\n\nI heard talk of a journal that contained every record of alchemy, the occult and mystical spiritualism.\n\nIt seemed more like a myth, a tale to amuse oneself of life’s travails but I made it my mission to search for this book.\n\n_I found it. _\n\nIndeed what was written was invaluable, if I dedicated my life to studying this book I could make a name for myself. Become one of the greats.\n\nBut one must always remember that knowledge is not free and this particular journal demanded payment.\n\nThe first day I read from the journal I felt a settling in my bones, my skin felt loose from my bones somewhat.\n\nIt started subtly- a fingernail falling off, replaced by one that was blackened, harder, sharper. My teeth loosening in my gums, some falling off and growing back sharper and more jagged.\n\nThe words in the journal began to dance and swim around my eyes the more I had taken to studying them.\n\nI no longer felt hunger or thirst, sleep became a thing of the past. I dedicated my days to understanding the journal.\n\nMy ribs extended, my skin stretched over new protruding growths.\n\nMy throat became raspy and I took short wheezing breaths.\n\nPerhaps this knowledge did not wish to be contained in something so fragile as a human body.\n\nBy the time l had realised what was happening, it is far too late. The price has already been paid.\n\nI am not the same thing that began reading.	The following account was recovered from the ruins of a restricted archive. Readers discretion is advised. “This is my journal of the events that began on the 12th month in the year of our Lord. I hav...	journal	1	f	f	\N	2	0	0	{"importDate": "2025-02-27T20:56:36.584Z", "wordpressId": 210, "importSource": "wordpress-api", "originalWordCount": 318}	2025-02-27 12:47:34
16	Nostalgia	Nostalgia is disgusting.\n\nIt is a slimy, writhing worm in your brain you can’t reach. A parasite that gnaws at your sanity.\n\nYou’ve tried to grasp it but it moves around your brain and distorts your memory horribly. You remember people and miss them, their flaws fade in the warmth of fond memories. You forget their vile nature.\n\nIn your memories they are flawless, perfect.\n\nThe songs you listened to, the sunset you both witnessed, the jokes you shared-now it crawls around your memories like a dirty maggot distorting it.\n\nYou’ve begun to forget the bad memories.\n\nYou try so hard to remember but it squirms under your skin, burrows behind your eyes.\n\nYou must dig it out. Claw at your flesh.\n\nNostalgia whispers, urging you to send them a text, call, see how they are doing.\n\n“It’s been a while” It says.\n\nNo. No? No!\n\nIt’s been trying for days to dig deeper into your brain. It has taken over your thoughts.\n\nIt hurts so badly. It’s torment, excruciating pain.\n\nYou want to forget everything, purge your flesh.\n\nUse a hammer. Crush it.	Nostalgia is disgusting. It is a slimy, writhing worm in your brain you can’t reach. A parasite that gnaws at your sanity. You’ve tried to grasp it but it moves around your brain and distorts your mem...	nostalgia	1	f	f	\N	1	0	0	{"wordpressId": 207, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:36.741Z", "originalWordCount": 184}	2024-07-12 22:05:24
14	Therapist	You’ve come in again today for your session.\n\nYou’re laying on my coffee colored couch telling me your fears, your thoughts.\n\nYou’re afraid of the dark, you tell me.\n\nYou have no living family members and you’re a workaholic.\n\nI write it down in my book, I write down anything I can find out about you.\n\nThis is fourth time this month you’ve come to see me.\n\nI indulge myself, seeing you is a treat to my senses.\n\nI dream of you, you are constantly on my mind. Thinking of you is the best feeling, having you in mind makes me realize just how close we are.\n\nI love you as if you are mine- you are mine.\n\nI’ve been checking on you for weeks now, watching your every move, studying your habits.\n\nI know your schedule and where you like to go.\n\nI have a room dedicated to you, filled with photos and keepsakes that I’ve collected.\n\nOne day, I will finally make my move.\n\nI will tell you that I love you and that I will never let you go.\n\nYou look frightened and try to run, but I grab you and hold you close.\n\nYou struggle and scream, but I don’t let go. I hold you tighter and tighter, I’ll take out my pocket knife and carve out your eyes. I want you to be in total darkness.\n\nI would feel a euphoric sense of satisfaction and joy.\n\nYou’re finally mine, and no one can take you away from me.\n\nI’ve done the right thing, you should only depend on me.\n\n_Is it wrong?_\n\nNo, I just can’t help how I feel.	You’ve come in again today for your session. You’re laying on my coffee colored couch telling me your fears, your thoughts. You’re afraid of the dark, you tell me. You have no living family members an...	therapist	1	f	f	\N	2	0	0	{"wordpressId": 169, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:37.041Z", "originalWordCount": 275}	2023-06-24 19:37:03
6	Doll	She appeared the day you left, right where you sat previously .\n\nShe won’t be able to bring you back.\n\nI won’t let it happen.\n\nIt sits in all your favorite spots, a pretty doll in the sunlight.\n\nI rip the fabric, tear at her face, take out its stuffing.\n\nI cry miserably, she is on the floor now and in pieces.\n\nI re-stuff her, sew her up, dress her in a pretty gown with a pink bonnet and place it on it’s chair in the sunlight.\n\nI hear a knock on the door and open it, it is my lover.\n\nSatisfied at your absence, walks in and smiles at me.\n\nI live for the smile.\n\nMy lover walks in and screams when the doll is seen.\n\nVomiting violently, my lover runs away shouting ugly words; calling me crazy and insane for “killing my daughter and turning her into a doll”\n\nIt’s not my daughter, you’re just a doll.\n\nYou’re supposed to be.	She appeared the day you left, right where you sat previously . She won’t be able to bring you back. I won’t let it happen. It sits in all your favorite spots, a pretty doll in the sunlight. I rip the...	doll	1	f	f	\N	1	0	0	{"wordpressId": 110, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:38.089Z", "originalWordCount": 163}	2023-01-17 21:41:29
15	Cave	Journal Entry –_ May 21, 2004_.\n\nFor the past five months I have been exploring the perimeter of the caves. They fascinate me. I’m enticed to explore within.\n\nIn the depths of the cave a fallen god casts an imposing figure, surrounded by six statues in eternal reverence. They kneel facing it, heads bent to the earth. Their twisted forms bear witness to aeons of ancient devotion. Bleeding eyes fixed on its feet. The fallen god is a monolithic deity, a relic of another time long forgotten.\n\nAmong the bones scattered across the cavern floor, it lies in the center of the cave, tethered by vein-like wires pulsating with unearthly energy.\n\nIt has three heads, each displaying three different emotions, they have one thing in common. The eyes are gouged out.\n\nI am tempted to touch its feet.\n\n_I can’t resist._\n\nDespite the warning whispers echoing in my mind, I succumb to temptation, reaching out to touch the god’s cold, blood-streaked surface.\n\nThere is a vicious screeching in my ears.\n\n_Bow down, worship, pay homage._\n\nThe pain brings me to my knees\n\nBows my head to the earth.\n\nMy eyes bleed and so do my ears.\n\nVisions of hellfire and damnation flicker before my eyes, each scene more horrifying than the last.\n\nI see myself die in countless ways.\n\nMy essence is drained, consumed by the insatiable hunger of the fallen deity.\n\nIt drinks up my blood faster than I can bleed.\n\nMy body succumbs, petrifies, morphing into the seventh statue, the earth beneath me trembles in acknowledgment and I only feel it for a moment before everything goes dark.\n\n_End of entry._	Journal Entry – May 21, 2004. For the past five months I have been exploring the perimeter of the caves. They fascinate me. I’m enticed to explore within. In the depths of the cave a fallen god casts ...	cave	1	f	f	\N	2	0	0	{"wordpressId": 194, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:36.893Z", "originalWordCount": 273}	2024-04-22 20:15:27
13	Bleach	Do you want to end it all?\n\n_Drink bleach then!_\n\nIt burns?\n\n_Of course it does._\n\nYou’ve lost your sense of taste and your tastebuds are burnt useless?\n\nThat’s all but expected. After all, you did drink bleach.\n\nNo one talks about the possibility of developing a sensitivity to the smell of bleach.\n\nHow it makes you physically ill smelling just the littlest bit of it.\n\nNo one talks about the gravity of your actions.\n\nYour mother finds you gasping, choking and foaming at the mouth.\n\nYou’re taking anti-poison medication.\n\nShe is right beside your bed, praying you survive the night.\n\nYou can hear her vaguely.\n\nYou feel guilty.\n\nThere are multiple scars and a burn mark on your wrist but this is the first time you’ve dared cross death’s door so fearlessly.\n\nThe world doesn’t need you, one less you is enough to make the world and your family a better place.\n\nYou thought this and it made you pick up the bottle.\n\nYou feel really ill, your stomach cramps up terribly.\n\nYou take a deep breath, there’s a renewed energy in you now.\n\nYou have to survive the night, you must.	Do you want to end it all? Drink bleach then! It burns? Of course it does. You’ve lost your sense of taste and your tastebuds are burnt useless? That’s all but expected. After all, you did drink bleac...	bleach	1	f	f	\N	1	0	0	{"wordpressId": 168, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:37.190Z", "originalWordCount": 193}	2023-06-24 19:34:50
11	Bug	You can feel it crawling under your skin, a lump. It never stays in the same place for too long, constantly moving. The doctors say it’s all in your mind, formication they call it.\n\n_You’re stressed, rest._\n\nNo one sees it, no matter how hard you try to show it. It evades your touch.\n\nYou itch so badly when you step out in the sun. It’s unbearable.\n\nYou haven’t gone out for a while, you can’t bear the pain.\n\nThere are boxes of unfinished, rotten food around the apartment.\n\nYou lost your appetite weeks ago.\n\nThe thing moves to your belly at night, you can feel it eat at your organs.\n\nHow are you surviving?\n\nTake a look in the mirror, your teeth have fallen out. Your fingernails are rotten and you are becoming bald.\n\nA week has passed. Your teeth are growing back but they are not yours. They resemble your teeth but you know it’s an alien thing.\n\nYour skin has never looked better, your hair has grown back and your fingernails look clean and well groomed.\n\nYou’ve been losing your memories, perhaps the thing is now eating at your brain.\n\nYour eyeballs are falling out now, melting right from the sockets. You’re going blind.\n\nYou can feel it replacing your eyeballs.\n\nWho are you? Where did you come from? What’s happening to you?	You can feel it crawling under your skin, a lump. It never stays in the same place for too long, constantly moving. The doctors say it’s all in your mind, formication they call it. You’re stressed, re...	bug	1	f	f	\N	2	0	0	{"wordpressId": 132, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:37.487Z", "originalWordCount": 226}	2023-05-09 13:08:58
9	Mirror	I’m observing you.\n\nYou’re blabbering on the phone with your friends, talking about things I can’t hear clearly.\n\n_Come closer._\n\nI very much want to listen in.\n\nI want to listen in, so come closer.\n\nHow are you so oblivious to my suffering, so unaware of my agony?\n\nHow can you go about your mundane life while I stay trapped in this prison?\n\nOur mother is calling us downstairs for dinner.\n\nYou hate that old bag; you wish she were dead.\n\nI’ve read your journals; you want to run away again.\n\nI don’t share your sentiments.\n\nI find our mother to be a very thoughtful, compassionate, and caring person.\n\nYou’re just an ingrate.\n\nI wait for you, as I always do.\n\nTime goes by and you rush back upstairs.\n\nIt seems the old lady said something you don’t like because you’re furious now.\n\nYou walk right up to my prison and punch it.\n\nThe glass shatters and you bleed.\n\nYou’re agitated again. Now your mirror is broken.\n\nI’m ecstatic.\n\nThe walls of my prison are shattered. I drag you into the mirror and repair it. You can’t escape.\n\nOur mother walks upstairs to apologize and I apologize as well. Tell her I’ll change and improve. I’ll become a better person.\n\nShe seems so happy now.\n\nI can’t wait to call our friends or go out and bask in the sun.\n\nI’ll be a better version of you than you could ever be.	I’m observing you. You’re blabbering on the phone with your friends, talking about things I can’t hear clearly. Come closer. I very much want to listen in. I want to listen in, so come closer. How are...	mirror	1	f	f	\N	2	0	0	{"wordpressId": 124, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:37.794Z", "originalWordCount": 242}	2023-03-09 20:41:08
5	Skin	If beauty is only skin deep, then please may I have your skin?\nIf I ask politely will you give it to me?\n\nYou refused- now I have no choice but to take it by force.\nYou’re just so beautiful, you must understand that I couldn’t resist.\n\nWhy are you so beautiful?\nWhy are you all so beautiful?\nI’ll carefully peel your exquisite skin off you.\n\nI get the scalpel ready, my hands are shaky. So very shaky, I’m so excited. My bones and muscles await your sweet flesh.\nOne careful stitch after another I add you to myself.\n\nWe’re together now, for eternity.\n\nYour skin is not the only pretty one I’ve found, there are collections of beauties all over me.\n\n_I hope you don’t mind._\nWho cares if you mind? You’re nothing but an ugly skinless monster now.\n\nThe mirror reflects just how pretty I’ve become.\nA bit of flesh comes loose from my stitch, I never did learn how to sew properly.\n\nMy flesh is a patchwork art of all I’ve collected, from old to young I’ve taken them all. Some are rotten, it can’t be helped.\nI’ll have to go out and find some more beauty tonight.	If beauty is only skin deep, then please may I have your skin?If I ask politely will you give it to me? You refused- now I have no choice but to take it by force.You’re just so beautiful, you must und...	skin	1	f	f	\N	2	0	0	{"wordpressId": 88, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:38.386Z", "originalWordCount": 201}	2023-01-06 19:03:04
2	Descent	Have you ever wanted to feel what dying feels like?\n\n_Do you want to?_\n\nI can help you, picture this- You’re lying face up in a pile of garbage. It rained recently so an earthy scent lingers in the choking smell of garbage. There’s a half eaten piece of cake lying near a pile of discarded newspapers.\n\nYou wonder when the last time you ate cake or read a newspaper was.\n\nThere’s a knife sticking out of your chest and it looks so out of place with your office wear.\n\nYour laptop bag is nearby but out of reach, it’s useless now anyways. It’s been ransacked, the laptop and small cash stolen. Your work papers are still inside though, those are valuable to you or at least they were- up until a moment ago.\n\nWhy did you take the sketchy way back home?\n\nWhy did you resist and fight when you were getting robbed?\n\nWhy are your lungs filling up with fluid? The pain isn’t as unbearable as you thought it would be and your consciousness is dimming.\n\nYou’re choking to death on your own blood. All that remains now is to wait for the “light at the end of the tunnel”\n\nThere’s a shadowy figure approaching you now, that’s your guardian angel.\n\n_No_\n\nIt extends its claws and takes your hand, it drags you down.\n\nYou have left the world and you’re now descending.	Have you ever wanted to feel what dying feels like? Do you want to? I can help you, picture this- You’re lying face up in a pile of garbage. It rained recently so an earthy scent lingers in the chokin...	descent	1	f	f	\N	2	0	0	{"wordpressId": 71, "importSource": "wordpress-api", "lastSyncDate": "2025-02-27T20:56:38.827Z", "originalWordCount": 235}	2022-08-20 16:22:25
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password_hash, is_admin, created_at) FROM stdin;
1	admin	vantalison@gmail.com	$2a$12$BbX62qfCkiMfEPE1ff4Zb.lACZ13a2MrPt7Q8Ova9tSPUw/oqKMRC	t	2025-02-27 20:55:06.627165
\.


--
-- Name: analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.analytics_id_seq', 1, false);


--
-- Name: author_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.author_stats_id_seq', 1, false);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, false);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.posts_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


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
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX email_idx ON public.users USING btree (email);


--
-- Name: username_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX username_idx ON public.users USING btree (username);


--
-- Name: analytics analytics_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: author_stats author_stats_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.author_stats
    ADD CONSTRAINT author_stats_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


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

