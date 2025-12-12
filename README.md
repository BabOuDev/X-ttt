# X Tic Tac Toe - Multiplayer Game with 2D & 3D Modes

A full-featured multiplayer tic-tac-toe game web app built with React.js and Node.js, featuring both classic 2D and immersive 3D cube gameplay.

## ✨ Features

### 🎮 Game Modes
- **2D Classic Mode** - Traditional 3×3 tic-tac-toe grid
- **3D Cube Mode** - Revolutionary 3×3×3 cube with 49 winning combinations!
  - Interactive 3D visualization using Three.js
  - Full camera rotation and zoom controls
  - 90° snap rotation buttons
  - Right-click drag to orbit camera

### 🤖 AI Difficulty Levels
- **Easy** - Random moves, perfect for beginners
- **Medium** - Smart AI that evaluates moves and picks from top 2 options
- **Hard** - Unbeatable AI that always plays optimally

### 🎯 Multiplayer Support
- **Live Multiplayer** - Real-time gameplay via Socket.IO
- **vs Computer** - Play against AI with selectable difficulty
- Automatic player pairing for online matches

### 🎉 Animations & Visual Effects
- **Win Animation** - Colorful confetti celebration with victory text
- **Loss Animation** - Atmospheric defeat effect with falling particles
- Smooth piece animations and hover effects
- Player-specific highlight colors (red for X, blue for O)

### 🎨 Advanced 3D Features
- Semi-transparent glass-like cube cells
- Dual-layer rendering (wireframe + fill)
- Strategic positioning indicators (center, corners, face centers)
- Smaller bounding boxes for precise cell selection
- Mobile-responsive controls

## 🛠️ Tech Stack

### Front End
- React 15.2.0
- Three.js r77 (vanilla, for 3D rendering)
- Webpack + Babel
- React Router
- Ampersand
- SASS/SCSS
- Socket.IO Client
- Jest (testing)

### Back End
- Node.js 10.24.1
- Socket.IO
- Express

## 📁 Folder Structure

- **WS** - Server side and compiled front end
- **react_ws_src** - React development source and testing
  - `src/views/ttt/GameMain.js` - 2D game logic
  - `src/views/ttt/GameMain3D.js` - 3D game logic with Three.js
  - `src/helpers/win_sets_3d.js` - 49 3D winning combinations
  - `src/sass/game3d.scss` - 3D game styling

## 🚀 Getting Started

### Prerequisites
- Node.js 10.24.1 (enforced via package.json engines)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/xims/X-ttt.git
cd X-ttt
```

2. Install server dependencies
```bash
cd WS
npm install
```

3. Install client dependencies
```bash
cd ../react_ws_src
npm install
```

### Running the Application

1. Start the server (in one terminal)
```bash
cd WS
npm start
# Server runs on http://localhost:3001
```

2. Start the development client (in another terminal)
```bash
cd react_ws_src
npm start
# Client runs on http://localhost:3000
```

3. Open http://localhost:3000 in your browser

### Configuration

The app is configurable via XML file:
- Development: `react_ws_src/static/ws_conf.xml`
- Production: `WS/public/ws_conf.xml`

Socket.IO server URL is configured at:
```xml
<SOCKET__io  u='http://localhost:3001'  />
```

## 🎲 How to Play

1. **Enter your name**
2. **Choose game mode:**
   - 2D Classic or 3D Cube
   - Live Multiplayer or vs Computer
3. **Select difficulty** (for vs Computer mode)
4. **Start playing!**
   - Click cells to place your mark
   - In 3D mode: Right-click + drag to rotate camera
   - Use control buttons for 90° rotations
5. **Play Again** button to restart with same settings

## 🏆 3D Mode Controls

- **Left-click** - Place your mark on a cell
- **Right-click + drag** - Rotate camera around the cube
- **Arrow buttons** - 90° snap rotations (up, down, left, right)
- **+/- buttons** - Zoom in/out
- **Rotate button** - Toggle auto-rotation
- **Center button** - Reset camera to default view

## 📊 AI Strategy

The AI evaluates moves based on:
- **Immediate wins** (Score: 1000)
- **Blocking opponent wins** (Score: 900)
- **Setting up future wins** (Score: 100 for 2-in-a-row)
- **Positional advantages:**
  - 2D: Center (30 pts), Corners (20 pts)
  - 3D: Cube center (50 pts), Face centers (35 pts), Corners (25 pts)

## 🌐 View Online

https://x-ttt.herokuapp.com/

Configuration: https://x-ttt.herokuapp.com/ws_conf.xml

---

## 📝 License

For demonstration purposes only.
