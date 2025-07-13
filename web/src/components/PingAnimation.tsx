import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PingParticle {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isHealthy: boolean;
  responseTime: number;
}

interface PingAnimationProps {
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data?: {
      responseTime: number;
      isHealthy: boolean;
    };
  }>;
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
  }>;
  isAnimating: boolean;
}

export default function PingAnimation({ edges, nodes, isAnimating }: PingAnimationProps) {
  const [particles, setParticles] = useState<PingParticle[]>([]);

  useEffect(() => {
    if (!isAnimating) {
      setParticles([]);
      return;
    }

    const spawnParticle = () => {
      if (edges.length === 0 || nodes.length === 0) return;

      // Pick a random edge
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const particle: PingParticle = {
        id: `${Date.now()}-${Math.random()}`,
        sourceX: sourceNode.position.x + 60, // Offset for node center
        sourceY: sourceNode.position.y + 30,
        targetX: targetNode.position.x + 60,
        targetY: targetNode.position.y + 30,
        isHealthy: edge.data?.isHealthy || false,
        responseTime: edge.data?.responseTime || 1,
      };

      setParticles(prev => [...prev, particle]);

      // Remove particle after animation completes
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, 2000 + particle.responseTime * 10); // Animation duration based on response time
    };

    // Spawn particles at regular intervals
    const interval = setInterval(spawnParticle, 1500);

    return () => {
      clearInterval(interval);
      setParticles([]);
    };
  }, [edges, nodes, isAnimating]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute w-3 h-3 rounded-full ${
              particle.isHealthy ? 'bg-green-400' : 'bg-red-400'
            } shadow-lg`}
            initial={{
              x: particle.sourceX,
              y: particle.sourceY,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: particle.targetX,
              y: particle.targetY,
              scale: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0],
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: Math.max(1, particle.responseTime / 5), // Slower for higher response times
              ease: "easeInOut",
              times: [0, 0.1, 0.9, 1],
            }}
            style={{
              filter: `drop-shadow(0 0 6px ${particle.isHealthy ? '#10b981' : '#ef4444'})`,
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Pulse animation on nodes when particles are active */}
      <AnimatePresence>
        {isAnimating && nodes.map((node) => (
          <motion.div
            key={`pulse-${node.id}`}
            className="absolute rounded-full border-2 border-blue-400"
            style={{
              left: node.position.x + 40,
              top: node.position.y + 10,
              width: 80,
              height: 60,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0, 0.3, 0],
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 2, // Stagger the pulses
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}