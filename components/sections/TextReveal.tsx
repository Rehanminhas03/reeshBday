"use client";

import { motion, type Variants } from "framer-motion";

/**
 * Masked, line-by-line text reveal. Each line sits in an overflow-hidden mask
 * and rises into view with a soft stagger when it scrolls into the viewport.
 */
const lineVariants: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: 1,
      delay: i * 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function TextReveal({
  lines,
  className = "",
  lineClassName = "",
  once = true,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  once?: boolean;
}) {
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden">
          <motion.div
            custom={i}
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount: 0.6 }}
            className={lineClassName}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
