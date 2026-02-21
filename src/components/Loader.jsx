import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium animated loader with blur overlay.
 * Fades out when content is loaded.
 */
export default function Loader({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/90"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
        {/* Spinner */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-gray-600"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <p className="text-gray-700 font-medium text-lg">Loading...</p>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
