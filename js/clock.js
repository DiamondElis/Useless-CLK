// clock.js - Time calculation and mapping logic

/**
 * Maps time values to visual properties
 * This is the core "useless clock" logic that translates
 * conventional time into the abstract dice representation
 */
class ClockSystem {
  constructor() {
    // Time values
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.milliseconds = 0;
    
    // Angles for traditional clock calculations
    this.hourAngle = 0;
    this.minuteAngle = 0;
    this.secondAngle = 0;
    
    // Tracking for animations
    this.lastSecond = -1;
    this.lastMinute = -1;
    this.lastHour = -1;
    
    // Visual mapping properties
    this.dicePositions = [];
    this.diceValues = [];
    this.diceRotations = [];
    this.colorShift = 0;
    
    // Initialize mapping arrays
    this.initMappings();
  }
  
  /**
   * Initialize the mappings between time and dice properties
   */
  initMappings() {
    // Create 12 positions for hours mapping (in radians)
    for (let i = 0; i < 12; i++) {
      const angle = map(i, 0, 12, 0, TWO_PI) - HALF_PI;
      this.dicePositions.push({ 
        x: cos(angle) * 40, 
        y: sin(angle) * 40,
        z: 0
      });
    }
    
    // Create values mappings for minutes (0-59)
    this.diceValues = [
      // Map minutes to sum of three dice
      // We'll implement a smart algorithm later
    ];
    
    // Create rotation mappings for seconds
    for (let i = 0; i < 60; i++) {
      const rotation = map(i, 0, 60, 0, TWO_PI);
      this.diceRotations.push({
        x: cos(rotation) * PI,
        y: sin(rotation) * PI,
        z: rotation
      });
    }
  }
  
  /**
   * Update time values and calculate mappings
   */
  update() {
    // Get current time
    this.hours = hour() % 12;
    this.minutes = minute();
    this.seconds = second();
    this.milliseconds = millis() % 1000;
    
    // Calculate traditional clock angles
    this.hourAngle = map(this.hours + this.minutes/60, 0, 12, 0, TWO_PI) - HALF_PI;
    this.minuteAngle = map(this.minutes + this.seconds/60, 0, 60, 0, TWO_PI) - HALF_PI;
    this.secondAngle = map(this.seconds + this.milliseconds/1000, 0, 60, 0, TWO_PI) - HALF_PI;
    
    // Detect time changes for triggering animations
    if (this.seconds !== this.lastSecond) {
      this.onSecondChange();
      this.lastSecond = this.seconds;
      
      if (this.minutes !== this.lastMinute) {
        this.onMinuteChange();
        this.lastMinute = this.minutes;
        
        if (this.hours !== this.lastHour) {
          this.onHourChange();
          this.lastHour = this.hours;
        }
      }
    }
  }
  
  /**
   * Handle second change events
   */
  onSecondChange() {
    // Trigger second-based animations
    if (typeof animationSystem !== 'undefined') {
      animationSystem.triggerEffect('secondTick');
    }
  }
  
  /**
   * Handle minute change events
   */
  onMinuteChange() {
    // Trigger minute-based animations
    if (typeof animationSystem !== 'undefined') {
      animationSystem.triggerEffect('minuteChange');
    }
    
    // Update dice values to represent new minute
    this.mapMinutesToDice();
  }
  
  /**
   * Handle hour change events
   */
  onHourChange() {
    // Trigger hour-based animations
    if (typeof animationSystem !== 'undefined') {
      animationSystem.triggerEffect('hourChange');
    }
    
    // Update dice positions to represent new hour
    this.mapHoursToDice();
  }
  
  /**
   * Map current hour to dice positions
   * This defines how the hour is represented by dice positions
   */
  mapHoursToDice() {
    if (typeof diceSystem === 'undefined') return;
    
    // Map hour to target position for dice arrangement
    const targetPosition = this.dicePositions[this.hours];
    
    // Distribute dice around the hour position
    const spread = 15; // Spacing between dice
    
    // Calculate positions for each die
    const positions = [];
    
    // We're using 3 dice, so create 3 positions
    positions.push({
      x: targetPosition.x,
      y: targetPosition.y - spread,
      z: targetPosition.z
    });
    
    positions.push({
      x: targetPosition.x - spread,
      y: targetPosition.y + spread,
      z: targetPosition.z
    });
    
    positions.push({
      x: targetPosition.x + spread,
      y: targetPosition.y + spread,
      z: targetPosition.z
    });
    
    // Return the positions for dice system to use
    return positions;
  }
  
  /**
   * Map current minutes to dice values
   * This defines how minutes are represented by dice values
   */
  mapMinutesToDice() {
    if (typeof diceSystem === 'undefined') return;
    
    // Calculate minutes of day (0-1439)
    const minutesOfDay = this.hours * 60 + this.minutes;
    
    // If this is a new minute, trigger dice roll
    if (this.minutes !== this.lastMinute) {
      // Trigger dice roll animation
      if (typeof diceSystem !== 'undefined') {
        diceSystem.roll();
      }
      
      // Map the minute of day to dice values
      if (typeof diceSystem !== 'undefined' && diceSystem.dice.length === 3) {
        // For 3 dice (values 1-6 each), we need to represent 0-1439 minutes
        // We can use a modular approach
        
        // First die: represents hundreds place (0-14 mapped to repeating 1-6)
        const firstDieValue = (Math.floor(minutesOfDay / 100) % 6) + 1;
        
        // Second die: represents tens place (0-9 mapped to repeating 1-6)
        const secondDieValue = (Math.floor((minutesOfDay % 100) / 10) % 6) + 1;
        
        // Third die: represents ones place (0-9 mapped to repeating 1-6)
        const thirdDieValue = ((minutesOfDay % 10) % 6) + 1;
        
        // Set dice values
        diceSystem.dice[0].value = firstDieValue;
        diceSystem.dice[1].value = secondDieValue;
        diceSystem.dice[2].value = thirdDieValue;
        
        // Set target rotations for each die
        diceSystem.setDieRotationForValue(diceSystem.dice[0], firstDieValue);
        diceSystem.setDieRotationForValue(diceSystem.dice[1], secondDieValue);
        diceSystem.setDieRotationForValue(diceSystem.dice[2], thirdDieValue);
      }
    }
  }
  
  /**
   * Map current seconds to dice rotations
   * This defines how seconds are represented by dice rotations
   */
  mapSecondsToDice() {
    if (typeof diceSystem === 'undefined') return;
    
    // Get rotation mapping for current second
    const baseRotation = this.diceRotations[this.seconds];
    
    // Add smooth interpolation within the second
    const progress = this.milliseconds / 1000;
    const nextSecond = (this.seconds + 1) % 60;
    const nextRotation = this.diceRotations[nextSecond];
    
    // Interpolate between current and next rotation
    const rotations = [];
    
    // Create slightly different rotations for each die
    for (let i = 0; i < 3; i++) {
      const offset = i * TWO_PI / 3; // Distribute rotations
      
      rotations.push({
        x: lerp(baseRotation.x, nextRotation.x, progress) + cos(offset) * 0.2,
        y: lerp(baseRotation.y, nextRotation.y, progress) + sin(offset) * 0.2,
        z: lerp(baseRotation.z, nextRotation.z, progress) + offset
      });
    }
    
    // Return the rotations for dice system to use
    return rotations;
  }
  
  /**
   * Distribute a target sum across a specified number of dice
   * @param {number} targetSum - The sum to distribute
   * @param {number} numDice - Number of dice to distribute across
   * @returns {Array} Array of dice values
   */
  distributeSumAcrossDice(targetSum, numDice) {
    // Constraints: Each die must have value 1-6
    // Minimum possible sum: numDice * 1
    // Maximum possible sum: numDice * 6
    
    // Constrain targetSum to valid range
    targetSum = constrain(targetSum, numDice, numDice * 6);
    
    // Initialize all dice to minimum value
    const values = Array(numDice).fill(1);
    
    // Remaining value to distribute
    let remaining = targetSum - numDice;
    
    // Distribute remaining value, making sure no die exceeds 6
    while (remaining > 0) {
      // Find index of die with lowest current value
      const minIndex = values.indexOf(Math.min(...values));
      
      // Increment if we can without exceeding 6
      if (values[minIndex] < 6) {
        values[minIndex]++;
        remaining--;
      } else {
        // If all dice are at maximum (6), we can't distribute further
        break;
      }
    }
    
    // Shuffle the values to add variety
    return this.shuffleArray([...values]);
  }
  
  /**
   * Utility function to shuffle an array
   * @param {Array} array - The array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  /**
   * Get time values as a formatted string
   * @returns {string} Formatted time string
   */
  getTimeString() {
    const h = this.hours === 0 ? 12 : this.hours;
    const m = this.minutes < 10 ? `0${this.minutes}` : this.minutes;
    const s = this.seconds < 10 ? `0${this.seconds}` : this.seconds;
    
    return `${h}:${m}:${s}`;
  }
  
  /**
   * Convert time to color values
   * @returns {Object} RGB color values
   */
  getTimeColor() {
    // Map hours to hue (0-360)
    const hue = map(this.hours, 0, 12, 0, 360);
    
    // Map minutes to saturation (50-100)
    const saturation = map(this.minutes, 0, 60, 50, 100);
    
    // Map seconds to brightness (60-100)
    const brightness = map(this.seconds, 0, 60, 60, 100);
    
    // Convert HSB to RGB
    colorMode(HSB, 360, 100, 100);
    const col = color(hue, saturation, brightness);
    colorMode(RGB, 255); // Reset to RGB mode
    
    return {
      r: red(col),
      g: green(col),
      b: blue(col)
    };
  }
} 