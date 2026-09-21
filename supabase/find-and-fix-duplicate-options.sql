-- Duplicate-option audit for public.mcq_questions_job  (2026-09-20)
--
-- A question whose options repeat a value is defective in one of two degrees:
--   • ambiguous — the repeated value IS the row's `answer`, so two options are
--                 both correct and grading depends on which one is chosen.
--   • cosmetic  — the repeat is only among the wrong options; still gradeable,
--                 but it reads as a typo to the student.
--
-- PostgREST cannot compare two positions of a jsonb array, and unindexed scans
-- time out for the anon role, so this audit runs here in the SQL editor
-- (full privileges, set-based, no paging).
--
-- Work top to bottom. Section 5 changes data and defaults to ROLLBACK — read
-- the counts first, then edit it deliberately.

-- ============================================================================
-- 0. Confirm how `options` is stored (jsonb vs text[])
--    The queries below assume jsonb. If udt_name is 'text' (an array column),
--    replace `jsonb_array_elements_text(q.options)` with
--    `unnest(q.options)` and drop the `jsonb_typeof` guards.
-- ============================================================================
select column_name, data_type, udt_name
  from information_schema.columns
 where table_schema = 'public'
   and table_name   = 'mcq_questions_job'
   and column_name in ('options', 'answer', 'is_active')
 order by ordinal_position;

-- ============================================================================
-- 1. Headline counts
-- ============================================================================
with exploded as (
  select q.id,
         q.is_active,
         lower(btrim(regexp_replace(opt.value, '\s+', ' ', 'g')))            as norm_option,
         lower(btrim(regexp_replace(coalesce(q.answer, ''), '\s+', ' ', 'g'))) as norm_answer
    from public.mcq_questions_job q
    cross join lateral jsonb_array_elements_text(q.options) as opt(value)
   where jsonb_typeof(q.options) = 'array'
),
repeated as (
  select id,
         bool_or(is_active)                 as is_active,
         bool_or(norm_option = norm_answer) as answer_is_duplicated
    from exploded
   group by id, norm_option
  having count(*) > 1
)
select count(*)                                                        as questions_with_duplicate_options,
       count(*) filter (where answer_is_duplicated)                    as ambiguous_answer_duplicated,
       count(*) filter (where not answer_is_duplicated)                as cosmetic_wrong_option_repeat,
       count(*) filter (where is_active)                               as still_active,
       (select count(*) from public.mcq_questions_job where is_active) as active_rows_in_table
  from repeated;

-- ============================================================================
-- 2. Breakdown by subject and topic (where to focus manual repair)
-- ============================================================================
with exploded as (
  select q.id, q.subject, q.topic, q.is_active,
         lower(btrim(regexp_replace(opt.value, '\s+', ' ', 'g')))            as norm_option,
         lower(btrim(regexp_replace(coalesce(q.answer, ''), '\s+', ' ', 'g'))) as norm_answer
    from public.mcq_questions_job q
    cross join lateral jsonb_array_elements_text(q.options) as opt(value)
   where jsonb_typeof(q.options) = 'array'
),
repeated as (
  select id,
         max(subject)                       as subject,
         max(topic)                         as topic,
         bool_or(is_active)                 as is_active,
         bool_or(norm_option = norm_answer) as answer_is_duplicated
    from exploded
   group by id, norm_option
  having count(*) > 1
),
worst_per_question as (
  select id, subject, topic,
         bool_or(is_active)           as is_active,
         bool_or(answer_is_duplicated) as ambiguous
    from repeated
   group by id, subject, topic
)
select subject,
       topic,
       count(*)                                     as duplicate_questions,
       count(*) filter (where ambiguous)            as ambiguous,
       count(*) filter (where is_active)            as still_active
  from worst_per_question
 group by subject, topic
 order by duplicate_questions desc, subject, topic;

-- ============================================================================
-- 3. Full listing for review
-- ============================================================================
with exploded as (
  select q.id,
         opt.ordinality                                                  as position,
         lower(btrim(regexp_replace(opt.value, '\s+', ' ', 'g')))         as norm_option,
         lower(btrim(regexp_replace(coalesce(q.answer, ''), '\s+', ' ', 'g'))) as norm_answer
    from public.mcq_questions_job q
    cross join lateral jsonb_array_elements_text(q.options) with ordinality as opt(value, ordinality)
   where jsonb_typeof(q.options) = 'array'
),
repeated as (
  select id,
         norm_option,
         bool_or(norm_option = norm_answer)    as answer_is_duplicated,
         array_agg(position order by position) as positions
    from exploded
   group by id, norm_option
  having count(*) > 1
),
per_question as (
  select id,
         bool_or(answer_is_duplicated)          as ambiguous,
         array_agg(positions order by norm_option) as duplicate_positions,
         string_agg(norm_option, ' | ' order by norm_option) as repeated_values
    from repeated
   group by id
)
select p.id,
       case when p.ambiguous then 'ambiguous' else 'cosmetic' end as severity,
       p.duplicate_positions,
       p.repeated_values,
       q.subject, q.topic, q.post_name, q.is_active,
       left(q.question, 140) as question,
       q.options, q.answer
  from per_question p
  join public.mcq_questions_job q on q.id = p.id
 order by p.ambiguous desc, q.subject, p.id;

-- ============================================================================
-- 4. Related defect: `answer` text is not present among the options at all.
--    The app grades by matching the answer text, so these rows cannot be
--    answered correctly no matter which option the student picks.
-- ============================================================================
select count(*) as answers_not_among_options
  from public.mcq_questions_job q
 where jsonb_typeof(q.options) = 'array'
   and q.answer is not null
   and not exists (
         select 1
           from jsonb_array_elements_text(q.options) as opt(value)
          where lower(btrim(regexp_replace(opt.value, '\s+', ' ', 'g')))
              = lower(btrim(regexp_replace(q.answer, '\s+', ' ', 'g')))
       );

-- ============================================================================
-- 5. FIX — hide the ambiguous questions from every exam (defaults to ROLLBACK)
--
--    `is_active = false` is the safe repair: the app filters on is_active, so
--    the row stops being served while its content stays available for a proper
--    editorial fix. Ambiguous rows go first because two identical correct
--    options make the question ungradable.
-- ============================================================================
begin;

with exploded as (
  select q.id,
         lower(btrim(regexp_replace(opt.value, '\s+', ' ', 'g')))            as norm_option,
         lower(btrim(regexp_replace(coalesce(q.answer, ''), '\s+', ' ', 'g'))) as norm_answer
    from public.mcq_questions_job q
    cross join lateral jsonb_array_elements_text(q.options) as opt(value)
   where jsonb_typeof(q.options) = 'array'
),
ambiguous as (
  select id
    from exploded
   where norm_option = norm_answer
   group by id, norm_option
  having count(*) > 1
)
update public.mcq_questions_job q
   set is_active = false
  from (select distinct id from ambiguous) a
 where q.id = a.id
   and q.is_active;

-- Check the row count reported by the UPDATE above; it should equal
-- `ambiguous_answer_duplicated` from section 1. Then either:
rollback;
-- or replace the line above with:  commit;

-- ============================================================================
-- 5b. ALTERNATIVE — replace the repeated wrong option instead of hiding the row
--
--    Use when the question is worth keeping and only a distractor repeats.
--    It overwrites the LATER duplicate with a placeholder so an editor can
--    fill in a real distractor; the option carrying the answer is never
--    touched. Review section 3 first — a placeholder ships to students.
-- ============================================================================
-- begin;
-- with exploded as (
--   select q.id, q.answer,
--          opt.ordinality                                          as position,
--          lower(btrim(regexp_replace(opt.value, '\s+', ' ', 'g'))) as norm_option,
--          lower(btrim(regexp_replace(coalesce(q.answer, ''), '\s+', ' ', 'g'))) as norm_answer
--     from public.mcq_questions_job q
--     cross join lateral jsonb_array_elements_text(q.options) with ordinality as opt(value, ordinality)
--    where jsonb_typeof(q.options) = 'array'
-- ),
-- later_duplicates as (
--   select id, max(position) as position
--     from exploded
--    where norm_option <> norm_answer
--    group by id, norm_option
--   having count(*) > 1
-- )
-- update public.mcq_questions_job q
--    set options = jsonb_set(q.options,
--                            array[(d.position - 1)::text],
--                            to_jsonb('[ডুপ্লিকেট — নতুন অপশন বসান]'::text))
--   from later_duplicates d
--  where q.id = d.id;
-- rollback;
