<div align="center">
  <img src="public/logo.svg" alt="EarCheck Logo" width="120" />
  <h1>EarCheck - Headset Tester</h1>
  <p>A fast, secure, 100% client-side web application for testing headsets, microphones, and audio outputs directly in the browser.</p>
</div>

---

## 🎧 What is it?
EarCheck is a lightweight diagnostic tool designed for testing audio equipment (like Bluetooth headsets or standalone microphones) quickly. Because it processes audio entirely locally inside your browser, it guarantees **100% data privacy**—no audio recordings are ever uploaded or saved to any external servers.

It's perfect for QA teams, call centers, or anyone who wants to ensure their hardware is functioning properly before jumping into a meeting.

## ✨ Features
* **Live Volume Meter:** Visualize your microphone input levels in real-time.
* **Hardware Mute Detection:** Instantly see if your microphone is muted (supports hardware mute buttons).
* **Loopback Audio:** Hear yourself in real-time to check audio quality and latency.
* **Test Sounds:** Play distinct frequencies and chimes (sweep, high chime, low thump, ding-dong) to test headset speaker response.
* **Master Volume Control:** Precisely adjust the output volume of test sounds and playback.
* **Record & Playback:** Record short clips to hear exactly how you sound to others.

## 🛠️ How does it work?
The app leverages native web APIs to run completely in your browser without needing a backend server:
1. **WebRTC (`getUserMedia`):** Grabs the raw audio stream from your selected microphone.
2. **Web Audio API:** Analyzes the microphone signal to draw the live volume meter, handles the "loopback" routing so you can hear yourself, and generates the synthetic test sounds.
3. **MediaRecorder API:** Captures the microphone stream into a temporary `.webm` file in your browser's memory, allowing you to listen back or download it locally.

## 🚀 Deployment
EarCheck is a static React application built with Vite and Tailwind CSS. It is fully ready to be deployed to **Vercel**, Netlify, or any static hosting provider. 

Since there is no backend or database required, you can deploy it instantly by pushing this repository to Vercel. No environment variables are needed!

---
<div align="center">
  <i>Created by Aaron Lacap (NQX) 2026</i>
</div>
