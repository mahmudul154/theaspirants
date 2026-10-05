/* Test-only DOM environment for the ১v১ game-mode simulation.
   Two React roots inside one jsdom document act as two browser tabs. */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="rootA"></div><div id="rootB"></div><div id="rootC"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true
})

const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
Object.defineProperty(globalThis, 'localStorage', { value: window.localStorage, configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: window.sessionStorage, configurable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.HTMLInputElement = window.HTMLInputElement
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.MouseEvent = window.MouseEvent
globalThis.KeyboardEvent = window.KeyboardEvent
globalThis.getComputedStyle = window.getComputedStyle
globalThis.requestAnimationFrame = window.requestAnimationFrame?.bind(window) || (cb => setTimeout(cb, 16))
globalThis.cancelAnimationFrame = window.cancelAnimationFrame?.bind(window) || clearTimeout
globalThis.IS_REACT_ACT_ENVIRONMENT = true

/* A WebSocket that never connects: the Realtime socket is unavailable in this
   sandbox, which is exactly the "same browser only" situation. */
class DeadWebSocket {
  constructor() {
    this.readyState = 3
    setTimeout(() => { try { this.onerror?.({}) } catch {} try { this.onclose?.({ code: 1006 }) } catch {} }, 5)
  }
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}
globalThis.WebSocket = DeadWebSocket
window.WebSocket = DeadWebSocket

/* BroadcastChannel polyfill with one registry shared by every "tab" so the
   two roots can talk to each other (mirrors real cross-tab behaviour). */
const registry = new Map()
class SimBroadcastChannel {
  constructor(name) {
    this.name = name
    this.onmessage = null
    this.listeners = new Set()
    if (!registry.has(name)) registry.set(name, new Set())
    registry.get(name).add(this)
  }
  addEventListener(type, listener) { if (type === 'message') this.listeners.add(listener) }
  removeEventListener(type, listener) { if (type === 'message') this.listeners.delete(listener) }
  dispatch(data) {
    try { this.onmessage?.({ data }) } catch {}
    this.listeners.forEach(listener => { try { listener({ data }) } catch {} })
  }
  postMessage(data) {
    const peers = [...(registry.get(this.name) || [])]
    const clone = JSON.parse(JSON.stringify(data))
    peers.forEach(peer => {
      if (peer === this) return
      setTimeout(() => peer.dispatch(clone), 1)
    })
  }
  close() { registry.get(this.name)?.delete(this) }
}
globalThis.BroadcastChannel = SimBroadcastChannel
window.BroadcastChannel = SimBroadcastChannel

export const simWindow = window
