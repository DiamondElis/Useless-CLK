// dice.js - Dice physics and rendering using p5.js

/**
 * DiceSystem manages the dice visualization and physics
 * This simulates the dice inside the green container on the watch face
 */
class DiceSystem {
  constructor() {
    // Dice properties
    this.dice = [];       // Array to hold dice objects
    this.diceCount = 3;   // Number of dice to display
    this.diceSize = 25;   // Size of each die
    
    // Container properties
    this.containerSize = 100;  // Increased container size for three dice
    this.containerColor = color(10, 77, 60); // Deep green
    
    // Animation states
    this.isRolling = false;    // Whether dice are currently rolling
    this.rollStartTime = 0;    // When the current roll started
    this.rollDuration = 1000;  // How long a roll lasts in milliseconds
    
    // Physics tracking
    this.lastUpdateTime = 0;   // Last time physics were updated
  }
  
  /**
   * Initialize dice with starting positions and values
   */
  init() {
    // Clear any existing dice
    this.dice = [];
    
    // Create dice with random initial properties
    for (let i = 0; i < this.diceCount; i++) {
      this.dice.push({
        // Position within container
        x: random(-this.containerSize/4, this.containerSize/4),
        y: random(-this.containerSize/4, this.containerSize/4),
        z: random(-this.containerSize/4, this.containerSize/4),
        
        // Rotation angles
        rotX: random(TWO_PI),
        rotY: random(TWO_PI),
        rotZ: random(TWO_PI),
        
        // Die value (1-6)
        value: floor(random(1, 7)),
        
        // Target rotation for final position
        targetRotX: 0,
        targetRotY: 0,
        targetRotZ: 0,
        
        // Physics properties
        velocity: createVector(0, 0, 0),
        angularVelocity: createVector(0, 0, 0)
      });
      
      // Set initial die rotation to match its value
      this.setDieRotationForValue(this.dice[i], this.dice[i].value);
    }
  }
  
  /**
   * Roll all dice with physics
   */
  roll() {
    // Start rolling animation
    this.isRolling = true;
    this.rollStartTime = millis();
    
    // Apply random forces to each die
    for (let i = 0; i < this.dice.length; i++) {
      const die = this.dice[i];
      
      // Random linear velocity
      die.velocity = createVector(
        random(-5, 5),
        random(-5, 5),
        random(-5, 5)
      );
      
      // Random angular velocity
      die.angularVelocity = createVector(
        random(-0.2, 0.2),
        random(-0.2, 0.2),
        random(-0.2, 0.2)
      );
      
      // Note: We don't set new random values here anymore
      // Values are set by the clock system
    }
  }
  
  /**
   * Set die rotation to show a specific value face-up
   * @param {Object} die - Die object to set rotation for
   * @param {number} value - Die value to show (1-6)
   */
  setDieRotationForValue(die, value) {
    // Standard dice have opposite faces summing to 7
    // Set rotation to show the specified value on top
    switch(value) {
      case 1: // 1 on top (6 on bottom)
        die.targetRotX = 0;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
      case 2: // 2 on top (5 on bottom)
        die.targetRotX = HALF_PI;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
      case 3: // 3 on top (4 on bottom)
        die.targetRotX = 0;
        die.targetRotY = HALF_PI;
        die.targetRotZ = 0;
        break;
      case 4: // 4 on top (3 on bottom)
        die.targetRotX = 0;
        die.targetRotY = -HALF_PI;
        die.targetRotZ = 0;
        break;
      case 5: // 5 on top (2 on bottom)
        die.targetRotX = -HALF_PI;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
      case 6: // 6 on top (1 on bottom)
        die.targetRotX = PI;
        die.targetRotY = 0;
        die.targetRotZ = 0;
        break;
    }
  }
  
  /**
   * Update dice physics
   */
  update() {
    // Calculate time since last update for frame-rate independent physics
    const currentTime = millis();
    const deltaTime = (currentTime - this.lastUpdateTime) / 16; // Normalize to 60fps
    this.lastUpdateTime = currentTime;
    
    // Calculate roll progress for animations
    const rollProgress = this.isRolling ? 
      constrain((currentTime - this.rollStartTime) / this.rollDuration, 0, 1) : 1;
    
    // Physics constants
    const containerRadius = this.containerSize / 2;
    const damping = 0.95;        // Velocity reduction factor
    const angularDamping = 0.9;  // Rotation reduction factor
    
    // Update each die
    for (let i = 0; i < this.dice.length; i++) {
      const die = this.dice[i];
      
      if (this.isRolling) {
        // Update position based on velocity
        die.x += die.velocity.x * deltaTime;
        die.y += die.velocity.y * deltaTime;
        die.z += die.velocity.z * deltaTime;
        
        // Update rotation based on angular velocity
        die.rotX += die.angularVelocity.x * deltaTime;
        die.rotY += die.angularVelocity.y * deltaTime;
        die.rotZ += die.angularVelocity.z * deltaTime;
        
        // Check if die is outside container bounds
        const distFromCenter = sqrt(die.x * die.x + die.y * die.y + die.z * die.z);
        if (distFromCenter > containerRadius - this.diceSize/2) {
          // Calculate normal vector pointing from center to die
          const nx = die.x / distFromCenter;
          const ny = die.y / distFromCenter;
          const nz = die.z / distFromCenter;
          
          // Move die back to boundary
          die.x = nx * (containerRadius - this.diceSize/2);
          die.y = ny * (containerRadius - this.diceSize/2);
          die.z = nz * (containerRadius - this.diceSize/2);
          
          // Reflect velocity vector for bounce
          const dotProduct = die.velocity.x * nx + die.velocity.y * ny + die.velocity.z * nz;
          die.velocity.x -= 2 * dotProduct * nx;
          die.velocity.y -= 2 * dotProduct * ny;
          die.velocity.z -= 2 * dotProduct * nz;
          
          // Apply extra damping for collision
          die.velocity.mult(damping);
        }
        
        // Apply general damping
        die.velocity.mult(damping);
        die.angularVelocity.mult(angularDamping);
        
        // Check if rolling has completed
        if (rollProgress >= 1) {
          this.isRolling = false;
        }
      } else {
        // If not rolling, position dice in a triangle formation
        const angle = TWO_PI / 3 * i;
        const radius = containerRadius * 0.4;
        
        const targetX = cos(angle) * radius;
        const targetY = sin(angle) * radius;
        
        // Smoothly interpolate to target position
        die.x = lerp(die.x, targetX, 0.05);
        die.y = lerp(die.y, targetY, 0.05);
        die.z = lerp(die.z, 0, 0.05);
        
        // Smoothly interpolate to target rotation
        die.rotX = lerp(die.rotX, die.targetRotX, 0.1);
        die.rotY = lerp(die.rotY, die.targetRotY, 0.1);
        die.rotZ = lerp(die.rotZ, die.targetRotZ, 0.1);
      }
    }
  }
  
  /**
   * Display dice in 3D space
   */
  display() {
    // Update physics
    this.update();
    
    push();
    
    // Draw dice container (green circle)
    push();
    translate(0, 0, 10);
    rotateX(HALF_PI);
    fill(this.containerColor);
    noStroke();
    ellipse(0, 0, this.containerSize, this.containerSize);
    pop();
    
    // Apply any active animation effects
    let effectValues = { scale: 1, rotation: 0, colorShift: 0, shake: 0 };
    if (typeof animationSystem !== 'undefined') {
      effectValues = animationSystem.getEffectValues();
    }
    
    // Apply animation shake effect
    translate(random(-effectValues.shake, effectValues.shake), 
              random(-effectValues.shake, effectValues.shake));
    
    // Draw each die
    for (let i = 0; i < this.dice.length; i++) {
      const die = this.dice[i];
      
      push();
      // Position die
      translate(die.x, die.y, die.z + 15);
      
      // Apply rotation
      rotateX(die.rotX + effectValues.rotation);
      rotateY(die.rotY + effectValues.rotation);
      rotateZ(die.rotZ);
      
      // Apply scale effect
      scale(effectValues.scale);
      
      // Draw die cube
      fill(255);
      stroke(200);
      strokeWeight(0.5);
      box(this.diceSize);
      
      // Draw dots on die faces
      this.drawDieFaces(this.diceSize/2);
      
      pop();
    }
    
    pop();
  }
  
  /**
   * Draw dots on all faces of a die
   * @param {number} size - Half the side length of the die
   */
  drawDieFaces(size) {
    const dotSize = size * 0.15;  // Size of dots
    const dotOffset = size * 0.6;  // Offset from center for dots
    
    fill(0);  // Black dots
    noStroke();
    
    // Face 1 (front) - 1 dot in center
    push();
    translate(0, 0, size + 0.1);
    ellipse(0, 0, dotSize);
    pop();
    
    // Face 2 (right) - 2 dots diagonal
    push();
    translate(size + 0.1, 0, 0);
    rotateY(HALF_PI);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    pop();
    
    // Face 3 (top) - 3 dots diagonal + center
    push();
    translate(0, -size - 0.1, 0);
    rotateX(HALF_PI);
    ellipse(0, 0, dotSize);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    pop();
    
    // Face 4 (bottom) - 4 dots in corners
    push();
    translate(0, size + 0.1, 0);
    rotateX(-HALF_PI);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    ellipse(dotOffset/2, -dotOffset/2, dotSize);
    ellipse(-dotOffset/2, dotOffset/2, dotSize);
    pop();
    
    // Face 5 (left) - 5 dots (4 corners + center)
    push();
    translate(-size - 0.1, 0, 0);
    rotateY(-HALF_PI);
    ellipse(0, 0, dotSize);
    ellipse(dotOffset/2, dotOffset/2, dotSize);
    ellipse(-dotOffset/2, -dotOffset/2, dotSize);
    ellipse(dotOffset/2, -dotOffset/2, dotSize);
    ellipse(-dotOffset/2, dotOffset/2, dotSize);
    pop();
    
    // Face 6 (back) - 6 dots (2 columns of 3)
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
   * Map a time value to dice arrangement
   * @param {number} hour - Current hour (0-11)
   * @param {number} minute - Current minute (0-59)
   * @param {number} second - Current second (0-59)
   */
  mapTimeToArrangement(hour, minute, second) {
    // Hour determines position
    const hourAngle = map(hour % 12, 0, 12, 0, TWO_PI) - HALF_PI;
    
    // Minute determines value
    // Map to sum of 3 dice (3-18)
    const minuteSum = floor(map(minute, 0, 60, 3, 19));
    
    // Second determines rotation
    const secondAngle = map(second, 0, 60, 0, TWO_PI);
    
    // Calculate positions based on hour
    const positions = [];
    const containerRadius = this.containerSize / 2;
    const baseX = cos(hourAngle) * (containerRadius * 0.6);
    const baseY = sin(hourAngle) * (containerRadius * 0.6);
    
    // Distribute dice around base position
    for (let i = 0; i < this.diceCount; i++) {
      const angle = hourAngle + i * TWO_PI / this.diceCount;
      positions.push({
        x: baseX + cos(angle) * this.diceSize,
        y: baseY + sin(angle) * this.diceSize,
        z: 0
      });
    }
    
    // Calculate values based on minute
    const values = this.distributeSumAcrossDice(minuteSum, this.diceCount);
    
    // Apply to dice
    for (let i = 0; i < this.diceCount; i++) {
      // Only change values when not rolling
      if (!this.isRolling) {
        // Set position targets
        this.dice[i].x = lerp(this.dice[i].x, positions[i].x, 0.05);
        this.dice[i].y = lerp(this.dice[i].y, positions[i].y, 0.05);
        this.dice[i].z = lerp(this.dice[i].z, positions[i].z, 0.05);
        
        // Update die value and rotation
        if (this.dice[i].value !== values[i]) {
          this.dice[i].value = values[i];
          this.setDieRotationForValue(this.dice[i], values[i]);
        }
      }
    }
  }
  
  /**
   * Distribute a target sum across dice values
   * @param {number} targetSum - Sum to distribute (3-18 for 3 dice)
   * @param {number} numDice - Number of dice
   * @returns {Array} Array of dice values that sum to targetSum
   */
  distributeSumAcrossDice(targetSum, numDice) {
    // Constrain to valid range
    targetSum = constrain(targetSum, numDice, numDice * 6);
    
    // Start with all dice at 1
    const values = Array(numDice).fill(1);
    let remaining = targetSum - numDice;
    
    // Distribute remaining value
    while (remaining > 0) {
      // Find die with lowest value
      const minIndex = values.indexOf(Math.min(...values));
      
      // Increment if not at maximum
      if (values[minIndex] < 6) {
        values[minIndex]++;
        remaining--;
      } else {
        // Cannot distribute further
        break;
      }
    }
    
    // Shuffle the values for variety
    return this.shuffleArray([...values]);
  }
  
  /**
   * Shuffle array elements randomly
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random(i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  /**
   * Check if mouse is over dice container
   * @returns {boolean} True if mouse is over container
   */
  isMouseOver() {
    // Calculate distance from mouse to center of container
    const mouseXCanvas = mouseX - width/2;
    const mouseYCanvas = mouseY - height/2;
    const dist = sqrt(mouseXCanvas * mouseXCanvas + mouseYCanvas * mouseYCanvas);
    
    // Check if within container radius
    return dist < this.containerSize/2;
  }
  
  /**
   * Handle mouse click on dice
   * @returns {boolean} True if dice were clicked
   */
  handleClick() {
    if (this.isMouseOver()) {
      this.roll();
      return true;
    }
    return false;
  }
} 