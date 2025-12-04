'use client'

import { useState } from 'react'
import { motion } from 'motion/react'

export default function XIcon() {
  const [rotation, setRotation] = useState(0)

  return (
    <motion.svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      stroke="#000000"
      strokeWidth="3"
      strokeLinecap="butt"
      animate={ { rotate: rotation } }
      transition={ { duration: 0.25, ease: 'easeIn' } }
      onHoverStart={ () => setRotation((r) => r + 180) }
    >
      <motion.line
        x1="17"
        y1="17"
        x2="39"
        y2="39"
      />
      <motion.line
        x1="17"
        y1="39"
        x2="39"
        y2="17"
      />
    </motion.svg>
  )
}
