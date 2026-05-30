"use client"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Speaker = "Caller" | "Reception"
type Message = { speaker: Speaker; text: string }

const CONVERSATIONS: { label: string; messages: Message[] }[] = [
  {
    label: "Table booking",
    messages: [
      { speaker: "Caller",    text: "Hi, can I book a table for Saturday night? Four people, around 7." },
      { speaker: "Reception", text: "Absolutely, 7pm Saturday for four. Can I grab a name and number to confirm?" },
      { speaker: "Caller",    text: "It's Marcus. 0412 555 890." },
      { speaker: "Reception", text: "Perfect, you're confirmed. We'll send a reminder the morning of." },
    ],
  },
  {
    label: "Taking an order",
    messages: [
      { speaker: "Caller",    text: "Hi, do you have sunflowers this Saturday?" },
      { speaker: "Reception", text: "We do. Are you after a bunch or an arrangement?" },
      { speaker: "Caller",    text: "Just a bunch, it's for a birthday." },
      { speaker: "Reception", text: "No problem. I'll set one aside. Can I grab your name and a number to confirm?" },
    ],
  },
  {
    label: "Booking an appointment",
    messages: [
      { speaker: "Caller",    text: "Hi, I need to book a checkup." },
      { speaker: "Reception", text: "Of course. We have Tuesday at 10am or Thursday at 2pm. Which suits?" },
      { speaker: "Caller",    text: "Tuesday works." },
      { speaker: "Reception", text: "Confirmed for Tuesday 10am. Can I get your name and a contact number?" },
    ],
  },
  {
    label: "After-hours message",
    messages: [
      { speaker: "Caller",    text: "Hi, it's after hours but I have an end-of-year tax question." },
      { speaker: "Reception", text: "No problem. I'll make sure the team gets back to you. What's the question?" },
      { speaker: "Caller",    text: "It's about a property sale and whether it affects my return." },
      { speaker: "Reception", text: "Got it. Can I take your name and best number so they can call you back?" },
    ],
  },
]

export type CallTranscriptHandle = {
  jumpTo: (idx: number) => void
}

type Props = {
  onComplete?: () => void
  onConvChange?: (idx: number) => void
}

const ease = [0.22, 1, 0.36, 1] as const

const CallTranscript = forwardRef<CallTranscriptHandle, Props>(function CallTranscript(
  { onComplete, onConvChange },
  ref
) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [convIdx, setConvIdx]       = useState(0)
  const [visible, setVisible]       = useState<Message[]>([])
  const [showTyping, setShowTyping] = useState(false)
  const [msgOpacity, setMsgOpacity] = useState(1)
  const [restartKey, setRestartKey] = useState(0)

  const scrollRef    = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const startConvRef = useRef(0)

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mql.matches)
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mql.addEventListener("change", listener)
    return () => mql.removeEventListener("change", listener)
  }, [])

  useImperativeHandle(ref, () => ({
    jumpTo: (idx: number) => {
      startConvRef.current = idx
      setRestartKey((k) => k + 1)
    },
  }))

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (visible.length === 0) { el.scrollTop = 0; return }
    const id = setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }), 60)
    return () => clearTimeout(id)
  }, [visible.length, showTyping])

  useEffect(() => {
    // Reduced-motion / low-end fallback: render one full conversation
    // statically (all messages at once), with no typing indicator and no
    // auto-cycling. startConvRef defaults to 0 and still honours jumpTo.
    if (reducedMotion) {
      const ci = startConvRef.current
      setConvIdx(ci)
      onConvChange?.(ci)
      setVisible(CONVERSATIONS[ci].messages)
      setShowTyping(false)
      setMsgOpacity(1)
      return
    }

    let cancelled = false
    const ids: ReturnType<typeof setTimeout>[] = []

    function wait(ms: number): Promise<void> {
      return new Promise((resolve, reject) => {
        const id = setTimeout(() => (cancelled ? reject() : resolve()), ms)
        ids.push(id)
      })
    }

    async function run() {
      let ci = startConvRef.current
      while (!cancelled) {
        const conv = CONVERSATIONS[ci]
        setConvIdx(ci)
        onConvChange?.(ci)
        setVisible([])
        setShowTyping(false)
        setMsgOpacity(1)

        try {
          for (const msg of conv.messages) {
            if (msg.speaker === "Reception") {
              await wait(600)
              setShowTyping(true)
              await wait(1200)
              setShowTyping(false)
              setVisible((prev) => [...prev, msg])
            } else {
              await wait(1000)
              setVisible((prev) => [...prev, msg])
            }
          }

          if (ci === 0 && !completedRef.current) {
            const id = setTimeout(() => {
              if (!cancelled) { completedRef.current = true; onComplete?.() }
            }, 1000)
            ids.push(id)
          }

          await wait(2000)
          setMsgOpacity(0)
          await wait(500)
          ci = (ci + 1) % CONVERSATIONS.length
        } catch {
          return
        }
      }
    }

    run()
    return () => { cancelled = true; ids.forEach(clearTimeout) }
  }, [reducedMotion, restartKey, onComplete, onConvChange])

  const conv = CONVERSATIONS[convIdx]

  return (
    <div className="absolute inset-5 flex flex-col rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0" />
          <span className="text-[12px] font-medium text-slate-600 tracking-wide">Incoming call</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={convIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#F59E0B]"
          >
            {conv.label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Message list */}
      <motion.div
        ref={scrollRef}
        animate={{ opacity: msgOpacity }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-scroll no-scrollbar px-4 py-4 flex flex-col gap-2"
      >
        {visible.map((msg, i) => {
          const isBB = msg.speaker === "Reception"
          return (
            <motion.div
              key={`${convIdx}-${i}`}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease }}
              className={`flex ${isBB ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] px-3 py-1.5 text-[12px] leading-[1.5] rounded-2xl ${
                  isBB
                    ? "bg-[#1E3A5F] text-white rounded-br-md"
                    : "bg-slate-100 text-slate-800 rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          )
        })}

        <AnimatePresence>
          {showTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease }}
              className="flex justify-end"
            >
              <div className="bg-[#1E3A5F] rounded-2xl rounded-br-md px-3.5 py-2.5">
                <div className="flex gap-[5px] items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-[5px] h-[5px] rounded-full bg-white/60 block"
                      animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
})

export default CallTranscript
