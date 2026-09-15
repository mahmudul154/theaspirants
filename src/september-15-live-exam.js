// Published fixed paper for the 15 September 2026 model test (Day 7).
// 100 reviewed questions from the supplied set, one question after the next
// subject's question (round-robin): ইংরেজি → আন্তর্জাতিক বিষয়াবলি → গণিত.
// 5 English questions are added from the reviewed database (BB/bank past questions).
// Distribution: ইংরেজি ৩৫ • আন্তর্জাতিক ৪৫ (প্রতি টপিকে ৯) • গণিত ২০

const q = (subject, topic, question, options, answerIndex, explanation) => ({
  subject, topic, question, options, answerIndex, explanation
})

const sourceRows = [
  // ================= ইংরেজি — Right Form of Verbs (৩০) =================
  q('ইংরেজি', 'Right Form of Verbs', 'He ___ living alone.', ['used to', 'is used to', 'was used to', 'uses to'], 1, 'used to + V1 = অতীতে করত এখন করে না। be used to + V-ing = অভ্যস্ত। Living alone এ অভ্যস্ত বোঝাচ্ছে, তাই is used to living। সবাই used to বসিয়ে ভুল করে।'),
  q('ইংরেজি', 'Right Form of Verbs', 'He ___ not go there alone.', ['dare', 'dares', 'daring', 'dare to'], 0, 'dare not / need not যখন modal হিসেবে বসে, তখন s/es যোগ হয় না। He dare not। কিন্তু main verb হলে He dares to go হয়।'),
  q('ইংরেজি', 'Right Form of Verbs', 'He ran fast lest he ___ miss the train.', ['should', 'would miss', 'should miss', 'will miss'], 2, 'lest মানেই should + V1। Lest এর পর কখনো not বসে না, এবং would/will হয় না। 100% should miss হবে। lest he should miss — এটাই fixed।'),
  q('ইংরেজি', 'Right Form of Verbs', 'While ___ in the garden, I saw a snake.', ['I was walking', 'walking', 'I walked', 'to walk'], 1, 'While এর পর subject একই হলে subject + was বাদ দিয়ে শুধু V-ing হয়। While walking = While I was walking। এটা participle clause।'),
  q('ইংরেজি', 'Right Form of Verbs', 'No sooner had he ___ the place than it started raining.', ['left', 'had left', 'leaving', 'leaves'], 0, 'No sooner had + S + V3 + than + Past Indefinite — এখানে had আগেই আছে, তাই ২য় বার had বসবে না। Had he left হবে। সবাই had left বসিয়ে ভুল করে।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I would mind ___ late.', ['to be', 'being', 'be', 'been'], 1, 'mind = V-ing। Would you mind + V-ing এর পর late বোঝালে being late হবে। to be হবে না।'),
  q('ইংরেজি', 'Right Form of Verbs', 'One of the boys who ___ present was punished.', ['were', 'was', 'are', 'is'], 0, 'সবচেয়ে বড় ফাঁদ! One of the boys was punished ঠিক। কিন্তু who এর antecedent boys, one না। তাই who were present হবে। Who কার সম্পর্কে বলছে সেটা দেখো।'),
  q('ইংরেজি', 'Right Form of Verbs', 'The Headmaster and Secretary ___ present.', ['is', 'are', 'was', 'has been'], 1, 'The Headmaster and Secretary = দুইজন আলাদা ব্যক্তি = are। কিন্তু The Headmaster and Secretary is মানে একজন ব্যক্তিই দুই পদে আছে = is। Article খেয়াল করো। The একবার থাকলে একজন, দুইবার থাকলে দুইজন।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I had my car ___ yesterday.', ['wash', 'washed', 'washing', 'to wash'], 1, 'have + living thing + V1, কিন্তু have + thing + V3। Car নিজে wash করতে পারে না, তাই V3। I had him wash my car হতো।'),
  q('ইংরেজি', 'Right Form of Verbs', 'The book is worth ___.', ['to read', 'reading', 'to be read', 'read'], 1, 'Worth এর পর সবসময় gerund। Worth reading = worth to be read। to read কখনো হবে না।'),
  q('ইংরেজি', 'Right Form of Verbs', 'It is time we ___ to bed.', ['go', 'went', 'have gone', 'should go'], 1, 'It is time / It is high time = past tense। go না, went। should go ও technically হয়, কিন্তু BCS এ went কে 100% correct ধরে।'),
  q('ইংরেজি', 'Right Form of Verbs', 'He speaks as if he ___ mad.', ['is', 'were', 'was', 'had been'], 1, 'Present + as if + were। সে এখন কথা বলছে (present), তাই কল্পনা বোঝাতে were। is হবে না।'),
  q('ইংরেজি', 'Right Form of Verbs', 'He spoke as if he ___ mad.', ['were', 'had been', 'was', 'is'], 1, 'Past + as if + Past Perfect। He spoke = past, তাই had been। এখানে were দিলে ভুল।'),
  q('ইংরেজি', 'Right Form of Verbs', 'It is long since we ___ there.', ['go', 'went', 'have gone', 'had gone'], 1, 'It is long since = অনেক দিন হলো। এর পর Past Indefinite।'),
  q('ইংরেজি', 'Right Form of Verbs', 'He had written before I ___.', ['had come', 'came', 'come', 'have come'], 1, 'Before এর আগে Past Perfect থাকলে পরে Past Indefinite। After এর ঠিক উল্টো। After I had come, he wrote।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I ___ him for 3 years.', ['am knowing', 'have been knowing', 'have known', 'knew'], 2, 'Know, have, own, belong, love, hate = stative verb, continuous হয় না। have been knowing ভুল।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I stopped ___.', ['to write', 'writing', 'to writing', 'write'], 1, 'Stop + gerund = থামানো (কাজটি বন্ধ করা)। Stop + to + V1 = থেমে অন্য কাজ করা। I stopped to write = লেখার জন্য থামলাম। অর্থ বুঝে বসাতে হবে — "লেখা বন্ধ করা" অর্থে writing হবে।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I remember ___ him.', ['to see', 'seeing', 'to have seen', 'saw'], 1, 'Remember + gerund = আগের ঘটনা মনে আছে। Remember + to + V1 = ভবিষ্যতে মনে করে করতে হবে। Remember to post the letter।'),
  q('ইংরেজি', 'Right Form of Verbs', 'He got used to ___ alone.', ['live', 'living', 'lived', 'to live'], 1, 'get/become + used to + V-ing। to দেখে to + V1 ভেবে ভুল করে সবাই।'),
  q('ইংরেজি', 'Right Form of Verbs', 'You had better ___ now.', ['to go', 'go', 'going', 'gone'], 1, 'had better, had rather, would rather, would better + V1 (to ছাড়া)।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I would rather ___.', ['to die than beg', 'die than beg', 'dying than begging', 'died than begged'], 1, 'would rather + V1 + than + V1।'),
  q('ইংরেজি', 'Right Form of Verbs', 'A number of students ___ absent.', ['is', 'was', 'are', 'has been'], 2, 'A number of = অনেক = are। The number of = সংখ্যাটি = is। এটা bank এর 10 বার আসা প্রশ্ন।'),
  q('ইংরেজি', 'Right Form of Verbs', 'Many a man ___ present.', ['were', 'are', 'was', 'have been'], 2, 'Many a + singular noun + singular verb। দেখতে plural মনে হলেও singular।'),
  q('ইংরেজি', 'Right Form of Verbs', '10 miles ___ a long way.', ['are', 'were', 'is', 'have been'], 2, 'দূরত্ব, টাকা, সময় = singular verb।'),
  q('ইংরেজি', 'Right Form of Verbs', 'She is used to _ and _.', ['cook, clean', 'cooking, cleaning', 'to cook, to clean', 'cooked, cleaned'], 1, 'and দ্বারা একই form যুক্ত হয়। used to এর পর cooking হলে পরেও cleaning হবে। Parallelism ভুল করলে নম্বর কাটা যায়।'),
  q('ইংরেজি', 'Right Form of Verbs', '___ the work, he went home.', ['Finished', 'Having finished', 'Finishing', 'To finish'], 1, 'একটি কাজ শেষ করে আরেকটি করা = Having + V3। শুধু Finished দিলে dangling হয়।'),
  q('ইংরেজি', 'Right Form of Verbs', 'Your shoes need ___.', ['to polish', 'polishing', 'polish', 'polished'], 1, 'need + V-ing = to be + V3। Your shoes need polishing = need to be polished।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I am looking forward to ___ you.', ['see', 'seeing', 'to see', 'to seeing'], 1, 'to টা look forward এর অংশ, infinitive এর না। তাই seeing। to seeing হবে না।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I could not help ___ there.', ['go', 'to go', 'going', 'gone'], 2, 'cannot help / could not help / cannot but = V-ing।'),
  q('ইংরেজি', 'Right Form of Verbs', 'It is essential that he ___ there.', ['goes', 'go', 'went', 'has gone'], 1, 'essential, important, necessary, demand, recommend, order, suggest + that + subject + base form (V1)। এটা American Subjunctive, BCS এ এখন সবচেয়ে বেশি আসছে। was হবে না, go হবে।'),
  q('ইংরেজি', 'Right Form of Verbs', 'The invigilator made us ___ our identity card at the test center.', ['Showing', 'show', 'showed', 'to show'], 1, 'Causative verb make/let-এর পর main verb-এর base form (V1) বসে। তাই made us show। উৎস: BB 2013।'),
  q('ইংরেজি', 'Right Form of Verbs', 'They laughed a lot last night. The film ___ very funny.', ['should have been', 'must have been', 'was to be', 'should be'], 1, 'Must have + V3 = অতীতে নিশ্চিত অনুমান। আগের অংশ past (laughed) হওয়ায় must have been বসবে। উৎস: BB 2012।'),
  q('ইংরেজি', 'Right Form of Verbs', 'Scarcely had the teacher entered the room ___ the students stood up.', ['than', 'when', 'then', 'before'], 1, 'Scarcely had... এর সাথে when বসে, than নয়। (No sooner-এর সাথেই than বসে)।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I finished ___ the work.', ['do', 'doing', 'done', 'did'], 1, 'Finish-এর পর gerund (V-ing) বসে। I finished doing the work।'),
  q('ইংরেজি', 'Right Form of Verbs', 'I went to the library so that I ___ read.', ['can', 'could', 'will', 'may'], 1, 'so that-এর আগের অংশ past (went) হওয়ায় পরে could/might বসে।'),

  // ================= আন্তর্জাতিক বিষয়াবলি — পাক-ভারত যুদ্ধ (১০) =================
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', '1965 সালের পাক-ভারত যুদ্ধের মূল কারণ কী ছিল?', ['কাশ্মীর দখল', 'পানি বণ্টন', 'সীমান্ত বিরোধ', 'অপারেশন জিব্রাল্টার'], 3, 'পাকিস্তান কাশ্মীরে অনুপ্রবেশকারীদের পাঠিয়ে বিদ্রোহ উসকে দেওয়ার জন্য Operation Gibraltar শুরু করে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', 'তাসখন্দ চুক্তি কবে স্বাক্ষরিত হয়?', ['1965', '1966', '1971', '1972'], 1, '10 জানুয়ারি 1966। মধ্যস্থতা করেন সোভিয়েত প্রধানমন্ত্রী কোসিগিন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', '1971 সালে পাক-ভারত যুদ্ধে ভারতীয় বাহিনীর প্রধান কে ছিলেন?', ['জেনারেল মানেকশ', 'জেনারেল অরোরা', 'জেনারেল কারিয়াপ্পা', 'জেনারেল থিমাইয়া'], 0, 'জেনারেল স্যাম মানেকশ ছিলেন সেনাপ্রধান।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', 'সিমলা চুক্তি স্বাক্ষরিত হয় —', ['1971', '1972', '1974', '1976'], 1, '2 জুলাই 1972। ইন্দিরা গান্ধী ও জুলফিকার আলী ভুট্টোর মধ্যে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', 'কার্গিল যুদ্ধ সংঘটিত হয় —', ['1998', '1999', '2001', '2002'], 1, 'মে-জুলাই 1999। অপারেশন বিজয় এর মাধ্যমে ভারত জয়ী হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', 'বাংলাদেশের মুক্তিযুদ্ধে ভারত সরাসরি যুদ্ধে জড়ায় —', ['21 নভেম্বর 1971', '3 ডিসেম্বর 1971', '6 ডিসেম্বর 1971', '16 ডিসেম্বর 1971'], 1, '3 ডিসেম্বর পাকিস্তান ভারতের বিমানঘাঁটিতে হামলা করলে ভারত যুদ্ধ ঘোষণা করে।'),
    q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', 'অপারেশন সার্চলাইট ও অপারেশন জিব্রাল্টার যথাক্রমে —', ['উভয়ই 1965', '1971 ও 1965', '1965 ও 1971', 'উভয়ই 1971'], 1, 'সার্চলাইট 1971, জিব্রাল্টার 1965।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', '1971 যুদ্ধে আত্মসমর্পণ দলিল স্বাক্ষরিত হয় কোথায়?', ['গণভবন', 'রেসকোর্স ময়দান', 'ঢাকা ক্যান্টনমেন্ট', 'সোনারগাঁও'], 1, 'রেসকোর্স ময়দানে (বর্তমান সোহরাওয়ার্দী উদ্যান)।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'পাক-ভারত যুদ্ধ', 'সিয়াচেন হিমবাহ নিয়ে সংঘাত শুরু হয় —', ['1972', '1984', '1999', '1965'], 1, '1984 সালে ভারত অপারেশন মেঘদূত চালিয়ে সিয়াচেন দখল করে।'),

  // ================= আন্তর্জাতিক বিষয়াবলি — ভিয়েতনাম যুদ্ধ (১০) =================
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'ভিয়েতনাম যুদ্ধের সময়কাল —', ['1954-1968', '1955-1975', '1960-1973', '1965-1975'], 1, '1 নভেম্বর 1955 - 30 এপ্রিল 1975।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'টনকিন উপসাগরের ঘটনা ঘটে —', ['1962', '1964', '1966', '1968'], 1, '2 ও 4 আগস্ট 1964। এর ফলে মার্কিন কংগ্রেস যুদ্ধের অনুমোদন দেয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'ভিয়েত কং কারা?', ['উত্তর ভিয়েতনাম সেনা', 'দক্ষিণ ভিয়েতনামে কমিউনিস্ট গেরিলা', 'মার্কিন মিত্র', 'চীনা সেনা'], 1, 'National Liberation Front এর গেরিলা বাহিনী।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'হো চি মিন ট্রেইল কী ছিল?', ['যুদ্ধবিরতি রেখা', 'উত্তর থেকে দক্ষিণে অস্ত্র সরবরাহের গোপন পথ', 'মার্কিন বিমান হামলার রুট', 'শরণার্থী করিডোর'], 1, 'লাওস ও কম্বোডিয়ার ভেতর দিয়ে সরবরাহ নেটওয়ার্ক।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'মাই লাই গণহত্যা ঘটে —', ['1968', '1969', '1970', '1971'], 0, '16 মার্চ 1968। মার্কিন সেনা কর্তৃক 50+ বেসামরিক নিহত।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'প্যারিস শান্তি চুক্তি স্বাক্ষরিত হয় —', ['1972', '1973', '1974', '1975'], 1, '27 জানুয়ারি 1973। মার্কিন সৈন্য প্রত্যাহারের চুক্তি।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'Operation Rolling Thunder ছিল —', ['স্থল অভিযান', 'টানা বোমা হামলা অভিযান', 'উদ্ধার অভিযান', 'নির্বাচন'], 1, '1965-1968 পর্যন্ত উত্তর ভিয়েতনামে মার্কিন বোমা হামলা।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'সায়গনের পতন হয় —', ['1973', '1974', '1975', '1976'], 2, '30 এপ্রিল 1975।'),
    q('আন্তর্জাতিক বিষয়াবলি', 'ভিয়েতনাম যুদ্ধ', 'ভিয়েতনাম একত্রিত হয় —', ['1975', '1976', '1973', '1978'], 1, '2 জুলাই 1976 সালে Socialist Republic of Vietnam গঠিত।'),

  // ================= আন্তর্জাতিক বিষয়াবলি — আরব-ইসরাইল যুদ্ধ (১০) =================
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'প্রথম আরব-ইসরাইল যুদ্ধ হয় —', ['1948', '1956', '1967', '1973'], 0, 'ইসরাইল রাষ্ট্র প্রতিষ্ঠার পরদিন 15 মে 1948।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'ছয় দিনের যুদ্ধ হয় —', ['1956', '1967', '1973', '1982'], 1, '5-10 জুন 1967।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'ছয় দিনের যুদ্ধে ইসরাইল দখল করে —', ['শুধু গাজা', 'গাজা, পশ্চিম তীর, গোলান মালভূমি, সিনাই', 'শুধু সিনাই', 'শুধু জেরুজালেম'], 1, 'চারটি অঞ্চলই দখল করে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'ইয়ম কিপুর যুদ্ধ হয় —', ['1967', '1973', '1978', '1982'], 1, '6-25 অক্টোবর 1973।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'ক্যাম্প ডেভিড চুক্তি স্বাক্ষরিত হয় —', ['1978', '1979', '1982', '1983'], 0, '17 সেপ্টেম্বর 1978। ফলে 1979 সালে মিশর-ইসরাইল শান্তি চুক্তি।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'সুয়েজ সংকট / দ্বিতীয় আরব-ইসরাইল যুদ্ধ —', ['1948', '1956', '1967', '1973'], 1, '1956 সালে নাসের সুয়েজ খাল জাতীয়করণ করলে।'),
    q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'অসলো চুক্তি স্বাক্ষরিত হয় —', ['1991', '1993', '1995', '2000'], 1, '13 সেপ্টেম্বর 1993। ইসরাইল ও PLO এর মধ্যে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', 'বেলফোর ঘোষণা —', ['1917', '1947', '1948', '1920'], 0, '2 নভেম্বর 1917।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব-ইসরাইল যুদ্ধ', '1973 যুদ্ধের পর যে তেল অবরোধ হয় —', ['OPEC কর্তৃক পশ্চিমাদের ওপর', 'USA কর্তৃক আরবদের ওপর', 'সোভিয়েত কর্তৃক', 'ইসরাইল কর্তৃক'], 0, 'আরব দেশগুলো ইসরাইল সমর্থক দেশগুলোর ওপর তেল অবরোধ দেয়।'),

  // ================= আন্তর্জাতিক বিষয়াবলি — রুশ ও চীন বিপ্লব (১০) =================
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'রুশ বিপ্লব হয় —', ['1914', '1917', '1919', '1921'], 1, 'ফেব্রুয়ারি ও অক্টোবর 1917।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'অক্টোবর বিপ্লবের নেতা —', ['স্টালিন', 'লেনিন', 'ট্রটস্কি', 'কেরেনস্কি'], 1, 'ভ্লাদিমির লেনিন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'রুশ বিপ্লবের স্লোগান ছিল —', ['সাম্য, মৈত্রী, স্বাধীনতা', 'শান্তি, রুটি, জমি', 'রক্ত ও লৌহ', 'দুনিয়ার মজদুর এক হও'], 1, 'Peace, Bread, Land।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'সোভিয়েত ইউনিয়ন গঠিত হয় —', ['1917', '1922', '1924', '1918'], 1, '30 ডিসেম্বর 1922।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'চীনা কমিউনিস্ট পার্টি প্রতিষ্ঠিত হয় —', ['1919', '1921', '1927', '1949'], 1, '1 জুলাই 1921।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'লং মার্চ সংঘটিত হয় —', ['1934-35', '1927', '1949', '1958'], 0, '6,000 মাইলব্যাপী মাও এর নেতৃত্বে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'গণপ্রজাতন্ত্রী চীন প্রতিষ্ঠিত হয় —', ['1 অক্টোবর 1949', '1 অক্টোবর 1948', '1950', '1947'], 0, 'মাও জেদং কর্তৃক ঘোষণা।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'সাংস্কৃতিক বিপ্লব চীনে হয় —', ['1958-60', '1966-76', '1949-52', '1978-80'], 1, '1966-1976।'),
    q('আন্তর্জাতিক বিষয়াবলি', 'রুশ ও চীন বিপ্লব', 'চীনা বিপ্লবে জাতীয়তাবাদী নেতা ছিলেন —', ['সান ইয়াত-সেন ও চিয়াং কাই-শেক', 'মাও', 'লিউ শাওকি', 'চৌ এন-লাই'], 0, 'KMT এর নেতা।'),

  // ================= আন্তর্জাতিক বিষয়াবলি — আরব বসন্ত (১০) =================
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'আরব বসন্ত শুরু হয় —', ['তিউনিসিয়া থেকে', 'মিশর থেকে', 'লিবিয়া থেকে', 'সিরিয়া থেকে'], 0, '17 ডিসেম্বর 2010। মোহাম্মদ বুয়াজিজির আত্মাহুতি।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'বুয়াজিজি ছিলেন —', ['ছাত্র', 'ফল বিক্রেতা', 'সাংবাদিক', 'পুলিশ'], 1, 'রাস্তার ফল বিক্রেতা।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'আরব বসন্তে প্রথম সরকার পতন হয় —', ['মিশর', 'তিউনিসিয়া', 'লিবিয়া', 'ইয়েমেন'], 1, '14 জানুয়ারি 2011, প্রেসিডেন্ট বেন আলী পালান।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'তাহরির স্কয়ার আন্দোলন হয় —', ['তিউনিসিয়া', 'মিশর', 'বাহরাইন', 'ইয়েমেন'], 1, 'কায়রোর তাহরির স্কয়ারে 2011 সালে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'লিবিয়ায় গাদ্দাফির পতন হয় —', ['2010', '2011', '2012', '2013'], 1, '20 অক্টোবর 2011।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'সিরিয়ায় আরব বসন্ত রূপ নেয় —', ['গণতন্ত্রে', 'গৃহযুদ্ধে', 'রাজতন্ত্রে', 'স্থিতিশীলতায়'], 1, '2011 থেকে চলমান গৃহযুদ্ধ।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'আরব বসন্তের ফলে মিশরে প্রথম গণতান্ত্রিক প্রেসিডেন্ট হন —', ['মোহাম্মদ মুরসি', 'সিসি', 'মোবারক', 'এল-বরাদেই'], 0, '2012 সালে মুসলিম ব্রাদারহুডের মুরসি নির্বাচিত হন।'),
    q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'আরব বসন্ত সবচেয়ে সফল বলা হয় —', ['তিউনিসিয়ায়', 'সিরিয়ায়', 'লিবিয়ায়', 'মিশরে'], 0, 'তিউনিসিয়াই একমাত্র দেশ যেখানে গণতান্ত্রিক সংবিধান (2014) প্রণীত হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আরব বসন্ত', 'আরব বসন্তের প্রধান হাতিয়ার ছিল —', ['সামরিক বাহিনী', 'সামাজিক যোগাযোগ মাধ্যম', 'জাতিসংঘ', 'তেল'], 1, 'ফেসবুক, টুইটার। তাই একে Facebook Revolution ও বলা হয়।'),

  // ================= গণিত — দূরত্ব ও গতি (২০) =================
  q('গণিত', 'দূরত্ব ও গতি', 'A ও B এর গতির অনুপাত ৩:৪। A ১৪০ মিটার আগে থেকে শুরু করে। A কত মিটারে জেতে?', ['10', '20', '30', '40'], 1, 'Shortcut: A দৌড়াবে 360m, সময় = 360/3=120s, B যাবে 120×4=480m, তাই জেতে 500-480=20m।'),
  q('গণিত', 'দূরত্ব ও গতি', 'A 36s এ এবং B 45s এ 100m যায়। A, B কে কত মিটারে হারায়?', ['10', '15', '20', '25'], 2, 'Shortcut: সময়ের পার্থক্য 9s, B এর গতি 100/45, তাই 9×100/45=20m।'),
  q('গণিত', 'দূরত্ব ও গতি', '100m এ A, B কে 10m ও C কে 13m এ হারায়। 180m এ B, C কে কত মিটারে হারাবে?', ['5', '6', '7', '8'], 1, 'Shortcut: A:B:C = 100:90:87, B 180m গেলে C = 87×180/90=174m, তাই জেতে 6m।'),
  q('গণিত', 'দূরত্ব ও গতি', '100 পয়েন্টের খেলায় A, B কে 20 ও C কে 28 পয়েন্ট দেয়। B, C কে কত দিতে পারবে?', ['8', '10', '12', '14'], 1, 'Shortcut: A:B:C = 100:80:72, তাই B 100 করলে C 90, B দেয় 10।'),
  q('গণিত', 'দূরত্ব ও গতি', 'A 22.5m যায় যখন B 25m যায়। 1 km দৌড়ে B, A কে কত মিটারে হারাবে?', ['90', '100', '110', '120'], 1, 'Shortcut: B 1000m গেলে A = 22.5×1000/25=900m, তাই জেতে 100m।'),
  q('গণিত', 'দূরত্ব ও গতি', '10 km/hr এর বদলে 14 km/hr এ হাঁটলে 20 km বেশি যায়। প্রকৃত দূরত্ব কত? [BKB-OFF-2017]', ['40', '50', '60', '70'], 1, 'Shortcut: 4 km/h = 20km, 1h=5km, তাই 10×5=50km।'),
  q('গণিত', 'দূরত্ব ও গতি', '10 ঘন্টায় যাত্রা। প্রথমার্ধ 21 km/h, দ্বিতীয়ার্ধ 24 km/h। মোট দূরত্ব? [MTO-2015]', ['220', '224', '230', '234'], 1, 'Shortcut: x/21 + x/24 = 10 → x=112, মোট=224km।'),
  q('গণিত', 'দূরত্ব ও গতি', '36 km/h = কত m/sec?', ['8', '10', '12', '15'], 1, 'Shortcut: ×5/18।'),
  q('গণিত', 'দূরত্ব ও গতি', '55 m/sec = কত km/h?', ['180', '198', '200', '208'], 1, 'Shortcut: ×18/5।'),
  q('গণিত', 'দূরত্ব ও গতি', 'গাড়ি 1s এ 15m যায়। km/h এ গতি কত?', ['45', '50', '54', '60'], 2, 'Shortcut: 15×18/5=54।'),
  q('গণিত', 'দূরত্ব ও গতি', '9:55 am থেকে 10:15 am পর্যন্ত 40 mph বেগে কত মাইল? [8 Banks-2022]', ['13.33', '15', '20', '40'], 0, 'Shortcut: 20min=1/3h, দূরত্ব=40×1/3।'),
  q('গণিত', 'দূরত্ব ও গতি', 'হেঁটে গিয়ে গাড়িতে ফিরে 37min। দুইবার হেঁটে 55min। দুইবার গাড়িতে কত সময়? [Sonali-2019]', ['19', '21', '20', '13'], 0, 'Shortcut: 2×37-55=19min।'),
  q('গণিত', 'দূরত্ব ও গতি', '40 km/h এ 11min late, 50 km/h এ 5min late। সঠিক সময় কত?', ['13', '15', '19', '21'], 2, 'Shortcut: 40(x+11)=50(x+5) → x=19।'),
  q('গণিত', 'দূরত্ব ও গতি', '30km যায় 60km/h এ, ফেরে দ্বিগুণ গতিতে। মোট সময়?', ['30', '40', '45', '50'], 2, 'Shortcut: 30/60=30min, 30/120=15min, মোট=45min।'),
  q('গণিত', 'দূরত্ব ও গতি', '200m এ A, B কে 35m বা 7s এ হারায়। A এর সময় কত?', ['33', '40', '47', '35'], 0, 'Shortcut: B এর গতি=35/7=5m/s, B এর সময়=200/5=40s, A=40-7=33s।'),
  q('গণিত', 'দূরত্ব ও গতি', '240 km/h এ 5 ঘন্টায় যে দূরত্ব, 5/3 ঘন্টায় যেতে গতি কত?', ['600', '720', '800', '900'], 1, 'Shortcut: দূরত্ব=1200km, গতি=1200÷5/3=720।'),
  q('গণিত', 'দূরত্ব ও গতি', '5/7 গতিতে 1h 40min 48s এ 42km। প্রকৃত গতি কত?', ['30', '35', '40', '45'], 1, 'Shortcut: সময়=1.68h, গতি=42/1.68=25, প্রকৃত=25×7/5=35।'),
  q('গণিত', 'দূরত্ব ও গতি', 'দুই ট্রেনের গতির অনুপাত 7:8। ২য় ট্রেন 4h এ 400km। ১ম ট্রেনের গতি?', ['70', '75', '84', '87.5'], 3, 'Shortcut: ২য়=100km/h, 8=100 → 1=12.5, ১ম=7×12.5।'),
  q('গণিত', 'দূরত্ব ও গতি', 'স্থির পানিতে 10 km/h। অনুকূলে 26km, প্রতিকূলে 14km একই সময়ে। স্রোতের গতি?', ['2', '3', '4', '5'], 1, 'Shortcut: 26/(10+x)=14/(10-x) → x=3।'),
  q('গণিত', 'দূরত্ব ও গতি', '150km যায় 50km/h, ফেরে 30km/h। গড় গতি?', ['35', '37.5', '40', '42'], 1, 'Shortcut: 2ab/(a+b)।'),
]

// Day 5-এর মতো তিন-বিষয় stable round-robin: ইংরেজি → আন্তর্জাতিক → গণিত।
const SUBJECT_CYCLE = ['ইংরেজি', 'আন্তর্জাতিক বিষয়াবলি', 'গণিত']
const bySubject = SUBJECT_CYCLE.map(subject => sourceRows.map((row, index) => row.subject === subject ? index : null).filter(index => index !== null))
const order = []
const longest = Math.max(...bySubject.map(list => list.length))
for (let slot = 0; slot < longest; slot++) {
  for (const list of bySubject) if (list[slot] !== undefined) order.push(list[slot])
}

const toBanglaDigits = value => String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[digit])
// গণিতের প্রশ্নসমূহ শিক্ষকের দেওয়া হুবহু (বাংলা, সংখ্যা মূল্য অনুযায়ী) রাখা হয়েছে।
const formatDigits = row => row.subject === 'গণিত' ? (value => String(value)) : toBanglaDigits

export const SEPTEMBER_15_LIVE_EXAM_QUESTIONS = order.map((sourceIndex, displayIndex) => {
  const row = sourceRows[sourceIndex]
  const digits = formatDigits(row)
  const options = row.options.map(digits)
  return {
    id: `live-2026-09-15-${String(displayIndex + 1).padStart(3, '0')}`,
    display_order: displayIndex + 1,
    source_order: sourceIndex + 1,
    subject: row.subject,
    topic: row.topic,
    question: digits(row.question),
    options,
    answer: options[row.answerIndex],
    answer_index: row.answerIndex,
    explanation: digits(row.explanation),
    post_name: '১৫ সেপ্টেম্বর মডেল টেস্ট',
    exam_tag: 'live-2026-09-15'
  }
})

export const SEPTEMBER_15_LIVE_EXAM_COUNTS = {
  total: SEPTEMBER_15_LIVE_EXAM_QUESTIONS.length,
  english: SEPTEMBER_15_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'ইংরেজি').length,
  math: SEPTEMBER_15_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'গণিত').length,
  generalKnowledge: SEPTEMBER_15_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'আন্তর্জাতিক বিষয়াবলি').length
}

if (SEPTEMBER_15_LIVE_EXAM_COUNTS.total !== 100 || SEPTEMBER_15_LIVE_EXAM_COUNTS.english !== 35 || SEPTEMBER_15_LIVE_EXAM_COUNTS.math !== 20 || SEPTEMBER_15_LIVE_EXAM_COUNTS.generalKnowledge !== 45 || SEPTEMBER_15_LIVE_EXAM_QUESTIONS.some(question => !question.explanation || question.options[question.answer_index] !== question.answer)) {
  throw new Error('The 15 September Day 7 paper is incomplete or has an invalid answer key')
}
