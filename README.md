# Electrode Cylinder Visualization

This project is an interactive 3D visualization of electrode cylinders using [Three.js](https://threejs.org/), a JavaScript library for 3D graphics, and [Vite](https://vitejs.dev/), a build tool for frontend development.

## Features

- **3D Electrode Cylinders**: Renders four vertically aligned electrode cylinders, two of which have side gaps.
- **Interactive Controls**:
  - **Mouse Interaction**:
    - Left Click: Rotate the scene.
    - Middle Click: Zoom in/out.
    - Right Click: Pan the scene.
    - Click on Electrodes: Change their color.
  - **Rotation Toggle**: Button to start/stop automatic rotation of the scene.
  - **Position Slider**: Slider to adjust the vertical position of the electrode group.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/PyExtr/threejs-vite.git
   cd threejs-vite
   ```

2. **Install Dependencies**:

   Ensure you have [Node.js](https://nodejs.org/) installed. Then, run:

   ```bash
   npm install
   ```

3. **Run the Development Server**:

   ```bash
   npm run dev
   ```

   Open your browser and navigate to `http://localhost:3000` to see the visualization.

## Usage

- **Rotate Scene**: Click and drag with the left mouse button.
- **Zoom**: Use the middle mouse button or scroll wheel.
- **Pan**: Click and drag with the right mouse button.
- **Change Electrode Color**: Click on an electrode to cycle through colors (grey, blue, red).
- **Toggle Rotation**: Click the "Start Rotation" button to initiate automatic rotation; click again to stop.
- **Adjust Position**: Use the slider at the bottom to move the electrode group vertically.

## Project Structure

- **`index.html`**: Main HTML file containing the canvas and UI elements.
- **`main.js`**: Primary JavaScript file initializing the scene, camera, renderer, and defining the 3D objects and interactions.
- **`style.css`**: CSS file for styling the UI components.
- **`package.json`**: Contains project metadata and dependencies.

## Dependencies

- [Three.js](https://threejs.org/): JavaScript 3D library.
- [Vite](https://vitejs.dev/): Frontend build tool.
- [dat.GUI](https://github.com/dataarts/dat.gui): Lightweight GUI for adjusting parameters (optional, for development purposes).
