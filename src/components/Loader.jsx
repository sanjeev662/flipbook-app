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
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: 'var(--flipbook-bg)' }}
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
        {/* Spinner — Publuu blue #3461c9 */}
        <motion.div
          className="w-16 h-16 rounded-full border-4"
          style={{ borderColor: 'rgba(0,0,0,0.08)', borderTopColor: 'var(--flipbook-accent)' }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <p className="font-medium text-lg [color:var(--flipbook-text)]">Loading...</p>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
