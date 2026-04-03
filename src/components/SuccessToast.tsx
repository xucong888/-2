import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
  show: boolean;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  show,
  message = '推演成功，已为您生成命理报告',
  duration = 3000,
  onClose
}) => {
  React.useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink-900 text-paper-50 px-8 py-4 rounded-full shadow-2xl z-50 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium tracking-wide">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
