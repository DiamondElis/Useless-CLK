# 🎲 Useless Dice Clock

![Project Banner](./assets/banner.png)

## 📌 Overview

A visually striking, interactive "useless clock" web experience inspired by the aesthetic of luxury dice watches. This project reimagines time-telling through abstract dice representations, creating a beautiful but deliberately impractical way to visualize the passage of time.

**Live demo**: [https://username.github.io/useless-dice-clock](https://username.github.io/useless-dice-clock)

![Preview GIF](./assets/preview.gif)

## 🌟 Features

- **Interactive 3D Dice**: Physically simulated dice that respond to clicks and represent time in abstract ways
- **Mesmerizing Animations**: Rich visual effects including particle systems, wave patterns, and dynamic lighting
- **Responsive Design**: Fully adaptable layout with touch optimization for mobile devices
- **Time-Based Transformations**: Visual elements that subtly transform based on hours, minutes, and seconds
- **Creative Time Visualization**: A beautiful but deliberately "useless" way to tell time
- **Custom Typography**: Elegant Mincho-style fonts with hand-drawn and Art Deco influences

## 🛠️ Technology Stack

- **p5.js**: Core creative coding library for visualization and interactivity
- **WEBGL**: For 3D rendering of the watch face and dice
- **HTML5/CSS3**: Modern layout techniques and animations
- **JavaScript ES6+**: Clean, modular code structure
- **p5.sound** (optional): For subtle audio feedback
- **Web Fonts**: Integration of premium Mincho-style typefaces

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge recommended)
- Basic understanding of HTML, CSS, and JavaScript
- Local development server (recommended)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/username/useless-dice-clock.git
   cd useless-dice-clock
   ```

2. **Launch a local development server:**
   
   Using Python:
   ```bash
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```
   
   Or using Node.js:
   ```bash
   # Install if needed
   npm install -g http-server
   
   # Run
   http-server
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8000` (or the port shown in your terminal)

### Project Structure

```
useless-dice-clock/
├── index.html           # Main HTML structure
├── css/                 # Stylesheets
│   ├── main.css         # Core styles
│   ├── animations.css   # Animation definitions
│   └── responsive.css   # Media queries
├── js/                  # JavaScript files
│   ├── main.js          # Entry point and core functionality
│   ├── clock.js         # Time calculation and mapping
│   ├── dice.js          # Dice physics and rendering
│   ├── animations.js    # Animation controllers
│   └── utils.js         # Helper functions
├── assets/              # Media files
│   ├── images/          # Background textures, UI elements
│   ├── fonts/           # Custom typography
│   └── sounds/          # Optional audio effects
└── lib/                 # External libraries
    └── p5.js            # p5.js library files
```

## 📱 Responsive Design

The project is fully responsive with specific optimizations:

- **Desktop**: Full 3D experience with hover effects and high-detail animations
- **Tablet**: Adapted layout with touch-friendly controls
- **Mobile**: Streamlined interface with gyroscope integration and performance optimizations

## 💻 Development Guide

### Core Components

1. **Clock Engine (`clock.js`)**
   - Handles time calculations
   - Maps temporal data to visual properties
   - Manages timing and synchronization

2. **Dice System (`dice.js`)**
   - 3D dice modeling and rendering
   - Physics simulation for realistic movement
   - Mapping of time values to dice properties

3. **Animation Controller (`animations.js`)**
   - Manages transitions and effects
   - Handles scroll-based animations
   - Controls background patterns and particles

### Adding New Visualizations

To create a new time visualization style:

1. Create a new class in `js/visualizations/`
2. Implement the standard visualization interface
3. Register your visualization in `main.js`
4. Add UI controls in the gallery section

Example:

```javascript
class BinaryDiceVisualization extends BaseVisualization {
  constructor() {
    super('binary');
    this.description = "Represents time in binary using dice patterns";
  }
  
  update(hours, minutes, seconds) {
    // Your implementation here
  }
  
  render() {
    // Your rendering code here
  }
}

// Register in main.js
visualizationManager.register(new BinaryDiceVisualization());
```

### Performance Optimization

For optimal performance:

- Use `requestAnimationFrame` for animations
- Implement throttling for heavy calculations
- Consider using offscreen canvas for complex rendering
- Adjust detail levels based on device capabilities
- Lazy-load non-essential components

## 🧪 Testing

The project includes basic testing setup:

- **Visual Testing**: Compare renders against reference images
- **Performance Testing**: FPS monitoring and bottleneck identification
- **Cross-Browser Testing**: Verification across major browsers
- **Responsive Testing**: Device simulation for various screen sizes

Run tests with:

```bash
npm test
```

## 📚 Learning Resources

This project demonstrates several advanced creative coding techniques:

- **3D in p5.js**: Working with WEBGL mode and 3D primitives
- **Physics Simulation**: Basic rigid body physics for dice
- **Shader Programming**: Custom GLSL for special effects
- **Creative Data Visualization**: Abstract representation of time data
- **Interaction Design**: Creating engaging user experiences

Recommended resources:

- [The Nature of Code](https://natureofcode.com/) by Daniel Shiffman
- [p5.js Reference](https://p5js.org/reference/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Assignment Context

This project was created for a creative coding class assignment to develop a "useless clock" - a visualization that shows time in a non-traditional and purposefully impractical way. The goal was to question conventional time representation while implementing creative coding techniques with p5.js.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Inspired by the [FM12-GDGD dice watch](https://number11-dinks.myshopify.com/en/products/fm12-gdgd)
- Thanks to [Creative Coding course] for the assignment prompt
- p5.js community for examples and inspiration
- Typography featuring:
  - [Craft Mincho](https://www.freejapanesefont.com/craft-mincho-free-download/) - A hand-crafted Mincho typeface
  - [Shippori Mincho](https://fonts.google.com/specimen/Shippori+Mincho) - An old-style Mincho typeface 
  - [Hina Mincho](https://fonts.google.com/specimen/Hina+Mincho) - An old-fashioned Japanese font
- [Additional credits for any resources used]

---

Made with ❤️ and lots of coffee by [Your Name]

```
                    _______
                   /       \
                  /  O   O  \
                 /     ∆     \
                /  _________  \
                \____________/
                 USELESS CLOCK
``` 