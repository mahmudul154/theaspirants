// Published fixed paper for the 9 September 2026, 23:30 Asia/Dhaka live exam.
// Every question comes from the supplied English, world-civilisation, and Math papers.
// The display sequence is shuffled once, kept deterministic, and shared by every candidate.

const sourceRows = [
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "When water ______, it turns into ice.",
    "options": [
      "will freeze",
      "freezes",
      "would freeze",
      "froze"
    ],
    "answerIndex": 1,
    "explanation": "Zero conditional দিয়ে চিরন্তন সত্য বা বৈজ্ঞানিক নিয়ম বোঝানো হয়; এখানে পানির জমে বরফ হওয়া সাধারণ সত্য। তাই when-clause এবং main clause—দুই অংশেই Present Simple বসে, সঠিক উত্তর ‘freezes’।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "If she ______ her identity card, she ______ in trouble.",
    "options": [
      "lose, would be",
      "loses, will be",
      "will loss",
      "loses, would be"
    ],
    "answerIndex": 1,
    "explanation": "ভবিষ্যতের বাস্তবসম্ভব শর্তে First Conditional-এর গঠন হলো If + Present Indefinite, তারপর will + base verb। Subject ‘she’ তৃতীয় পুরুষ একবচন বলে loses হবে এবং ফল বোঝাতে will be হবে।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "Complete the sentence: “If I were you, I ______ take the money.”",
    "options": [
      "shall",
      "will",
      "would",
      "may"
    ],
    "answerIndex": 2,
    "explanation": "বর্তমানের কাল্পনিক বা অবাস্তব পরিস্থিতি বোঝাতে Second Conditional ব্যবহৃত হয়: If + Past Simple/were, তারপর would/could/might + V1। তাই ‘If I were you’–এর পরে সঠিক রূপ ‘would take’।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "Select the sentence with appropriate form:",
    "options": [
      "If Salina had the money, she would buy a fast car.",
      "If I know the answer, I would tell you.",
      "If I was you, I would put your jacket on.",
      "If I would be nice if the weather is better."
    ],
    "answerIndex": 0,
    "explanation": "Second Conditional-এ if-clause-এ Past Simple এবং মূল clause-এ would + V1 বসে। Option A-তে ‘had’ main verb হিসেবে Past Simple এবং ‘would buy’ সঠিকভাবে ব্যবহৃত হয়েছে; অন্য বিকল্পগুলোতে tense, subjunctive ‘were’ বা বাক্যগঠনের ভুল আছে।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "Balaka ______ on a trip to Rajshahi if he had had time.",
    "options": [
      "would go",
      "would have gone",
      "would gone",
      "was going"
    ],
    "answerIndex": 1,
    "explanation": "অতীতে কোনো শর্ত পূরণ না হওয়ায় যে কাজ ঘটেনি, সেটি Third Conditional দিয়ে বোঝানো হয়: would/could/might + have + V3 … if + had + V3। ‘if he had had time’ Past Perfect হওয়ায় সঠিক উত্তর ‘would have gone’।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "Had I known you were waiting outside, I ______.",
    "options": [
      "had invited you to come in",
      "would invite you to come in",
      "would be inviting you to come in",
      "would have invited you to come in"
    ],
    "answerIndex": 3,
    "explanation": "‘Had I known’ হলো ‘If I had known’-এর inverted Third Conditional রূপ। এ ধরনের বাক্যের অন্য clause-এ would/could/might + have + V3 বসে, তাই সঠিক উত্তর ‘would have invited you to come in’।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "Identify the correct sentence.",
    "options": [
      "Had you been there on time, you could have had the information.",
      "If you had been there on time, you could have the information.",
      "Had you been there on time, you might get the information.",
      "Had been you there, you could have got the information."
    ],
    "answerIndex": 0,
    "explanation": "Inverted Third Conditional-এ Had + subject + V3 ব্যবহৃত হয় এবং মূল clause-এ could/would/might + have + V3 বসে। Option A-তে ‘Had you been’ ও ‘could have had’—দুই অংশই নিয়মমাফিক; অন্যগুলোতে verb form বা word order ভুল।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "He ______ arrested if he had tried to leave the country.",
    "options": [
      "would have",
      "could have",
      "must have",
      "would have been"
    ],
    "answerIndex": 3,
    "explanation": "তিনি নিজে কাউকে গ্রেপ্তার করতেন না; বরং তাঁকে গ্রেপ্তার করা হতো—তাই এখানে passive sense। Third Conditional passive-এর গঠন would/could/might + have been + V3; ‘arrested’ V3 হওয়ার কারণে ‘would have been’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "If we practiced speaking English, we ______ speak better.",
    "options": [
      "could",
      "could have",
      "can",
      "would have"
    ],
    "answerIndex": 0,
    "explanation": "If-clause-এ Past Simple ‘practiced’ থাকায় এটি Second Conditional। সামর্থ্য বোঝাতে main clause-এ could + V1 বসে, তাই ‘could speak better’ সঠিক; could have বা would have অতীতের সম্পন্ন কাজ বোঝায়।"
  },
  {
    "subject": "English",
    "topic": "Conditionals",
    "question": "______ better, the team would have been able to defeat the opponent.",
    "options": [
      "If it prepares",
      "If prepares",
      "Preparing",
      "Had it prepared"
    ],
    "answerIndex": 3,
    "explanation": "মূল clause-এ ‘would have been able’ থাকায় এটি Third Conditional। If-clause-এর inverted রূপ Had + subject + V3, তাই ‘Had it prepared’ বসবে।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "The board insisted that the CEO ______ a revised plan.",
    "options": [
      "submits",
      "submit",
      "will submit",
      "has submitted"
    ],
    "answerIndex": 1,
    "explanation": "Insist, demand, recommend, suggest বা require–এর পরে that-clause থাকলে subjunctive mood-এ verb-এর base form বসে। তাই subject ‘the CEO’ একবচন হলেও ‘submits’ নয়, সঠিক উত্তর ‘submit’।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "The government requires ______ before the end of the financial year.",
    "options": [
      "that these forms be submitted",
      "that these forms should be submitted",
      "for these forms to be submitted",
      "these forms submission"
    ],
    "answerIndex": 0,
    "explanation": "Require that-এর পরে passive subjunctive-এর গঠন হলো that + subject + be + V3। তাই ‘that these forms be submitted’ সঠিক; এখানে be অপরিবর্তিত থাকে।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "The speaker failed to make the audience ______ to him patiently.",
    "options": [
      "to listen",
      "listen",
      "listened",
      "listening"
    ],
    "answerIndex": 1,
    "explanation": "Make causative verb হিসেবে ব্যবহৃত হলে সক্রিয় object-এর পরে bare infinitive বা V1 বসে: make + object + V1। তাই audience-এর পরে সঠিক রূপ ‘listen’; to listen বা listening হবে না।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "I couldn’t mend the computer myself, so I ______ at a shop.",
    "options": [
      "had it mended",
      "had it mend",
      "did it mend",
      "had mended"
    ],
    "answerIndex": 0,
    "explanation": "অন্য কাউকে দিয়ে কোনো বস্তুতে কাজ করিয়ে নেওয়া বোঝাতে causative have-এর passive গঠন হলো have/had + thing + V3। কম্পিউটারটি দোকানে মেরামত করানো হয়েছে বলে সঠিক উত্তর ‘had it mended’।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "“I will not let you go.” In the sentence, ‘go’ is a/an —",
    "options": [
      "infinitive",
      "gerund",
      "participle",
      "verbal noun"
    ],
    "answerIndex": 0,
    "explanation": "Let-এর পরে সবসময় to-বিহীন bare infinitive বসে। তাই বাক্যের ‘go’ হলো infinitive; এটি gerund, participle বা verbal noun নয়।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "Travelers ______ their reservation well in advance if they want to visit St. Martins Island.",
    "options": [
      "had better to get",
      "had to better get",
      "had better get",
      "had better got"
    ],
    "answerIndex": 2,
    "explanation": "Had better একটি modal idiom এবং এর পর verb-এর base form বসে। তাই to, অতীত রূপ বা ভুল word order ছাড়া ‘had better get’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "He ran fast lest he ______ miss the train.",
    "options": [
      "can",
      "could",
      "should",
      "would"
    ],
    "answerIndex": 2,
    "explanation": "Lest অর্থ ‘পাছে’ বা ‘যেন না’; এর পরে সাধারণত should বা might এবং তারপর base verb বসে। তাই ‘lest he should miss’ সঠিক গঠন।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "We look forward ______ a response from you.",
    "options": [
      "to receiving",
      "to receive",
      "in receiving",
      "for receiving"
    ],
    "answerIndex": 0,
    "explanation": "Look forward to-তে ‘to’ হলো preposition, infinitive marker নয়। Preposition-এর পরে verb এলে gerund হয়, তাই সঠিক উত্তর ‘to receiving’।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "______ your shoes before you enter the room?",
    "options": [
      "Do you mind to remove",
      "Would you mind removed",
      "Would you mind removing",
      "Will you mind remove"
    ],
    "answerIndex": 2,
    "explanation": "ভদ্র অনুরোধে would/do you mind-এর পরে verb + ing ব্যবহৃত হয়। তাই ‘Would you mind removing your shoes?’ সঠিক; to remove, removed বা bare verb নয়।"
  },
  {
    "subject": "English",
    "topic": "Right Form of Verbs",
    "question": "In the fear of ______, he escaped elsewhere.",
    "options": [
      "arresting",
      "arrested",
      "having arrested",
      "being arrested"
    ],
    "answerIndex": 3,
    "explanation": "Of একটি preposition, তাই পরে gerund প্রয়োজন; আবার তিনি কাউকে গ্রেপ্তার করেননি, নিজে গ্রেপ্তার হওয়ার ভয় পেয়েছেন—এখানে passive sense। ফলে being + V3 রূপে ‘being arrested’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "Samin is my colleague. I _____ him for ten years.",
    "options": [
      "know",
      "new",
      "have known",
      "have been known"
    ],
    "answerIndex": 2,
    "explanation": "For ten years অতীত থেকে বর্তমান পর্যন্ত চলা সম্পর্ক বোঝায়। Know একটি stative verb, তাই এর continuous form সাধারণত ব্যবহার হয় না; Present Perfect ‘have known’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "It _____ since early morning.",
    "options": [
      "is raining",
      "rained",
      "was raining",
      "has been raining"
    ],
    "answerIndex": 3,
    "explanation": "Since early morning দিয়ে অতীতের নির্দিষ্ট সময় থেকে এখন পর্যন্ত চলমান কাজ বোঝানো হয়েছে। তাই Present Perfect Continuous-এর গঠন has/have been + V-ing অনুযায়ী ‘has been raining’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "My father _____ before I came.",
    "options": [
      "would be leaving",
      "had been leaving",
      "had left",
      "will leave"
    ],
    "answerIndex": 2,
    "explanation": "অতীতে দুটি কাজের মধ্যে আগে ঘটানো কাজ Past Perfect এবং পরে ঘটানো কাজ Past Simple হয়। ‘I came’-এর আগে বাবা চলে গিয়েছিলেন, তাই had + V3 রূপে ‘had left’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "The doctor _____ after the patient had died.",
    "options": [
      "died / came",
      "dies",
      "had died",
      "die"
    ],
    "answerIndex": 0,
    "explanation": "After-এর ক্ষেত্রে তুলনামূলক আগে ঘটানো কাজ পরে লিখলেও সেটি Past Perfect এবং পরে ঘটানো কাজ আগে লিখলেও সেটি Past Simple হয়। এখানে after-এর পরে ‘had died’ Past Perfect আছে, তাই আগের অংশে Past Simple বা V2 রূপ ‘died / came’ বসবে।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "Identify the correct sentence.",
    "options": [
      "Yesterday, he has gone home.",
      "Yesterday, he did gone home.",
      "Yesterday, he had gone home.",
      "Yesterday, he went home."
    ],
    "answerIndex": 3,
    "explanation": "Yesterday-এর মতো অতীত-নির্দেশক adverb থাকলে বাক্যে Past Indefinite বা V2 বসে। তাই ‘Yesterday, he went home’ সঠিক; has gone, had gone বা did gone নয়।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "My uncle arrived while I _____ the dinner.",
    "options": [
      "would cook",
      "had cooked",
      "cook",
      "was cooking"
    ],
    "answerIndex": 3,
    "explanation": "অতীতে একটি দীর্ঘস্থায়ী কাজ চলার সময় আরেকটি তাৎক্ষণিক কাজ ঘটলে দীর্ঘ কাজটি Past Continuous হয়। তাই uncle arrived-এর সময় চলমান রান্না বোঝাতে ‘was cooking’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "As they waited, Rahim argued against war _____.",
    "options": [
      "while his brother discusses the effects of pollution.",
      "while his brother discussed the effects of pollution.",
      "while his brother was discussing the effects of pollution.",
      "while his brother had discussing the effects of pollution."
    ],
    "answerIndex": 2,
    "explanation": "Waited ও argued অতীতের ঘটনা এবং while দিয়ে একই সময়ে চলমান কাজ বোঝানো হয়েছে। তাই Past Continuous was/were + V-ing অনুযায়ী ‘while his brother was discussing …’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "They _____ their reports yet.",
    "options": [
      "didn’t write",
      "have written",
      "wrote",
      "haven’t written"
    ],
    "answerIndex": 3,
    "explanation": "বাক্যের শেষে yet থাকলে সাধারণত Present Perfect-এর negative বা interrogative রূপ ব্যবহৃত হয়। এখানে কাজটি এখনও শেষ হয়নি, তাই ‘haven’t written’ সঠিক।"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "Identify the correct sentence.",
    "options": [
      "No sooner had we reached the station the train left.",
      "No sooner had we reached the station then the train left.",
      "No sooner had we reached the station the train had left.",
      "No sooner had we reached the station than the train left."
    ],
    "answerIndex": 3,
    "explanation": "No sooner-এর সঙ্গে সবসময় than বসে এবং গঠন হলো No sooner had + subject + V3 + than + subject + V2। তাই সঠিক বাক্যটি ‘No sooner had we reached the station than the train left।’"
  },
  {
    "subject": "English",
    "topic": "Tense",
    "question": "He looked as though he _____ twenty miles.",
    "options": [
      "has run",
      "had run",
      "was running",
      "have been running"
    ],
    "answerIndex": 1,
    "explanation": "As though/as if-এর আগের clause Past Simple ‘looked’ হলে পরের কাল্পনিক বা পূর্ববর্তী অবস্থা Past Perfect হয়। তাই had + V3 রূপে ‘had run’ সঠিক।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "বিশ্বের প্রাচীনতম সভ্যতা কোনটি?",
    "options": [
      "মিশরীয় সভ্যতা",
      "সিন্ধু সভ্যতা",
      "মেসোপটেমীয় সভ্যতা",
      "চীনা সভ্যতা"
    ],
    "answerIndex": 2,
    "explanation": "খ্রিষ্টপূর্ব প্রায় ৫০০০ অব্দে সূচিত মেসোপটেমীয় সভ্যতাকে বিশ্বের প্রাচীনতম নগরসভ্যতা বলা হয়। সুমেরীয়, আসিরীয়, ব্যাবিলনীয় ও ক্যালডীয় ছিল এর প্রধান উপসভ্যতা।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "মেসোপটেমীয় সভ্যতা কোন দুই নদীর মধ্যবর্তী ভূখণ্ডে গড়ে উঠেছিল?",
    "options": [
      "নীল ও সিন্ধু",
      "টাইগ্রিস ও ইউফ্রেটিস (দজলা ও ফোরাত)",
      "হোয়াংহো ও ইয়াংসিকিয়াং",
      "গঙ্গা ও যমুনা"
    ],
    "answerIndex": 1,
    "explanation": "মেসোপটেমিয়া শব্দের অর্থ দুই নদীর মধ্যবর্তী ভূমি। টাইগ্রিস বা দজলা এবং ইউফ্রেটিস বা ফোরাত নদীর অববাহিকাতেই এই সভ্যতার বিকাশ; এর প্রধান অংশ বর্তমান ইরাকে।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "মেসোপটেমীয় সভ্যতার সবচেয়ে বড় অবদান কোনটি?",
    "options": [
      "প্যাপিরাস আবিষ্কার",
      "চাকা আবিষ্কার",
      "প্রথম বর্ণমালা উদ্ভাবন",
      "পিরামিড নির্মাণ"
    ],
    "answerIndex": 1,
    "explanation": "চাকার আবিষ্কার মেসোপটেমীয় সভ্যতার শ্রেষ্ঠ অবদান হিসেবে পরিচিত। কিউনিফর্ম লিপি, সিলমোহর, বৃত্তকে ৩৬০° ভাগ ও দিনকে ১২ জোড়া ঘণ্টায় ভাগ করাও তাদের গুরুত্বপূর্ণ অবদান।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "‘কিউনিফর্ম’ বলতে কী বোঝায়?",
    "options": [
      "যোগাযোগের সংকেত-পতাকা",
      "সুমেরীয়দের লেখন পদ্ধতি (কীলকাকার লিপি)",
      "চিত্রকর্মের একটি রীতি",
      "পোড়ামাটির মুদ্রা"
    ],
    "answerIndex": 1,
    "explanation": "কিউনিফর্ম ছিল সুমেরীয়দের কীলকাকার লিপি। নরম কাদামাটির ফলকে তীক্ষ্ণ কলম দিয়ে দাগ কেটে লেখা হতো বলে চিহ্নগুলো কীলক বা V-আকৃতির দেখাত; পরে আক্কাদীয় ও ব্যাবিলনীয়রাও এটি ব্যবহার করে।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "মেসোপটেমিয়া এলাকার সিংহভাগ বর্তমানে কোন দেশে অবস্থিত?",
    "options": [
      "ইরাক",
      "ইরান",
      "তুরস্ক",
      "সিরিয়া"
    ],
    "answerIndex": 0,
    "explanation": "টাইগ্রিস ও ইউফ্রেটিসের মধ্যবর্তী ঐতিহাসিক মেসোপটেমিয়ার প্রধান অংশ বর্তমান ইরাকে। এর কিছু অংশ ইরান, সিরিয়া, তুরস্ক ও কুয়েতেও বিস্তৃত।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "হাম্মুরাবির বিখ্যাত আইনসংহিতা কোন সভ্যতায় প্রণীত হয়েছিল?",
    "options": [
      "সুমেরীয়",
      "ব্যাবিলনীয়",
      "মিশরীয়",
      "গ্রিক"
    ],
    "answerIndex": 1,
    "explanation": "ব্যাবিলনের রাজা হাম্মুরাবি এই আইনসংহিতা প্রণয়ন করেন। সম্পত্তি, বাণিজ্য, পরিবার ও অপরাধের শাস্তিবিষয়ক বিধান থাকায় এটি প্রাচীনতম ও সুসংরক্ষিত আইনসংহিতাগুলোর একটি।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "হাম্মুরাবির আইনের মূল কথা বা মূলনীতি কী ছিল?",
    "options": [
      "ক্ষমা করাই মহত্ত্ব",
      "চোখের বদলে চোখ, দাঁতের বদলে দাঁত",
      "সবার আগে দেশ",
      "রাজাই আইন"
    ],
    "answerIndex": 1,
    "explanation": "হাম্মুরাবির আইনের মূলনীতি ছিল প্রতিশোধমূলক Lex Talionis—ক্ষতির সমান ক্ষতি। তাই এর পরিচিত বক্তব্য ‘চোখের বদলে চোখ, দাঁতের বদলে দাঁত’।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "মিশরীয় সভ্যতা কোন নদীর তীরে গড়ে উঠেছিল?",
    "options": [
      "গঙ্গা",
      "নীল নদ",
      "হোয়াংহো",
      "রাইন"
    ],
    "answerIndex": 1,
    "explanation": "নীল নদের নিয়মিত প্লাবনের পলি মিশরের মাটিকে অত্যন্ত উর্বর করত এবং কৃষি, যোগাযোগ ও বসতি গঠনে প্রধান ভূমিকা রাখত। এজন্য মিশরকে নীল নদের দান বলা হয়।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "মিশরীয় সভ্যতায় ‘প্যাপিরাস’ বলতে কী বোঝাত?",
    "options": [
      "ধাতব মুদ্রা",
      "নলখাগড়া জাতীয় গাছের বাকল দিয়ে তৈরি কাগজ",
      "মমি সংরক্ষণে ব্যবহৃত তেল",
      "পিরামিডের স্তম্ভ"
    ],
    "answerIndex": 1,
    "explanation": "নীল নদের তীরে জন্মানো নলখাগড়া জাতীয় প্যাপিরাস গাছের বাকল চেপে ও শুকিয়ে লেখার কাগজ তৈরি করা হতো। ইংরেজি paper শব্দটির উৎসও এই প্যাপিরাস।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "পৃথিবীর সবচেয়ে বড় পিরামিড কোনটি?",
    "options": [
      "জোসারের পিরামিড",
      "খুফুর পিরামিড",
      "মাইকিরিনাসের পিরামিড",
      "স্ফিংক্স"
    ],
    "answerIndex": 1,
    "explanation": "ফারাও খুফুর পিরামিড, যা গিজার মহাপিরামিড নামেও পরিচিত, পৃথিবীর বৃহত্তম পিরামিড। সবচেয়ে পুরোনো পিরামিড হলো জোসারের স্টেপ পিরামিড।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "বিশ্বে সবচেয়ে বেশি সংখ্যক পিরামিড কোথায় রয়েছে?",
    "options": [
      "মেক্সিকো",
      "সুদান",
      "মিশর",
      "ইরাক"
    ],
    "answerIndex": 1,
    "explanation": "মিশরের পিরামিড বেশি বিখ্যাত হলেও সংখ্যার বিচারে সুদানেই সবচেয়ে বেশি পিরামিড আছে। প্রাচীন কুশ রাজ্যের নাপাতা ও মেরোয়ে অঞ্চলে ২০০টির বেশি পিরামিড পাওয়া গেছে।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "সিন্ধু সভ্যতার অপর নাম কী?",
    "options": [
      "নগর সভ্যতা",
      "মরু সভ্যতা",
      "দ্বীপ সভ্যতা",
      "পর্বত সভ্যতা"
    ],
    "answerIndex": 0,
    "explanation": "সিন্ধু সভ্যতা ছিল সুপরিকল্পিত নগরায়নের আদর্শ নমুনা, তাই এর অপর নাম নগর সভ্যতা। এটি হরপ্পা সভ্যতা নামেও পরিচিত এবং ব্রোঞ্জ যুগের সভ্যতা।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "সিন্ধু সভ্যতার নগর পরিকল্পনার সবচেয়ে উল্লেখযোগ্য বৈশিষ্ট্য কোনটি?",
    "options": [
      "বিশাল রাজপ্রাসাদ",
      "সুষম পয়ঃনিষ্কাশন ব্যবস্থা",
      "সুউচ্চ মন্দির",
      "বিশাল যুদ্ধদুর্গ"
    ],
    "answerIndex": 1,
    "explanation": "জালের মতো সরলরৈখিক রাস্তা, ইট দিয়ে বাঁধানো ঢাকা ড্রেন এবং বাড়িতে স্নানাগার সিন্ধু সভ্যতার উন্নত পয়ঃনিষ্কাশন ব্যবস্থার প্রমাণ। তাই এটিই তাদের নগর পরিকল্পনার সবচেয়ে উল্লেখযোগ্য বৈশিষ্ট্য।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "হরপ্পা নগরী কোন নদীর তীরে গড়ে উঠেছিল?",
    "options": [
      "সিন্ধু নদী",
      "গঙ্গা নদী",
      "রাবি নদী",
      "সরস্বতী নদী"
    ],
    "answerIndex": 2,
    "explanation": "হরপ্পা নগরী গড়ে উঠেছিল রাবি নদীর তীরে; অন্য প্রধান নগর মহেঞ্জোদারো ছিল সিন্ধু নদের তীরে। বর্তমানে দুটি স্থানই পাকিস্তানে অবস্থিত।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "সিন্ধু সভ্যতা কোন যুগের সভ্যতা?",
    "options": [
      "ব্রোঞ্জ যুগের",
      "পুরাপ্রস্তর যুগের",
      "লৌহ যুগের",
      "মধ্যপ্রস্তর যুগের"
    ],
    "answerIndex": 0,
    "explanation": "সিন্ধু বা হরপ্পা সভ্যতা ছিল ব্রোঞ্জ যুগের নগরসভ্যতা, যার পরিণত পর্ব আনুমানিক খ্রিষ্টপূর্ব ২৬০০–১৯০০। পরীক্ষায় ‘ব্রোঞ্জ যুগ’ বা ‘তাম্র-ব্রোঞ্জ যুগ’ উত্তরটি গ্রহণযোগ্য।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "সিন্ধু সভ্যতা কত সালে আবিষ্কৃত হয়?",
    "options": [
      "১৯২০ সালে",
      "১৯২১ সালে",
      "১৯২২ সালে",
      "১৯২৩ সালে"
    ],
    "answerIndex": 1,
    "explanation": "১৯২১ সালে দয়ারাম সাহানীর পরিচালনায় হরপ্পায় প্রত্নতাত্ত্বিক খনন শুরু হয়, তাই আবিষ্কারের বছর হিসেবে ১৯২১ ধরা হয়। ১৯২২ সালে রাখালদাস বন্দ্যোপাধ্যায় মহেঞ্জোদারোর অনুসন্ধান চালান।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "পৃথিবীর প্রথম বর্ণমালা কারা উদ্ভাবন করে?",
    "options": [
      "সুমেরীয়রা",
      "মিশরীয়রা",
      "ফিনিশীয়রা",
      "রোমানরা"
    ],
    "answerIndex": 2,
    "explanation": "ভূমধ্যসাগরীয় উপকূলের ফিনিশীয়রা ২২টি ব্যঞ্জনবর্ণের প্রথম বর্ণমালা উদ্ভাবন করে। পরবর্তীতে গ্রিক ও রোমান বর্ণমালা এরই উন্নত রূপ।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "প্রাচীন পারস্যের ধর্ম (জরথুস্ট্রীয় ধর্ম) কে প্রবর্তন করেন?",
    "options": [
      "সাইরাস (কুরুশ)",
      "দারিউস",
      "জরথুস্ট্র",
      "আলেকজান্ডার"
    ],
    "answerIndex": 2,
    "explanation": "জরথুস্ট্র বা জরদস্ত পারস্যের জরথুস্ট্রীয় ধর্মের প্রবর্তক। সাইরাস ও দারিউস পারস্য সাম্রাজ্য গড়লেও ধর্মপ্রবর্তকের নাম জরথুস্ট্র।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "হিব্রু সভ্যতার সবচেয়ে বড় অবদান কোনটি?",
    "options": [
      "বহুদেববাদ",
      "একেশ্বরবাদ",
      "মূর্তিপূজার প্রচলন",
      "জ্যোতির্বিদ্যা চর্চা"
    ],
    "answerIndex": 1,
    "explanation": "হিব্রু সভ্যতার শ্রেষ্ঠ অবদান একেশ্বরবাদ—এক ও অদ্বিতীয় ঈশ্বরে বিশ্বাস। এই ধারণা পরবর্তীতে ইহুদি, খ্রিষ্ট ও ইসলাম ধর্মের ভাবনায় গভীর প্রভাব ফেলে।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "চীনের মহাপ্রাচীরের দৈর্ঘ্য কত?",
    "options": [
      "২,১১৯ কিমি",
      "২১,১৯৬ কিমি",
      "৫,০০০ কিমি",
      "৫১,০০০ কিমি"
    ],
    "answerIndex": 1,
    "explanation": "চীনের মহাপ্রাচীরের দৈর্ঘ্য প্রায় ২১,১৯৬ কিলোমিটার। এটি পৃথিবীর বৃহত্তম মানবনির্মিত স্থাপনাগুলোর একটি।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "কাগজ কোন দেশের আবিষ্কার?",
    "options": [
      "ইংল্যান্ড",
      "প্রাচীন চীন",
      "প্রাচীন ইতালি",
      "প্রাচীন রোম"
    ],
    "answerIndex": 1,
    "explanation": "কাগজের উদ্ভব প্রাচীন চীনে। খ্রিষ্টাব্দ ১০৫ সালে সাই লুন উন্নত কাগজ তৈরির পদ্ধতি রাজদরবারে উপস্থাপন করেন বলে প্রচলিতভাবে তাঁকেই এ আবিষ্কারের কৃতিত্ব দেওয়া হয়।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "‘ইতিহাসের জনক’ বলা হয় কাকে?",
    "options": [
      "থুসিডাইডিস",
      "হেরোডোটাস",
      "এরিস্টটল",
      "সাইমনিডিস"
    ],
    "answerIndex": 1,
    "explanation": "গ্রিক ঐতিহাসিক হেরোডোটাসকে ইতিহাসের জনক বলা হয়। তাঁর Histories গ্রন্থে গ্রিক-পারস্য যুদ্ধসহ বিভিন্ন জাতির ইতিহাস, জীবনযাত্রা ও রীতিনীতি বর্ণিত হয়েছে।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "প্রাচীন অলিম্পিক ক্রীড়া কোথায় শুরু হয়েছিল?",
    "options": [
      "রোম",
      "অলিম্পিয়া (গ্রিস)",
      "মিশর",
      "ইতালি"
    ],
    "answerIndex": 1,
    "explanation": "প্রাচীন অলিম্পিকের সূচনা গ্রিসের অলিম্পিয়ায়; প্রথম নথিভুক্ত আসরটি খ্রিষ্টপূর্ব ৭৭৬ সালে। আধুনিক অলিম্পিকের প্রথম আসরও গ্রিসের এথেন্সে ১৮৯৬ সালে হয়।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "দার্শনিক সক্রেটিস কোন দেশের নাগরিক ছিলেন?",
    "options": [
      "চীন",
      "গ্রিস",
      "ইতালি",
      "জাপান"
    ],
    "answerIndex": 1,
    "explanation": "সক্রেটিস ছিলেন প্রাচীন গ্রিসের এথেন্সের দার্শনিক। প্রশ্নোত্তরের মাধ্যমে যুক্তি যাচাইয়ের তাঁর পদ্ধতি সক্রেটীয় পদ্ধতি নামে পরিচিত।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "অ্যাকাডেমি (Akademia) প্রতিষ্ঠা করেন কে?",
    "options": [
      "এরিস্টটল",
      "জুলিয়াস সিজার",
      "নেপোলিয়ন",
      "প্লেটো"
    ],
    "answerIndex": 3,
    "explanation": "প্লেটো খ্রিষ্টপূর্ব আনুমানিক ৩৮৭ সালে এথেন্সে অ্যাকাডেমি প্রতিষ্ঠা করেন। সেখানে দর্শন ও গণিতসহ নানা বিষয়ে শিক্ষা দেওয়া হতো এবং এরিস্টটলও এই প্রতিষ্ঠানে অধ্যয়ন করেন।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "মহাবীর আলেকজান্ডারের শিক্ষক কে ছিলেন?",
    "options": [
      "সক্রেটিস",
      "সেনেকা",
      "এরিস্টটল",
      "প্লেটো"
    ],
    "answerIndex": 2,
    "explanation": "গ্রিক দার্শনিক এরিস্টটল মেসিডোনিয়ার রাজপুত্র আলেকজান্ডারের শিক্ষক ছিলেন। তিনি আলেকজান্ডারকে দর্শন, নীতিশাস্ত্র ও জ্ঞানচর্চায় শিক্ষা দেন।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "প্রাচীন গ্রিসে প্রথম গণতন্ত্রের সূচনা কোথায় হয়?",
    "options": [
      "স্পার্টা",
      "এথেন্স",
      "মেসিডোনিয়া",
      "থিবস"
    ],
    "answerIndex": 1,
    "explanation": "প্রাচীন গ্রিসে প্রথম গণতন্ত্রের সূচনা এথেন্সে হয় এবং পেরিক্লিস সেখানে গণতন্ত্রকে চূড়ান্ত রূপ দেন। এথেন্সের নেতৃত্বে ডেলিয়ান লীগও গঠিত হয়েছিল।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "রোমান সভ্যতার সবচেয়ে গুরুত্বপূর্ণ অবদান কোনটি?",
    "options": [
      "আইন প্রণয়ন",
      "ধাতব মুদ্রার আবিষ্কার",
      "লেখন পদ্ধতির আবিষ্কার",
      "কাচের আবিষ্কার"
    ],
    "answerIndex": 0,
    "explanation": "রোমান সভ্যতার সবচেয়ে গুরুত্বপূর্ণ অবদান আইন প্রণয়ন। বারো ফলকের আইন খ্রিষ্টপূর্ব ৪৫১–৪৫০ সালে সংকলিত হয় এবং রোমান আইননীতি পরবর্তী ইউরোপীয় আইনব্যবস্থাকে গভীরভাবে প্রভাবিত করে।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "“এলাম, দেখলাম, জয় করিলাম” (Veni, Vidi, Vici)—বিখ্যাত উক্তিটি কার?",
    "options": [
      "অগাস্টাস সিজার",
      "জুলিয়াস সিজার",
      "আলেকজান্ডার",
      "হেরোডোটাস"
    ],
    "answerIndex": 1,
    "explanation": "Veni, Vidi, Vici বা ‘এলাম, দেখলাম, জয় করিলাম’ ছিল রোমান সেনাপতি জুলিয়াস সিজারের বিখ্যাত উক্তি। রোমান সভ্যতা ইতালির টাইবার নদের তীরে গড়ে উঠেছিল।"
  },
  {
    "subject": "আন্তর্জাতিক বিষয়াবলি",
    "topic": "বিশ্ব সভ্যতা",
    "question": "ইনকা সভ্যতার প্রধান কেন্দ্র কোথায় গড়ে উঠেছিল?",
    "options": [
      "মেক্সিকো",
      "ব্রাজিল",
      "পেরুর দক্ষিণাঞ্চলে (মাচুপিচ্চু)",
      "আর্জেন্টিনা"
    ],
    "answerIndex": 2,
    "explanation": "ইনকা সভ্যতা দক্ষিণ আমেরিকার পেরুর দক্ষিণাঞ্চলে গড়ে উঠেছিল এবং মাচুপিচ্চু ছিল এর বিখ্যাত নগরী। প্রাচীন আমেরিকার সভ্যতাগুলোর মধ্যে ইনকাকে অত্যন্ত উন্নত সভ্যতা ধরা হয়।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "কোনো আসল ৩ বছরে মুনাফা-আসলে ৫৫০০ টাকা হয়। মুনাফা আসলের ৩/৮ অংশ হলে মুনাফার হার নির্ণয় করুন।",
    "options": [
      "১২.৫০%",
      "১২.৫০%",
      "১২%",
      "১৩%"
    ],
    "answerIndex": 1,
    "explanation": "তিন বছরের মুনাফা আসলের ৩/৮ অংশ হলে এক বছরের মুনাফা হবে (৩/৮) ÷ ৩ = ১/৮ অংশ। ১/৮ = ১২.৫০%, তাই সঠিক উত্তর ১২.৫০%; উৎসের ক ও খ বিকল্পে একই মান মুদ্রিত থাকলেও উত্তরসূচিতে খ চিহ্নিত।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "কোনো সংখ্যার ৪০%-এর সঙ্গে ৪২ যোগ করলে ফলাফল হবে সেই সংখ্যা। সংখ্যাটি কত?",
    "options": [
      "৯০",
      "৮০",
      "৭৫",
      "৭০"
    ],
    "answerIndex": 3,
    "explanation": "ধরি সংখ্যাটি x। প্রশ্নমতে x-এর ৪০% + ৪২ = x, অর্থাৎ x-এর ৬০% = ৪২; ফলে x = ৪২ × ১০০ ÷ ৬০ = ৭০।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "কোন সংখ্যার ৬০% থেকে ৬০ বিয়োগ করলে বিয়োগফল ৬০ হয়?",
    "options": [
      "৫০০",
      "৬০",
      "২০০",
      "৪০০"
    ],
    "answerIndex": 2,
    "explanation": "ধরি সংখ্যাটি x। তাহলে ৬০% of x − ৬০ = ৬০, তাই ৬০% of x = ১২০ এবং x = ১২০ × ১০০ ÷ ৬০ = ২০০।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "কোন পরীক্ষায় ৬৮% পরীক্ষার্থী উত্তীর্ণ হলো। যদি আরও ১৪ জন বেশি উত্তীর্ণ হতো, তাহলে পাশের হার ৭৫% হতো। পরীক্ষার্থীর সংখ্যা কত?",
    "options": [
      "২০০ জন",
      "১৫০ জন",
      "২৫০ জন",
      "৩০০ জন"
    ],
    "answerIndex": 0,
    "explanation": "পাশের হার বাড়ার পার্থক্য ৭৫% − ৬৮% = ৭%, যা ১৪ জন। তাই ১% = ২ জন এবং ১০০% = ২০০ জন; সঠিক উত্তর ২০০ জন।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "রাজা তাঁর সম্পদের ১২% স্ত্রীকে, ৫৮% ছেলেকে এবং অবশিষ্ট ৭,২০,০০০ টাকা মেয়েকে দিলেন। তাঁর সম্পদের মোট মূল্য কত?",
    "options": [
      "২৪,০০,০০০ টাকা",
      "২০,০০,০০০ টাকা",
      "১৬,০০,০০০ টাকা",
      "১২,০০,০০০ টাকা"
    ],
    "answerIndex": 0,
    "explanation": "স্ত্রী ও ছেলে পেয়েছে ১২% + ৫৮% = ৭০%, তাই মেয়ের অংশ ৩০%। ৩০% = ৭,২০,০০০ টাকা হলে মোট সম্পদ = ৭,২০,০০০ × ১০০ ÷ ৩০ = ২৪,০০,০০০ টাকা।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "একটি গাছের উচ্চতা প্রতিবছর ২০% বৃদ্ধি পায়। বর্তমানে গাছটির উচ্চতা ১০৮০ সেমি হলে দুই বছর আগে উচ্চতা কত ছিল?",
    "options": [
      "৬৭৫ সেমি",
      "৭৫০ সেমি",
      "৭৭৫ সেমি",
      "৮০০ সেমি"
    ],
    "answerIndex": 1,
    "explanation": "দুই বছরে প্রতি বছর ২০% করে বৃদ্ধি মানে আগের উচ্চতাকে দুবার ১২০% দিয়ে গুণ করা। তাই দুই বছর আগের উচ্চতা = ১০৮০ × ১০০/১২০ × ১০০/১২০ = ৭৫০ সেমি।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "ছোটনের বেতন গত মাসে ৯% বৃদ্ধির পর বর্তমান বেতন কত? যদি ৯%-এর বদলে ১১% বৃদ্ধি পেত, তবে বেতন ৭২,১৫০ টাকা হতো।",
    "options": [
      "৬৬,১৯৩ টাকা",
      "৬৫,০০০ টাকা",
      "৭০,৮৫০ টাকা",
      "৭২,২০০ টাকা"
    ],
    "answerIndex": 2,
    "explanation": "ধরি শুরুর বেতন ১০০%। ১১% বাড়লে ১১১% = ৭২,১৫০ টাকা, তাই ৯% বাড়ার পর বর্তমান বেতন ১০৯% = ৭২,১৫০ × ১০৯ ÷ ১১১ = ৭০,৮৫০ টাকা।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "তেল বা চিনির মূল্য ২৫% বৃদ্ধি পেলে ব্যয় বৃদ্ধি না করতে ব্যবহার শতকরা কত কমাতে হবে?",
    "options": [
      "১৬%",
      "২০%",
      "২৫%",
      "২৪%"
    ],
    "answerIndex": 1,
    "explanation": "আগের মূল্য ১০০ টাকা হলে ২৫% বৃদ্ধিতে নতুন মূল্য ১২৫ টাকা। পুরোনো ১০০ টাকার ব্যয় রাখতে ১২৫ টাকার পণ্যের ২৫ টাকা কমাতে হবে; ২৫/১২৫ × ১০০ = ২০%, তাই উত্তর ২০%।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "১ থেকে ৭০ পর্যন্ত সংখ্যাগুলোর মধ্যে যেসব সংখ্যার বর্গের একক অঙ্ক ১, সেগুলোর সংখ্যা শতকরা কত?",
    "options": [
      "১৪",
      "১২",
      "২০",
      "২১"
    ],
    "answerIndex": 2,
    "explanation": "যে সংখ্যার একক অঙ্ক ১ বা ৯, তার বর্গের একক অঙ্ক ১ হয়। ১ থেকে ৭০ পর্যন্ত এমন ১৪টি সংখ্যা আছে—১, ৯, ১১, ১৯, …, ৬৯; তাই ১৪/৭০ × ১০০ = ২০%।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "একটি সংখ্যার ৪০% অন্য একটি সংখ্যার দুই-তৃতীয়াংশের সমান হলে প্রথম ও দ্বিতীয় সংখ্যার অনুপাত কত?",
    "options": [
      "২:৫",
      "৫:৩",
      "৫:৩",
      "৭:৩"
    ],
    "answerIndex": 2,
    "explanation": "ধরি প্রথম সংখ্যা x ও দ্বিতীয় সংখ্যা y। ৪০% of x = ২/৩ of y হলে ২x/৫ = ২y/৩, অর্থাৎ ৬x = ১০y; তাই x:y = ১০:৬ = ৫:৩। উৎসের খ ও গ বিকল্পে একই অনুপাত মুদ্রিত, উত্তরসূচিতে গ চিহ্নিত।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "যদি m-এর ৮% = p-এর ৪% হয়, তবে m-এর ২০% হলো p-এর কত শতাংশ?",
    "options": [
      "৮০%",
      "১৬%",
      "১০%",
      "কোনোটিই নয়"
    ],
    "answerIndex": 2,
    "explanation": "m-এর ৮% = p-এর ৪%। উভয় পাশে ২.৫ দিয়ে গুণ করলে m-এর ২০% = p-এর ১০% পাওয়া যায়, তাই সঠিক উত্তর ১০%।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "প্রথম সংখ্যার ৩০% দ্বিতীয় সংখ্যা থেকে বিয়োগ করলে দ্বিতীয় সংখ্যাটি তার ৪/৫ অংশ হয়। প্রথম ও দ্বিতীয় সংখ্যার অনুপাত কত?",
    "options": [
      "৩:২",
      "২:৩",
      "২:৫",
      "৪:৭"
    ],
    "answerIndex": 1,
    "explanation": "দ্বিতীয় সংখ্যা তার ৪/৫ হলে সেটি ২০% কমেছে। এই ২০% দ্বিতীয় সংখ্যার সমান প্রথম সংখ্যার ৩০%, তাই প্রথম:দ্বিতীয় = ২০:৩০ = ২:৩।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "একটি কারখানায় কর্মীর সংখ্যা ৫৮%, কর্মকর্তা ৬৬০ জন এবং অবশিষ্ট ২৬৪ জন ক্লার্ক। মোট কর্মচারীর সংখ্যা কত?",
    "options": [
      "১৫০০",
      "২০০০",
      "২২০০",
      "২৫০০"
    ],
    "answerIndex": 2,
    "explanation": "কর্মী ৫৮% হলে কর্মকর্তা ও ক্লার্ক মিলিয়ে বাকি ৪২%। ৬৬০ + ২৬৪ = ৯২৪ জন = মোটের ৪২%, সুতরাং মোট কর্মচারী = ৯২৪ × ১০০ ÷ ৪২ = ২২০০ জন।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "একজন যাত্রী পণ্যের মূল্যের ৫০% customs duty এবং পণ্যের মূল্য ও duty-এর যোগফলের ওপর ২০% sales tax দেন। duty ও tax মিলিয়ে ৩৫০ টাকা হলে পণ্যের মূল মূল্য কত?",
    "options": [
      "৪০০ টাকা",
      "৪৫০ টাকা",
      "৫০০ টাকা",
      "কোনোটিই নয় (৪৩৭.৫০ টাকা)"
    ],
    "answerIndex": 3,
    "explanation": "পণ্যের মূল্য ১০০ টাকা ধরলে customs duty ৫০ টাকা এবং ১৫০ টাকার ওপর sales tax ৩০ টাকা; মোট কর ৮০ টাকা। ৮০ টাকার করের জন্য মূল্য ১০০ টাকা হলে ৩৫০ টাকার করের জন্য মূল্য = ৩৫০ × ১০০ ÷ ৮০ = ৪৩৭.৫০ টাকা, তাই ‘কোনোটিই নয়’ সঠিক।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "রিয়াজ তার আয়ের ২০% tax দেন এবং অবশিষ্ট টাকার ২০% বাড়িভাড়া দেন। তিনি মোট আয়ের কত শতাংশ বাড়িভাড়া দেন?",
    "options": [
      "১৫%",
      "২০%",
      "২৫%",
      "১৬%"
    ],
    "answerIndex": 3,
    "explanation": "মোট আয় ১০০ টাকা ধরলে tax দেওয়ার পর অবশিষ্ট থাকে ৮০ টাকা। তার ২০% বাড়িভাড়া = ৮০ × ২০/১০০ = ১৬ টাকা, অর্থাৎ মোট আয়ের ১৬%।"
  },
  {
    "subject": "গাণিতিক যুক্তি",
    "topic": "শতকরা ও লাভ-ক্ষতি",
    "question": "চিনির মূল্য ২০% কমল এবং ব্যবহার ২০% বৃদ্ধি পেল। চিনি বাবদ খরচ শতকরা কত কমল বা বাড়ল?",
    "options": [
      "৮% বাড়ে",
      "৪% কমে",
      "কোনো পরিবর্তন হয়নি",
      "২০% কমে"
    ],
    "answerIndex": 1,
    "explanation": "মূল্য ২০% কমে ৮০ এবং ব্যবহার ২০% বেড়ে ১২০ হলে পুরোনো খরচ ১০০ × ১০০ = ১০,০০০, নতুন খরচ ৮০ × ১২০ = ৯,৬০০। তাই খরচ ৪০০/১০,০০০ × ১০০ = ৪% কমে; ধারাবাহিক শতকরা পরিবর্তনে একই হারের কমা ও বাড়া একে অপরকে বাতিল করে না।"
  }
]

export const SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER = [33, 6, 59, 43, 44, 14, 7, 35, 9, 42, 65, 48, 51, 73, 22, 25, 21, 38, 17, 13, 68, 40, 16, 4, 5, 72, 24, 47, 26, 55, 50, 74, 2, 53, 45, 19, 29, 39, 75, 3, 63, 41, 54, 52, 34, 66, 62, 32, 58, 71, 36, 28, 31, 67, 61, 27, 64, 46, 23, 18, 10, 12, 56, 57, 49, 70, 30, 0, 37, 1, 60, 15, 69, 20, 8, 11]

if (sourceRows.length !== 76 || new Set(SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER).size !== 76 || Math.min(...SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER) !== 0 || Math.max(...SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER) !== 75) {
  throw new Error('The 9 September live paper must contain every one of its 76 supplied questions exactly once')
}

export const SEPTEMBER_9_LIVE_EXAM_QUESTIONS = SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER.map((sourceIndex, displayIndex) => {
  const row = sourceRows[sourceIndex]
  return {
    id: `live-2026-09-09-${String(displayIndex + 1).padStart(3, '0')}`,
    display_order: displayIndex + 1,
    source_order: sourceIndex + 1,
    subject: row.subject,
    topic: row.topic,
    question: row.question,
    options: row.options,
    answer: row.options[row.answerIndex],
    answer_index: row.answerIndex,
    explanation: row.explanation,
    post_name: '৯ সেপ্টেম্বর লাইভ পরীক্ষা',
    exam_tag: 'live-2026-09-09'
  }
})

export const SEPTEMBER_9_LIVE_EXAM_COUNTS = {
  total: SEPTEMBER_9_LIVE_EXAM_QUESTIONS.length,
  english: SEPTEMBER_9_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'English').length,
  generalKnowledge: SEPTEMBER_9_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'আন্তর্জাতিক বিষয়াবলি').length,
  math: SEPTEMBER_9_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'গাণিতিক যুক্তি').length
}

if (SEPTEMBER_9_LIVE_EXAM_COUNTS.total !== 76 || SEPTEMBER_9_LIVE_EXAM_COUNTS.english !== 30 || SEPTEMBER_9_LIVE_EXAM_COUNTS.generalKnowledge !== 30 || SEPTEMBER_9_LIVE_EXAM_COUNTS.math !== 16 || SEPTEMBER_9_LIVE_EXAM_QUESTIONS.some(question => !question.explanation || question.options[question.answer_index] !== question.answer)) {
  throw new Error('The 9 September live paper is incomplete or has an invalid answer key')
}
