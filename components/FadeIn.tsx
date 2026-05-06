"use client"
import { motion } from "framer-motion"

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
}

const ease = [0.22, 1, 0.36, 1] as const

export default function FadeIn({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  )
}
