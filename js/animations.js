// animations.js - Animation controllers for p5.js sketch

/**
 * AnimationSystem handles visual effects and transitions
 * This system manages effects triggered by time events and user interactions
 */
class AnimationSystem {
  constructor() {
    // Storage for effect definitions
    this.effects = {};
    
    // Track active animations
    this.activeEffects = [];
    
    // Initialize all effect definitions
    this.defineEffects();
  }
  
  /**
   * Define all available animation effects
   */
  defineEffects() {
    // Second tick effect - subtle pulse when second changes
    this.effects.secondTick = {
      duration: 500,  // Effect lasts 500ms
      update: (progress) => {
        // Create ease-in-out curve for smooth animation
        const eased = this.easeInOutSine(progress);
        
        // Return transformation values
        return {
          scale: 1 + sin(eased * PI) * 0.05,  // Subtle scale pulse
          rotation: 0,
          colorShift: 0,
          shake: 0
        };
      }
    };
    
    // Minute change effect - stronger pulse 
    this.effects.minuteChange = {
      duration: 1000,  // Effect lasts 1 second
      update: (progress) => {
        const eased = this.easeInOutSine(progress);
        return {
          scale: 1 + sin(eased * PI) * 0.1,  // Stronger scale pulse
          rotation: sin(eased * TWO_PI) * 0.05,  // Slight rotation
          colorShift: sin(eased * PI) * 20,  // Subtle color shift
          shake: 0
        };
      }
    };
    
    // Hour change effect - major animation
    this.effects.hourChange = {
      duration: 2000,  // Effect lasts 2 seconds
      update: (progress) => {
        const eased = this.easeInOutSine(progress);
        return {
          scale: 1 + sin(eased * PI) * 0.2,  // Major scale pulse
          rotation: sin(eased * TWO_PI) * 0.1,  // Stronger rotation
          colorShift: sin(eased * PI) * 50,  // Significant color shift
          shake: sin(eased * PI * 2) * 2  // Slight shake
        };
      }
    };
    
    // Dice roll effect - physical shaking
    this.effects.diceRoll = {
      duration: 1000,  // Effect lasts 1 second
      update: (progress) => {
        // More shake at beginning, tapering off
        const shakeAmount = sin(progress * PI * 5) * (1 - progress) * 5;
        return {
          scale: 1,
          rotation: 0,
          colorShift: 0,
          shake: shakeAmount
        };
      }
    };
    
    // Background wave effect - subtle background animation
    this.effects.backgroundWave = {
      duration: 10000,  // Long-lasting effect (10 seconds)
      update: (progress) => {
        // Continuous wave effect that loops
        return {
          scale: 1,
          rotation: 0,
          colorShift: sin(progress * TWO_PI) * 10,
          shake: 0
        };
      }
    };
  }
  
  /**
   * Trigger a named animation effect
   * @param {string} effectName - Name of effect to trigger
   * @param {Object} params - Optional parameters for effect
   */
  triggerEffect(effectName, params = {}) {
    // Check if effect exists
    if (this.effects[effectName]) {
      // Add to active effects
      this.activeEffects.push({
        name: effectName,
        startTime: millis(),
        params: params,
        effect: this.effects[effectName]
      });
    }
  }
  
  /**
   * Update all active animations
   */
  update() {
    const currentTime = millis();
    
    // Update each active effect
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      const elapsedTime = currentTime - effect.startTime;
      const progress = constrain(elapsedTime / effect.effect.duration, 0, 1);
      
      // Remove completed effects
      if (progress >= 1) {
        this.activeEffects.splice(i, 1);
      }
    }
  }
  
  /**
   * Get combined values from all active effects
   * @returns {Object} Combined transformation values
   */
  getEffectValues() {
    // Default values (no transformation)
    let result = {
      scale: 1,
      rotation: 0,
      colorShift: 0,
      shake: 0
    };
    
    // No active effects, return defaults
    if (this.activeEffects.length === 0) {
      return result;
    }
    
    // Combine all active effects
    this.activeEffects.forEach(activeEffect => {
      const progress = constrain(
        (millis() - activeEffect.startTime) / activeEffect.effect.duration, 
        0, 
        1
      );
      
      // Get values from effect's update function
      const values = activeEffect.effect.update(progress, activeEffect.params);
      
      // Combine values (multiplicative for scale, additive for others)
      if (values.scale !== undefined) result.scale *= values.scale;
      if (values.rotation !== undefined) result.rotation += values.rotation;
      if (values.colorShift !== undefined) result.colorShift += values.colorShift;
      if (values.shake !== undefined) result.shake += values.shake;
    });
    
    return result;
  }
  
  /**
   * Easing function for smooth animations
   * @param {number} t - Progress value (0-1)
   * @returns {number} Eased value
   */
  easeInOutSine(t) {
    return -(cos(PI * t) - 1) / 2;
  }
  
  /**
   * Create particle effects
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} type - Particle type
   */
  createParticles(x, y, type = 'sparkle') {
    // Particle effects could be implemented here
    // This would create visual particles at the specified location
  }
}

/**
 * BackgroundAnimation handles the dynamic background patterns
 */
class BackgroundAnimation {
  constructor() {
    // Pattern properties
    this.waveCount = 30;  // Number of wave lines
    this.waveSpeed = 0.0001;  // Wave movement speed
    this.waveAmplitude = 2;  // Wave height
    
    // Color properties
    this.baseColor = color(230, 201, 146);  // Gold base color
    this.accentColor = color(245, 241, 230);  // Cream accent
  }
  
  /**
   * Draw background pattern
   * @param {number} ms - Current milliseconds for animation
   */
  draw(ms) {
    push();
    
    // Get effect values if animation system exists
    let colorShift = 0;
    if (typeof animationSystem !== 'undefined') {
      colorShift = animationSystem.getEffectValues().colorShift;
    }
    
    // Adjust colors based on animation
    const adjustedBase = color(
      red(this.baseColor) + colorShift,
      green(this.baseColor),
      blue(this.baseColor) - colorShift
    );
    
    // Draw wave pattern
    stroke(adjustedBase);
    strokeWeight(0.5);
    noFill();
    
    // Rotate pattern slowly
    const rotationSpeed = 0.00005;
    rotate(ms * rotationSpeed);
    
    // Draw multiple wave spirals
    for (let i = 0; i < this.waveCount; i++) {
      const radius = i * 5;
      const angle = i * 0.5;
      
      beginShape();
      for (let a = 0; a < TWO_PI * 2; a += 0.1) {
        // Calculate wave effect
        const waveEffect = sin(a * 3 + ms * this.waveSpeed) * this.waveAmplitude;
        const r = radius + waveEffect;
        
        // Calculate point coordinates
        const px = cos(a + angle) * r;
        const py = sin(a + angle) * r;
        
        // Add point to shape
        curveVertex(px, py);
      }
      endShape();
    }
    
    pop();
  }
}

/**
 * ParticleSystem manages decorative particles
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 50;
  }
  
  /**
   * Add a new particle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} properties - Particle properties
   */
  addParticle(x, y, properties = {}) {
    // Default properties
    const defaults = {
      size: random(2, 5),
      color: color(230, 201, 146, 150),  // Semi-transparent gold
      lifespan: random(1000, 3000),
      velocity: createVector(random(-1, 1), random(-1, 1)),
      rotation: random(TWO_PI)
    };
    
    // Merge with custom properties
    const particle = {...defaults, ...properties};
    particle.position = createVector(x, y);
    particle.birthtime = millis();
    
    // Add to particle array
    this.particles.push(particle);
    
    // Remove oldest particles if exceeded maximum
    if (this.particles.length > this.maxParticles) {
      this.particles.shift();
    }
  }
  
  /**
   * Update and display all particles
   */
  update() {
    const currentTime = millis();
    
    // Update each particle
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Calculate age
      const age = currentTime - particle.birthtime;
      
      // Remove expired particles
      if (age > particle.lifespan) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Calculate opacity based on age
      const opacity = map(age, 0, particle.lifespan, 1, 0);
      
      // Update position
      particle.position.add(particle.velocity);
      
      // Draw particle
      push();
      translate(particle.position.x, particle.position.y);
      rotate(particle.rotation + age * 0.001);
      
      // Set color with opacity
      const particleColor = color(
        red(particle.color),
        green(particle.color),
        blue(particle.color),
        255 * opacity
      );
      fill(particleColor);
      noStroke();
      
      // Draw shape
      ellipse(0, 0, particle.size);
      pop();
    }
  }
  
  /**
   * Create particles at mouse position
   */
  createMouseParticles() {
    // Create particles following mouse movement
    if (mouseIsPressed) {
      // More particles when mouse is pressed
      for (let i = 0; i < 3; i++) {
        this.addParticle(
          mouseX - width/2 + random(-10, 10), 
          mouseY - height/2 + random(-10, 10),
          {
            color: color(random(200, 255), random(180, 220), random(100, 150), 200),
            size: random(3, 8)
          }
        );
      }
    } else if (frameCount % 5 === 0 && dist(mouseX, mouseY, pmouseX, pmouseY) > 5) {
      // Occasional particles during mouse movement
      this.addParticle(
        mouseX - width/2, 
        mouseY - height/2,
        {
          color: color(230, 201, 146, 150),
          size: random(2, 4)
        }
      );
    }
  }
  
  /**
   * Create particles for time change effects
   * @param {string} type - Type of time change
   */
  createTimeParticles(type) {
    const count = type === 'second' ? 5 : type === 'minute' ? 10 : 20;
    const containerSize = 80;
    
    for (let i = 0; i < count; i++) {
      // Create particles in a circle around center
      const angle = random(TWO_PI);
      const distance = random(containerSize/4, containerSize/2);
      const x = cos(angle) * distance;
      const y = sin(angle) * distance;
      
      // Different colors based on type
      let particleColor;
      if (type === 'second') {
        particleColor = color(230, 201, 146, 150); // Gold
      } else if (type === 'minute') {
        particleColor = color(10, 77, 60, 150); // Green
      } else {
        particleColor = color(random(200, 255), random(180, 220), random(100, 150), 200); // Random
      }
      
      // Add particle with velocity away from center
      this.addParticle(x, y, {
        color: particleColor,
        velocity: createVector(cos(angle) * random(0.5, 2), sin(angle) * random(0.5, 2)),
        size: random(3, 8),
        lifespan: random(500, 1500)
      });
    }
  }
}

/**
 * ScrollAnimations handles animations triggered by scrolling
 */
class ScrollAnimations {
  constructor() {
    // Track which sections are in view
    this.sectionsInView = new Set();
    
    // Initialize intersection observer
    this.initIntersectionObserver();
    
    // Add scroll event listener
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }
  
  /**
   * Initialize intersection observer to detect elements entering viewport
   */
  initIntersectionObserver() {
    // Create observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add 'in-view' class to trigger CSS animations
          entry.target.classList.add('in-view');
          
          // Store section ID in our tracking Set
          this.sectionsInView.add(entry.target.id || entry.target.className);
          
          // Create special effects for section entrance
          this.createSectionEntranceEffect(entry.target);
        } else {
          // Remove from tracking when out of view
          this.sectionsInView.delete(entry.target.id || entry.target.className);
        }
      });
    }, { threshold: 0.2 }); // 20% visibility required
    
    // Observe all relevant sections
    document.querySelectorAll('.content-section, .gallery-grid, .sources-list').forEach(el => {
      observer.observe(el);
    });
  }
  
  /**
   * Handle scroll events
   */
  handleScroll() {
    // Add 'scrolled' class to body when scrolled down
    if (window.scrollY > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
    
    // Parallax effects could be added here
    this.updateParallaxElements();
  }
  
  /**
   * Create special effect when section enters viewport
   * @param {Element} section - DOM element entering viewport
   */
  createSectionEntranceEffect(section) {
    // We could add specific p5.js effects here when sections come into view
    // For now we'll rely on CSS animations
  }
  
  /**
   * Update elements with parallax scrolling effect
   */
  updateParallaxElements() {
    // Calculate parallax based on scroll position
    const scrollY = window.scrollY;
    
    // Apply to background elements
    document.querySelectorAll('.parallax-bg').forEach(el => {
      const speed = el.dataset.speed || 0.5;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
    
    // Apply to foreground elements
    document.querySelectorAll('.parallax-fg').forEach(el => {
      const speed = el.dataset.speed || -0.2;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }
  
  /**
   * Check if a specific section is in viewport
   * @param {string} sectionId - ID or class of section to check
   * @returns {boolean} Whether section is in view
   */
  isSectionInView(sectionId) {
    return this.sectionsInView.has(sectionId);
  }
} 