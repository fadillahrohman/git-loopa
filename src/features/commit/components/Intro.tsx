import { motion } from "framer-motion";
import logoImage from "../../../assets/logo/loopa.png";

export function Intro({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="relative h-screen w-full bg-white flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <motion.div
        className="z-10 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.img
          src={logoImage}
          alt="Git Loopa Logo"
          className="w-50 h-50 mb-8 drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.5, y: -40 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            rotate: { delay: 1, duration: 2, repeat: Infinity, repeatDelay: 3 },
          }}
        />

        <div className="max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 mb-8 leading-relaxed"
          >
            Your commits with ease. Manage your Git history and timestamps{" "}
            <span className="font-semibold text-zinc-800">professionally</span>.
          </motion.p>
        </div>

        <motion.button
          onClick={onGetStarted}
          className="group relative px-8 py-3 bg-zinc-900 text-white font-medium rounded-full shadow-xl transition-all"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">Let's Commit</span>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-zinc-400 text-xs uppercase tracking-widest"
      >
        PRESENTING TO YOU
      </motion.p>
    </div>
  );
}
