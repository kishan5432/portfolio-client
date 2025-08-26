import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useMagnetic } from '@/lib/magnetic';
import { cn } from '@/lib/utils';

export function CursorDemo() {
  // Example of using magnetic effect on a custom element
  const magneticCard = useMagnetic({ strength: 0.2, radius: 120 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Custom Cursor System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the enhanced cursor interactions with magnetic effects and hover states.
            Hover over different elements to see the cursor transform.
          </p>
        </motion.div>

        {/* Cursor Types Section */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-center">Cursor Types</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Default Cursor */}
            <div className="text-center space-y-4">
              <div
                className="w-32 h-32 mx-auto bg-card border-2 border-border rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                data-cursor="default"
              >
                <span className="text-sm font-medium">Default</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Standard cursor behavior
              </p>
            </div>

            {/* Magnetic Cursor */}
            <div className="text-center space-y-4">
              <div
                className="w-32 h-32 mx-auto bg-primary/10 border-2 border-primary/30 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                data-cursor="magnet"
              >
                <span className="text-sm font-medium text-primary">Magnetic</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cursor attracts to element
              </p>
            </div>

            {/* View Cursor */}
            <div className="text-center space-y-4">
              <div
                className="w-32 h-32 mx-auto bg-secondary/10 border-2 border-secondary/30 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                data-cursor="view"
              >
                <span className="text-sm font-medium text-secondary">View</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enhanced viewing cursor
              </p>
            </div>
          </div>
        </motion.section>

        {/* Magnetic Buttons Section */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-center">Magnetic Buttons</h2>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              magnetic
              variant="default"
              size="lg"
              className="min-w-[160px]"
            >
              Magnetic Primary
            </Button>

            <Button
              magnetic
              variant="outline"
              size="lg"
              className="min-w-[160px]"
            >
              Magnetic Outline
            </Button>

            <Button
              magnetic
              variant="ghost"
              size="lg"
              className="min-w-[160px]"
            >
              Magnetic Ghost
            </Button>
          </div>
        </motion.section>

        {/* Custom Magnetic Elements */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-center">Custom Magnetic Elements</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Magnetic Card */}
            <motion.div
              ref={magneticCard.ref}
              className="bg-card border-2 border-border rounded-xl p-6 space-y-4 cursor-pointer"
              style={{
                x: magneticCard.x,
                y: magneticCard.y,
                transform: 'translate3d(0, 0, 0)'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold">Magnetic Card</h3>
              <p className="text-muted-foreground">
                This card uses the useMagnetic hook for custom magnetic behavior.
                Hover near it to see the attraction effect.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Action 1</Button>
                <Button size="sm" variant="outline">Action 2</Button>
              </div>
            </motion.div>

            {/* Interactive Grid */}
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "aspect-square rounded-lg cursor-pointer transition-all duration-300",
                    i % 2 === 0
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-secondary/10 border border-secondary/30"
                  )}
                  data-cursor={i % 2 === 0 ? "magnet" : "view"}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {i % 2 === 0 ? 'Magnet' : 'View'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Advanced Cursor Examples */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-center">Advanced Interactions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Draggable Element */}
            <motion.div
              className="bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 rounded-xl p-6 cursor-grab active:cursor-grabbing"
              data-cursor="magnet"
              drag
              dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
              dragElastic={0.1}
              whileHover={{ scale: 1.02 }}
              whileDrag={{ scale: 1.05 }}
            >
              <h3 className="text-lg font-semibold mb-2">Draggable</h3>
              <p className="text-sm text-muted-foreground">
                Drag this element around
              </p>
            </motion.div>

            {/* Hover Effect Element */}
            <motion.div
              className="bg-gradient-to-br from-secondary/20 to-primary/20 border-2 border-secondary/30 rounded-xl p-6 cursor-pointer"
              data-cursor="view"
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-2">3D Hover</h3>
              <p className="text-sm text-muted-foreground">
                Hover for 3D effect
              </p>
            </motion.div>

            {/* Pulse Element */}
            <motion.div
              className="bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-primary/50 rounded-xl p-6 cursor-pointer"
              data-cursor="magnet"
              whileHover={{ scale: 1.02 }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.4)",
                  "0 0 0 20px rgba(59, 130, 246, 0)",
                  "0 0 0 0 rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <h3 className="text-lg font-semibold mb-2">Pulse Effect</h3>
              <p className="text-sm text-muted-foreground">
                Continuous pulse animation
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Instructions */}
        <motion.div
          className="bg-muted/50 border border-border rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-2">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <strong>data-cursor="magnet"</strong>
              <p>Creates magnetic attraction effect</p>
            </div>
            <div>
              <strong>data-cursor="view"</strong>
              <p>Enhances cursor for viewing elements</p>
            </div>
            <div>
              <strong>useMagnetic()</strong>
              <p>Hook for custom magnetic behavior</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
