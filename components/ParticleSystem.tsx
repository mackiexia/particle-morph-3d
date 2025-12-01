import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPositions } from '../utils/geometry';
import { ShapeType } from '../types';

interface ParticleSystemProps {
  shape: ShapeType;
  density: number;
  symbols: [string, string, string, string];
  colors: string[];
}

// Generate a texture from a character
const createCharTexture = (char: string, color: string): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 64, 64);
    
    // 1. Draw the character (emoji or text) normally
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff'; 
    ctx.fillText(char, 32, 32);

    // 2. Force Monochrome for Emojis
    // Emojis render in color by default, ignoring fillStyle in many browsers.
    // To allow tinting via Three.js material color, we must convert the emoji to a white silhouette.
    // 'source-in' keeps the alpha of the drawn emoji but replaces the color with the next fill.
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 64);
    
    // Reset composite operation just in case
    ctx.globalCompositeOperation = 'source-over';
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Sub-component for a single symbol group to manage its own InstancedMesh
const SymbolGroup = ({ 
  symbol, 
  color, 
  positions, 
  count,
  targetPositions
}: { 
  symbol: string, 
  color: string, 
  positions: Float32Array, 
  count: number,
  targetPositions: Float32Array
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const texture = useMemo(() => createCharTexture(symbol, color), [symbol]); // Color prop only used for dependency key
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const lerpFactor = 0.05; // Smoothing speed

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Interpolate current pos towards target
      positions[idx] += (targetPositions[idx] - positions[idx]) * lerpFactor;
      positions[idx + 1] += (targetPositions[idx + 1] - positions[idx + 1]) * lerpFactor;
      positions[idx + 2] += (targetPositions[idx + 2] - positions[idx + 2]) * lerpFactor;

      dummy.position.set(
        positions[idx],
        positions[idx + 1],
        positions[idx + 2]
      );
      
      // Make particles look at camera (Billboard effect)
      dummy.lookAt(state.camera.position);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.4, 0.4]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        alphaTest={0.01} 
        side={THREE.DoubleSide} 
        color={color}
      />
    </instancedMesh>
  );
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ shape, density, symbols, colors }) => {
  // We divide the total density by 4 (one for each symbol)
  const countPerSymbol = Math.floor(density / 4);
  const totalCount = countPerSymbol * 4;

  // Generate target positions for the whole set
  const allTargetPositions = useMemo(() => {
    return getPositions(shape, totalCount);
  }, [shape, totalCount]);

  // Current positions (mutable state for animation)
  // We initialize them to target first to avoid 0,0,0 explosion on mount
  const currentPositionsRef = useRef<Float32Array>(new Float32Array(totalCount * 3));
  
  // Initialize once
  useEffect(() => {
     // Start at random positions or target
     const arr = currentPositionsRef.current;
     if(arr.length !== totalCount * 3) {
         currentPositionsRef.current = new Float32Array(totalCount * 3);
     }
  }, [totalCount]);

  // Split logic: render 4 SymbolGroups
  return (
    <group>
      {symbols.map((sym, index) => {
        const startIdx = index * countPerSymbol * 3;
        const endIdx = startIdx + (countPerSymbol * 3);
        
        // Slice the target positions for this group
        const groupTargets = allTargetPositions.slice(startIdx, endIdx);
        
        // We need a persistent buffer for current positions for this group to interpolate
        // Since useFrame handles logic per component, we pass a slice of the ref logic 
        // effectively by creating a new Float32Array for the sub-component state 
        // that initializes from the main one, or just let the sub-component manage its own buffer.
        // Let's let the subcomponent manage its own current position buffer to be cleaner.
        
        return (
          <SymbolGroupWrapper 
            key={`${index}-${countPerSymbol}`} // Remount if density changes
            symbol={sym}
            color={colors[index % colors.length]}
            count={countPerSymbol}
            targetPositions={groupTargets}
          />
        );
      })}
    </group>
  );
};

// Wrapper to hold state for positions so they persist between renders while target changes
const SymbolGroupWrapper = ({ symbol, color, count, targetPositions }: any) => {
    const currentPositions = useMemo(() => {
        // Initialize with spread out random or 0
        const arr = new Float32Array(count * 3);
        for(let i=0; i<arr.length; i++) arr[i] = (Math.random() - 0.5) * 10;
        return arr;
    }, [count]);

    return <SymbolGroup 
        symbol={symbol} 
        color={color} 
        positions={currentPositions} 
        count={count} 
        targetPositions={targetPositions} 
    />;
}