-- Reclassify questions currently tagged as the generic `Arithmetic` topic.
--
-- Scope: only the mathematics subject in mcq_questions_job
-- (the live app maps the database subject `গণিত` to `গাণিতিক যুক্তি`).
-- The question, answer, options, explanation, subject, and row identity are
-- not changed; only topic is updated from the question text.
--
-- Run this once in the Supabase SQL Editor. Review the preview result from the
-- temporary table before allowing the UPDATE section to run in production.

BEGIN;

LOCK TABLE public.mcq_questions_job IN SHARE ROW EXCLUSIVE MODE;

-- One-time rollback copy of the rows being reclassified.
CREATE TABLE IF NOT EXISTS public.mcq_questions_job_arithmetic_topic_backup_20260912 AS
SELECT id, created_at, subject, topic, question
FROM public.mcq_questions_job
WHERE subject = 'গণিত'
  AND topic = 'Arithmetic';

ALTER TABLE public.mcq_questions_job_arithmetic_topic_backup_20260912 ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.mcq_questions_job_arithmetic_topic_backup_20260912 FROM anon, authenticated;
CREATE UNIQUE INDEX IF NOT EXISTS mcq_questions_job_arithmetic_topic_backup_20260912_identity_idx
  ON public.mcq_questions_job_arithmetic_topic_backup_20260912 (id, created_at);

DROP TABLE IF EXISTS pg_temp.arithmetic_topic_reclass_20260912;

CREATE TEMP TABLE arithmetic_topic_reclass_20260912 ON COMMIT DROP AS
SELECT
  q.id,
  q.subject,
  q.topic AS old_topic,
  q.question,
  CASE
    -- More specific topics come before broad keyword matches.
    WHEN q.question ~* 'average|arithmetic mean|mean of|গড়|গড়'
      THEN 'গড়'
    WHEN q.question ~* 'simple interest|compound interest|interest rate|interest|annual rate|সুদ|বিনিয়োগ|বিনিয়োগ'
      THEN 'সরল ও যৌগিক মুনাফা'
    WHEN q.question ~* 'profit|loss|selling price|cost price|discount|লাভ|ক্ষতি|বিক্রয়মূল্য|বিক্রয়মূল্য|ক্রয়মূল্য|ক্রয়মূল্য|বাট্টা'
      THEN 'লাভ ও ক্ষতি'
    WHEN q.question ~* 'percentage|percent|শতকরা|%'
      THEN 'শতকরা'
    WHEN q.question ~* 'age|বয়স|বয়স'
      THEN 'বয়স ভিত্তিক'
    WHEN q.question ~* 'ratio|proportion|অনুপাত|সমানুপাত'
      THEN 'অনুপাত ও সমানুপাত'
    WHEN q.question ~* 'mixture|alligation|মিশ্রণ'
      THEN 'মিশ্রণ'
    WHEN q.question ~* 'pipe|cistern|tank|reservoir|container|নল|চৌবাচ্চা|বালতি|reservoir'
      THEN 'নল ও চৌবাচ্চা'
    WHEN q.question ~* 'boat|stream|upstream|downstream|নৌকা|স্রোত'
      THEN 'Boat & Stream'
    WHEN q.question ~* 'speed|distance|train|walking|walked|rate of|গতি|দূরত্ব|হেঁটে|হাঁটে'
      THEN 'Speed, Distance & Time'
    WHEN q.question ~* 'work|worker|efficien|machine|produce|কাজ|শ্রমিক|মেশিন|উৎপাদন'
      THEN 'কাজ ও সময়'
    WHEN q.question ~* 'gcd|lcm|greatest common factor|highest common factor|গ\.সা\.গু|ল\.সা\.গু'
      THEN 'গ.সা.গু. ও ল.সা.গু.'
    WHEN q.question ~* 'decimal|দশমিক'
      THEN 'Decimals'
    WHEN q.question ~* 'fraction|ভগ্নাংশ|half|third|quarter|অর্ধেক|এক-তৃতীয়াংশ|এক-তৃতীয়াংশ'
      THEN 'Fractions'
    WHEN q.question ~* 'unit conversion|convert|kilogram|gram|milligram|meter|metre|centimeter|সেন্টিমিটার|কিলোগ্রাম|মিলিগ্রাম|মিটার|কত অংশ'
      THEN 'একক রূপান্তর'
    WHEN q.question ~* 'area|perimeter|length|width|height|volume|square feet|ক্ষেত্রফল|পরিসীমা|দৈর্ঘ্য|প্রস্থ|উচ্চতা|আয়তন|আয়তন'
      THEN 'ক্ষেত্রফল ও পরিসীমা'
    WHEN q.question ~* 'probability|সম্ভাব্যতা|at least one|কমপক্ষে'
      THEN 'সম্ভাব্যতা'
    WHEN q.question ~* 'permutation|combination|বিন্যাস|সমাবেশ'
      THEN 'Permutation and Combination'
    WHEN q.question ~* 'series|sequence|ধারা|ক্রমিক'
      THEN 'Sequence and Series'
    WHEN q.question ~* 'statistics|median|mode|পরিসংখ্যান|মধ্যক|প্রচুরক'
      THEN 'Statistics'
    WHEN q.question ~* 'logarithm|লগারিদম'
      THEN 'Logarithm'
    WHEN q.question ~* 'set theory|set |সেট'
      THEN 'Set Theory'
    WHEN q.question ~* 'quadratic|দ্বিপদী সমীকরণ'
      THEN 'দ্বিপদী সমীকরণ'
    WHEN q.question ~* 'equation|algebra|বীজগণিত|সমীকরণ'
      THEN 'Algebra'
    WHEN q.question ~* 'triangle|circle|geometry|angle|জ্যামিতি|ত্রিভুজ|বৃত্ত|কোণ'
      THEN 'Geometry'
    WHEN q.question ~* 'number|prime|divis|remainder|natural number|সংখ্যা|মৌলিক|ভাজ্য|ভাগশেষ'
      THEN 'Number System'
    ELSE 'Arithmetic'
  END AS new_topic
FROM public.mcq_questions_job AS q
WHERE q.subject = 'গণিত'
  AND q.topic = 'Arithmetic';

-- Preview classification counts before the update.
SELECT new_topic, count(*) AS question_count
FROM arithmetic_topic_reclass_20260912
GROUP BY new_topic
ORDER BY new_topic;

-- Apply only the topic change. All other question fields remain untouched.
UPDATE public.mcq_questions_job AS q
SET topic = r.new_topic
FROM arithmetic_topic_reclass_20260912 AS r
WHERE q.id = r.id
  AND q.subject = r.subject
  AND q.topic = r.old_topic;

-- Post-update audit: generic Arithmetic rows left intentionally unmatched and
-- every new topic group are visible for review.
SELECT topic, count(*) AS question_count
FROM public.mcq_questions_job
WHERE subject = 'গণিত'
GROUP BY topic
ORDER BY topic;

COMMIT;
