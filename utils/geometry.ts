import { ShapeType } from '../types';
import * as THREE from 'three';

export const getPositions = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    let x = 0, y = 0, z = 0;

    // Use random parameters for uniform cloud distribution
    const r1 = Math.random();
    const r2 = Math.random();
    const r3 = Math.random();

    switch (shape) {
      case ShapeType.MOBIUS: {
        const u = r1 * Math.PI * 2; // 0 to 2PI
        // Add some thickness variance
        const v = (r2 - 0.5) * 0.6; 
        x = (1 + v / 2 * Math.cos(u / 2)) * Math.cos(u) * 4;
        y = (1 + v / 2 * Math.cos(u / 2)) * Math.sin(u) * 4;
        z = (v / 2 * Math.sin(u / 2)) * 4;
        break;
      }
      case ShapeType.STAR: {
        // Random angle for uniform distribution around the star arms
        const angle = r1 * Math.PI * 2;
        const rBase = 2 + Math.sin(angle * 5) * 2; // 5 arms
        const h = (r2 - 0.5) * 2;
        const r = rBase * (1 - Math.abs(h)/3); // Taper out
        
        // Scatter slightly from the perfect parametric line
        const jitter = (Math.random() - 0.5) * 0.2;
        x = (r + jitter) * Math.cos(angle);
        y = (r + jitter) * Math.sin(angle);
        z = h * 3;
        break;
      }
      case ShapeType.KLEIN: {
        const u = r1 * Math.PI * 2;
        const v = r2 * Math.PI * 2;
        // Standard Klein Bottle Parametric equations
        const r = 4 - 2 * Math.cos(u);
        if (0 <= u && u < Math.PI) {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
            y = 16 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
        } else {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
            y = 16 * Math.sin(u);
        }
        z = r * Math.sin(v);
        // Scale down
        x *= 0.25; y *= 0.25; z *= 0.25;
        y -= 2; // Center
        break;
      }
      case ShapeType.DNA: {
        const turns = 4;
        // Random height/position along the helix
        const t = r1; 
        const angle = t * Math.PI * 2 * turns;
        const radius = 2;
        const height = (t - 0.5) * 10;
        
        // Split into two strands randomly
        const strand = r2 > 0.5 ? 0 : Math.PI;
        
        // Main helix
        x = radius * Math.cos(angle + strand);
        z = radius * Math.sin(angle + strand);
        y = height;
        
        // Add rungs (bridges) - approx 10% of particles form rungs
        if (Math.random() < 0.15) {
            const ratio = Math.random(); // Position along the rung
            x = (radius * Math.cos(angle) * (1 - 2*ratio)); 
            z = (radius * Math.sin(angle) * (1 - 2*ratio));
            y = height;
        }
        break;
      }
      case ShapeType.INCENSE: {
        // Part distribution: 
        // 0.0 - 0.6: Bowl Body
        // 0.6 - 0.7: Legs
        // 0.7 - 0.8: Handles
        // 0.8 - 1.0: Smoke (New)
        
        const part = Math.random();
        
        if (part < 0.6) {
             // Main Body (Bowl) - Flattened Sphere
             const theta = Math.random() * Math.PI * 2;
             const phi = Math.random() * Math.PI; // Bottom half mostly
             const rad = 2.5;
             x = rad * Math.sin(phi) * Math.cos(theta);
             z = rad * Math.sin(phi) * Math.sin(theta);
             y = rad * Math.cos(phi) * 0.6 - 0.5; 
        } else if (part < 0.7) {
            // Legs (3 legs)
            const legIdx = Math.floor(Math.random() * 3);
            const legAngle = (legIdx * Math.PI * 2) / 3;
            const h = Math.random() * 2;
            const legSpread = (Math.random() - 0.5) * 0.5;
            x = (1.5 + h*0.2) * Math.cos(legAngle + legSpread);
            z = (1.5 + h*0.2) * Math.sin(legAngle + legSpread);
            y = -1.5 - h;
        } else if (part < 0.8) {
            // Handles (2 ears) - Vertical Torus segments
            const handleIdx = Math.floor(Math.random() * 2);
            const handleBaseAngle = handleIdx * Math.PI;
            const uT = Math.random() * Math.PI; // Half circle
            x = (2.5 + 0.5 * Math.sin(uT)) * Math.cos(handleBaseAngle);
            z = 0.5 * Math.cos(uT); // Thickness
            y = 1 + 1.5 * Math.sin(uT);
        } else {
            // -- SMOKE (Drifting Wisps) --
            // Starts at center y ~ 1.0, goes up to y ~ 8.0
            // Sine waves for drifting effect
            
            const strandId = Math.floor(Math.random() * 3); // 3 main wisps
            const height = Math.random() * 7; // 0 to 7 height
            
            y = 1.0 + height;
            
            // Base wiggle + Drift
            // Frequency increases with height to look like turbulence
            const driftX = Math.sin(y * 0.8 + strandId) * (y * 0.3); 
            const driftZ = Math.cos(y * 0.5 + strandId) * (y * 0.2);
            
            // Spiral factor
            const spiral = y * 0.5;
            
            x = driftX + Math.sin(spiral) * 0.5;
            z = driftZ + Math.cos(spiral) * 0.5;
            
            // Taper: smoke gets wider/more scattered at top
            const scatter = (Math.random() - 0.5) * (y * 0.2);
            x += scatter;
            z += scatter;
        }
        break;
      }
      case ShapeType.CROWN: {
        // Improved Phoenix Crown based on reference
        // 1. Cap/Base (30%) - A solid rounded hat shape
        // 2. Ornaments (30%) - High intricate detail on top/front
        // 3. Side Tassels (30%) - Long hanging beads at temples
        // 4. Front Veil (10%) - Shorter hanging beads
        
        const part = Math.random();
        
        if (part < 0.3) {
            // -- CAP / BASE --
            // A semi-sphere / cylinder blend
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.4; // Top part of sphere
            const rad = 3.0;
            x = rad * Math.sin(phi) * Math.cos(theta);
            z = rad * Math.sin(phi) * Math.sin(theta);
            y = 2.0 + rad * Math.cos(phi) * 0.5; // Lifted up
            // Flatten bottom rim
            if (y > 3.2) y = 3.2; 
            
        } else if (part < 0.6) {
            // -- ORNAMENTS (Phoenixes/Flowers) --
            // Dense cluster on top and front
            // Fan shape at the back, Crest at front
            const isFan = Math.random() > 0.5;
            
            if (isFan) {
                // Back Fan
                const theta = Math.PI + (Math.random() - 0.5) * Math.PI; // Back arc
                const rad = 3.5;
                x = rad * Math.cos(theta);
                z = rad * Math.sin(theta);
                y = 3.5 + Math.random() * 2.0;
            } else {
                // Front Crest
                const theta = (Math.random() - 0.5) * Math.PI; // Front arc
                const rad = 3.2;
                x = rad * Math.cos(theta);
                z = rad * Math.sin(theta);
                y = 3.5 + Math.cos(theta)*1.5 + Math.random(); // Peak in middle
            }
            
        } else if (part < 0.9) {
            // -- SIDE TASSELS (Long) --
            // Located at +/- PI/2 (Left/Right)
            const side = Math.random() > 0.5 ? 1 : -1;
            // Cluster around the ear area
            const angleCenter = Math.PI / 2 * side;
            const angleWidth = 0.3;
            const theta = angleCenter + (Math.random() - 0.5) * angleWidth;
            
            const rad = 3.4;
            x = rad * Math.cos(theta);
            z = rad * Math.sin(theta);
            
            // Hang down long
            const drop = Math.random() * 6.0;
            y = 2.5 - drop; 
            
            // Slight sway outwards
            x += (side * drop * 0.1); 
            
        } else {
            // -- FRONT VEIL (Short) --
            // Front arc
            const theta = (Math.random() - 0.5) * Math.PI * 0.8;
            const rad = 3.3;
            x = rad * Math.cos(theta);
            z = rad * Math.sin(theta);
            
            const drop = Math.random() * 2.0; // Shorter
            y = 2.5 - drop;
        }
        break;
      }
      case ShapeType.RELIEF: {
        // Topography / Relief map - Uniform random scatter
        const u = (r1 * 8) - 4; // -4 to 4
        const v = (r2 * 8) - 4; // -4 to 4
        
        x = u;
        z = v;
        // Height function
        y = Math.sin(Math.sqrt(x*x + z*z) * 2) + Math.cos(x) * Math.cos(z);
        break;
      }
      default:
        x = (Math.random() - 0.5) * 10;
        y = (Math.random() - 0.5) * 10;
        z = (Math.random() - 0.5) * 10;
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }
  
  return positions;
};