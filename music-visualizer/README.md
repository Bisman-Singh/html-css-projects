# Music Visualizer

A real-time audio visualizer using the Web Audio API and Canvas, built with pure HTML, CSS, and JavaScript.

## Features

- **Load audio files** — supports mp3, wav, and other browser-supported formats
- **Web Audio API** — uses AudioContext, AnalyserNode, and getByteFrequencyData
- **Three visualization modes**:
  1. **Bars** — frequency spectrum bar graph with gradient colors
  2. **Radial** — circular visualization radiating from center
  3. **Wave** — waveform line with glow effects
- **Play/Pause** controls (button or spacebar)
- **Volume slider**
- **Progress bar** — click to seek, shows current time and duration
- **Responsive canvas** — fills the entire viewport
- **Idle animation** — ambient particle ring when no audio is playing
- **Dark background** with vibrant neon purple-to-cyan gradients

## Usage

Open `index.html` in any modern browser. Click "Load Audio" to select an audio file, then enjoy the visualizations. No build tools or dependencies required.
