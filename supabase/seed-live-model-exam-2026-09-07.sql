-- Today’s published live model test — schema and idempotent answer-key seed.
-- Run this whole file in Supabase Dashboard > SQL Editor using a project owner/service role.
-- It intentionally uses a dedicated table, never mcq_questions_job. The public app may
-- read only active rows; insert/update/delete remain restricted to service roles/SQL Editor.
-- Generated from src/todays-model-exam.js on 2026-09-07. Do not hand-edit question order.

BEGIN;

CREATE TABLE IF NOT EXISTS public.live_model_exam_questions (
  id text PRIMARY KEY,
  exam_id text NOT NULL,
  display_order integer NOT NULL CHECK (display_order > 0),
  source_order integer NOT NULL CHECK (source_order > 0),
  subject text NOT NULL,
  topic text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2),
  answer text NOT NULL,
  answer_index smallint NOT NULL CHECK (answer_index >= 0),
  explanation text NOT NULL,
  post_name text NOT NULL,
  exam_tag text NOT NULL DEFAULT 'model-test',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (exam_id, display_order)
);

CREATE INDEX IF NOT EXISTS live_model_exam_questions_exam_display_idx
  ON public.live_model_exam_questions (exam_id, display_order);

ALTER TABLE public.live_model_exam_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.live_model_exam_questions FROM anon, authenticated;
GRANT SELECT ON TABLE public.live_model_exam_questions TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read active live model questions" ON public.live_model_exam_questions;
CREATE POLICY "Public can read active live model questions"
  ON public.live_model_exam_questions
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- This trigger is created only if the common project helper is already present.
-- The explicit upsert below also sets updated_at, so the seed is safe without it.
DO $$
BEGIN
  IF to_regprocedure('public.handle_updated_at()') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_live_model_exam_questions_updated_at') THEN
    CREATE TRIGGER set_live_model_exam_questions_updated_at
      BEFORE UPDATE ON public.live_model_exam_questions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

WITH seed_rows AS (
  SELECT *
  FROM jsonb_to_recordset($seed$
[
  {
    "id": "today-model-2026-09-07-001",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 1,
    "source_order": 15,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি ঘোষ ধ্বনি?",
    "options": [
      "চ",
      "ছ",
      "জ",
      "স"
    ],
    "answer": "জ",
    "answer_index": 2,
    "explanation": "জ উচ্চারণের সময় স্বরতন্ত্রী কাঁপে, তাই এটি ঘোষ ধ্বনি। প্রতি বর্গের তৃতীয়, চতুর্থ ও পঞ্চম বর্ণ সাধারণত ঘোষ—যেমন গ, ঘ, ঙ এবং জ, ঝ, ঞ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-002",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 2,
    "source_order": 47,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "ভাষা আন্দোলনভিত্তিক প্রথম নাটক ‘কবর’ কার লেখা?",
    "options": [
      "মুনীর চৌধুরী",
      "মুনীরুজ্জামান",
      "জহির রায়হান",
      "সেলিনা হোসেন"
    ],
    "answer": "মুনীর চৌধুরী",
    "answer_index": 0,
    "explanation": "কারাগারে রচিত মুনীর চৌধুরীর কবর ভাষা আন্দোলনভিত্তিক প্রথম নাটক হিসেবে পরিচিত। নাম, লেখক ও কারাগারে রচিত—এই তিনটি তথ্য একসঙ্গে মনে রাখো।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-003",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 3,
    "source_order": 92,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ঠিক ৫:০০টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার ক্ষুদ্রতর কোণ কত?",
    "options": [
      "১২০°",
      "১৩৫°",
      "১৫০°",
      "১৬৫°"
    ],
    "answer": "১৫০°",
    "answer_index": 2,
    "explanation": "ঠিক ৫টায় মিনিটের কাঁটা ১২-এ এবং ঘণ্টার কাঁটা ৫-এ থাকে; তাই ৫ × ৩০° = ১৫০°। এটি ১৮০°-এর কম, তাই এটিই ক্ষুদ্রতর কোণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-004",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 4,
    "source_order": 13,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি কণ্ঠ্য ধ্বনি?",
    "options": [
      "ক",
      "ত",
      "প",
      "চ"
    ],
    "answer": "ক",
    "answer_index": 0,
    "explanation": "ক-বর্গ—ক, খ, গ, ঘ, ঙ—প্রচলিত বাংলা ব্যাকরণে কণ্ঠ্য ধ্বনি। আধুনিক ধ্বনিবিজ্ঞানে একে পশ্চাৎতালব্যও বলা হয়, তবে চাকরির পরীক্ষায় কণ্ঠ্য উত্তরটি প্রত্যাশিত।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-005",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 5,
    "source_order": 51,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "মুক্তিযুদ্ধকালে বাংলাদেশকে কয়টি সেক্টরে ভাগ করা হয়েছিল?",
    "options": [
      "৮টি",
      "৯টি",
      "১০টি",
      "১১টি"
    ],
    "answer": "১১টি",
    "answer_index": 3,
    "explanation": "গেরিলা যুদ্ধ ও সামরিক কার্যক্রম সমন্বয়ের জন্য মুক্তিযুদ্ধকালে বাংলাদেশকে ১১টি সেক্টরে ভাগ করা হয়। ১১–১৭ জুলাই ১৯৭১ কলকাতার ৮ নং থিয়েটার রোডের সম্মেলনে এই কাঠামো চূড়ান্ত হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-006",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 6,
    "source_order": 27,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "নিকটবর্তী দুটি ধ্বনি সদৃশ হওয়ার প্রক্রিয়াকে কী বলে?",
    "options": [
      "সমীভবন",
      "বিষমীভবন",
      "অপিনিহিতি",
      "স্বরভক্তি"
    ],
    "answer": "সমীভবন",
    "answer_index": 0,
    "explanation": "পাশাপাশি ধ্বনি পরস্পরের প্রভাবে সদৃশ হলে তাকে সমীভবন বা assimilation বলে। জন্ম → জম্ম এই পরিবর্তনের পরিচিত উদাহরণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-007",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 7,
    "source_order": 73,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি সমকোণী ত্রিভুজের লম্ব দুটি বাহু ৬ সেমি ও ৮ সেমি। অতিভুজ কত?",
    "options": [
      "৯ সেমি",
      "১০ সেমি",
      "১২ সেমি",
      "১৪ সেমি"
    ],
    "answer": "১০ সেমি",
    "answer_index": 1,
    "explanation": "পাইথাগোরাস সূত্র a² + b² = c²; তাই √(৬² + ৮²) = √১০০ = ১০ সেমি। ৬–৮–১০ একটি বহুল ব্যবহৃত পাইথাগোরীয় ত্রয়ী।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-008",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 8,
    "source_order": 14,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি মহাপ্রাণ ধ্বনি?",
    "options": [
      "ক",
      "খ",
      "গ",
      "ঙ"
    ],
    "answer": "খ",
    "answer_index": 1,
    "explanation": "খ উচ্চারণে ক-এর তুলনায় বেশি বায়ু বের হয়, তাই খ মহাপ্রাণ ধ্বনি। প্রতি বর্গের দ্বিতীয় ও চতুর্থ বর্ণ সাধারণত মহাপ্রাণ—খ, ঘ, ছ, ঝ, ঠ, ঢ, থ, ধ, ফ ও ভ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-009",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 9,
    "source_order": 64,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "১৯৭১ সালের ২ মার্চ ঢাকা বিশ্ববিদ্যালয়ে প্রথম স্বাধীন বাংলাদেশের পতাকা উত্তোলন করেন কে?",
    "options": [
      "আ স ম আবদুর রব",
      "শাজাহান সিরাজ",
      "তাজউদ্দীন আহমদ",
      "মওলানা ভাসানী"
    ],
    "answer": "আ স ম আবদুর রব",
    "answer_index": 0,
    "explanation": "২ মার্চ ঢাকা বিশ্ববিদ্যালয়ের কলাভবন প্রাঙ্গণে তৎকালীন ডাকসু ভিপি আ স ম আবদুর রব স্বাধীন বাংলাদেশের পতাকা প্রথম উত্তোলন করেন। সে পতাকার লাল বৃত্তের ভেতরে বাংলাদেশের মানচিত্র ছিল।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-010",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 10,
    "source_order": 71,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি ত্রিভুজের দুটি কোণ ৪৮° ও ৬৭°। তৃতীয় কোণ কত?",
    "options": [
      "৫৫°",
      "৬০°",
      "৬৫°",
      "৭৫°"
    ],
    "answer": "৬৫°",
    "answer_index": 2,
    "explanation": "ত্রিভুজের তিন অন্তঃকোণের যোগ ১৮০°। সুতরাং ১৮০° − (৪৮° + ৬৭°) = ৬৫°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-011",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 11,
    "source_order": 16,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি অঘোষ ধ্বনি?",
    "options": [
      "গ",
      "জ",
      "স",
      "দ"
    ],
    "answer": "স",
    "answer_index": 2,
    "explanation": "স উচ্চারণের সময় স্বরতন্ত্রীর কম্পন হয় না, তাই এটি অঘোষ ধ্বনি। প্রতি বর্গের প্রথম ও দ্বিতীয় বর্ণ সাধারণত অঘোষ; স, শ ও ষ-ও অঘোষ উষ্মধ্বনি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-012",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 12,
    "source_order": 46,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "প্রথম শহীদ মিনার নির্মাণ করেছিলেন কারা?",
    "options": [
      "ঢাকা মেডিকেল কলেজের ছাত্ররা",
      "পাকিস্তান সরকার",
      "ঢাকা বিশ্ববিদ্যালয়ের শিক্ষকরা",
      "পূর্ত বিভাগ"
    ],
    "answer": "ঢাকা মেডিকেল কলেজের ছাত্ররা",
    "answer_index": 0,
    "explanation": "ভাষা শহীদদের স্মরণে ১৯৫২ সালে ঢাকা মেডিকেল কলেজের ছাত্ররা প্রথম শহীদ মিনার নির্মাণ করেন। এটি ২৩ ফেব্রুয়ারি সম্পন্ন হয় এবং ২৬ ফেব্রুয়ারি পাকিস্তানি কর্তৃপক্ষ ভেঙে দেয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-013",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 13,
    "source_order": 85,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি বর্গক্ষেত্রের কর্ণ ১০√২ সেমি। ক্ষেত্রফল কত?",
    "options": [
      "৫০ বর্গসেমি",
      "১০০ বর্গসেমি",
      "২০০ বর্গসেমি",
      "৪০০ বর্গসেমি"
    ],
    "answer": "১০০ বর্গসেমি",
    "answer_index": 1,
    "explanation": "বর্গক্ষেত্রে কর্ণ d = a√২। কর্ণ ১০√২ হলে বাহু ১০ সেমি; ফলে ক্ষেত্রফল ১০² = ১০০ বর্গসেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-014",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 14,
    "source_order": 29,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘জন্ম’ → ‘জম্ম’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "স্বরলোপ",
      "সমীভবন",
      "বিষমীভবন",
      "অপিনিহিতি"
    ],
    "answer": "সমীভবন",
    "answer_index": 1,
    "explanation": "জন্ম শব্দে ন ধ্বনি পরের ম-এর প্রভাবে ম হয়ে জম্ম হয়েছে। পরবর্তী ধ্বনির প্রভাবে পূর্বের ধ্বনি বদলানোকে পরগত সমীভবনও বলা হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-015",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 15,
    "source_order": 48,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "কোন সালে পাকিস্তানের সংবিধানে বাংলাকে উর্দুর পাশাপাশি অন্যতম রাষ্ট্রভাষা করা হয়?",
    "options": [
      "১৯৫২",
      "১৯৫৪",
      "১৯৫৬",
      "১৯৬২"
    ],
    "answer": "১৯৫৬",
    "answer_index": 2,
    "explanation": "পাকিস্তানের ১৯৫৬ সালের সংবিধানে উর্দুর সঙ্গে বাংলাও রাষ্ট্রভাষার মর্যাদা পায়। প্রশ্নে সংবিধানে শব্দটি থাকলে ১৯৫৬ মনে রাখবে, ১৯৫৪ নয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-016",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 16,
    "source_order": 17,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "‘র’ কোন ধরনের ধ্বনি?",
    "options": [
      "নাসিক্য",
      "পার্শ্বিক",
      "কম্পনজাত",
      "উষ্ম"
    ],
    "answer": "কম্পনজাত",
    "answer_index": 2,
    "explanation": "র উচ্চারণে জিহ্বার অগ্রভাগ কম্পিত হয়ে দন্তমূলে আঘাত করে, তাই র কম্পনজাত ধ্বনি। র কম্পনজাত, ল পার্শ্বিক এবং ড়–ঢ় তাড়নজাত—এই জোড়াগুলো মনে রাখো।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-017",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 17,
    "source_order": 99,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ঠিক ১:০০টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার কোণ কত?",
    "options": [
      "২০°",
      "৩০°",
      "৪৫°",
      "৬০°"
    ],
    "answer": "৩০°",
    "answer_index": 1,
    "explanation": "ঠিক ১টায় কাঁটাদুটির ব্যবধান এক ঘর; প্রতিটি ঘরের কোণ ৩০°। তাই কোণ ৩০°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-018",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 18,
    "source_order": 33,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘প্রেম’ → ‘পিরেম’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "স্বরসঙ্গতি",
      "স্বরভক্তি",
      "ধ্বনি বিপর্যয়",
      "বিষমীভবন"
    ],
    "answer": "স্বরভক্তি",
    "answer_index": 1,
    "explanation": "প্রেম-এর যুক্ত ব্যঞ্জনের মাঝে ই-ধ্বনি ঢুকে পিরেম হয়েছে; এটি স্বরভক্তি বা anaptyxis। গ্লাস → গেলাসও একই ধরনের উদাহরণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-019",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 19,
    "source_order": 69,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "অপারেশন সার্চলাইট শুরু হয় কোন রাতে?",
    "options": [
      "৭ মার্চ ১৯৭১",
      "২৩ মার্চ ১৯৭১",
      "২৫ মার্চ ১৯৭১",
      "২৬ মার্চ ১৯৭১"
    ],
    "answer": "২৫ মার্চ ১৯৭১",
    "answer_index": 2,
    "explanation": "অপারেশন সার্চলাইট ২৫ মার্চ ১৯৭১ রাতে শুরু হয়। ঢাকা বিশ্ববিদ্যালয়, রাজারবাগ পুলিশ লাইন ও পিলখানাসহ গুরুত্বপূর্ণ স্থানে পরিকল্পিত হামলা চালানো হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-020",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 20,
    "source_order": 86,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ঠিক ৩:০০টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার কোণ কত?",
    "options": [
      "৬০°",
      "৯০°",
      "১২০°",
      "১৫০°"
    ],
    "answer": "৯০°",
    "answer_index": 1,
    "explanation": "ঠিক ৩টায় মিনিটের কাঁটা ১২-এ ও ঘণ্টার কাঁটা ৩-এ থাকে; ৩ × ৩০° = ৯০°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-021",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 21,
    "source_order": 8,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "বাংলা ভাষায় মৌলিক ব্যঞ্জনধ্বনি কয়টি?",
    "options": [
      "২৮টি",
      "৩০টি",
      "৩২টি",
      "৩৯টি"
    ],
    "answer": "৩০টি",
    "answer_index": 1,
    "explanation": "প্রচলিত ব্যাকরণে বাংলা ভাষার মৌলিক ব্যঞ্জনধ্বনি ৩০টি। মৌলিক ধ্বনি মোট ৩৭টি = ৭টি স্বরধ্বনি + ৩০টি ব্যঞ্জনধ্বনি; বর্ণমালার ব্যঞ্জনবর্ণ ৩৯টি—দুটি আলাদা ধারণা।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-022",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 22,
    "source_order": 42,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "১৯৫২ সালের ২০ ফেব্রুয়ারি রাতে ঢাকা শহরে কী জারি করা হয়?",
    "options": [
      "সামরিক আইন",
      "১৪৪ ধারা",
      "জরুরি অবস্থা",
      "কারফিউ"
    ],
    "answer": "১৪৪ ধারা",
    "answer_index": 1,
    "explanation": "২০ ফেব্রুয়ারি ১৯৫২ রাতে ঢাকা শহরে ১৪৪ ধারা জারি করে সভা, মিছিল ও জমায়েত নিষিদ্ধ করা হয়। ছাত্ররা ২১ ফেব্রুয়ারি এই ধারা ভঙ্গ করেই মিছিল বের করেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-023",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 23,
    "source_order": 80,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি সরলকোণের একটি অংশ ১১৮° হলে অপর অংশ কত?",
    "options": [
      "৫২°",
      "৬২°",
      "৭২°",
      "৮২°"
    ],
    "answer": "৬২°",
    "answer_index": 1,
    "explanation": "সরলকোণের মান ১৮০°। অতএব অপর অংশ ১৮০° − ১১৮° = ৬২°; পাশাপাশি এ দুই কোণ সম্পূরক কোণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-024",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 24,
    "source_order": 32,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘বড়’ → ‘বড্ড’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "স্বরলোপ",
      "ব্যঞ্জনদ্বিত্ব",
      "স্বরাগম",
      "অপিনিহিতি"
    ],
    "answer": "ব্যঞ্জনদ্বিত্ব",
    "answer_index": 1,
    "explanation": "বড় → বড্ড-এ ড ধ্বনির দ্বিত্ব হয়েছে, তাই এটি ব্যঞ্জনদ্বিত্ব। পাকা → পাক্কা একই ধরনের পরিচিত উদাহরণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-025",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 25,
    "source_order": 58,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "সেক্টর ৮-এর প্রাথমিক কমান্ডার কে ছিলেন?",
    "options": [
      "মেজর আবু ওসমান চৌধুরী",
      "মেজর এম. এ. জলিল",
      "মেজর কে. এম. শফিউল্লাহ",
      "মেজর মীর শওকত আলী"
    ],
    "answer": "মেজর আবু ওসমান চৌধুরী",
    "answer_index": 0,
    "explanation": "সেক্টর ৮-এর প্রাথমিক কমান্ডার ছিলেন মেজর আবু ওসমান চৌধুরী; পরে মেজর এম. এ. মঞ্জুর দায়িত্ব নেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-026",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 26,
    "source_order": 6,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি পরাশ্রয়ী বর্ণের উদাহরণ?",
    "options": [
      "ক",
      "ঋ",
      "ঁ",
      "য"
    ],
    "answer": "ঁ",
    "answer_index": 2,
    "explanation": "ঁ, ং ও ঃ পরাশ্রয়ী বর্ণ। এগুলো স্বতন্ত্রভাবে নয়, অন্য বর্ণ বা ধ্বনির আশ্রয়ে ব্যবহৃত হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-027",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 27,
    "source_order": 91,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "১২টার পরে প্রথমবার ঘণ্টা ও মিনিটের কাঁটা কখন মিলবে?",
    "options": [
      "১২টা ৫৫ ৫/১১ মিনিটে",
      "১টা ৫ ৫/১১ মিনিটে",
      "১টা ১০ মিনিটে",
      "১টা ১৫ মিনিটে"
    ],
    "answer": "১টা ৫ ৫/১১ মিনিটে",
    "answer_index": 1,
    "explanation": "মিনিটের কাঁটা প্রতি মিনিটে ৬° এবং ঘণ্টার কাঁটা ০.৫° চলে; আপেক্ষিক গতি ৫.৫°/মিনিট। ৩৬০ ÷ ৫.৫ = ৬৫ ৫/১১ মিনিট, অর্থাৎ ১টা ৫ ৫/১১ মিনিটে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-028",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 28,
    "source_order": 12,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি ওষ্ঠ্য ধ্বনি?",
    "options": [
      "প",
      "দ",
      "চ",
      "ক"
    ],
    "answer": "প",
    "answer_index": 0,
    "explanation": "প, ফ, ব, ভ ও ম ওষ্ঠ্য বর্গের ধ্বনি। প উচ্চারণে দুই ঠোঁট মিলিয়ে বায়ু বাধাপ্রাপ্ত হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-029",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 29,
    "source_order": 56,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "মুক্তিযুদ্ধের সেক্টর ৬-এর কমান্ডার কে ছিলেন?",
    "options": [
      "মেজর এম. এ. জলিল",
      "উইং কমান্ডার এম. খাদের বাশার",
      "মেজর মীর শওকত আলী",
      "মেজর নাজমুল হক"
    ],
    "answer": "উইং কমান্ডার এম. খাদের বাশার",
    "answer_index": 1,
    "explanation": "সেক্টর ৬-এর কমান্ডার ছিলেন উইং কমান্ডার এম. খাদের বাশার। সেক্টর ৬ মূলত রংপুর ও দিনাজপুরের অংশ নিয়ে গঠিত ছিল।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-030",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 30,
    "source_order": 89,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ৪:২০টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার ক্ষুদ্রতর কোণ কত?",
    "options": [
      "০°",
      "১০°",
      "২০°",
      "৩০°"
    ],
    "answer": "১০°",
    "answer_index": 1,
    "explanation": "ঘড়ির কোণের সূত্র |৩০H − ৫.৫M|। ৪:২০-এ |১২০ − ১১০| = ১০°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-031",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 31,
    "source_order": 34,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘স্কুল’ → ‘ইস্কুল’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "স্বরাগম",
      "স্বরলোপ",
      "সমীভবন",
      "স্বরসঙ্গতি"
    ],
    "answer": "স্বরাগম",
    "answer_index": 0,
    "explanation": "স্কুল শব্দের শুরুতে ই স্বর যুক্ত হয়ে ইস্কুল হয়েছে; এটি আদি স্বরাগম।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-032",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 32,
    "source_order": 49,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "ইউনেস্কো ২১ ফেব্রুয়ারিকে আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে ঘোষণা করে কবে?",
    "options": [
      "২১ ফেব্রুয়ারি ১৯৯৯",
      "১৭ নভেম্বর ১৯৯৯",
      "২১ ফেব্রুয়ারি ২০০০",
      "১৭ নভেম্বর ২০০০"
    ],
    "answer": "১৭ নভেম্বর ১৯৯৯",
    "answer_index": 1,
    "explanation": "ইউনেস্কোর ৩০তম সাধারণ সম্মেলনে ১৭ নভেম্বর ১৯৯৯ আন্তর্জাতিক মাতৃভাষা দিবসের স্বীকৃতি দেওয়া হয়। বিশ্বজুড়ে প্রথম পালিত হয় ২১ ফেব্রুয়ারি ২০০০।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-033",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 33,
    "source_order": 76,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "ব্যাসার্ধ ৭ সেমি একটি বৃত্তের পরিধি কত? (π = ২২/৭)",
    "options": [
      "২২ সেমি",
      "৪৪ সেমি",
      "৭৭ সেমি",
      "১৫৪ সেমি"
    ],
    "answer": "৪৪ সেমি",
    "answer_index": 1,
    "explanation": "বৃত্তের পরিধি C = ২πr। তাই ২ × ২২/৭ × ৭ = ৪৪ সেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-034",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 34,
    "source_order": 26,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "দ্রুত উচ্চারণে শব্দের কোনো ধ্বনি লুপ্ত হলে তাকে কী বলে?",
    "options": [
      "স্বরাগম",
      "ধ্বনিলোপ",
      "ধ্বনি বিপর্যয়",
      "ব্যঞ্জনদ্বিত্ব"
    ],
    "answer": "ধ্বনিলোপ",
    "answer_index": 1,
    "explanation": "দ্রুত উচ্চারণে কোনো ধ্বনি বাদ পড়লে তাকে ধ্বনিলোপ বলে। জানালা → জানলা-তে মধ্যবর্তী স্বর লোপ পেয়েছে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-035",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 35,
    "source_order": 44,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "ভাষা শহীদ আবুল বরকত কী ছিলেন?",
    "options": [
      "ঢাকা বিশ্ববিদ্যালয়ের এমএ শ্রেণির ছাত্র",
      "ঢাকা হাইকোর্টের কর্মচারী",
      "সাংবাদিক",
      "চিকিৎসক"
    ],
    "answer": "ঢাকা বিশ্ববিদ্যালয়ের এমএ শ্রেণির ছাত্র",
    "answer_index": 0,
    "explanation": "আবুল বরকত ঢাকা বিশ্ববিদ্যালয়ের রাষ্ট্রবিজ্ঞান বিভাগের এমএ শ্রেণির ছাত্র ছিলেন। ভাষা শহীদদের পরিচয় থেকেও MCQ আসে—বরকত ছাত্র, শফিউর হাইকোর্ট কর্মচারী।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-036",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 36,
    "source_order": 38,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘করিয়া’ → ‘করে’ রূপান্তরটি কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "স্বরাগম",
      "অভিশ্রুতি",
      "ব্যঞ্জনদ্বিত্ব",
      "স্বরভক্তি"
    ],
    "answer": "অভিশ্রুতি",
    "answer_index": 1,
    "explanation": "করিয়া → কইরা → করে রূপান্তরে অপিনিহিতি-পরবর্তী স্বরপরিবর্তন ঘটে; এটি অভিশ্রুতি। রাখিয়া → রাইখ্যা → রেখে-ও একই ধারার উদাহরণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-037",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 37,
    "source_order": 93,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ৯:১৫টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার ক্ষুদ্রতর কোণ কত?",
    "options": [
      "১৬৫°",
      "১৭০°",
      "১৭২° ৩০′",
      "১৭৫°"
    ],
    "answer": "১৭২° ৩০′",
    "answer_index": 2,
    "explanation": "৯:১৫-এ কাঁটার সরাসরি ব্যবধান ১৮৭° ৩০′। ক্ষুদ্রতর কোণ তাই ৩৬০° − ১৮৭° ৩০′ = ১৭২° ৩০′।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-038",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 38,
    "source_order": 10,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি দন্ত্য ধ্বনি?",
    "options": [
      "ক",
      "ট",
      "দ",
      "প"
    ],
    "answer": "দ",
    "answer_index": 2,
    "explanation": "দ উচ্চারণে জিহ্বার অগ্রভাগ দাঁতের গোড়া বা দাঁতে স্পর্শ করে, তাই এটি দন্ত্য ধ্বনি। ত, থ, দ, ধ, ন দন্ত্য বর্গ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-039",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 39,
    "source_order": 50,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "পাকিস্তান গণপরিষদে বাংলাকে পরিষদের ভাষা হিসেবে অন্তর্ভুক্তির সংশোধনী প্রস্তাব কে দেন?",
    "options": [
      "ধীরেন্দ্রনাথ দত্ত",
      "আবুল হাশেম",
      "শামসুল হক",
      "অলি আহাদ"
    ],
    "answer": "ধীরেন্দ্রনাথ দত্ত",
    "answer_index": 0,
    "explanation": "ধীরেন্দ্রনাথ দত্ত ২৩ ফেব্রুয়ারি ১৯৪৮ পাকিস্তান গণপরিষদে বাংলা অন্তর্ভুক্তির সংশোধনী প্রস্তাব দেন। ভাষা আন্দোলনের সাংবিধানিক সূচনার সঙ্গে তাঁর নাম জড়িত।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-040",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 40,
    "source_order": 74,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি ত্রিভুজের ভূমি ১৬ সেমি এবং উচ্চতা ৯ সেমি। ক্ষেত্রফল কত?",
    "options": [
      "৬৪ বর্গসেমি",
      "৭২ বর্গসেমি",
      "৮০ বর্গসেমি",
      "৯৬ বর্গসেমি"
    ],
    "answer": "৭২ বর্গসেমি",
    "answer_index": 1,
    "explanation": "ত্রিভুজের ক্ষেত্রফল = ½ × ভূমি × উচ্চতা। তাই ½ × ১৬ × ৯ = ৭২ বর্গসেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-041",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 41,
    "source_order": 19,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "‘ক্ষ’ যুক্তবর্ণের বিশ্লিষ্ট রূপ কোনটি?",
    "options": [
      "ক্ + ষ",
      "ক্ + শ",
      "খ্ + ষ",
      "ক্ + স"
    ],
    "answer": "ক্ + ষ",
    "answer_index": 0,
    "explanation": "ক্ষ যুক্তবর্ণটি ক্ + ষ দিয়ে গঠিত। উচ্চারণ ভিন্ন শোনালেও বানান-বিশ্লেষণে ক্ + ষ লিখতে হবে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-042",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 42,
    "source_order": 55,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "সেক্টর ৪ ও সেক্টর ৫-এর কমান্ডার যথাক্রমে কে ছিলেন?",
    "options": [
      "মেজর সি. আর. দত্ত ও মেজর মীর শওকত আলী",
      "মেজর খালেদ মোশাররফ ও মেজর কে. এম. শফিউল্লাহ",
      "মেজর এম. এ. জলিল ও মেজর আবু তাহের",
      "মেজর নাজমুল হক ও মেজর আবু ওসমান চৌধুরী"
    ],
    "answer": "মেজর সি. আর. দত্ত ও মেজর মীর শওকত আলী",
    "answer_index": 0,
    "explanation": "সেক্টর ৪-এর কমান্ডার মেজর সি. আর. দত্ত এবং সেক্টর ৫-এর কমান্ডার মেজর মীর শওকত আলী।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-043",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 43,
    "source_order": 90,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ৭:২০টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার ক্ষুদ্রতর কোণ কত?",
    "options": [
      "৯০°",
      "৯৫°",
      "১০০°",
      "১১০°"
    ],
    "answer": "১০০°",
    "answer_index": 2,
    "explanation": "৭:২০-এ ঘণ্টার কাঁটা ২২০° ও মিনিটের কাঁটা ১২০°-এ; পার্থক্য ১০০°। সূত্রে H অবশ্যই ১২-ঘণ্টার ঘরের সংখ্যা।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-044",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 44,
    "source_order": 35,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘জানালা’ → ‘জানলা’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "স্বরলোপ",
      "স্বরাগম",
      "স্বরভক্তি",
      "ব্যঞ্জনদ্বিত্ব"
    ],
    "answer": "স্বরলোপ",
    "answer_index": 0,
    "explanation": "জানালা থেকে একটি অ ধ্বনি লোপ পেয়ে জানলা হয়েছে। তাই এটি স্বরলোপ, যা ধ্বনিলোপের বিশেষ রূপ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-045",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 45,
    "source_order": 53,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "মুক্তিযুদ্ধের সেক্টর ২-এর কমান্ডার কে ছিলেন?",
    "options": [
      "মেজর খালেদ মোশাররফ",
      "মেজর কে. এম. শফিউল্লাহ",
      "মেজর সি. আর. দত্ত",
      "মেজর মীর শওকত আলী"
    ],
    "answer": "মেজর খালেদ মোশাররফ",
    "answer_index": 0,
    "explanation": "মেজর খালেদ মোশাররফ সেক্টর ২-এর প্রধান কমান্ডার ছিলেন; পরে মেজর এ টি এম হায়দার দায়িত্ব নেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-046",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 46,
    "source_order": 1,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "ভাষার ক্ষুদ্রতম শ্রুতিগ্রাহ্য একক কোনটি?",
    "options": [
      "বর্ণ",
      "ধ্বনি",
      "শব্দ",
      "বাক্য"
    ],
    "answer": "ধ্বনি",
    "answer_index": 1,
    "explanation": "ধ্বনি কানে শোনা যায়; ভাষার শ্রুতিগ্রাহ্য ক্ষুদ্রতম একক ধ্বনি। লিখিত প্রতীক বোঝালে উত্তর হবে বর্ণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-047",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 47,
    "source_order": 87,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ঠিক ৬:০০টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার কোণ কত?",
    "options": [
      "৯০°",
      "১২০°",
      "১৫০°",
      "১৮০°"
    ],
    "answer": "১৮০°",
    "answer_index": 3,
    "explanation": "ঠিক ৬টায় দুটি কাঁটা সরলরেখায় বিপরীত দিকে থাকে, তাই কোণ ১৮০°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-048",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 48,
    "source_order": 31,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘পিশাচ’ → ‘পিচাশ’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "ধ্বনি বিপর্যয়",
      "স্বরসঙ্গতি",
      "স্বরভক্তি",
      "ব্যঞ্জনদ্বিত্ব"
    ],
    "answer": "ধ্বনি বিপর্যয়",
    "answer_index": 0,
    "explanation": "পিশাচ → পিচাশ-এ শ ও চ-এর অবস্থান বদলেছে। ধ্বনি যোগ বা লোপ না পেয়ে অবস্থান বদলালে তাকে ধ্বনি বিপর্যয় বলে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-049",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 49,
    "source_order": 67,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "১৯৭১ সালের অসহযোগ আন্দোলন আনুষ্ঠানিকভাবে কত তারিখ পর্যন্ত চলে?",
    "options": [
      "৭ মার্চ",
      "১৭ মার্চ",
      "২৫ মার্চ",
      "২৬ মার্চ"
    ],
    "answer": "২৫ মার্চ",
    "answer_index": 2,
    "explanation": "অসহযোগ আন্দোলন ২ মার্চ থেকে ২৫ মার্চ ১৯৭১-এর সামরিক অভিযানের আগ পর্যন্ত চলে। এই সময় পূর্ব বাংলার প্রশাসন কার্যত বঙ্গবন্ধুর নির্দেশ অনুসরণ করত।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-050",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 50,
    "source_order": 81,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি ত্রিভুজের দুই দূরবর্তী অন্তঃকোণ ৪৫° ও ৬০°। সংশ্লিষ্ট বহিঃকোণ কত?",
    "options": [
      "৯০°",
      "৯৫°",
      "১০০°",
      "১০৫°"
    ],
    "answer": "১০৫°",
    "answer_index": 3,
    "explanation": "ত্রিভুজের বহিঃকোণ দুই দূরবর্তী অন্তঃকোণের যোগফল। তাই ৪৫° + ৬০° = ১০৫°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-051",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 51,
    "source_order": 23,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "‘আ’ উচ্চারণে জিহ্বা নিচু থাকে; তাই এটি কোন স্বরধ্বনি?",
    "options": [
      "সংবৃত",
      "বিবৃত",
      "সম্মুখ",
      "অর্ধসংবৃত"
    ],
    "answer": "বিবৃত",
    "answer_index": 1,
    "explanation": "আ উচ্চারণে জিহ্বা নিচু থাকে এবং মুখ বেশি খোলে, তাই এটি বিবৃত স্বর। জিহ্বা উঁচু ও মুখ কম খোলা হলে স্বর সংবৃত হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-052",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 52,
    "source_order": 52,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "চট্টগ্রাম ও পার্বত্য চট্টগ্রাম প্রধানত কোন সেক্টরের অন্তর্ভুক্ত ছিল?",
    "options": [
      "সেক্টর ১",
      "সেক্টর ২",
      "সেক্টর ৪",
      "সেক্টর ৮"
    ],
    "answer": "সেক্টর ১",
    "answer_index": 0,
    "explanation": "সেক্টর ১-এ চট্টগ্রাম, পার্বত্য চট্টগ্রাম এবং নোয়াখালীর পূর্বাংশ ছিল। এর প্রাথমিক কমান্ডার জিয়াউর রহমান, পরে রফিকুল ইসলাম।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-053",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 53,
    "source_order": 79,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি সুষম ষড়ভুজের প্রতিটি অন্তঃকোণের মান কত?",
    "options": [
      "৯০°",
      "১০৮°",
      "১২০°",
      "১৩৫°"
    ],
    "answer": "১২০°",
    "answer_index": 2,
    "explanation": "সুষম ষড়ভুজের প্রতিটি অন্তঃকোণ = (৬ − ২) × ১৮০° ÷ ৬ = ১২০°। এর প্রতিটি বহিঃকোণ ৬০°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-054",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 54,
    "source_order": 2,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "ধ্বনির লিখিত প্রতীককে কী বলে?",
    "options": [
      "বর্ণ",
      "অক্ষর",
      "শব্দ",
      "পদ"
    ],
    "answer": "বর্ণ",
    "answer_index": 0,
    "explanation": "ধ্বনির লিখিত প্রতীককে বর্ণ বলে। ধ্বনি শোনা যায়, বর্ণ লেখা ও দেখা যায়; সব বর্ণের সমষ্টি বর্ণমালা।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-055",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 55,
    "source_order": 60,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "সেক্টর ১০ মূলত কোন ধরনের অভিযানের জন্য নির্ধারিত ছিল?",
    "options": [
      "নৌ-কমান্ডো অভিযান",
      "বিমান প্রতিরক্ষা",
      "কেবল স্থলযুদ্ধ",
      "সীমান্ত শরণার্থী ব্যবস্থাপনা"
    ],
    "answer": "নৌ-কমান্ডো অভিযান",
    "answer_index": 0,
    "explanation": "সেক্টর ১০ নৌ-কমান্ডোদের বিশেষ অভিযানের জন্য নির্ধারিত ছিল এবং এর নির্দিষ্ট ভৌগোলিক এলাকা ছিল না।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-056",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 56,
    "source_order": 4,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "প্রচলিত বাংলা বর্ণমালায় স্বরবর্ণ কয়টি?",
    "options": [
      "৯টি",
      "১০টি",
      "১১টি",
      "১২টি"
    ],
    "answer": "১১টি",
    "answer_index": 2,
    "explanation": "প্রচলিত বাংলা বর্ণমালায় অ, আ, ই, ঈ, উ, ঊ, ঋ, এ, ঐ, ও ও ঔ—মোট ১১টি স্বরবর্ণ। মৌলিক স্বরধ্বনি ৭টি, তাই দুটি গুলিয়ে ফেলবে না।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-057",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 57,
    "source_order": 98,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "১২ ঘণ্টায় ঘণ্টা ও মিনিটের কাঁটা কতবার মিলিত হয়?",
    "options": [
      "১০ বার",
      "১১ বার",
      "১২ বার",
      "১৩ বার"
    ],
    "answer": "১১ বার",
    "answer_index": 1,
    "explanation": "১২ ঘণ্টায় ঘণ্টা ও মিনিটের কাঁটা ১১ বার মিলিত হয়; ২৪ ঘণ্টায় ২২ বার। শুরু ও শেষের একই মিলনকে দুইবার গণনা করা হয় না।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-058",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 58,
    "source_order": 24,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি উষ্মধ্বনি?",
    "options": [
      "ক",
      "ট",
      "স",
      "ন"
    ],
    "answer": "স",
    "answer_index": 2,
    "explanation": "স, শ, ষ ও হ উষ্মধ্বনি। উচ্চারণে সরু পথে বায়ুর ঘর্ষণ বা শিসের মতো শব্দ হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-059",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 59,
    "source_order": 54,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "মুক্তিযুদ্ধের সেক্টর ৩-এর কমান্ডার কে ছিলেন?",
    "options": [
      "মেজর এম. এ. জলিল",
      "মেজর কে. এম. শফিউল্লাহ",
      "মেজর আবু ওসমান চৌধুরী",
      "মেজর আবু তাহের"
    ],
    "answer": "মেজর কে. এম. শফিউল্লাহ",
    "answer_index": 1,
    "explanation": "মেজর কে. এম. শফিউল্লাহ সেক্টর ৩-এর প্রাথমিক কমান্ডার ছিলেন; সেপ্টেম্বর থেকে মেজর এ. এন. এম. নুরুজ্জামান দায়িত্ব নেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-060",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 60,
    "source_order": 82,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি রম্বসের কর্ণ দুটি ১২ সেমি ও ১০ সেমি। ক্ষেত্রফল কত?",
    "options": [
      "৫০ বর্গসেমি",
      "৬০ বর্গসেমি",
      "৭২ বর্গসেমি",
      "১২০ বর্গসেমি"
    ],
    "answer": "৬০ বর্গসেমি",
    "answer_index": 1,
    "explanation": "রম্বসের ক্ষেত্রফল = ½ × কর্ণ₁ × কর্ণ₂। তাই ½ × ১২ × ১০ = ৬০ বর্গসেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-061",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 61,
    "source_order": 28,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "সদৃশ দুটি ধ্বনির একটিকে বিসদৃশ করার প্রক্রিয়াকে কী বলে?",
    "options": [
      "স্বরসঙ্গতি",
      "বিষমীভবন",
      "ব্যঞ্জনদ্বিত্ব",
      "স্বরাগম"
    ],
    "answer": "বিষমীভবন",
    "answer_index": 1,
    "explanation": "দুটি সদৃশ ধ্বনির একটি বদলে বিসদৃশ হলে তাকে বিষমীভবন বা dissimilation বলে। শরীর → শরীল এর পরিচিত উদাহরণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-062",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 62,
    "source_order": 62,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "১৯৭১ সালের ১ মার্চ জাতীয় পরিষদের অধিবেশন অনির্দিষ্টকালের জন্য স্থগিত ঘোষণা করেন কে?",
    "options": [
      "জেনারেল ইয়াহিয়া খান",
      "জুলফিকার আলী ভুট্টো",
      "আইয়ুব খান",
      "নূরুল আমিন"
    ],
    "answer": "জেনারেল ইয়াহিয়া খান",
    "answer_index": 0,
    "explanation": "১ মার্চ ১৯৭১ ইয়াহিয়া খান ঢাকায় ৩ মার্চ বসার কথা থাকা জাতীয় পরিষদ অধিবেশন অনির্দিষ্টকালের জন্য স্থগিত করেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-063",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 63,
    "source_order": 84,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "ব্যাসার্ধ ৭ সেমি একটি অর্ধবৃত্তের ক্ষেত্রফল কত? (π = ২২/৭)",
    "options": [
      "৪৪ বর্গসেমি",
      "৪৯ বর্গসেমি",
      "৭৭ বর্গসেমি",
      "১৫৪ বর্গসেমি"
    ],
    "answer": "৭৭ বর্গসেমি",
    "answer_index": 2,
    "explanation": "অর্ধবৃত্তের ক্ষেত্রফল = ½πr²। তাই ½ × ২২/৭ × ৭² = ৭৭ বর্গসেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-064",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 64,
    "source_order": 25,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি স্পর্শধ্বনি?",
    "options": [
      "র",
      "ল",
      "ট",
      "স"
    ],
    "answer": "ট",
    "answer_index": 2,
    "explanation": "ট উচ্চারণে বায়ু সম্পূর্ণ বাধাপ্রাপ্ত হয়ে পরে বের হয়, তাই এটি স্পর্শধ্বনি। পাঁচ বর্গের বর্ণগুলো স্পর্শধ্বনির প্রধান উদাহরণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-065",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 65,
    "source_order": 41,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "রাষ্ট্রভাষা বাংলার দাবিতে প্রথম সর্বাত্মক হরতাল পালিত হয় কবে?",
    "options": [
      "১১ মার্চ ১৯৪৮",
      "২১ ফেব্রুয়ারি ১৯৫২",
      "২১ ফেব্রুয়ারি ১৯৪৮",
      "৭ মার্চ ১৯৭১"
    ],
    "answer": "১১ মার্চ ১৯৪৮",
    "answer_index": 0,
    "explanation": "রাষ্ট্রভাষা বাংলার দাবিতে প্রথম সর্বাত্মক হরতাল পালিত হয় ১১ মার্চ ১৯৪৮। গণপরিষদ, মুদ্রা, ডাকটিকিট ও চাকরির পরীক্ষায় বাংলার দাবি ছিল এর কেন্দ্রবিন্দু।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-066",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 66,
    "source_order": 22,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি যৌগিক স্বরধ্বনির উদাহরণ?",
    "options": [
      "অ",
      "আ",
      "ই",
      "ঐ"
    ],
    "answer": "ঐ",
    "answer_index": 3,
    "explanation": "ঐ ও ঔ যৌগিক স্বরধ্বনির পরিচিত উদাহরণ। অ, আ ও ই-এর মতো একক স্বরের বিপরীতে ঐ-তে দুই স্বরের মিলন ধরা হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-067",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 67,
    "source_order": 94,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "একটি ঘড়ি প্রতি ঘণ্টায় ৫ মিনিট এগিয়ে যায়। সকাল ৮টায় ঠিক করলে প্রকৃত সন্ধ্যা ৮টায় ঘড়িটি কত বাজাবে?",
    "options": [
      "৮টা",
      "৮টা ৩০ মিনিট",
      "৯টা",
      "৯টা ৩০ মিনিট"
    ],
    "answer": "৯টা",
    "answer_index": 2,
    "explanation": "১২ ঘণ্টায় ঘণ্টার কাঁটা একবার এবং মিনিটের কাঁটা ১২ বার ঘোরে; ২৪ ঘণ্টায় যথাক্রমে ২ ও ২৪ বার। ব্যবধান ২২ বার।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-068",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 68,
    "source_order": 3,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "অর্থবোধক ধ্বনিসমষ্টিকে কী বলে?",
    "options": [
      "ধ্বনি",
      "বর্ণ",
      "শব্দ",
      "বাক্য"
    ],
    "answer": "শব্দ",
    "answer_index": 2,
    "explanation": "অর্থ প্রকাশ করে এমন এক বা একাধিক ধ্বনির সমষ্টি শব্দ। শব্দের সমষ্টিতে বাক্য গঠিত হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-069",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 69,
    "source_order": 61,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "মেজর আবু তাহের মুক্তিযুদ্ধের কোন সেক্টরের উল্লেখযোগ্য কমান্ডার ছিলেন?",
    "options": [
      "সেক্টর ৪",
      "সেক্টর ৬",
      "সেক্টর ১১",
      "সেক্টর ২"
    ],
    "answer": "সেক্টর ১১",
    "answer_index": 2,
    "explanation": "মেজর আবু তাহের মুক্তিযুদ্ধের সেক্টর ১১-এর উল্লেখযোগ্য কমান্ডার ছিলেন। সেক্টর ১১-এ পর্যায়ক্রমে জিয়াউর রহমান, আবু তাহের ও হামিদুল্লাহ খান দায়িত্ব পালন করেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-070",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 70,
    "source_order": 72,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি সমদ্বিবাহু ত্রিভুজের সমান দুটি কোণ ৭২° করে। শীর্ষকোণ কত?",
    "options": [
      "২৪°",
      "৩৬°",
      "৫৪°",
      "৭২°"
    ],
    "answer": "৩৬°",
    "answer_index": 1,
    "explanation": "সমদ্বিবাহু ত্রিভুজে সমান দুই কোণ ৭২° করে হলে শীর্ষকোণ = ১৮০° − ৭২° − ৭২° = ৩৬°।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-071",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 71,
    "source_order": 36,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘বিলাতি’ → ‘বিলিতি’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "স্বরভক্তি",
      "অপিনিহিতি",
      "স্বরসঙ্গতি",
      "ধ্বনি বিপর্যয়"
    ],
    "answer": "স্বরসঙ্গতি",
    "answer_index": 2,
    "explanation": "বিলাতি-র আ ধ্বনি ই-এর প্রভাবে ই হয়েছে; এটি স্বরসঙ্গতি। দেশি → দিশি ও মুলা → মুলোও পরিচিত উদাহরণ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-072",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 72,
    "source_order": 45,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "ভাষা শহীদ শফিউর রহমান পেশায় কী ছিলেন?",
    "options": [
      "ঢাকা হাইকোর্টের কর্মচারী",
      "ঢাকা বিশ্ববিদ্যালয়ের শিক্ষক",
      "সাংবাদিক",
      "চিকিৎসক"
    ],
    "answer": "ঢাকা হাইকোর্টের কর্মচারী",
    "answer_index": 0,
    "explanation": "শফিউর রহমান ঢাকা হাইকোর্টের কর্মচারী ছিলেন এবং ২২ ফেব্রুয়ারির মিছিলে শহীদ হন। তাঁকে ছাত্র বলে গুলিয়ে ফেলবে না।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-073",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 73,
    "source_order": 78,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "দৈর্ঘ্য ১৫ সেমি ও প্রস্থ ৮ সেমি একটি আয়তের কর্ণ কত?",
    "options": [
      "১৬ সেমি",
      "১৭ সেমি",
      "১৮ সেমি",
      "১৯ সেমি"
    ],
    "answer": "১৭ সেমি",
    "answer_index": 1,
    "explanation": "আয়তের কর্ণ দৈর্ঘ্য ও প্রস্থকে লম্ব বাহু ধরে সমকোণী ত্রিভুজ তৈরি করে। √(১৫² + ৮²) = √২৮৯ = ১৭ সেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-074",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 74,
    "source_order": 7,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "ব্যঞ্জনবর্ণের সংক্ষিপ্ত রূপকে কী বলে?",
    "options": [
      "কার",
      "ফলা",
      "মাত্রা",
      "হসন্ত"
    ],
    "answer": "ফলা",
    "answer_index": 1,
    "explanation": "যুক্তবর্ণে ব্যবহৃত ব্যঞ্জনবর্ণের সংক্ষিপ্ত রূপকে ফলা বলে—যেমন য-ফলা, র-ফলা। কার হলো স্বরবর্ণের সংক্ষিপ্ত চিহ্ন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-075",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 75,
    "source_order": 63,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "১৯৭১ সালের ৩ মার্চ জাতীয় পরিষদের অধিবেশন কোথায় বসার কথা ছিল?",
    "options": [
      "ঢাকায়",
      "লাহোরে",
      "করাচিতে",
      "ইসলামাবাদে"
    ],
    "answer": "ঢাকায়",
    "answer_index": 0,
    "explanation": "জাতীয় পরিষদের প্রথম অধিবেশন ৩ মার্চ ১৯৭১ ঢাকায় বসার কথা ছিল; ইয়াহিয়া খান ১ মার্চ সেটি স্থগিত করেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-076",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 76,
    "source_order": 11,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি মূর্ধন্য ধ্বনি?",
    "options": [
      "ন",
      "ণ",
      "ম",
      "ঙ"
    ],
    "answer": "ণ",
    "answer_index": 1,
    "explanation": "ট, ঠ, ড, ঢ, ণ মূর্ধন্য বর্গের ধ্বনি। ণ উচ্চারণে জিহ্বা উল্টে মূর্ধা স্পর্শ করে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-077",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 77,
    "source_order": 96,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "একটি ঘড়ি প্রতি ২৪ ঘণ্টায় ২ মিনিট এগিয়ে যায়। ১৫ দিনে ঘড়িটি কত মিনিট এগিয়ে যাবে?",
    "options": [
      "২০ মিনিট",
      "২৫ মিনিট",
      "৩০ মিনিট",
      "৩২ মিনিট"
    ],
    "answer": "৩০ মিনিট",
    "answer_index": 2,
    "explanation": "২৪ ঘণ্টায় ২ মিনিট এগোলে ১৫ দিনে ঘড়ি ১৫ × ২ = ৩০ মিনিট এগিয়ে যাবে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-078",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 78,
    "source_order": 20,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "‘জ্ঞ’ যুক্তবর্ণের বিশ্লিষ্ট রূপ কোনটি?",
    "options": [
      "জ্ + ঞ",
      "ঞ্ + জ",
      "গ্ + য",
      "জ্ + ন"
    ],
    "answer": "জ্ + ঞ",
    "answer_index": 0,
    "explanation": "জ্ঞ যুক্তবর্ণটি জ্ + ঞ দিয়ে গঠিত। আঞ্চলিক উচ্চারণ ভিন্ন হলেও বর্ণগত বিশ্লেষণে জ্ + ঞ হবে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-079",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 79,
    "source_order": 66,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "৭ মার্চের ঐতিহাসিক ভাষণ কোথায় দেওয়া হয়?",
    "options": [
      "রেসকোর্স ময়দানে",
      "পল্টন ময়দানে",
      "সোহরাওয়ার্দী হল প্রাঙ্গণে",
      "ঢাকা বিশ্ববিদ্যালয়ের কলাভবনে"
    ],
    "answer": "রেসকোর্স ময়দানে",
    "answer_index": 0,
    "explanation": "বঙ্গবন্ধুর ৭ মার্চের ভাষণ রেসকোর্স ময়দানে হয়; বর্তমান নাম সোহরাওয়ার্দী উদ্যান।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-080",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 80,
    "source_order": 88,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "ঘড়িতে ২:৩০টায় ঘণ্টা ও মিনিটের কাঁটার মধ্যকার ক্ষুদ্রতর কোণ কত?",
    "options": [
      "৭৫°",
      "৯০°",
      "১০৫°",
      "১২০°"
    ],
    "answer": "১০৫°",
    "answer_index": 2,
    "explanation": "২:৩০-এ ঘণ্টার কাঁটা ৭৫° এবং মিনিটের কাঁটা ১৮০°-এ থাকে। পার্থক্য ১০৫°; ঘণ্টার কাঁটা ২-এ স্থির থাকে না।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-081",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 81,
    "source_order": 37,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘রাখিয়া’ → ‘রাইখা’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "অভিশ্রুতি",
      "অপিনিহিতি",
      "বিষমীভবন",
      "সমীভবন"
    ],
    "answer": "অপিনিহিতি",
    "answer_index": 1,
    "explanation": "রাখিয়া-তে খ-এর পরের ই আগে উচ্চারিত হয়ে রাইখা হয়েছে; এটি অপিনিহিতি। সহজ সূত্র: পরের ই/উ আগে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-082",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 82,
    "source_order": 59,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "মুক্তিযুদ্ধের সেক্টর ৯-এর কমান্ডার কে ছিলেন?",
    "options": [
      "মেজর এম. এ. জলিল",
      "মেজর আবু তাহের",
      "মেজর নাজমুল হক",
      "মেজর জিয়াউর রহমান"
    ],
    "answer": "মেজর এম. এ. জলিল",
    "answer_index": 0,
    "explanation": "সেক্টর ৯-এর কমান্ডার ছিলেন মেজর এম. এ. জলিল; পরে মেজর জয়নাল আবেদীনও দায়িত্ব পান।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-083",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 83,
    "source_order": 95,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "একটি ঘড়ি ২৪ ঘণ্টায় ১০ মিনিট পিছিয়ে যায়। মধ্যরাতে ঠিক করার পর প্রকৃত দুপুর ১২টায় ঘড়িটি কত দেখাবে?",
    "options": [
      "১১টা ৫০ মিনিট",
      "১১টা ৫৫ মিনিট",
      "১২টা",
      "১২টা ৫ মিনিট"
    ],
    "answer": "১১টা ৫৫ মিনিট",
    "answer_index": 1,
    "explanation": "২৪ ঘণ্টায় ১০ মিনিট পিছোলে ১২ ঘণ্টায় ৫ মিনিট পিছোবে। তাই মধ্যরাত থেকে প্রকৃত দুপুরে ঘড়ি দেখাবে ১১টা ৫৫ মিনিট।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-084",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 84,
    "source_order": 5,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "বাংলা ভাষায় মৌলিক স্বরধ্বনি কয়টি?",
    "options": [
      "৫টি",
      "৬টি",
      "৭টি",
      "১১টি"
    ],
    "answer": "৭টি",
    "answer_index": 2,
    "explanation": "বাংলায় মৌলিক স্বরধ্বনি ৭টি: অ, আ, ই, উ, এ, ও ও অ্যা। বর্ণমালার ১১ স্বরবর্ণের সঙ্গে এটি গুলিয়ে ফেলবে না।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-085",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 85,
    "source_order": 65,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "১৯৭১ সালের ৩ মার্চ পল্টন ময়দানে স্বাধীনতার ইশতেহার পাঠ করেন কে?",
    "options": [
      "শাজাহান সিরাজ",
      "আ স ম আবদুর রব",
      "কাজী আরেফ আহমেদ",
      "সিরাজুল আলম খান"
    ],
    "answer": "শাজাহান সিরাজ",
    "answer_index": 0,
    "explanation": "৩ মার্চ পল্টন ময়দানে শাজাহান সিরাজ স্বাধীনতার ইশতেহার পাঠ করেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-086",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 86,
    "source_order": 39,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "স্বরভক্তির ক্ষেত্রে কী ঘটে?",
    "options": [
      "শব্দের আদিতে ব্যঞ্জনধ্বনি যুক্ত হয়",
      "যুক্ত ব্যঞ্জনের মাঝে স্বরধ্বনি যুক্ত হয়",
      "দুটি ধ্বনির স্থান বদলে যায়",
      "একটি ধ্বনি লুপ্ত হয়"
    ],
    "answer": "যুক্ত ব্যঞ্জনের মাঝে স্বরধ্বনি যুক্ত হয়",
    "answer_index": 1,
    "explanation": "স্বরভক্তিতে যুক্ত ব্যঞ্জনের উচ্চারণ সহজ করতে মাঝখানে স্বরধ্বনি যুক্ত হয়। প্রেম → পিরেম স্বরভক্তি; স্কুল → ইস্কুল আদি স্বরাগম।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-087",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 87,
    "source_order": 97,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "২৪ ঘণ্টায় মিনিটের কাঁটা ঘণ্টার কাঁটার চেয়ে কতবার বেশি পূর্ণ আবর্তন করে?",
    "options": [
      "১২ বার",
      "২০ বার",
      "২২ বার",
      "২৪ বার"
    ],
    "answer": "২২ বার",
    "answer_index": 2,
    "explanation": "শুরুতে ১৫ মিনিট এগিয়ে থাকা ঘড়ি প্রতি ঘণ্টায় ৫ মিনিট করে পিছোলে ত্রুটি শূন্য হতে ১৫ ÷ ৫ = ৩ ঘণ্টা লাগে। তাই দুপুর ৩টায় ঠিক সময় দেখাবে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-088",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 88,
    "source_order": 40,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "অপিনিহিতিতে ব্যঞ্জনের পরের ই-কার বা উ-কার কোথায় উচ্চারিত হয়?",
    "options": [
      "শব্দের শেষে",
      "সংশ্লিষ্ট ব্যঞ্জনের আগে",
      "অপরিবর্তিত স্থানে",
      "শুধু নাসিক্য বর্ণের পরে"
    ],
    "answer": "সংশ্লিষ্ট ব্যঞ্জনের আগে",
    "answer_index": 1,
    "explanation": "অপিনিহিতিতে ব্যঞ্জনের পরের ই-কার বা উ-কার স্বস্থানে না থেকে সংশ্লিষ্ট ব্যঞ্জনের আগে উচ্চারিত হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-089",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 89,
    "source_order": 43,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "ভাষা আন্দোলন",
    "question": "১৯৫২ সালের ২১ ফেব্রুয়ারি বাংলা সনের কত ফাল্গুন ছিল?",
    "options": [
      "৮ ফাল্গুন ১৩৫৮",
      "১২ ফাল্গুন ১৩৫৮",
      "৮ ফাল্গুন ১৩৫৯",
      "২১ ফাল্গুন ১৩৫৮"
    ],
    "answer": "৮ ফাল্গুন ১৩৫৮",
    "answer_index": 0,
    "explanation": "২১ ফেব্রুয়ারি ১৯৫২-এর বাংলা তারিখ ছিল ৮ ফাল্গুন ১৩৫৮ বঙ্গাব্দ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-090",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 90,
    "source_order": 75,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি বর্গক্ষেত্রের ক্ষেত্রফল ১৪৪ বর্গসেমি। এর পরিসীমা কত?",
    "options": [
      "৩৬ সেমি",
      "৪০ সেমি",
      "৪৮ সেমি",
      "৫৬ সেমি"
    ],
    "answer": "৪৮ সেমি",
    "answer_index": 2,
    "explanation": "বর্গক্ষেত্রের ক্ষেত্রফল ১৪৪ হলে বাহু √১৪৪ = ১২ সেমি; পরিসীমা ৪ × ১২ = ৪৮ সেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-091",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 91,
    "source_order": 21,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "‘রঞ্জন’ শব্দে ব্যবহৃত যুক্তবর্ণটির বিশ্লিষ্ট রূপ কী?",
    "options": [
      "ন্ + জ",
      "জ্ + ঞ",
      "ঞ্ + জ",
      "ঙ্ + জ"
    ],
    "answer": "ঞ্ + জ",
    "answer_index": 2,
    "explanation": "রঞ্জন শব্দের ঞ্জ যুক্তবর্ণটি ঞ্ + জ দিয়ে গঠিত। জ্ঞ = জ্ + ঞ, আর ঞ্জ = ঞ্ + জ।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-092",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 92,
    "source_order": 68,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "১৯৭১ সালের ২৩ মার্চ পূর্ব বাংলায় কোন দিবস হিসেবে পালিত হয়?",
    "options": [
      "প্রতিরোধ দিবস",
      "বিজয় দিবস",
      "শহীদ দিবস",
      "সংবিধান দিবস"
    ],
    "answer": "প্রতিরোধ দিবস",
    "answer_index": 0,
    "explanation": "২৩ মার্চ পাকিস্তান দিবস হলেও পূর্ব বাংলায় ছাত্র সংগ্রাম পরিষদ প্রতিরোধ দিবস পালন করে এবং বহু স্থানে বাংলাদেশের পতাকা উত্তোলিত হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-093",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 93,
    "source_order": 83,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "একটি ট্রাপিজিয়ামের সমান্তরাল বাহু ১২ সেমি ও ১৮ সেমি, উচ্চতা ৬ সেমি। ক্ষেত্রফল কত?",
    "options": [
      "৭২ বর্গসেমি",
      "৮০ বর্গসেমি",
      "৯০ বর্গসেমি",
      "১০৮ বর্গসেমি"
    ],
    "answer": "৯০ বর্গসেমি",
    "answer_index": 2,
    "explanation": "ট্রাপিজিয়ামের ক্ষেত্রফল = ½ × (সমান্তরাল বাহু দুটির যোগ) × উচ্চতা। তাই ½ × (১২ + ১৮) × ৬ = ৯০ বর্গসেমি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-094",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 94,
    "source_order": 30,
    "subject": "বাংলা",
    "topic": "ধ্বনি পরিবর্তন",
    "question": "‘শরীর’ → ‘শরীল’ কোন ধ্বনি-পরিবর্তনের উদাহরণ?",
    "options": [
      "সমীভবন",
      "বিষমীভবন",
      "স্বরভক্তি",
      "ধ্বনিলোপ"
    ],
    "answer": "বিষমীভবন",
    "answer_index": 1,
    "explanation": "শরীর-এ দুটি র ধ্বনির একটি ল-এ বদলে শরীল হওয়ায় সদৃশতা ভেঙেছে; এটি বিষমীভবন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-095",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 95,
    "source_order": 70,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মার্চ ১৯৭১",
    "question": "২৬ মার্চ বাংলাদেশে আনুষ্ঠানিকভাবে কী হিসেবে পালিত হয়?",
    "options": [
      "স্বাধীনতা দিবস",
      "বিজয় দিবস",
      "গণঅভ্যুত্থান দিবস",
      "শহীদ দিবস"
    ],
    "answer": "স্বাধীনতা দিবস",
    "answer_index": 0,
    "explanation": "২৬ মার্চ স্বাধীনতার ঘোষণার স্মরণে বাংলাদেশে স্বাধীনতা দিবস পালিত হয়। ১৬ ডিসেম্বর বিজয় দিবস।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-096",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 96,
    "source_order": 18,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "‘ল’ কোন ধরনের ধ্বনি?",
    "options": [
      "নাসিক্য",
      "পার্শ্বিক",
      "উষ্ম",
      "স্পর্শ"
    ],
    "answer": "পার্শ্বিক",
    "answer_index": 1,
    "explanation": "ল উচ্চারণে জিহ্বার দুই পাশ দিয়ে বায়ু বের হয়, তাই ল পার্শ্বিক ধ্বনি।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-097",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 97,
    "source_order": 100,
    "subject": "মানসিক দক্ষতা",
    "topic": "ঘড়ি",
    "question": "একটি ঘড়ি দুপুর ১২টায় ১৫ মিনিট এগিয়ে ছিল এবং পরে প্রতি ঘণ্টায় ৫ মিনিট করে পিছিয়ে যায়। কখন ঘড়িটি আবার ঠিক সময় দেখাবে?",
    "options": [
      "দুপুর ১টায়",
      "দুপুর ২টায়",
      "দুপুর ৩টায়",
      "দুপুর ৪টায়"
    ],
    "answer": "দুপুর ৩টায়",
    "answer_index": 2,
    "explanation": "শুরুর ১৫ মিনিট অতিরিক্ত ত্রুটি প্রতি ঘণ্টায় ৫ মিনিট করে কমে; ৩ ঘণ্টা পরে ত্রুটি শূন্য। তাই ঘড়ি দুপুর ৩টায় ঠিক দেখাবে।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-098",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 98,
    "source_order": 9,
    "subject": "বাংলা",
    "topic": "ধ্বনি ও বর্ণ",
    "question": "নিচের কোনটি নাসিক্য ব্যঞ্জনধ্বনি?",
    "options": [
      "র",
      "ম",
      "ল",
      "হ"
    ],
    "answer": "ম",
    "answer_index": 1,
    "explanation": "ঙ, ঞ, ণ, ন ও ম নাসিক্য ব্যঞ্জনধ্বনি। ম উচ্চারণে বায়ু নাসারন্ধ্র দিয়ে বের হয়।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-099",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 99,
    "source_order": 57,
    "subject": "বাংলাদেশ বিষয়াবলি",
    "topic": "মুক্তিযুদ্ধের ১১ সেক্টর",
    "question": "সেক্টর ৭-এর প্রাথমিক কমান্ডার কে ছিলেন?",
    "options": [
      "মেজর নাজমুল হক",
      "মেজর আবু তাহের",
      "মেজর সি. আর. দত্ত",
      "মেজর খালেদ মোশাররফ"
    ],
    "answer": "মেজর নাজমুল হক",
    "answer_index": 0,
    "explanation": "সেক্টর ৭-এর প্রাথমিক কমান্ডার ছিলেন মেজর নাজমুল হক; পরে মেজর কাজী নুরুজ্জামান দায়িত্ব নেন।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  },
  {
    "id": "today-model-2026-09-07-100",
    "exam_id": "today-model-test-2026-09-07-2330",
    "display_order": 100,
    "source_order": 77,
    "subject": "মানসিক দক্ষতা",
    "topic": "জ্যামিতি",
    "question": "ব্যাসার্ধ ৭ সেমি একটি বৃত্তের ক্ষেত্রফল কত? (π = ২২/৭)",
    "options": [
      "৪৪ বর্গসেমি",
      "৭৭ বর্গসেমি",
      "১৫৪ বর্গসেমি",
      "৩০৮ বর্গসেমি"
    ],
    "answer": "১৫৪ বর্গসেমি",
    "answer_index": 2,
    "explanation": "বৃত্তের ক্ষেত্রফল A = πr²। ২২/৭ × ৭² = ১৫৪ বর্গসেমি; পরিধির ২πr সূত্রের সঙ্গে গুলিয়ে ফেলবে না।",
    "post_name": "আজকের মডেল পরীক্ষা",
    "exam_tag": "model-test",
    "is_active": true
  }
]
$seed$::jsonb) AS row(
    id text,
    exam_id text,
    display_order integer,
    source_order integer,
    subject text,
    topic text,
    question text,
    options jsonb,
    answer text,
    answer_index smallint,
    explanation text,
    post_name text,
    exam_tag text,
    is_active boolean
  )
)
INSERT INTO public.live_model_exam_questions (
  id, exam_id, display_order, source_order, subject, topic, question, options,
  answer, answer_index, explanation, post_name, exam_tag, is_active, updated_at
)
SELECT
  id, exam_id, display_order, source_order, subject, topic, question, options,
  answer, answer_index, explanation, post_name, exam_tag, is_active, timezone('utc', now())
FROM seed_rows
ON CONFLICT (id) DO UPDATE SET
  exam_id = EXCLUDED.exam_id,
  display_order = EXCLUDED.display_order,
  source_order = EXCLUDED.source_order,
  subject = EXCLUDED.subject,
  topic = EXCLUDED.topic,
  question = EXCLUDED.question,
  options = EXCLUDED.options,
  answer = EXCLUDED.answer,
  answer_index = EXCLUDED.answer_index,
  explanation = EXCLUDED.explanation,
  post_name = EXCLUDED.post_name,
  exam_tag = EXCLUDED.exam_tag,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc', now());

DO $$
DECLARE
  seeded_count integer;
  duplicate_order_count integer;
  bad_answer_count integer;
  missing_explanation_count integer;
BEGIN
  SELECT count(*),
         count(*) - count(DISTINCT display_order),
         count(*) FILTER (WHERE options ->> answer_index <> answer),
         count(*) FILTER (WHERE btrim(explanation) = '')
  INTO seeded_count, duplicate_order_count, bad_answer_count, missing_explanation_count
  FROM public.live_model_exam_questions
  WHERE exam_id = 'today-model-test-2026-09-07-2330';

  IF seeded_count <> 100 OR duplicate_order_count <> 0 OR bad_answer_count <> 0 OR missing_explanation_count <> 0 THEN
    RAISE EXCEPTION 'Live model-test seed validation failed: count %, duplicate order %, bad answer %, blank explanation %',
      seeded_count, duplicate_order_count, bad_answer_count, missing_explanation_count;
  END IF;
END $$;

COMMIT;

-- Expected post-run result:
-- 100 rows for exam_id today-model-test-2026-09-07-2330;
-- display_order 1..100; 40 বাংলা, 30 বাংলাদেশ বিষয়াবলি, 30 মানসিক দক্ষতা.
