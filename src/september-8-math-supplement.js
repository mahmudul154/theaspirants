// সাতটি প্রশ্নই ব্যবহারকারীর দেওয়া `last.pdf` থেকে নেওয়া হয়েছে।
// এগুলো ৮ সেপ্টেম্বর ২০২৬-এর লাইভ পরীক্ষার গণিত অংশে অতিরিক্তভাবে যুক্ত হবে।
const rows = [
  {
    question: 'The profit earned after selling an article for Tk. 3362 is the same as the loss incurred after selling it for Tk. 2346. At what selling price will a trader make a 20% profit on this article?',
    options: ['Tk. 4639.4', 'Tk. 4769.6', 'Tk. 4830.8', 'None of these'],
    answerIndex: 3,
    explanation: 'ধরি, দ্রব্যটির ক্রয়মূল্য Tk. x। সমান লাভ ও ক্ষতির শর্তে 3362 − x = x − 2346, তাই x = (3362 + 2346) ÷ 2 = Tk. 2854। 20% লাভে বিক্রয়মূল্য হবে 2854 × 1.20 = Tk. 3424.8, যা প্রদত্ত বিকল্পে নেই; তাই সঠিক উত্তর None of these।'
  },
  {
    question: 'Mr. Tanvir purchased stock for Tk. 1500 and sold 2/3 of it after its value doubled. He sold the remaining stock at 5 times its purchase price. What was his total profit on the stock?',
    options: ['Tk. 2000', 'Tk. 2500', 'Tk. 3000', 'Tk. 4500'],
    answerIndex: 2,
    explanation: 'Tk. 1500-এর শেয়ারের 2/3 অংশের ক্রয়মূল্য Tk. 1000 এবং দ্বিগুণ দামে বিক্রি করে পাওয়া যায় Tk. 2000। অবশিষ্ট অংশের ক্রয়মূল্য Tk. 500; সেটি ক্রয়মূল্যের 5 গুণে বিক্রি করে পাওয়া যায় Tk. 2500। মোট বিক্রয়মূল্য Tk. 4500, ফলে মোট লাভ = 4500 − 1500 = Tk. 3000।'
  },
  {
    question: 'A man sells two commodities for Tk. 4000 each, neither losing nor gaining in the deal. If he sold one commodity at a gain of 25%, what is the cost price of the other commodity?',
    options: ['Tk. 3200', 'Tk. 4800', 'Tk. 4000', 'Tk. 3600'],
    answerIndex: 1,
    explanation: 'দুটি দ্রব্যের মোট বিক্রয়মূল্য Tk. 8000 এবং লাভ-ক্ষতি না হওয়ায় মোট ক্রয়মূল্যও Tk. 8000। প্রথম দ্রব্যটি 25% লাভে Tk. 4000-এ বিক্রি হলে তার ক্রয়মূল্য = 4000 × 100/125 = Tk. 3200। অতএব অন্য দ্রব্যটির ক্রয়মূল্য = 8000 − 3200 = Tk. 4800।'
  },
  {
    question: 'There will be a loss of 10% if a chair is sold for Tk. 540. At what price should the chair be sold to make a profit of 20%?',
    options: ['Tk. 600', 'Tk. 540', 'Tk. 700', 'Tk. 720'],
    answerIndex: 3,
    explanation: '10% ক্ষতিতে বিক্রয়মূল্য ক্রয়মূল্যের 90% এবং 20% লাভে প্রয়োজনীয় বিক্রয়মূল্য ক্রয়মূল্যের 120%। তাই Tk. 540 যখন 90%-এর সমান, 120%-এর সমান বিক্রয়মূল্য হবে 540 × 120/90 = Tk. 720।'
  },
  {
    question: 'If selling an article for BDT 350 instead of BDT 340 gives an additional 5% gain, what is the cost price of the article?',
    options: ['BDT 180', 'BDT 150', 'BDT 200', 'BDT 250'],
    answerIndex: 2,
    explanation: 'দুই বিক্রয়মূল্যের পার্থক্য = 350 − 340 = Tk. 10। প্রশ্ন অনুযায়ী এই অতিরিক্ত Tk. 10 হলো ক্রয়মূল্যের 5%; সুতরাং 1% = Tk. 2 এবং 100% বা ক্রয়মূল্য = 2 × 100 = Tk. 200।'
  },
  {
    question: 'Alam sold two vehicles for Tk. 4600 each. He gained 10% on the first and lost 10% on the other. What was his overall percentage profit or loss?',
    options: ['2% loss', '1% profit', '1% loss', 'None of these'],
    answerIndex: 2,
    explanation: 'সমান বিক্রয়মূল্যে একটি দ্রব্যে x% লাভ এবং অন্যটিতে x% ক্ষতি হলে সব সময় নিট ক্ষতি হয়, যার হার x²/100। এখানে ক্ষতির হার = 10²/100 = 1%; তাই মোট ফলাফল 1% loss।'
  },
  {
    question: 'By selling a watch for Tk. 1200, a shopkeeper loses 20%. At what price should he sell it to gain 20%?',
    options: ['Tk. 1500', 'Tk. 1800', 'Tk. 2000', 'Tk. 1600'],
    answerIndex: 1,
    explanation: '20% ক্ষতিতে Tk. 1200 ক্রয়মূল্যের 80%-এর সমান, আর 20% লাভে বিক্রয়মূল্য হতে হবে ক্রয়মূল্যের 120%। তাই প্রয়োজনীয় বিক্রয়মূল্য = 1200 × 120/80 = Tk. 1800।'
  }
]

export const SEPTEMBER_8_MATH_SUPPLEMENT = rows.map((row, index) => ({
  id: `september-8-math-supplement-${String(index + 1).padStart(2, '0')}`,
  display_order: index + 1,
  source_order: index + 1,
  subject: 'গাণিতিক যুক্তি',
  topic: 'শতকরা ও লাভ-ক্ষতি',
  question: row.question,
  options: row.options,
  answer: row.options[row.answerIndex],
  answer_index: row.answerIndex,
  explanation: row.explanation,
  post_name: '৮ সেপ্টেম্বরের অতিরিক্ত গণিত প্রশ্ন',
  exam_tag: 'live-exam-supplement'
}))

export const SEPTEMBER_8_MATH_SUPPLEMENT_COUNT = SEPTEMBER_8_MATH_SUPPLEMENT.length

if (SEPTEMBER_8_MATH_SUPPLEMENT_COUNT !== 7) {
  throw new Error('The supplied 8 September Math supplement must contain exactly 7 questions')
}
