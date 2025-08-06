"use client";

import { Construction } from "lucide-react";
import { motion } from "motion/react";

export const ConstructionSpacer = () => {

  return (
    <motion.div className="px-4 space-y-2 py-3 mt-1">
        <div className="bg-neutral-800/20 rounded-md p-2.5 hover:bg-neutral-800/30 transition-colors">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Construction className="h-3 w-3 text-neutral-400" />
              <span>More coming soon...</span>
            </div>
          </div>
        </div>
    </motion.div>
  );
};
