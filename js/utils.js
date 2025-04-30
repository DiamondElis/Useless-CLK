// utils.js - Helper functions for Useless Dice Clock

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degToRad(degrees) {
  return degrees * PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function radToDeg(radians) {
  return radians * 180 / PI;
}

/**
 * Format time as HH:MM:SS
 * @param {number} h - Hours
 * @param {number} m - Minutes
 * @param {number} s - Seconds
 * @returns {string} Formatted time string
 */
function formatTimeString(h, m, s) {
  h = h % 12;
  h = h === 0 ? 12 : h; // Convert 0 to 12 for display
  m = m < 10 ? '0' + m : m; // Add leading zero
  s = s < 10 ? '0' + s : s; // Add leading zero
  return `${h}:${m}:${s}`;
}

/**
 * Get current time components
 * @returns {Object} Object containing hour, minute, second, and millis
 */
function getCurrentTime() {
  return {
    hour: hour() % 12,
    minute: minute(),
    second: second(),
    millis: millis() % 1000
  };
}

/**
 * Map time to color
 * @param {number} h - Hour
 * @param {number} m - Minute
 * @param {number} s - Second
 * @returns {object} RGB color object
 */
function timeToColor(h, m, s) {
  // Use HSB color mode for easy mapping
  colorMode(HSB, 360, 100, 100);
  
  // Map time components to HSB values
  const hue = map(h % 12, 0, 12, 0, 360);
  const saturation = map(m, 0, 60, 50, 100);
  const brightness = map(s, 0, 60, 70, 100);
  
  // Create color
  const col = color(hue, saturation, brightness);
  
  // Switch back to RGB mode
  colorMode(RGB, 255);
  
  // Return as RGB object
  return {
    r: red(col),
    g: green(col),
    b: blue(col)
  };
}

/**
 * Check if a point is inside a circle
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {number} cx - Circle center X
 * @param {number} cy - Circle center Y
 * @param {number} r - Circle radius
 * @returns {boolean} True if point is inside circle
 */
function pointInCircle(px, py, cx, cy, r) {
  const distSquared = (px - cx) * (px - cx) + (py - cy) * (py - cy);
  return distSquared <= r * r;
}

/**
 * Interpolate smoothly between two values (ease in/out)
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Progress (0-1)
 * @returns {number} Interpolated value
 */
function smoothStep(start, end, t) {
  // Clamp t to 0-1 range
  t = constrain(t, 0, 1);
  
  // Smooth step function: 3t² - 2t³
  t = t * t * (3 - 2 * t);
  
  // Interpolate
  return start + (end - start) * t;
}

/**
 * Generate a tonneau (barrel) shape path for watch face
 * @param {number} width - Width of shape
 * @param {number} height - Height of shape
 * @param {number} cornerRadius - Corner rounding amount
 * @returns {Array} Array of points defining the shape
 */
function generateTonneauShape(width, height, cornerRadius) {
  const points = [];
  const hw = width / 2;
  const hh = height / 2;
  
  // Control point distance
  const cpDist = cornerRadius * 0.551915; // approximation of circle with bezier
  
  // Top edge
  points.push({ x: -hw + cornerRadius, y: -hh, type: 'move' });
  points.push({ x: hw - cornerRadius, y: -hh, type: 'line' });
  
  // Top right corner
  points.push({ x: hw - cornerRadius + cpDist, y: -hh, type: 'bezier' });
  points.push({ x: hw, y: -hh + cornerRadius - cpDist, type: 'bezier' });
  points.push({ x: hw, y: -hh + cornerRadius, type: 'bezier' });
  
  // Right edge
  points.push({ x: hw, y: hh - cornerRadius, type: 'line' });
  
  // Bottom right corner
  points.push({ x: hw, y: hh - cornerRadius + cpDist, type: 'bezier' });
  points.push({ x: hw - cornerRadius + cpDist, y: hh, type: 'bezier' });
  points.push({ x: hw - cornerRadius, y: hh, type: 'bezier' });
  
  // Bottom edge
  points.push({ x: -hw + cornerRadius, y: hh, type: 'line' });
  
  // Bottom left corner
  points.push({ x: -hw + cornerRadius - cpDist, y: hh, type: 'bezier' });
  points.push({ x: -hw, y: hh - cornerRadius + cpDist, type: 'bezier' });
  points.push({ x: -hw, y: hh - cornerRadius, type: 'bezier' });
  
  // Left edge
  points.push({ x: -hw, y: -hh + cornerRadius, type: 'line' });
  
  // Top left corner
  points.push({ x: -hw, y: -hh + cornerRadius - cpDist, type: 'bezier' });
  points.push({ x: -hw + cornerRadius - cpDist, y: -hh, type: 'bezier' });
  points.push({ x: -hw + cornerRadius, y: -hh, type: 'bezier' });
  
  return points;
}

/**
 * Draw a tonneau shape using the points from generateTonneauShape
 * @param {Array} points - Points defining the shape
 */
function drawTonneauShape(points) {
  beginShape();
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    
    if (point.type === 'move') {
      vertex(point.x, point.y);
    } else if (point.type === 'line') {
      vertex(point.x, point.y);
    } else if (point.type === 'bezier') {
      // Bezier points come in groups of 3 (two control points and end point)
      if (i < points.length - 2 && points[i+1].type === 'bezier' && points[i+2].type === 'bezier') {
        bezierVertex(
          point.x, point.y,
          points[i+1].x, points[i+1].y,
          points[i+2].x, points[i+2].y
        );
        i += 2; // Skip the next two points as we've used them
      }
    }
  }
  
  endShape(CLOSE);
}

/**
 * Preload fonts and ensure they're available
 * @param {function} callback - Function to call when fonts are loaded
 */
function preloadFonts(callback) {
  const fontLoaded = () => {
    // Check if all fonts are loaded
    if (typeof craftMincho !== 'undefined' && 
        typeof shipporiMincho !== 'undefined' && 
        typeof hinaMincho !== 'undefined') {
      callback();
    }
  };
  
  // Font loading fallbacks
  setTimeout(fontLoaded, 3000); // Timeout fallback
}

/**
 * Create a gold metallic material for 3D objects
 */
function createGoldMaterial() {
  // p5.js doesn't have complex materials built in, but we can approximate
  specularMaterial(230, 201, 146);
  shininess(50);
}

/**
 * Handle window resize
 */
function handleWindowResize() {
  // Get clock container dimensions
  const container = document.getElementById('clock-container');
  if (!container) return;
  
  // Resize canvas to fit container
  resizeCanvas(container.offsetWidth, container.offsetHeight);
  
  // Reposition elements if needed
}

/**
 * Setup page interactions outside of canvas
 */
function setupPageInteractions() {
  // Add click handler for the "Roll Dice" button
  const rollDiceBtn = document.getElementById('roll-dice-btn');
  if (rollDiceBtn) {
    rollDiceBtn.addEventListener('click', () => {
      if (typeof diceSystem !== 'undefined') {
        diceSystem.roll();
      }
    });
  }
  
  // Setup gallery item interactions
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.dataset.mode;
      console.log(`Visualization mode selected: ${mode}`);
      // Could update the visualization mode here
    });
  });
}

/**
 * Show or hide the loading screen
 * @param {boolean} show - Whether to show (true) or hide (false) the loader
 * @param {number} delay - Delay in milliseconds before action
 */
function toggleLoadingScreen(show, delay = 0) {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;
  
  setTimeout(() => {
    if (show) {
      loadingScreen.style.display = 'flex';
      setTimeout(() => {
        loadingScreen.style.opacity = 1;
      }, 10);
    } else {
      loadingScreen.style.opacity = 0;
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500); // Match transition duration
    }
  }, delay);
} 