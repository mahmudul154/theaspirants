// Published fixed paper for the 10 September 2026, 23:30 Asia/Dhaka live exam.
// The supplied paper contains 100 reviewed questions on Parts of Speech and
// the listed international-affairs topics. The sender name is intentionally not
// stored in the paper metadata.

const q = (subject, topic, question, options, answerIndex, explanation) => ({
  subject, topic, question, options, answerIndex, explanation
})

const sourceRows = [
  q('ইংরেজি', 'পদ প্রকরণ', 'He came ___ foot.', ['by', 'on', 'with', 'in'], 1, 'On foot অর্থ হেঁটে। এটি একটি fixed expression; foot-এর আগে by বসে না।'),
  q('ইংরেজি', 'পদ প্রকরণ', '___ iron is a useful metal.', ['A', 'An', 'The', 'No article'], 3, 'Material noun সাধারণ অর্থে ব্যবহৃত হলে article বসে না। তাই সঠিক উত্তর No article।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The committee ___ given its report.', ['have', 'were', 'has', 'are'], 2, 'Committee এখানে একটি ঐক্যবদ্ধ সংস্থা হিসেবে ব্যবহৃত হয়েছে, তাই singular verb has এবং its বসবে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The committee ___ divided in their opinions.', ['was', 'were', 'is', 'has'], 1, 'Committee-এর সদস্যরা পৃথকভাবে মত দিচ্ছে, তাই এখানে plural verb were ব্যবহৃত হবে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The round of the ladder is broken. — round is:', ['Adjective', 'Verb', 'Noun', 'Preposition'], 2, 'Round এখানে সিঁড়ির ধাপ বোঝাচ্ছে, তাই এটি Noun। একই শব্দ ভিন্ন বাক্যে ভিন্ন Parts of Speech হতে পারে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Choose the grammatically correct sentence:', ['He is more senior than me.', 'He is seniorer than I.', 'He is senior to me.', 'He is most senior than I.'], 2, 'Senior একটি Latin comparative; এর পরে to বসে। তাই senior to me সঠিক, more বা than নয়।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The man is mortal. — mortal is:', ['Noun', 'Predicate Adjective', 'Adverb', 'Verb'], 1, 'Linking verb is-এর পরে mortal subject complement হিসেবে মানুষের গুণ প্রকাশ করছে; তাই এটি Predicate Adjective।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Only he can do it. — Only is:', ['Adjective', 'Adverb', 'Conjunction', 'Noun'], 1, 'Only এখানে he-কে জোর দিচ্ছে, তাই Adverb। The only boy-এ এটি Adjective হয়।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'He walked down the hill. — down is:', ['Adverb', 'Adjective', 'Preposition', 'Verb'], 2, 'Down-এর পরে the hill নামপদ আছে, তাই এখানে এটি Preposition।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The sleeping baby is cute. — sleeping is:', ['Verb', 'Noun', 'Adjective', 'Adverb'], 2, 'Sleeping শব্দটি baby-কে বিশেষিত করছে; তাই এটি participle adjective।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The above statement is true. — above is:', ['Preposition', 'Adjective', 'Adverb', 'Noun'], 1, 'Above এখানে statement নামপদকে বিশেষিত করছে, তাই এটি Adjective।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'He has ___ money.', ['a little', 'little', 'the little', 'few'], 1, 'Little অর্থ প্রায় নেই এবং money uncountable noun; তাই little সঠিক। A little অর্থ কিছুটা আছে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Hush! The baby is sleeping. — Hush expresses:', ['Joy', 'Silence', 'Surprise', 'Grief'], 1, 'Hush অর্থ চুপ বা নীরব থাকো; এটি Silence প্রকাশ করে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Both he ___ his brother are intelligent.', ['or', 'nor', 'and', 'but'], 2, 'Both-এর সঙ্গে correlative conjunction হিসেবে and ব্যবহৃত হয়।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'He is jealous ___ my success.', ['of', 'from', 'with', 'at'], 0, 'Jealous of একটি fixed preposition; অর্থ ঈর্ষান্বিত।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'He is angry ___ my behavior.', ['with', 'at', 'on', 'to'], 1, 'কোনো বিষয় বা আচরণের প্রতি রাগ বোঝালে angry at বা angry about ব্যবহৃত হয়।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'He is ___ better of the two.', ['a', 'an', 'the', 'no article'], 2, 'The + comparative + of the two হলো নির্দিষ্ট নিয়ম; তাই the সঠিক।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The girl ___ you met is my sister.', ['who', 'whom', 'which', 'whose'], 1, 'You met বাক্যে শূন্যস্থানটি object position-এ, তাই whom ব্যবহৃত হবে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Each of the students has submitted ___ assignment.', ['their', 'his', 'its', 'our'], 1, 'Each singular হওয়ায় singular possessive pronoun his ব্যবহৃত হবে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Who is knocking at the door? — Who is:', ['Relative Pronoun', 'Interrogative Pronoun', 'Personal Pronoun', 'Demonstrative Pronoun'], 1, 'প্রশ্নবোধক বাক্যে ব্যবহৃত Who হলো Interrogative Pronoun।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'A herd of cattle is grazing. — Herd is:', ['Common Noun', 'Collective Noun', 'Abstract Noun', 'Material Noun'], 1, 'Herd একটি পাল বা সমষ্টি বোঝায়, তাই এটি Collective Noun।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'His arrival surprised everyone. — Arrival is the noun form of:', ['Arrive', 'Arriving', 'Arrived', 'Arrives'], 0, 'Arrive verb-এর সঙ্গে -al যুক্ত হয়ে Arrival noun হয়েছে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Fast in He is on a fast is a/an:', ['Adjective', 'Adverb', 'Noun', 'Verb'], 2, 'On a fast অর্থ উপবাসে থাকা; এখানে fast Noun। A fast car-এ Adjective এবং runs fast-এ Adverb।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Still in He is still working is a/an:', ['Adjective', 'Conjunction', 'Adverb', 'Noun'], 2, 'Still এখানে এখনও অর্থে working-কে বিশেষিত করছে; তাই এটি Adverb of time।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Enough in He has enough money is a/an:', ['Adjective', 'Adverb', 'Noun', 'Pronoun'], 0, 'Enough যখন noun-এর আগে বসে, তখন এটি Adjective বা determiner হিসেবে কাজ করে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Near in The end is near is a/an:', ['Preposition', 'Adjective', 'Adverb', 'Verb'], 1, 'Linking verb is-এর পরে near এখানে কাছাকাছি গুণ প্রকাশ করছে, তাই Adjective।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'For in For he is honest, everyone respects him is a/an:', ['Preposition', 'Conjunction', 'Adverb', 'Adjective'], 1, 'For এখানে because অর্থে দুটি clause যুক্ত করেছে; তাই এটি Conjunction।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'All in All men are mortal is a/an:', ['Pronoun', 'Adjective', 'Adverb', 'Noun'], 1, 'All এখানে men-এর আগে বসে তাকে নির্ধারণ করছে; তাই এটি Adjective বা determiner।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The problem is not that complicated. — that is:', ['Pronoun', 'Adjective', 'Conjunction', 'Adverb'], 3, 'That অর্থ ততটা এবং complicated adjective-এর মাত্রা বোঝাচ্ছে; তাই এটি degree Adverb।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Whatever happens, remain calm. — Whatever is:', ['Pronoun', 'Adjective', 'Preposition', 'Adverb'], 0, 'Whatever নিজেই happens-এর subject; তাই এটি Pronoun।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'She hopes to work abroad. — to is:', ['Preposition', 'Conjunction', 'Pronoun', 'Infinitive'], 3, 'To এবং base verb work মিলে to-infinitive তৈরি করেছে; এখানে to preposition নয়।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Her explanation was very convincing. — convincing is:', ['Adjective', 'Gerund', 'Finite verb', 'Noun'], 0, 'Convincing explanation-এর গুণ বোঝাচ্ছে এবং very দিয়ে modified হয়েছে; তাই এটি Adjective।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'The repeated reading of the clause revealed its ambiguity. — reading is:', ['Finite verb', 'Verbal noun', 'Adverb', 'Present participle'], 1, 'Reading-এর আগে article the ও adjective repeated আছে এবং of-phrase যুক্ত হয়েছে; তাই এটি Verbal noun।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'As winter nears, demand rises. — nears is:', ['Noun', 'Verb', 'Adverb', 'Preposition'], 1, 'Nears অর্থ কাছে আসে; winter singular subject হওয়ায় verb-এ s যুক্ত হয়েছে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Her latest novel is a surprisingly good read. — read is:', ['Verb', 'Adjective', 'Noun', 'Adverb'], 2, 'A good read-এ article a এবং adjective good-এর পরে read noun হিসেবে বই বা লেখা বোঝাচ্ছে।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Please down your tools and listen. — down is:', ['Preposition', 'Adverb', 'Adjective', 'Verb'], 3, 'Down your tools অর্থ সরঞ্জাম নামিয়ে রাখো; এখানে down imperative Verb এবং your tools তার object।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Spread the mixture in an even layer. — even is:', ['Adverb', 'Verb', 'Adjective', 'Noun'], 2, 'Even অর্থ সমান বা সমান পুরুত্বের এবং layer noun-এর গুণ বোঝাচ্ছে; তাই Adjective।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'I was none the wiser after his explanation. — none is:', ['Adverb', 'Pronoun', 'Adjective', 'Noun'], 0, 'None the wiser expression-এ none comparative-এর মাত্রা নাকচ করছে; এখানে এটি Adverb।'),
  q('ইংরেজি', 'পদ প্রকরণ', 'Of the two proposals, I prefer that. — that is:', ['Adjective', 'Demonstrative pronoun', 'Conjunction', 'Adverb'], 1, 'That নিজেই একটি proposal-কে নির্দেশ করছে এবং prefer-এর object হয়েছে; তাই Demonstrative pronoun।'),

  q('আন্তর্জাতিক বিষয়াবলি', 'রেনেসাঁ', 'ইতালীয় রেনেসাঁর প্রাথমিক বিকাশের প্রধান কেন্দ্র কোন নগরী?', ['ফ্লোরেন্স', 'মাদ্রিদ', 'ভিয়েনা', 'লিসবন'], 0, 'ফ্লোরেন্স মানবতাবাদ ও শিল্পকলার গুরুত্বপূর্ণ কেন্দ্র ছিল। সম্পদশালী পৃষ্ঠপোষক ও শিল্পীদের ভূমিকা রেনেসাঁর বিকাশে গুরুত্বপূর্ণ।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রেনেসাঁ', 'রেনেসাঁয় মূলত কোন প্রাচীন সভ্যতাদ্বয়ের সাহিত্য ও শিল্পের প্রতি আগ্রহ পুনরুজ্জীবিত হয়?', ['মায়া ও ইনকা', 'গ্রিক ও রোমান', 'চীনা ও জাপানি', 'সুমেরীয় ও অ্যাসিরীয়'], 1, 'প্রাচীন গ্রিস ও রোমের সাহিত্য, শিল্প এবং চিন্তার পুনঃঅধ্যয়ন রেনেসাঁর অন্যতম বৈশিষ্ট্য।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রেনেসাঁ', 'মোনালিসা বর্তমানে কোন জাদুঘরে সংরক্ষিত?', ['লুভর, প্যারিস', 'ব্রিটিশ মিউজিয়াম, লন্ডন', 'প্রাদো, মাদ্রিদ', 'উফিৎসি, ফ্লোরেন্স'], 0, 'মোনালিসা ফ্রান্সের প্যারিসের লুভর জাদুঘরে সংরক্ষিত আছে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রেনেসাঁ', 'The School of Athens-এ বিশেষভাবে কোন দুই দার্শনিক ধারার প্রতিনিধিত্ব দেখা যায়?', ['মার্কসবাদ ও অস্তিত্ববাদ', 'উপযোগবাদ ও প্রত্যক্ষবাদ', 'দাওবাদ ও কনফুসীয়বাদ', 'প্লেটোনীয় ও অ্যারিস্টটলীয় দর্শন'], 3, 'রাফায়েল এই চিত্রে প্লেটো ও অ্যারিস্টটলের দর্শনধারার প্রতিনিধিদের সমবেত করেছেন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রেনেসাঁ', 'কাকে সাধারণত মানবতাবাদের জনক বলা হয়?', ['আইজ্যাক নিউটন', 'কার্ল মার্কস', 'ফ্রান্সেসকো পেত্রার্ক', 'চার্লস ডারউইন'], 2, 'প্রাচীন পাণ্ডুলিপি উদ্ধার, ধ্রুপদি সাহিত্যচর্চা ও মানবকেন্দ্রিক শিক্ষায় ভূমিকার জন্য পেত্রার্ককে মানবতাবাদের জনক বলা হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আফিম যুদ্ধ', 'প্রথম আফিম যুদ্ধের প্রধান প্রতিপক্ষ কারা ছিল?', ['চীন ও ফ্রান্স', 'চীন ও ব্রিটেন', 'চীন ও রাশিয়া', 'ব্রিটেন ও জাপান'], 1, 'প্রথম আফিম যুদ্ধে ব্রিটেনের বিরুদ্ধে চীনের চিং সাম্রাজ্য যুদ্ধ করে। দ্বিতীয় যুদ্ধে ফ্রান্সও ব্রিটেনের সঙ্গে যোগ দেয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আফিম যুদ্ধ', 'নানকিং চুক্তি কবে স্বাক্ষরিত হয়?', ['২৯ আগস্ট ১৮৪১', '২৯ আগস্ট ১৮৪২', '১ জুলাই ১৮৪২', '২৪ অক্টোবর ১৮৬০'], 1, 'নানকিং চুক্তি ২৯ আগস্ট ১৮৪২ সালে স্বাক্ষরিত হয়; ১৮৪১ সালের হংকং দখল আলাদা ঘটনা।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আফিম যুদ্ধ', 'ব্রিটিশরা প্রথম হংকং দ্বীপ দখল করে কোন সালে?', ['১৮৪১', '১৮৪২', '১৮৬০', '১৮৯৮'], 0, 'ব্রিটিশ দখল প্রতিষ্ঠিত হয় ১৮৪১ সালে; চুক্তির মাধ্যমে আনুষ্ঠানিক হস্তান্তর ১৮৪২ সালে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ক্রিমিয়া যুদ্ধ', 'ক্রিমিয়ার যুদ্ধে কোন পক্ষ পরাজিত হয়?', ['ব্রিটেন', 'রাশিয়া', 'ফ্রান্স', 'সার্ডিনিয়া-পিয়েডমন্ট'], 1, 'মিত্রশক্তির বিজয়ের পর ১৮৫৬ সালের প্যারিস চুক্তির মাধ্যমে যুদ্ধ শেষ হয় এবং রাশিয়া পরাজিত হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ক্রিমিয়া যুদ্ধ', 'ক্রিমিয়ায় রাশিয়ার কৃষ্ণসাগরীয় নৌবহরের গুরুত্বপূর্ণ ঘাঁটি কোন শহরে?', ['মিনস্ক', 'খারকিভ', 'সেভাস্তোপোল', 'লভিভ'], 2, 'সেভাস্তোপোলের বন্দর ও নৌঘাঁটি ক্রিমিয়া ও রাশিয়া–ইউক্রেন ইতিহাসে গুরুত্বপূর্ণ।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রাশিয়া–ইউক্রেন যুদ্ধ', 'OSCE-এর পূর্ণরূপ কী?', ['Organization for Social and Cultural Exchange', 'Organization of States for Common Economy', 'Organization for Security and Co-operation in Europe', 'Organization for Strategic Cooperation in Eurasia'], 2, 'OSCE-এর পূর্ণরূপ Organization for Security and Co-operation in Europe।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রাশিয়া–ইউক্রেন যুদ্ধ', 'নিচের কোনটি OSCE-এর ছয়টি দাপ্তরিক ভাষার অন্তর্ভুক্ত নয়?', ['আরবি', 'ইংরেজি', 'রুশ', 'ইতালীয়'], 0, 'OSCE-এর ছয়টি ভাষা ইংরেজি, ফরাসি, জার্মান, ইতালীয়, স্প্যানিশ ও রুশ; আরবি নয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রাশিয়া–ইউক্রেন যুদ্ধ', '১০ মার্চ ২০২২ রাশিয়া ও ইউক্রেনের পররাষ্ট্রমন্ত্রীরা কোথায় বৈঠক করেন?', ['জেনেভা, সুইজারল্যান্ড', 'মিনস্ক, বেলারুশ', 'আনতালিয়া, তুরস্ক', 'ভিয়েনা, অস্ট্রিয়া'], 2, 'তুরস্কের মধ্যস্থতায় আনতালিয়ায় বৈঠকটি অনুষ্ঠিত হয়; এটি পরবর্তী ইস্তাম্বুল আলোচনার থেকে আলাদা।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রাশিয়া–ইউক্রেন যুদ্ধ', 'OSCE-এর প্রাতিষ্ঠানিক বিকাশের সঠিক ক্রম কোনটি?', ['Helsinki Final Act → CSCE আলোচনা শুরু → OSCE নাম কার্যকর', 'OSCE নাম কার্যকর → CSCE আলোচনা শুরু → Helsinki Final Act', 'CSCE আলোচনা শুরু → Helsinki Final Act → OSCE নাম কার্যকর', 'CSCE আলোচনা শুরু → OSCE নাম কার্যকর → Helsinki Final Act'], 2, 'সঠিক ক্রম ১৯৭৩ সালে CSCE আলোচনা, ১৯৭৫ সালে Helsinki Final Act এবং ১৯৯৫ সালে OSCE নাম কার্যকর।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ওয়েস্টফেলিয়া শান্তি চুক্তি', 'ওয়েস্টফেলিয়ার প্রধান অক্টোবরের চুক্তিগুলোর গ্রেগরীয় তারিখ কোনটি?', ['২৪ অক্টোবর ১৬৪৮', '৪ জুলাই ১৬৪৮', '১৪ জুলাই ১৬৪৮', '১১ নভেম্বর ১৬৪৮'], 0, 'গ্রেগরীয় পঞ্জিকা অনুযায়ী প্রধান চুক্তির তারিখ ২৪ অক্টোবর ১৬৪৮; পুরোনো পঞ্জিকায় ১৪ অক্টোবর দেখা যায়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ওয়েস্টফেলিয়া শান্তি চুক্তি', '১৬৪৮ সালের ফ্রান্সের রাজা কে ছিলেন?', ['ষোড়শ লুই', 'নেপোলিয়ন', 'অষ্টাদশ লুই', 'চতুর্দশ লুই'], 3, 'চতুর্দশ লুই তখন অপ্রাপ্তবয়স্ক ছিলেন; তাঁর রাজত্বের নামে চুক্তি সম্পাদিত হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ওয়েস্টফেলিয়া শান্তি চুক্তি', 'ফ্রান্স–স্পেন যুদ্ধের অবসান ঘটানো ১৬৫৯ সালের চুক্তি কোনটি?', ['লুসান চুক্তি', 'তিয়ানজিন চুক্তি', 'পিরেনিজ চুক্তি', 'নানকিং চুক্তি'], 2, 'পিরেনিজ চুক্তি ওয়েস্টফেলিয়ার ১১ বছর পর ফ্রান্স–স্পেন যুদ্ধের অবসান ঘটায়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'শিল্পবিপ্লব', 'শিল্পবিপ্লব প্রথম কোন দেশে শুরু হয়?', ['রাশিয়া', 'জাপান', 'ফ্রান্স', 'ব্রিটেন'], 3, 'অষ্টাদশ শতকের ব্রিটেনে যন্ত্রভিত্তিক উৎপাদনের রূপান্তর প্রথম ব্যাপকভাবে শুরু হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'শিল্পবিপ্লব', 'ব্রিটেনের প্রাথমিক শিল্পায়নে কোন খাত বিশেষ অগ্রণী ছিল?', ['সুতি বস্ত্রশিল্প', 'পরমাণুশিল্প', 'কম্পিউটারশিল্প', 'বিমানশিল্প'], 0, 'সুতা কাটা ও কাপড় বোনার যান্ত্রিকীকরণ প্রথম শিল্পায়নের কেন্দ্রীয় প্রক্রিয়া ছিল।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'শিল্পবিপ্লব', 'Water Frame-এর প্রাথমিক শক্তির উৎস কী?', ['ডিজেল', 'প্রবাহিত পানি', 'পারমাণবিক শক্তি', 'বিদ্যুৎ'], 1, 'Water Frame জলশক্তিতে চলত; তাই প্রাথমিক কারখানাগুলো অনেক সময় নদীর কাছে গড়ে উঠত।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'শিল্পবিপ্লব', 'প্রথম শিল্পবিপ্লবের প্রধান জীবাশ্ম জ্বালানি কোনটি?', ['কয়লা', 'ইউরেনিয়াম', 'হাইড্রোজেন', 'পেট্রল'], 0, 'কয়লা বাষ্পশক্তি ও লৌহশিল্পের বিকাশে প্রথম শিল্পবিপ্লবে গুরুত্বপূর্ণ ছিল।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আমেরিকার স্বাধীনতা যুদ্ধ', 'যুক্তরাষ্ট্রের স্বাধীনতার ঘোষণা কবে গৃহীত হয়?', ['২ জুলাই ১৭৮৩', '৪ জুলাই ১৭৭৬', '১৭ সেপ্টেম্বর ১৭৮৭', '১৯ এপ্রিল ১৭৭৫'], 1, '৪ জুলাই ১৭৭৬ স্বাধীনতার ঘোষণাপত্র গ্রহণের দিন; এটি যুদ্ধ শুরুর দিন নয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আমেরিকার স্বাধীনতা যুদ্ধ', '১৭৮১ সালে ব্রিটিশদের বড় আত্মসমর্পণ কোথায় ঘটে?', ['ইয়র্কটাউন', 'বোস্টন', 'কনকর্ড', 'ফিলাডেলফিয়া'], 0, 'ইয়র্কটাউনের আত্মসমর্পণ আমেরিকার স্বাধীনতা যুদ্ধে বড় সামরিক মোড় তৈরি করে; আনুষ্ঠানিক শান্তি আসে ১৭৮৩ সালে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ফরাসি রাজতন্ত্র বিলুপ্ত করে কোন পরিষদ?', ['League of Nations', 'Directory', 'National Convention', 'Estates-General ১৬১৪'], 2, '১৭৯২ সালের ২১ সেপ্টেম্বর National Convention রাজতন্ত্র বিলোপ করে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'প্রথম বিশ্বযুদ্ধ', 'ফ্রানৎস ফার্দিনান্দ কোথায় নিহত হন?', ['সারায়েভো', 'বার্লিন', 'ভিয়েনা', 'প্যারিস'], 0, 'অস্ট্রিয়া-হাঙ্গেরি শাসিত বসনিয়ার সারায়েভোতে ফ্রানৎস ফার্দিনান্দ নিহত হন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ফরাসি বিপ্লবের সময় নারী অধিকারের প্রবক্তা কে ছিলেন?', ['অল্যাঁপ দ্য গুজ (Olympe de Gouges)', 'জোয়ান অব আর্ক', 'মেরি কুরি', 'কোকো শ্যানেল'], 0, 'অল্যাঁপ দ্য গুজ ১৭৯১ সালে নারী ও নারী নাগরিকের অধিকারের ঘোষণাপত্র লেখেন; ১৭৯৩ সালে নিহত হন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ফরাসি বিপ্লবের প্রেক্ষাপটে বুর্জোয়া বলতে কাদের বোঝায়?', ['মধ্যবিত্ত ব্যবসায়ী, আইনজীবী, চিকিৎসক শ্রেণি', 'ভূমিদাস', 'যাজক', 'সৈনিক'], 0, 'শিক্ষিত মধ্যবিত্ত বুর্জোয়ারা বিপ্লবের নেতৃত্ব দেয় এবং পরে পুঁজিবাদী ব্যবস্থার ভিত্তি গড়ে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'নেপোলিয়নের মৃত্যু কবে ও কোথায় হয়?', ['৫ মে ১৮২১, সেন্ট হেলেনা', '১৮ জুন ১৮১৫, ওয়াটারলু', '২১ জানুয়ারি ১৭৯৩, প্যারিস', '১৫ আগস্ট ১৭৬৯, কর্সিকা'], 0, 'ব্রিটিশদের হাতে বন্দি অবস্থায় দক্ষিণ আটলান্টিকের সেন্ট হেলেনা দ্বীপে ৫ মে ১৮২১ সালে তাঁর মৃত্যু হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ফরাসি উপনিবেশ হাইতির বিপ্লবের নেতা কে ছিলেন?', ['তুস্যাঁ লুভেরত্যুর', 'সিমোন বলিভার', 'জর্জ ওয়াশিংটন', 'নেলসন ম্যান্ডেলা'], 0, 'তুস্যাঁ লুভেরত্যুরের নেতৃত্বে ১৭৯১–১৮০৪ সালের হাইতি বিপ্লব সংঘটিত হয়; হাইতি ১৮০৪ সালে স্বাধীন হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'রুশ বিপ্লব', 'রুশ বিপ্লব কবে হয়?', ['১৭৮৯', '১৮৮৯', '১৯১৭', '১৯৪৭'], 2, 'ফেব্রুয়ারি ও অক্টোবর বা বলশেভিক বিপ্লব ১৯১৭ সালে ঘটে; নেতা ছিলেন ভ্লাদিমির লেনিন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আমেরিকার স্বাধীনতা যুদ্ধ', 'স্ট্যাচু অব লিবার্টির হাতে কী আছে?', ['ডান হাতে মশাল, বাম হাতে ফলক (ট্যাবলেট)', 'দুই হাতে তলোয়ার', 'পতাকা ও বন্দুক', 'বই ও কলম'], 0, 'মশাল আলোকায়নের প্রতীক এবং বাম হাতে থাকা ফলকে ৪ জুলাই ১৭৭৬-এর তারিখ খোদাই করা আছে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'বিশ্ব পরিচিতি', 'অ্যান্টেনাসহ আইফেল টাওয়ারের বর্তমান উচ্চতা কত?', ['১০২ মিটার', '২০০ মিটার', 'প্রায় ৩৩০ মিটার', '৫০০ মিটার'], 2, 'মূল কাঠামো প্রায় ৩০০ মিটার; অ্যান্টেনাসহ বর্তমান উচ্চতা প্রায় ৩৩০ মিটার।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ওয়েস্টফেলিয়া শান্তি চুক্তি', 'ত্রিশ বছরের যুদ্ধ (Thirty Years War) কবে হয়?', ['১৬১৮–১৬৪৮', '১৭৮৯–১৭৯৯', '১৯১৪–১৯১৮', '১৯৩৯–১৯৪৫'], 0, 'ত্রিশ বছরের যুদ্ধ মূলত জার্মানিতে ধর্মীয় ও রাজনৈতিক সংঘাত ছিল এবং ওয়েস্টফেলিয়া চুক্তিতে শেষ হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ভার্সাই প্রাসাদে টেনিস কোর্ট শপথ কবে নেওয়া হয়?', ['২০ জুন ১৭৮৯', '১৪ জুলাই ১৭৮৯', '২৬ আগস্ট ১৭৮৯', '২১ জানুয়ারি ১৭৯৩'], 0, 'তৃতীয় এস্টেটের প্রতিনিধিরা সংবিধান রচনা না করা পর্যন্ত সভা ভঙ্গ না করার শপথ নেন ২০ জুন ১৭৮৯।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ফরাসি বিপ্লবের সময় জাতীয় সংগীত কোনটি হয়?', ['গড সেভ দ্য কিং', 'লা মার্সেইয়েজ (La Marseillaise)', 'ইন্টারন্যাশনাল', 'ওড টু জয়'], 1, '১৭৯২ সালে রুজে দ্য লিল রচিত লা মার্সেইয়েজ পরে ফ্রান্সের জাতীয় সংগীত হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'দাঁতো (Danton) কে ছিলেন?', ['জ্যাকোবিন নেতা ও বাগ্মী', 'বিজ্ঞানী', 'চিত্রকর', 'ঔপন্যাসিক'], 0, 'জর্জ দাঁতো ফরাসি বিপ্লবের প্রথম সারির নেতা ও বাগ্মী ছিলেন; ১৭৯৪ সালে গিলোটিনে নিহত হন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'গিলোটিন কী?', ['এক ধরনের বন্দুক', 'শিরশ্ছেদের যন্ত্র', 'এক ধরনের মুদ্রা', 'এক ধরনের পোশাক'], 1, 'গিলোটিন ধারালো ফলাযুক্ত শিরশ্ছেদের যন্ত্র; বিপ্লবকালে এটি ব্যবহৃত হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'লিজিয়ন অব অনার (Legion of Honour) কে প্রবর্তন করেন?', ['ষোড়শ লুই', 'নেপোলিয়ন', 'দ্য গল', 'মিতেরাঁ'], 1, 'নেপোলিয়ন ১৮০২ সালে ফ্রান্সের সর্বোচ্চ বেসামরিক ও সামরিক সম্মান হিসেবে এটি চালু করেন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ট্রাফালগারের যুদ্ধ কবে হয়?', ['১৮০৫', '১৮১৫', '১৭৮৯', '১৭৯৯'], 0, '২১ অক্টোবর ১৮০৫ ব্রিটিশ অ্যাডমিরাল নেলসন ফরাসি-স্প্যানিশ নৌবহরকে পরাজিত করেন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ফরাসি বিপ্লবের শিশু বলা হয় কাকে?', ['রুশোকে', 'জন লককে', 'ভলতেয়ারকে', 'নেপোলিয়নকে'], 3, 'বিপ্লবের গর্ভে জন্ম নিয়ে ক্ষমতায় আসায় নেপোলিয়নকে Child of the French Revolution বলা হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'এনসাইক্লোপিডিয়া সম্পাদনা করে ফরাসি বিপ্লবের বুদ্ধিবৃত্তিক ভিত্তি তৈরিতে কে ভূমিকা রাখেন?', ['দিদেরো', 'নেপোলিয়ন', 'লাফায়েত', 'মিরাবো'], 0, 'দেনি দিদেরো ১৭৫১–১৭৭২ সালে Encyclopedie সম্পাদনা করেন; এটি যুক্তিবাদ ও আলোকায়ন ছড়ায়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'ভলতেয়ারের আসল নাম কী?', ['ফ্রাঁসোয়া-মারি আরুয়ে', 'শার্ল লুই', 'জ্যাঁ-জ্যাক', 'দেনি দিদেরো'], 0, 'Voltaire হলো ছদ্মনাম; তাঁর আসল নাম François-Marie Arouet।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'মন্টেস্কুর ক্ষমতা স্বতন্ত্রীকরণ নীতিতে কয়টি বিভাগের কথা বলা হয়েছে?', ['২টি', '৩টি', '৪টি', '৫টি'], 1, 'আইন বিভাগ, শাসন বিভাগ ও বিচার বিভাগ—এই তিনটি বিভাগের কথা বলা হয়েছে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আমেরিকার স্বাধীনতা যুদ্ধ', 'Government of the people, by the people, for the people — উক্তিটি কার?', ['রুশো', 'আব্রাহাম লিংকন', 'চার্চিল', 'ওয়াশিংটন'], 1, '১৮৬৩ সালের Gettysburg Address-এ আব্রাহাম লিংকন গণতন্ত্রের এই সংজ্ঞা দেন।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'Give me good mother, I will give you good nation — উক্তিটি কার?', ['Abraham Lincoln', 'Hitler', 'Sk Mujib', 'Napoleon'], 3, 'প্রতিযোগিতামূলক পরীক্ষায় প্রচলিত মতে উক্তিটি নেপোলিয়ন বোনাপার্টের।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'আমেরিকার স্বাধীনতা যুদ্ধ', 'Liberty or Death স্লোগানটি কার?', ['রুশো', 'প্যাট্রিক হেনরি', 'নেপোলিয়ন', 'লেনিন'], 1, '১৭৭৫ সালে প্যাট্রিক হেনরির বিখ্যাত ভাষণ ছিল Give me liberty, or give me death।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'জনসাধারণই সার্বভৌম ক্ষমতার অধিকারী — উক্তিটি কার?', ['কার্ল মার্কস', 'হিটলার', 'রুশো', 'প্লেটো'], 2, 'রুশোর গণসার্বভৌমত্ব তত্ত্বের মূল কথা হলো জনসাধারণ সার্বভৌম ক্ষমতার অধিকারী।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'ফরাসি বিপ্লব', 'A Tale of Two Cities উপন্যাসের লেখক কে?', ['চার্লস ডিকেন্স', 'রুশো', 'ভলতেয়ার', 'টলস্টয়'], 0, '১৮৫৯ সালে প্রকাশিত A Tale of Two Cities-এর লেখক চার্লস ডিকেন্স; এর পটভূমি ফরাসি বিপ্লব।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'প্রথম বিশ্বযুদ্ধ', 'Tank প্রথম ব্যবহার করে কোন দেশ?', ['জার্মানি', 'ব্রিটেন', 'ফ্রান্স', 'আমেরিকা'], 1, '১৯১৬ সালে Somme-এর যুদ্ধে ব্রিটেন প্রথম Tank ব্যবহার করে।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'প্রথম বিশ্বযুদ্ধ', 'জার্মানিকে যুদ্ধের জন্য দায়ী করে কোন ধারা?', ['২৩১ নং ধারা', '১৪ দফা', 'মনরো ডকট্রিন', 'আটলান্টিক সনদ'], 0, 'Treaty of Versailles-এর ২৩১ নং ধারায় War Guilt Clause-এর মাধ্যমে জার্মানিকে দায়ী করা হয়।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'প্রথম বিশ্বযুদ্ধ', 'প্রথম বিশ্বযুদ্ধের ফলে কোন সাম্রাজ্যের পতন হয়নি?', ['অটোমান', 'অস্ট্রো-হাঙ্গেরিয়ান', 'রাশিয়ান', 'ব্রিটিশ'], 3, 'German, Ottoman, Austro-Hungarian ও Russian—চার সাম্রাজ্যের পতন হয়; ব্রিটিশ সাম্রাজ্য তখন পতিত হয়নি।'),
  q('আন্তর্জাতিক বিষয়াবলি', 'প্রথম বিশ্বযুদ্ধ', 'প্রথম বিশ্বযুদ্ধে বিষাক্ত গ্যাস প্রথম ব্যবহার করে কোন দেশ?', ['ব্রিটেন', 'ফ্রান্স', 'জার্মানি', 'রাশিয়া'], 2, '১৯১৫ সালে Ypres-এর যুদ্ধে জার্মানি প্রথম Chlorine gas ব্যবহার করে।'),

  q('ইংরেজি', 'শব্দ-সম্পর্ক', 'PALTRY : SUBSTANTIAL ::', ['Meager : Scanty', 'Frivolous : Serious', 'Tenuous : Substantial', 'Petty : Trivial'], 1, 'Paltry ও Substantial পরস্পরের বিপরীতার্থক। একইভাবে Frivolous ও Serious বিপরীতার্থক।'),
  q('ইংরেজি', 'শব্দ-সম্পর্ক', 'TANGENT : CIRCLE ::', ['Arc : Sphere', 'Chord : Line', 'Radius : Diameter', 'Vertex : Angle'], 3, 'Tangent বৃত্তকে একটি বিন্দুতে স্পর্শ করে; Vertex angle-এর একটি নির্দিষ্ট বিন্দু।'),
  q('ইংরেজি', 'শব্দ-সম্পর্ক', 'OBFUSCATE : CLARITY ::', ['Elucidate : Obscurity', 'Exacerbate : Intensity', 'Mitigate : Severity', 'Obfuscate : Simplicity'], 2, 'Obfuscate clarity নষ্ট করে; Mitigate severity কমায়। উভয়টিই verb ও সংশ্লিষ্ট noun-এর সম্পর্ক।'),
  q('ইংরেজি', 'শব্দ-সম্পর্ক', 'EPHEMERAL : PERMANENT ::', ['Transient : Lasting', 'Sporadic : Frequent', 'Volatile : Stable', 'Nascent : Mature'], 1, 'Ephemeral ও permanent বিপরীতার্থক; sporadic ও frequent-ও frequency-এর দিক থেকে বিপরীত।'),
  q('ইংরেজি', 'শব্দ-সম্পর্ক', 'BOOK : BIBLIOPHILE ::', ['Art : Connoisseur', 'Coin : Philatelist', 'Wine : Oenophile', 'Both A and C'], 3, 'Bibliophile বই পছন্দ করেন; Connoisseur art-এর এবং Oenophile wine-এর অনুরাগী। তাই A ও C উভয়ই সঠিক।'),
  q('ইংরেজি', 'Subject-Verb Agreement', 'Bread and butter ___ my favorite breakfast.', ['are', 'is', 'were', 'have'], 1, 'Bread and butter মিলে একটি খাবার বোঝালে singular verb is ব্যবহৃত হয়।'),
  q('ইংরেজি', 'Verb', 'They made him ___ the truth.', ['tell', 'tells', 'told', 'telling'], 0, 'Make, let, see ও hear-এর পরে bare infinitive বা verb-এর মূল রূপ বসে; তাই tell সঠিক।'),
  q('ইংরেজি', 'Tense', 'By 2030, we ___ on Mars.', ['live', 'will live', 'will have been living', 'are living'], 2, 'By + future time এবং চলমান কাজ বোঝালে Future Perfect Continuous ব্যবহৃত হয়।'),
  q('ইংরেজি', 'Subject-Verb Agreement', 'The book, along with the pens, ___ on the table.', ['are', 'were', 'is', 'have'], 2, 'Along with-এর পরের noun subject-এর সংখ্যা পরিবর্তন করে না; মূল subject book singular, তাই is হবে।')
]

const toBanglaDigits = value => String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[digit])
const order = Array.from({ length: sourceRows.length }, (_, index) => index)

if (sourceRows.length !== 100) throw new Error(`The 10 September live paper must contain exactly 100 questions, found ${sourceRows.length}`)

export const SEPTEMBER_10_LIVE_EXAM_SHUFFLED_ORDER = order
export const SEPTEMBER_10_LIVE_EXAM_QUESTIONS = order.map((sourceIndex, displayIndex) => {
  const row = sourceRows[sourceIndex]
  const options = row.options.map(toBanglaDigits)
  return {
    id: `live-2026-09-10-${String(displayIndex + 1).padStart(3, '0')}`,
    display_order: displayIndex + 1,
    source_order: sourceIndex + 1,
    subject: row.subject,
    topic: row.topic,
    question: toBanglaDigits(row.question),
    options,
    answer: options[row.answerIndex],
    answer_index: row.answerIndex,
    explanation: toBanglaDigits(row.explanation),
    post_name: '১০ সেপ্টেম্বর লাইভ পরীক্ষা',
    exam_tag: 'live-2026-09-10'
  }
})

export const SEPTEMBER_10_LIVE_EXAM_COUNTS = {
  total: SEPTEMBER_10_LIVE_EXAM_QUESTIONS.length,
  english: SEPTEMBER_10_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'ইংরেজি').length,
  generalKnowledge: SEPTEMBER_10_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'আন্তর্জাতিক বিষয়াবলি').length,
  math: 0
}

if (SEPTEMBER_10_LIVE_EXAM_COUNTS.total !== 100 || SEPTEMBER_10_LIVE_EXAM_COUNTS.english !== 48 || SEPTEMBER_10_LIVE_EXAM_COUNTS.generalKnowledge !== 52 || SEPTEMBER_10_LIVE_EXAM_QUESTIONS.some(question => !question.explanation || question.options[question.answer_index] !== question.answer)) {
  throw new Error('The 10 September live paper is incomplete or has an invalid answer key')
}
