/* ১v১ গেম মোড simulation — two tabs play one full step-mode match. */
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { GameMode } from '../../src/components/GameMode.jsx'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const failures = []
const check = (label, condition, extra = '') => {
  if (condition) console.log(`  ✓ ${label}`)
  else { failures.push(label); console.log(`  ✗ ${label} ${extra}`) }
}

const waitFor = async (fn, { timeout = 12000, interval = 120 } = {}) => {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const value = fn()
    if (value) return value
    await act(async () => { await sleep(interval) })
  }
  return null
}

const tabOf = root => ({
  root,
  buttons: () => [...root.querySelectorAll('button')],
  findButton: text => [...root.querySelectorAll('button')].find(button => button.textContent.includes(text)),
  click: async text => {
    const button = [...root.querySelectorAll('button')].find(node => node.textContent.includes(text))
    if (!button) throw new Error(`button not found: ${text}`)
    await act(async () => { button.dispatchEvent(new window.MouseEvent('click', { bubbles: true })) })
    return button
  },
  clickChip: async (text, label) => {
    let scope = root
    if (label) {
      const field = [...root.querySelectorAll('.gm-field')].find(node => (node.querySelector('.lbl')?.textContent || '').includes(label))
      if (!field) throw new Error(`field not found: ${label}`)
      scope = field
    }
    const chip = [...scope.querySelectorAll('.chip')].find(node => node.textContent.trim() === text)
    if (!chip) throw new Error(`chip not found: ${text} in ${label || 'page'}`)
    await act(async () => { chip.dispatchEvent(new window.MouseEvent('click', { bubbles: true })) })
  },
  setInput: async (selector, value) => {
    const input = root.querySelector(selector)
    if (!input) throw new Error(`input not found: ${selector}`)
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    await act(async () => {
      setter.call(input, value)
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    return input
  },
  text: () => root.textContent || ''
})

export async function run() {
  console.log('১v১ গেম মোড simulation\n')
  const containerA = document.getElementById('rootA')
  const containerB = document.getElementById('rootB')
  const noop = () => {}

  sessionStorage.setItem('asp_game_tab_id', 'tabA')
  localStorage.setItem('asp_game_name', 'রহিম')
  const rootA = createRoot(containerA)
  await act(async () => {
    rootA.render(React.createElement(GameMode, { user: null, questionCounts: null, setToastMsg: noop, go: noop }))
  })
  const A = tabOf(containerA)

  sessionStorage.setItem('asp_game_tab_id', 'tabB')
  localStorage.setItem('asp_game_name', 'করিম')
  const rootB = createRoot(containerB)
  await act(async () => {
    rootB.render(React.createElement(GameMode, { user: null, questionCounts: null, setToastMsg: noop, go: noop }))
  })
  const B = tabOf(containerB)

  console.log('১) রুম তৈরি')
  check('হোম স্ক্রিনে রুম তৈরি বোতাম আছে', !!A.findButton('রুম তৈরি করুন'))
  check('নাম প্রি-ফিল হয়েছে', containerA.querySelector('.gm-input')?.value === 'রহিম', containerA.querySelector('.gm-input')?.value)
  await A.click('রুম তৈরি করুন')
  const code = (await waitFor(() => containerA.querySelector('.gm-room-code b')?.textContent)) || ''
  check('রুম কোড তৈরি হয়েছে', /^[A-Z0-9]{4}$/.test(code), `code=${code}`)
  check('হোস্ট সিট দেখা যাচ্ছে', containerA.textContent.includes('আপনি'))
  check('প্রতিপক্ষ খালি সিট দেখাচ্ছে', containerA.textContent.includes('প্রতিপক্ষ এখনো আসেনি'))

  console.log('\n২) দ্বিতীয় ট্যাব কোড দিয়ে জয়েন')
  await B.setInput('.gm-code-input', code)
  await B.click('জয়েন')
  const joined = await waitFor(() => containerB.querySelectorAll('.gm-seat').length && containerB.textContent.includes('রহিম'))
  check('গেস্ট হোস্টকে দেখতে পাচ্ছে', !!joined)
  const hostSeesGuest = await waitFor(() => containerA.textContent.includes('করিম'))
  check('হোস্ট গেস্টকে দেখতে পাচ্ছে (লাইভ presence)', !!hostSeesGuest)

  console.log('\n৩) প্রস্তুতি ও ম্যাচ শুরু')
  await A.clickChip('৫', 'প্রশ্নসংখ্যা')
  await A.clickChip('১৫', 'সময়')
  check('প্রশ্নসংখ্যা ৫ সেট হয়েছে', containerA.querySelector('.gm-summary')?.textContent.includes('৫ প্রশ্ন'))
  await A.click('আমি প্রস্তুত')
  await B.click('আমি প্রস্তুত')
  const startEnabled = await waitFor(() => {
    const button = A.findButton('ম্যাচ শুরু করুন')
    return button && !button.disabled ? button : null
  })
  check('দুজন প্রস্তুত হলে হোস্টের স্টার্ট বোতাম চালু হয়', !!startEnabled)
  check('গেস্ট প্রস্তুত অবস্থা দেখছে', await waitFor(() => containerA.textContent.includes('প্রস্তুত ✓')) ? true : false)
  await A.click('ম্যাচ শুরু করুন')
  check('দুজনেই কাউন্টডাউনে গেছে', await waitFor(() => containerA.textContent.includes('দুজনেই প্রস্তুত হন') && containerB.textContent.includes('দুজনেই প্রস্তুত হন')))
  check('কাউন্টডাউন শেষে দুজনেই প্লে-স্ক্রিনে', await waitFor(() => containerA.querySelector('.gm-qcard') && containerB.querySelector('.gm-qcard'), { timeout: 12000 }))

  console.log('\n৪) প্রশ্নে প্রশ্নে ম্যাচ (একসাথে একই প্রশ্ন)')
  let answeredTogether = 0
  const catchUps = []
  for (let step = 0; step < 5; step++) {
    const aligned = await waitFor(() => {
      const a = containerA.querySelector('.gm-qno')?.textContent
      const b = containerB.querySelector('.gm-qno')?.textContent
      const cardA = containerA.querySelector('.gm-qcard')
      const cardB = containerB.querySelector('.gm-qcard')
      if (!a || !b || !cardA || !cardB) return null
      return a === b && !containerA.querySelector('.gm-reveal') ? { a, question: cardA.querySelector('.qn')?.textContent } : null
    }, { timeout: 10000 })
    if (!aligned) break
    const qaText = containerA.querySelector('.gm-qno')?.textContent || ''
    const qbText = containerB.querySelector('.gm-qno')?.textContent || ''
    check(`ধাপ ${step + 1}: দুজনের প্রশ্ন একই (${qaText})`, qaText === qbText, `${qaText} vs ${qbText}`)
    const questionA = containerA.querySelector('.gm-qcard .qn')?.textContent || ''
    const questionB = containerB.querySelector('.gm-qcard .qn')?.textContent || ''
    check(`ধাপ ${step + 1}: প্রশ্নের লেখা অভিন্ন (দুই ডিভাইসে একই প্রশ্ন)`, questionA === questionB && questionA.length > 0)
    const optsA = [...containerA.querySelectorAll('.gm-qcard .qopt')]
    const optsB = [...containerB.querySelectorAll('.gm-qcard .qopt')]
    check(`ধাপ ${step + 1}: অপশন সংখ্যা সমান`, optsA.length === optsB.length && optsA.length > 0)

    // Guest answers first so the host can see the live "opponent answered" state.
    await act(async () => { optsB[Math.min(1, optsB.length - 1)].dispatchEvent(new window.MouseEvent('click', { bubbles: true })) })
    await B.click('উত্তর নিশ্চিত করুন')
    const hostSeesPeer = await waitFor(() => (containerA.querySelector('.gm-turn')?.textContent || '').includes('প্রতিপক্ষ উত্তর দিয়েছে'), { timeout: 4000 })
    check(`ধাপ ${step + 1}: হোস্ট লাইভ দেখছে প্রতিপক্ষ উত্তর দিয়েছে`, !!hostSeesPeer)
    check(`ধাপ ${step + 1}: গেস্ট দেখছে প্রতিপক্ষ (হোস্ট) উত্তর দিচ্ছে`, /অপেক্ষা|দুজনেই/.test(containerB.querySelector('.gm-turn')?.textContent || ''))

    await act(async () => { optsA[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true })) })
    await A.click('উত্তর নিশ্চিত করুন')
    const revealed = await waitFor(() => containerA.querySelector('.gm-reveal') && containerB.querySelector('.gm-reveal'), { timeout: 6000 })
    check(`ধাপ ${step + 1}: দুজনেই সঠিক উত্তর দেখছে`, !!revealed)
    if (revealed) answeredTogether++

    // Both must move on to the very same next question.
    const startedAt = Date.now()
    const moved = await waitFor(() => {
      const a = containerA.querySelector('.gm-qno')?.textContent
      const b = containerB.querySelector('.gm-qno')?.textContent
      return a && b && a === b && a !== qaText ? { a, b } : null
    }, { timeout: 10000 })
    if (moved) catchUps.push(Date.now() - startedAt)
    else break
  }
  check('অন্তত চারটি প্রশ্ন একসাথে খেলা হয়েছে', answeredTogether >= 4, `answered=${answeredTogether}`)
  if (catchUps.length) {
    const worst = Math.max(...catchUps)
    console.log(`  ℹ একসাথে পরের প্রশ্নে পৌঁছাতে সর্বোচ্চ সময়: ${worst}ms`)
    check('দুজন প্রায় একসাথে পরের প্রশ্নে যায় (<4s)', worst < 4000, `${worst}ms`)
  }

  console.log('\n৫) ফলাফল')
  const resultReady = await waitFor(() => containerA.querySelector('.gm-result') && containerB.querySelector('.gm-result'), { timeout: 25000 })
  check('দুটি ট্যাবেই ফলাফল এসেছে', !!resultReady)
  const bannerText = containerA.querySelector('.gm-winner')?.textContent || ''
  check(`বিজয়ী ব্যানার আছে (${bannerText})`, /জিতে|ড্র|জমা দেয়নি/.test(bannerText))
  const rows = containerA.querySelectorAll('.gm-compare-row').length
  const rowsB = containerB.querySelectorAll('.gm-compare-row').length
  check('প্রশ্নে প্রশ্নে তুলনা দেখা যাচ্ছে', rows > 0 && rows === rowsB, `${rows}/${rowsB}`)
  check('প্রতিপক্ষের স্কোর দেখা যাচ্ছে', containerA.textContent.includes('করিম'))
  check('আবার খেলার বোতাম আছে', !!A.findButton('আবার খেলুন'))

  console.log('\n৬) রিম্যাচ')
  await A.click('আবার খেলুন')
  check('দুজনেই লবিতে ফিরেছে', await waitFor(() => containerA.querySelector('.gm-room-code') && containerB.querySelector('.gm-room-code')))
  const codeStill = containerA.querySelector('.gm-room-code b')?.textContent
  check('রুম কোড অপরিবর্তিত', codeStill === code, `${codeStill} vs ${code}`)

  console.log('\n৭) পুরো পেপার মোড (একসাথে সময় শেষ)')
  await A.clickChip('পুরো পেপার', 'কীভাবে খেলবেন')
  await A.clickChip('১০', 'প্রশ্নসংখ্যা')
  await A.clickChip('১০', 'মোট সময়')
  check('পেপার মোড সেট হয়েছে', containerA.textContent.includes('একই প্রশ্নের সেট'))
  await A.click('আমি প্রস্তুত')
  await B.click('আমি প্রস্তুত')
  await waitFor(() => { const b = A.findButton('ম্যাচ শুরু করুন'); return b && !b.disabled })
  await A.click('ম্যাচ শুরু করুন')
  const paperPlay = await waitFor(() => containerA.querySelector('.gm-paper-bar') && containerB.querySelector('.gm-paper-bar'), { timeout: 15000 })
  check('দুজনেই পেপার মোডের স্ক্রিনে', !!paperPlay)
  check('মোট প্রশ্ন ১০', containerA.querySelector('.gm-paper-progress b')?.textContent === '০/১০', containerA.querySelector('.gm-paper-progress b')?.textContent)
  const cardsA = containerA.querySelectorAll('.gm-qcard').length
  const cardsB = containerB.querySelectorAll('.gm-qcard').length
  check('দুই ট্যাবে একই সংখ্যক প্রশ্নের কার্ড', cardsA === cardsB && cardsA === 10, `${cardsA}/${cardsB}`)
  const q1a = containerA.querySelectorAll('.gm-qcard .qn')[3]?.textContent
  const q1b = containerB.querySelectorAll('.gm-qcard .qn')[3]?.textContent
  check('একই সেট—একই প্রশ্নের লেখা', !!q1a && q1a === q1b)
  // Both answer the first three questions on their own.
  for (let index = 0; index < 3; index++) {
    const optsA = [...containerA.querySelectorAll('.gm-qcard')[index].querySelectorAll('.qopt')]
    const optsB = [...containerB.querySelectorAll('.gm-qcard')[index].querySelectorAll('.qopt')]
    await act(async () => { optsA[index % optsA.length].dispatchEvent(new window.MouseEvent('click', { bubbles: true })) })
    await act(async () => { optsB[(index + 1) % optsB.length].dispatchEvent(new window.MouseEvent('click', { bubbles: true })) })
  }
  check('নিজের অগ্রগতি দেখাচ্ছে', containerA.querySelector('.gm-paper-progress b')?.textContent === '৩/১০', containerA.querySelector('.gm-paper-progress b')?.textContent)
  check('প্রতিপক্ষের লাইভ অগ্রগতি দেখাচ্ছে', await waitFor(() => containerA.querySelectorAll('.gm-paper-progress b')[1]?.textContent === '৩/১০', { timeout: 8000 }), containerA.querySelectorAll('.gm-paper-progress b')[1]?.textContent)
  const clock = containerA.querySelector('.gm-clock')?.textContent || ''
  check('শেয়ার্ড ক্লক আছে', /\d{1,2}:\d{2}/.test(clock), clock)
  await act(async () => { await sleep(2200) })
  const clockLater = containerA.querySelector('.gm-clock')?.textContent || ''
  check('ক্লক কমছে (দুজনেই একই সময় দেখছে)', clockLater !== clock && /\d{1,2}:\d{2}/.test(clockLater), `${clock} → ${clockLater}`)
  await B.click('সাবমিট')
  check('গেস্ট জমা দেওয়ার পর হোস্ট লাইভ দেখে প্রতিপক্ষ জমা দিয়েছে', await waitFor(() => containerB.querySelector('.gm-result') && containerA.textContent.includes('উত্তরপত্র জমা দিয়েছে ✓'), { timeout: 8000 }))
  await A.click('সাবমিট')
  const paperResult = await waitFor(() => containerA.querySelector('.gm-result') && containerB.querySelector('.gm-result'), { timeout: 10000 })
  check('পেপার ম্যাচের ফলাফল দুই ট্যাবে', !!paperResult)
  const paperRows = containerA.querySelectorAll('.gm-compare-row').length
  check('১০টি প্রশ্নের তুলনা', paperRows === 10, `${paperRows}`)
  check('পেপার ম্যাচের বিজয়ী ব্যানার', /জিতে|ড্র/.test(containerA.querySelector('.gm-winner')?.textContent || ''), containerA.querySelector('.gm-winner')?.textContent)

  console.log('\n৮) অ্যাপ ইন্টিগ্রেশন (শেয়ার লিংক + নেভিগেশন)')
  window.location.hash = '#game=' + code
  const containerC = document.getElementById('rootC')
  const { App } = await import('../../src/App.jsx')
  const rootC = createRoot(containerC)
  const unhandled = []
  const onUnhandled = reason => unhandled.push(reason)
  process.on('unhandledRejection', onUnhandled)
  await act(async () => {
    rootC.render(React.createElement(App))
  })
  await waitFor(() => containerC.querySelector('.gm-page'))
  const C = tabOf(containerC)
  check('চ্যালেঞ্জ লিংক (#game=CODE) সরাসরি গেম পেজ খোলে', !!containerC.querySelector('.gm-page'))
  check('লিংকের কোড জয়েন বক্সে বসে যায়', containerC.querySelector('.gm-code-input')?.value === code, containerC.querySelector('.gm-code-input')?.value)
  await C.click('← হোম')
  check('গেম পেজ থেকে হোমে ফেরা যায়', await waitFor(() => containerC.textContent.includes('পূর্ণাঙ্গ প্রস্তুতি')))
  const featureCard = [...containerC.querySelectorAll('button')].find(node => node.textContent.includes('১v১ গেম মোড'))
  check('হোমের ফিচার স্ট্রিপে গেম মোড কার্ড আছে', !!featureCard)
  if (featureCard) {
    await act(async () => { featureCard.dispatchEvent(new window.MouseEvent('click', { bubbles: true })) })
    check('ফিচার কার্ড থেকে গেম মোড খোলে', await waitFor(() => containerC.querySelector('.gm-page')))
  }
  process.off('unhandledRejection', onUnhandled)
  if (unhandled.length) console.log(`  ℹ ${unhandled.length}টি unhandled rejection (নেটওয়ার্ক-নির্ভর, টেস্টে অবাঞ্ছিত নয়)`)

  console.log(`\n${failures.length ? `❌ ব্যর্থ: ${failures.length}` : '✅ সব ধাপ সফল'}`)
  if (failures.length) failures.forEach(item => console.log(`   - ${item}`))
  return failures.length
}
