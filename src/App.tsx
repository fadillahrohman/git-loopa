import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Intro } from "./features/commit/components/Intro";
import { CommitForm } from "./features/commit/components/CommitForm";
import { Spinner } from "./shared/components/ui/Spinner";

function App() {
  const [view, setView] = useState<"intro" | "loading" | "form">("intro");

  const handleStart = () => {
    setView("loading");
    setTimeout(() => {
      setView("form");
    }, 1000);
  };

  return (
    <AnimatePresence mode="wait">
      {view === "intro" && <Intro key="intro" onGetStarted={handleStart} />}

      {view === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-screen flex items-center justify-center bg-white"
        >
          <Spinner />
        </motion.div>
      )}

      {view === "form" && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <CommitForm />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
