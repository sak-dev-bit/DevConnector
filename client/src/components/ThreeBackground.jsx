import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Error boundary for Three.js
class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
        }}>
          {/* Fallback background without Three.js */}
        </div>
      );
    }

    return this.props.children;
  }
}

function AnimatedStars() {
  const ref = useRef();

  const [sphere] = useMemo(() => {
    const sphere = new Float32Array(10000 * 3);
    for (let i = 0; i < 10000; i++) {
      sphere[i * 3] = (Math.random() - 0.5) * 30;
      sphere[i * 3 + 1] = (Math.random() - 0.5) * 30;
      sphere[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return [sphere];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime;
      ref.current.rotation.x = Math.sin(time * 0.02) * 0.3;
      ref.current.rotation.y = Math.sin(time * 0.03) * 0.25;
      ref.current.rotation.z = Math.sin(time * 0.015) * 0.15;
      ref.current.position.y = Math.sin(time * 0.01) * 0.5;
    }
  });

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#06b6d4"
        size={0.012}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
}

function FloatingCubes() {
  const meshRef1 = useRef();
  const meshRef2 = useRef();
  const meshRef3 = useRef();
  const meshRef4 = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef1.current) {
      meshRef1.current.rotation.x = time * 0.3;
      meshRef1.current.rotation.y = time * 0.4;
      meshRef1.current.position.y = Math.sin(time * 0.8) * 0.8;
      meshRef1.current.position.x = Math.cos(time * 0.5) * 2;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.x = time * 0.2;
      meshRef2.current.rotation.z = time * 0.5;
      meshRef2.current.position.x = Math.cos(time * 0.6) * 1.5;
      meshRef2.current.position.z = Math.sin(time * 0.4) * 1;
    }
    if (meshRef3.current) {
      meshRef3.current.rotation.y = time * 0.4;
      meshRef3.current.rotation.z = time * 0.3;
      meshRef3.current.position.z = Math.sin(time * 0.7) * 0.5;
      meshRef3.current.position.y = Math.cos(time * 0.3) * 1.2;
    }
    if (meshRef4.current) {
      meshRef4.current.rotation.x = time * 0.25;
      meshRef4.current.rotation.y = time * 0.35;
      meshRef4.current.position.x = Math.sin(time * 0.45) * 1.8;
      meshRef4.current.position.z = Math.cos(time * 0.55) * 0.8;
    }
  });

  return (
    <>
      <mesh ref={meshRef1} position={[3, 1, -6]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.7} />
      </mesh>
      <mesh ref={meshRef2} position={[-2, -1, -4]}>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#8b5cf6" transparent opacity={0.6} />
      </mesh>
      <mesh ref={meshRef3} position={[0, -2, -8]}>
        <tetrahedronGeometry args={[0.7]} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.5} />
      </mesh>
      <mesh ref={meshRef4} position={[-3, 2, -5]}>
        <dodecahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#ec4899" transparent opacity={0.4} />
      </mesh>
    </>
  );
}

function FloatingParticles() {
  const particlesRef = useRef();

  const [particles] = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return [positions];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.rotation.y = time * 0.05;
      particlesRef.current.position.y = Math.sin(time * 0.02) * 0.3;
    }
  });

  return (
    <Points ref={particlesRef} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ec4899"
        size={0.008}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function ThreeBackground() {
  return (
    <ThreeErrorBoundary>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
      }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: false, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#6366f1" />
          <AnimatedStars />
          <FloatingCubes />
          <FloatingParticles />
        </Canvas>
      </div>
    </ThreeErrorBoundary>
  );
}

export default ThreeBackground;