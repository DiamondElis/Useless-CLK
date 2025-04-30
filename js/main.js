// main.js - Main p5.js sketch for Useless Dice Clock

// Global variables
let craftMincho;      // Font for clock numerals
let shipporiMincho;   // Font for UI elements
let hinaMincho;       // Font for headlines
let diceSystem;       // Dice management system
let clockSystem;      // Clock logic
let animationSystem;  // Animation controller
let watchFace;        // Watch face background image
let bgPattern;        // Background pattern
let isLoading = true; // Loading state
let canvas;           // Main canvas
let cameraAngle = 0;  // Camera rotation angle

/**
 * Preload assets before setup
 */
function preload() {
  // Load fonts
  craftMincho = loadFont('assets/fonts/CraftMincho.ttf');
  shipporiMincho = loadFont('assets/fonts/ShipporiMincho-Regular.ttf');
  hinaMincho = loadFont('assets/fonts/HinaMincho-Regular.ttf');
  
  // Load images
  watchFace = loadImage('assets/images/watch-background.jpg');
  
  // Initialize systems
  clockSystem = new ClockSystem();
  diceSystem = new DiceSystem();
  animationSystem = new AnimationSystem();
}

/**
 * Setup p5.js canvas and initialize components
 */
function setup() {
  // Create canvas in the clock container
  const container = document.getElementById('clock-container');
  canvas = createCanvas(container.offsetWidth, container.offsetHeight, WEBGL);
  canvas.parent('clock-container');
  
  // Set text properties
  textFont(craftMincho);
  textAlign(CENTER, CENTER);
  
  // Explicitly set dice system properties
  diceSystem.diceCount = 3;
  diceSystem.containerSize = 100; // Increased size for 3 dice
  diceSystem.init();
  
  // Initialize clock with current hour
  clockSystem.lastHour = hour();
  
  // Force an initial dice roll to show current hour
  setTimeout(() => {
    clockSystem.mapMinutesToDice();
  }, 1000);
  
  // Force hide loading screen after a timeout
  setTimeout(() => {
    document.getElementById('loading-screen').style.opacity = 0;
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      isLoading = false;
    }, 500);
  }, 3000);
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  document.getElementById('roll-dice-btn').addEventListener('click', rollDice);
  
  // Add scroll animations
  initScrollAnimations();
}

/**
 * Main draw loop
 */
function draw() {
  // Clear background
  background(245, 241, 230);
  
  // Update time values
  clockSystem.update();
  
  // Map time to hour of day
  clockSystem.mapMinutesToDice();
  
  // Get current time
  const h = hour();
  const m = minute();
  const s = second();
  const ms = millis();
  
  // Update camera position based on mouse position and time
  updateCamera(h, m, s, ms);
  
  // Draw watch face
  drawWatchFace(h, m, s, ms);
  
  // Draw dice representation of time
  diceSystem.display();
  
  // Update animations
  animationSystem.update();
}

/**
 * Draw the watch face with numerals
 */
function drawWatchFace(h, m, s, ms) {
  push();
  
  // Apply slight rotation for perspective
  const rotX = map(mouseY, 0, height, -0.05, 0.05);
  const rotY = map(mouseX, 0, width, -0.05, 0.05);
  rotateX(rotX);
  rotateY(rotY);
  
  // Draw watch body (tonneau shape)
  fill(230, 201, 146); // Gold color
  specularMaterial(230, 201, 146);
  shininess(20);
  
  // Create watch case shape
  beginShape();
  // Top curve
  vertex(-150, -200, 0);
  bezierVertex(-200, -180, 0, -200, -120, 0, -150, -100, 0);
  // Right side
  vertex(-150, -100, 0);
  vertex(-150, 100, 0);
  // Bottom curve  
  bezierVertex(-200, 120, 0, -200, 180, 0, -150, 200, 0);
  // Bottom line
  vertex(150, 200, 0);
  // Bottom curve (right side)
  bezierVertex(200, 180, 0, 200, 120, 0, 150, 100, 0);
  // Right side
  vertex(150, 100, 0);
  vertex(150, -100, 0);
  // Top curve (right side)
  bezierVertex(200, -120, 0, 200, -180, 0, 150, -200, 0);
  // Top line
  vertex(-150, -200, 0);
  endShape(CLOSE);
  
  // Draw watch face
  push();
  translate(0, 0, 1);
  fill(245, 241, 230); // Cream color for face
  noStroke();
  
  // Draw face background
  ellipse(0, 0, 280, 280);
  
  // Draw spiral pattern on watch face
  drawWatchPattern(ms);
  
  // Draw hour markers
  drawHourMarkers();
  
  // Draw Japanese characters
  drawJapaneseCharacters();
  
  pop();
  
  pop();
}

/**
 * Draw spiral pattern on watch face
 */
function drawWatchPattern(ms) {
  push();
  stroke(230, 201, 146, 50); // Light gold color
  noFill();
  const spiralCount = 30;
  const rotationSpeed = 0.0001;
  
  // Rotate pattern slowly over time
  rotate(ms * rotationSpeed);
  
  for (let i = 0; i < spiralCount; i++) {
    const radius = i * 5;
    const angle = i * 0.5;
    const x = cos(angle) * radius;
    const y = sin(angle) * radius;
    
    beginShape();
    for (let a = 0; a < TWO_PI * 2; a += 0.1) {
      const r = radius + sin(a * 3 + ms * 0.001) * 2;
      const px = cos(a + angle) * r;
      const py = sin(a + angle) * r;
      curveVertex(px, py);
    }
    endShape();
  }
  pop();
}

/**
 * Draw hour markers around watch face
 */
function drawHourMarkers() {
  push();
  textFont(craftMincho);
  textSize(32);
  fill(26, 26, 26); // Dark color for numerals
  
  // Position hour numbers
  for (let i = 1; i <= 12; i++) {
    const angle = map(i, 0, 12, -PI / 2, 3 * PI / 2);
    const radius = 120;
    const x = cos(angle) * radius;
    const y = sin(angle) * radius;
    
    push();
    translate(x, y);
    // Rotate numbers to face outward
    const rotationAngle = atan2(y, x) + PI / 2;
    rotate(rotationAngle);
    text(i, 0, 0);
    pop();
  }
  pop();
}

/**
 * Draw Japanese characters on watch face
 */
function drawJapaneseCharacters() {
  push();
  textFont(craftMincho);
  textSize(18);
  fill(26, 26, 26, 200); // Dark color with transparency
  
  // Japanese characters at different positions (simplified for demonstration)
  text("キング", 0, -60);
  text("マカオ", 0, -40);
  text("百八", -90, 0);  // 108
  text("攫千金", -90, 40); // Fortune
  text("大金運", 90, 0);  // Great fortune
  text("煌櫻", 90, 40);   // Brilliant cherry blossom
  
  pop();
}

/**
 * Update camera position based on mouse and time
 */
function updateCamera(h, m, s, ms) {
  // Subtle camera movement
  cameraAngle = sin(ms * 0.0005) * 0.05;
  camera(0, 0, 350 + sin(ms * 0.001) * 20, 0, 0, 0, 0, 1, 0);
  rotateY(cameraAngle);
}

/**
 * Handle window resize
 */
function onWindowResize() {
  const container = document.getElementById('clock-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
}

/**
 * Roll the dice when button is clicked
 */
function rollDice() {
  diceSystem.roll();
  animationSystem.triggerEffect('diceRoll');
}

/**
 * Initialize scroll-based animations
 */
function initScrollAnimations() {
  // Observe elements entering viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.1 });
  
  // Observe all sections and interactive elements
  document.querySelectorAll('.content-section, .gallery-grid, .sources-list').forEach(el => {
    observer.observe(el);
  });
  
  // Handle header visibility on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });
}

// ------------------------------------------
// Clock System Class
// ------------------------------------------
class ClockSystem {
  constructor() {
    this.hourAngle = 0;
    this.minuteAngle = 0;
    this.secondAngle = 0;
    this.prevSecond = -1;
    this.tickSound = null;
    this.lastHour = 0;
  }
  
  /**
   * Update clock angles based on current time
   */
  update() {
    const h = hour() % 12;
    const m = minute();
    const s = second();
    const ms = millis();
    
    // Calculate angles for traditional clock hands (not visible but used for calculations)
    this.hourAngle = map(h + m/60, 0, 12, 0, TWO_PI) - HALF_PI;
    this.minuteAngle = map(m + s/60, 0, 60, 0, TWO_PI) - HALF_PI;
    this.secondAngle = map(s + (ms % 1000)/1000, 0, 60, 0, TWO_PI) - HALF_PI;
    
    // Check for second change to trigger animations
    if (s !== this.prevSecond) {
      this.prevSecond = s;
      animationSystem.triggerEffect('secondTick');
      
      // Trigger minute change
      if (s === 0) {
        animationSystem.triggerEffect('minuteChange');
        
        // Trigger hour change
        if (m === 0) {
          animationSystem.triggerEffect('hourChange');
        }
      }
    }
  }
  
  /**
   * Get current time values for dice mapping
   */
  getTimeValues() {
    return {
      hour: hour() % 12,
      minute: minute(),
      second: second(),
      millis: millis()
    };
  }
  
  /**
   * Map minutes to dice values
   */
  mapMinutesToDice() {
    const h = hour() % 12;
    const m = minute();
    const s = second();
    const ms = millis();
    
    // Map minutes to dice values
    const minuteDice = Math.floor(m / 15);
    const secondDice = Math.floor(s / 15);
    const millisDice = Math.floor(ms / 100);
    
    // Update dice system
    diceSystem.updateDiceValues(h, m, s, ms);
  }
}

// ------------------------------------------
// Dice System Class
// ------------------------------------------
class DiceSystem {
  constructor() {
    this.dice = [];
    this.diceCount = 3;
    this.containerSize = 80;
    this.diceSize = 25;
    this.isRolling = false;
    this.rollStartTime = 0;
    this.rollDuration = 1000;
    this.lastUpdateTime = 0;
  }
  
  /**
   * Initialize dice with starting positions and values
   */
  init() {
    for (let i = 0; i < this.diceCount; i++) {
      this.dice.push({
        x: random(-this.containerSize/4, this.containerSize/4),
        y: random(-this.containerSize/4, this.containerSize/4),
        z: random(-this.containerSize/4, this.containerSize/4),
        rotX: random(TWO_PI),
        rotY: random(TWO_PI),
        rotZ: random(TWO_PI),
        value: floor(random(1, 7)),
        targetRotX: 0,
        targetRotY: 0,
        targetRotZ: 0,
        velocity: { x: 0, y: 0, z: 0 },
        angularVelocity: { x: 0, y: 0, z: 0 }
      });
    }
  }
  
  /**
   * Roll the dice with physics
   */
  roll() {
    this.isRolling = true;
    this.rollStartTime = millis();
    
    // Apply random forces to each die
    this.dice.forEach(die => {
      die.velocity = {
        x: random(-5, 5),
        y: random(-5, 5),
        z: random(-5, 5)
      };
      
      die.angularVelocity = {
        x: random(-0.2, 0.2),
        y: random(-0.2, 0.2),
        z: random(-0.2, 0.2)
      };
      
      // Set target rotations for final die face
      const newValue = floor(random(1, 7));
      die.value = newValue;
      
      // Set target rotations based on die value
      this.setDieRotationForValue(die, newValue);
    });
  }
  
  /**
   * Set die rotation to show proper face for value
   */
  setDieRotationForValue(die, value) {
    // Define rotations for each face value (standard dice have opposite faces summing to 7)
    switch(value) {
      case 1: // 1 on top
        die.targetRotX = 0;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
      case 2: // 2 on top
        die.targetRotX = HALF_PI;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
      case 3: // 3 on top
        die.targetRotX = 0;
        die.targetRotY = HALF_PI;
        die.targetRotZ = 0;
        break;
      case 4: // 4 on top
        die.targetRotX = 0;
        die.targetRotY = -HALF_PI;
        die.targetRotZ = 0;
        break;
      case 5: // 5 on top
        die.targetRotX = -HALF_PI;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
      case 6: // 6 on top
        die.targetRotX = PI;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
    }
  }
  
  /**
   * Update dice physics
   */
  updatePhysics(deltaTime) {
    const containerRadius = this.containerSize / 2;
    const damping = 0.95;
    const angularDamping = 0.9;
    const rollProgress = constrain((millis() - this.rollStartTime) / this.rollDuration, 0, 1);
    
    this.dice.forEach(die => {
      if (this.isRolling) {
        // Update position
        die.x += die.velocity.x;
        die.y += die.velocity.y;
        die.z += die.velocity.z;
        
        // Update rotation
        die.rotX += die.angularVelocity.x;
        die.rotY += die.angularVelocity.y;
        die.rotZ += die.angularVelocity.z;
        
        // Contain within sphere
        const dist = sqrt(die.x * die.x + die.y * die.y + die.z * die.z);
        if (dist > containerRadius - this.diceSize/2) {
          // Normalize position
          const nx = die.x / dist;
          const ny = die.y / dist;
          const nz = die.z / dist;
          
          // Set position to boundary
          die.x = nx * (containerRadius - this.diceSize/2);
          die.y = ny * (containerRadius - this.diceSize/2);
          die.z = nz * (containerRadius - this.diceSize/2);
          
          // Reflect velocity
          const dotProduct = die.velocity.x * nx + die.velocity.y * ny + die.velocity.z * nz;
          die.velocity.x = die.velocity.x - 2 * dotProduct * nx;
          die.velocity.y = die.velocity.y - 2 * dotProduct * ny;
          die.velocity.z = die.velocity.z - 2 * dotProduct * nz;
          
          // Apply damping on collision
          die.velocity.x *= damping;
          die.velocity.y *= damping;
          die.velocity.z *= damping;
        }
        
        // Apply damping
        die.velocity.x *= damping;
        die.velocity.y *= damping;
        die.velocity.z *= damping;
        die.angularVelocity.x *= angularDamping;
        die.angularVelocity.y *= angularDamping;
        die.angularVelocity.z *= angularDamping;
        
        // Check if rolling is complete
        if (rollProgress >= 1) {
          this.isRolling = false;
        }
      } else {
        // Smoothly interpolate to final position and rotation
        die.x = lerp(die.x, (die.value % 3 - 1) * this.diceSize, 0.05);
        die.y = lerp(die.y, (floor(die.value / 3)) * this.diceSize, 0.05);
        die.z = lerp(die.z, 0, 0.05);
        
        die.rotX = lerp(die.rotX, die.targetRotX, 0.1);
        die.rotY = lerp(die.rotY, die.targetRotY, 0.1);
        die.rotZ = lerp(die.rotZ, die.targetRotZ, 0.1);
      }
    });
  }
  
  /**
   * Display dice in 3D space
   */
  display() {
    // Update dice physics
    const currentTime = millis();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;
    
    this.updatePhysics(deltaTime);
    
    push();
    
    // Draw dice container (green circle)
    push();
    translate(0, 0, 10);
    rotateX(HALF_PI);
    fill(10, 77, 60); // Deep green
    noStroke();
    ellipse(0, 0, this.containerSize, this.containerSize);
    pop();
    
    // Draw each die
    this.dice.forEach(die => {
      push();
      translate(die.x, die.y, die.z + 15);
      rotateX(die.rotX);
      rotateY(die.rotY);
      rotateZ(die.rotZ);
      
      // Draw die
      fill(255);
      stroke(200);
      strokeWeight(0.5);
      box(this.diceSize);
      
      // Draw die faces (dots)
      this.drawDieFaces(this.diceSize/2);
      
      pop();
    });
    
    pop();
  }
  
  /**
   * Draw dots on dice faces
   */
  drawDieFaces(size) {
    const dotSize = size * 0.15;
    const dotOffset = size * 0.6;
    fill(0);
    noStroke();
    
    // Face 1 (front) - 1 dot
    push();
    translate(0, 0, size + 0.1);
    ellipse(0, 0, dotSize);
    pop();
    
    // Face 2 (right) - 2 dots
    push();
    translate(size + 0.1, 0, 0);
    rotateY(HALF_PI);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    pop();
    
    // Face 3 (top) - 3 dots
    push();
    translate(0, -size - 0.1, 0);
    rotateX(HALF_PI);
    ellipse(0, 0, dotSize);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    pop();
    
    // Face 4 (bottom) - 4 dots
    push();
    translate(0, size + 0.1, 0);
    rotateX(-HALF_PI);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    ellipse(dotOffset/2, -dotOffset/2, dotSize);
    ellipse(-dotOffset/2, dotOffset/2, dotSize);
    pop();
    
    // Face 5 (left) - 5 dots
    push();
    translate(-size - 0.1, 0, 0);
    rotateY(-HALF_PI);
    ellipse(0, 0, dotSize);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    ellipse(dotOffset/2, -dotOffset/2, dotSize);
    ellipse(-dotOffset/2, dotOffset/2, dotSize);
    pop();
    
    // Face 6 (back) - 6 dots
    push();
    translate(0, 0, -size - 0.1);
    rotateY(PI);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    ellipse(dotOffset/2, -dotOffset/2, dotSize);
    ellipse(-dotOffset/2, dotOffset/2, dotSize);
    ellipse(dotOffset/2, 0, dotSize);
    ellipse(-dotOffset/2, 0, dotSize);
    pop();
  }
  
  /**
   * Update dice values
   */
  updateDiceValues(h, m, s, ms) {
    // Implementation of updating dice values based on the new time
  }
}

// ------------------------------------------
// Animation System Class
// ------------------------------------------
class AnimationSystem {
  constructor() {
    this.effects = {};
    this.activeEffects = [];
    this.lastTime = 0;
    
    // Define animation effects
    this.defineEffects();
  }
  
  /**
   * Define available animation effects
   */
  defineEffects() {
    // Second tick effect
    this.effects.secondTick = {
      duration: 500,
      update: (progress, params) => {
        // Subtle pulse effect
        const scale = 1 + sin(progress * PI) * 0.05;
        return { scale };
      }
    };
    
    // Minute change effect
    this.effects.minuteChange = {
      duration: 1000,
      update: (progress, params) => {
        // Slightly stronger pulse
        const scale = 1 + sin(progress * PI) * 0.1;
        return { scale, rotation: sin(progress * TWO_PI) * 0.05 };
      }
    };
    
    // Hour change effect
    this.effects.hourChange = {
      duration: 2000,
      update: (progress, params) => {
        // Major animation effect
        const scale = 1 + sin(progress * PI) * 0.2;
        return { 
          scale, 
          rotation: sin(progress * TWO_PI) * 0.1,
          colorShift: sin(progress * PI) * 50
        };
      }
    };
    
    // Dice roll effect
    this.effects.diceRoll = {
      duration: 1000,
      update: (progress, params) => {
        return { shake: sin(progress * PI * 10) * (1 - progress) * 5 };
      }
    };
  }
  
  /**
   * Trigger an animation effect
   */
  triggerEffect(effectName, params = {}) {
    if (this.effects[effectName]) {
      this.activeEffects.push({
        name: effectName,
        startTime: millis(),
        params: params,
        effect: this.effects[effectName]
      });
    }
  }
  
  /**
   * Update active animations
   */
  update() {
    // Update active effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      const elapsedTime = millis() - effect.startTime;
      const progress = constrain(elapsedTime / effect.effect.duration, 0, 1);
      
      // Remove completed effects
      if (progress >= 1) {
        this.activeEffects.splice(i, 1);
      }
    }
    
    this.lastTime = millis();
  }
  
  /**
   * Get combined effect values for current frame
   */
  getEffectValues() {
    let result = {
      scale: 1,
      rotation: 0,
      colorShift: 0,
      shake: 0
    };
    
    // Combine all active effects
    this.activeEffects.forEach(activeEffect => {
      const progress = constrain((millis() - activeEffect.startTime) / activeEffect.effect.duration, 0, 1);
      const values = activeEffect.effect.update(progress, activeEffect.params);
      
      // Combine values
      if (values.scale !== undefined) result.scale *= values.scale;
      if (values.rotation !== undefined) result.rotation += values.rotation;
      if (values.colorShift !== undefined) result.colorShift += values.colorShift;
      if (values.shake !== undefined) result.shake += values.shake;
    });
    
    return result;
  }
} 