import { motion, AnimatePresence } from 'framer-motion'
import { useIsFetching } from '@tanstack/react-query'

export function GlobalLoadingBar() {
    const isFetching = useIsFetching()

    return (
        <AnimatePresence>
            {isFetching > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[200] h-[3px]"
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-orange-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{
                            width: ['0%', '60%', '80%', '90%'],
                        }}
                        transition={{
                            duration: 2,
                            ease: 'easeInOut',
                            times: [0, 0.5, 0.8, 1],
                        }}
                    />
                    {/* Glow effect */}
                    <motion.div
                        className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-brand-500/50 to-transparent"
                        animate={{
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
