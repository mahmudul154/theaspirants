import { supabase } from './supabase.js'

/* ============================================================
   SSLCommerz ইন্টিগ্রেশন
   ---------------------------------
   রিয়েল পেমেন্ট চালু করতে ২টা জিনিস লাগবে:
   ১) SSLCommerz মার্চেন্ট অ্যাকাউন্ট — নিচে storeId বসাও
   ২) Supabase Edge Function ডিপ্লয়:
        supabase functions deploy sslcommerz-init --no-verify-jwt
        supabase secrets set SSLCZ_STORE_ID=xxxx SSLCZ_STORE_PASS=yyyy
      (কোড আছে: supabase/functions/sslcommerz-init/index.ts)

   ক্রেডেনশিয়াল না বসানো পর্যন্ত অ্যাপ "Sandbox/Demo গেটওয়ে"
   মোডে চলে — পুরো পেমেন্ট ফ্লো হুবহু SSLCommerz-এর মতো দেখায়।
   ============================================================ */
export const SSLCZ = {
  storeId: '', // ← এখানে তোমার SSLCommerz Store ID বসাও (যেমন: 'ovvashlive')
  merchantName: 'অভ্যাস — জব প্রস্তুতি'
}

export const isLive = () => Boolean(SSLCZ.storeId)

/* Edge Function-এর মাধ্যমে পেমেন্ট সেশন তৈরি (রিয়েল মোড) */
export async function initPayment({ plan, method, tranId, user }) {
  const { data, error } = await supabase.functions.invoke('sslcommerz-init', {
    body: {
      plan: plan.id,
      amount: plan.price,
      method,
      tranId,
      email: user?.email || '',
      name: user?.user_metadata?.full_name || ''
    }
  })
  if (error) throw error
  return data // { url: GatewayPageURL, tran_id }
}

export const genTranId = () =>
  'NV' + Date.now().toString().slice(-8) + String(Math.floor(10 + Math.random() * 89))

export const PAY_METHODS = [
  { id: 'bkash', name: 'বিকাশ', en: 'bKash', color: '#e2136e' },
  { id: 'nagad', name: 'নগদ', en: 'Nagad', color: '#f6921e' },
  { id: 'rocket', name: 'রকেট', en: 'Rocket', color: '#8c3494' },
  { id: 'card', name: 'কার্ড', en: 'Visa/Master', color: '#1a1f71' }
]
