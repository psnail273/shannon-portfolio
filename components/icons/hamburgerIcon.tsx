'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'motion/react'

export default function HamburgerMenu() {
  const [wipeNonce, setWipeNonce] = useState(0)
  const [isWiping, setIsWiping] = useState(false)
  const isWipingRef = useRef(false)

  const triggerWipe = useCallback(() => {
    if (isWipingRef.current) return
    isWipingRef.current = true
    setWipeNonce((n) => n + 1)
    setIsWiping(true)
  }, [])

  return (
    <motion.svg
      width="62"
      height="52"
      viewBox="0 0 62 52"
      onHoverStart={ triggerWipe }
      onTap={ triggerWipe }
    >
      <motion.line
        x1="16"
        y1="33.5"
        x2="36"
        y2="33.5"
        stroke="currentColor"
        initial={ { pathLength: 0, opacity: 0 } }
        animate={ { pathLength: 1, opacity: 1 } }
        transition={ {
          pathLength: { delay: 0.5, type: 'spring', duration: 0.5, bounce: 0 },
          opacity: { delay: 0.5, duration: 0.01 },
        } }
        style={ { strokeWidth: 2.5, strokeLinecap: 'round', fill: 'transparent' } }
      />
      <motion.line
        x1="16"
        y1="26"
        x2="46"
        y2="26"
        stroke="currentColor"
        initial={ { pathLength: 0, opacity: 0 } }
        animate={ { pathLength: 1, opacity: 1 } }
        transition={ {
          pathLength: { delay: 0.25, type: 'spring', duration: 0.5, bounce: 0 },
          opacity: { delay: 0.25, duration: 0.01 },
        } }
        style={ { strokeWidth: 2.5, strokeLinecap: 'round', fill: 'transparent' } }
      />
      <motion.line
        x1="16"
        y1="18.5"
        x2="46"
        y2="18.5"
        stroke="currentColor"
        initial={ { pathLength: 0, opacity: 0 } }
        animate={ { pathLength: 1, opacity: 1 } }
        transition={ {
          pathLength: { delay: 0, type: 'spring', duration: 0.5, bounce: 0 },
          opacity: { delay: 0, duration: 0.01 },
        } }
        style={ { strokeWidth: 2.5, strokeLinecap: 'round', fill: 'transparent' } }
      />
      { isWiping ? (
        <motion.g key={ wipeNonce }>
          <motion.rect
            x="16"
            y="16"
            width="30"
            height="5"
            fill="var(--color-background)"
            initial={ { x: -60 } }
            animate={ { x: 40 } }
            transition={ { delay: 0, duration: 0.75 } }
          />
          <motion.rect
            x="16"
            y="24"
            width="30"
            height="5"
            fill="var(--color-background)"
            initial={ { x: -60 } }
            animate={ { x: 40 } }
            transition={ { delay: 0.25, duration: 0.75 } }
          />
          <motion.rect
            x="16"
            y="32"
            width="20"
            height="5"
            fill="var(--color-background)"
            initial={ { x: -60 } }
            animate={ { x: 40 } }
            transition={ { delay: 0.5, duration: 0.75 } }
            onAnimationComplete={ () => {
              isWipingRef.current = false
              setIsWiping(false)
            } }
          />
        </motion.g>
      ) : null }
    </motion.svg>
  )
}
