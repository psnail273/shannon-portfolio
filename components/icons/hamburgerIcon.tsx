'use client'

import { motion, Variants } from 'motion/react'

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.5
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: 'spring', duration: .5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    }
  },
}

const wipe: Variants = {
  rest: {
    x: -60,
  },
  visible: {
    x: -60,
    transition: { duration: 0 }, // Instant snap back when hover ends
  },
  hover: (i: number) => {
    const delay = i * 0.5
    return {
      x: 40,
      transition: {
        delay,
        duration: 0.75,
      },
    }
  },
}

export default function HamburgerMenu() {
  return (
    <motion.svg
      width="62"
      height="52"
      viewBox="0 0 62 52"
      initial={ ['hidden', 'rest'] }
      animate="visible"
      whileHover="hover"
    >
      <motion.line
        x1="16"
        y1="33.5"
        x2="36"
        y2="33.5"
        stroke="#000000"
        variants={ draw }
        custom={ 1 }
        style={ { strokeWidth: 2.5, strokeLinecap: 'round', fill: 'transparent' } }
      />
      <motion.line
        x1="16"
        y1="26"
        x2="46"
        y2="26"
        stroke="#000000"
        variants={ draw }
        custom={ 0.5 }
        style={ { strokeWidth: 2.5, strokeLinecap: 'round', fill: 'transparent' } }
      />
      <motion.line
        x1="16"
        y1="18.5"
        x2="46"
        y2="18.5"
        stroke="#000000"
        variants={ draw }
        custom={ 0 }
        style={ { strokeWidth: 2.5, strokeLinecap: 'round', fill: 'transparent' } }
      />
      <motion.rect
        x="16"
        y="16"
        width="30"
        height="5"
        fill="white"
        variants={ wipe }
        custom={ 0 }
      />
      <motion.rect
        x="16"
        y="24"
        width="30"
        height="5"
        fill="white"
        variants={ wipe }
        custom={ 0.5 }
      />
      <motion.rect
        x="16"
        y="32"
        width="20"
        height="5"
        fill="white"
        variants={ wipe }
        custom={ 1 }
      />
    </motion.svg>
  )
}
