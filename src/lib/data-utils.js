// lib/data-utils.js

export const getQuestionCount = (item) => {
  const countMap = {
    "পদার্থবিজ্ঞান": 116,
    "উদ্ভিদবিজ্ঞান": 105,
    "রসায়ন": 105,
    // আপনার বাকি সাবজেক্টগুলো এখানে যোগ করুন
  };
  return countMap[item] || 0;
};

export    const getExamTagsForSubject = (subject) => {
  const examMap = {
    "English": ["BCS", "NTRCA", "Primary","Bank","General","HHj"],
    "বাংলা": ["বিসিএস", "এনটিআরসিএ", "প্রাথমিক"],
    "সাধারণ বিজ্ঞান": ["বিসিএস", "সব সরকারি জব"],
    // এভাবে আপনার সব সাবজেক্টের জন্য লিস্ট যোগ করুন
  };
  return examMap[subject] || ["সাধারণ"];
};

// lib/dat
export const getExamTagsForTopic = (topic) => {
  const topicMap = {
    // বাংলা ও ব্যাকরণ
    "বিরামচিহ্ন": ["BCS", "NTRCA", "Primary"],
    "ধ্বনি ও বর্ণ": ["BCS", "Govt"],
    "শব্দ ও বাক্য": ["BCS", "Bank", "Primary"],
    "সমাস": ["BCS", "Bank", "NTRCA"],
    
    // বিজ্ঞান ও জীববিজ্ঞান
    "কোষ বিদ্যা": ["BCS", "NTRCA", "Medical"],
    "বল ও গতি": ["BCS", "Bank", "Govt"],
    "মানবদেহ": ["BCS", "Primary", "Medical"],
    
    // ডিফল্ট ট্যাগ
    "বিবিধ": ["BCS", "All"]
  };

  // যদি টপিকটি ম্যাপে না থাকে, ডিফল্ট হিসেবে ["BCS", "All"] দেখাবে
  return topicMap[topic] || ["BCS", "All"];
};