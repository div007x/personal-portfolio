# 🚀 Personal Portfolio Website

A modern, responsive, and interactive personal portfolio website built to showcase my technical skills, projects, education, achievements, hackathon experiences, and professional profile.

The portfolio features interactive 3D visuals, smooth animations, responsive layouts, and dynamic user interface components.

## 🌐 Live Demo

**Portfolio:**
https://personal-portfolio-six-omega-62.vercel.app/

## 👨‍💻 About Me

Hi, I'm **Divakar R**, a B.Tech Information Technology student passionate about Software Development, Data Structures & Algorithms, Full-Stack Development, and Artificial Intelligence.

I enjoy transforming ideas into practical software solutions through clean, efficient, and scalable code. I am currently focused on strengthening my problem-solving skills, building real-world applications, and preparing for Software Development Engineer (SDE) opportunities.

## ✨ Features

* Modern and responsive portfolio design
* Immersive Three.js neural-network background with glowing nodes, connection lines, and ambient particle dust
* Click-triggered energy pulses that ripple through the 3D network
* Custom animated cursor with glow and magnetic hover states
* Mouse-based interactive visual effects
* Glassmorphism panels (blurred, translucent cards) across skills, projects, hackathons, and certificates
* Smooth scrolling navigation
* Active navigation state based on page position
* Scroll reveal animations
* Typewriter text animation
* Interactive 3D tilt card effects
* Animated glowing timeline for the Education section
* Responsive mobile navigation menu
* Certificate image lightbox
* Dynamic footer year
* Contact form interface
* Mobile and touch-device support
* Reduced-motion accessibility support

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Graphics and Animation

* Three.js
  * `THREE.Points` + `BufferGeometry` for the ambient glowing particle field
  * `THREE.CanvasTexture` for runtime-generated glow sprites (no external image assets)
  * `THREE.RingGeometry` with additive blending for click-triggered energy pulses
  * `THREE.FogExp2` for depth
* WebGL
* CSS Animations
* CSS glassmorphism (`backdrop-filter`) for translucent panel effects

### Web APIs

* DOM API
* Intersection Observer API
* Window and Document Events

### Development and Deployment

* Git
* GitHub
* Visual Studio Code
* Vercel

## 📂 Project Structure

```text
personal-portfolio/
│
├── assets/
│   ├── certificates/
│   ├── images/
│   └── resume/
│
├── index.html
├── style.css
├── script.js
├── .gitignore
└── README.md
```

## 📌 Portfolio Sections

### About Me

Provides an overview of my technical interests, career goals, and passion for software development.

### Technical Skills

Highlights my programming languages, core computer science concepts, development tools, frameworks, and libraries.

### Featured Projects

Showcases software projects with descriptions and technologies used.

### Education

Displays my academic background, academic performance, and relevant coursework.

### Achievements and Competitive Programming

Highlights my Data Structures and Algorithms practice, hackathon participation, and open-source interests.

### Hackathons and Tech Events

Showcases technical events and hackathons I have participated in, including:

* Yugam Codeathon 3.0
* NVIDIA RTX AI PC Day
* InnovIT 2025

### Certifications

Displays professional and technical certifications with an interactive certificate viewing experience.

### Interests

Highlights my interests in Software Development, Open Source, Competitive Programming, Web Development, Software Engineering, and Artificial Intelligence.

### Contact

Provides links to my professional profiles and a contact form interface.

## 🎨 Interactive Features

### Three.js Neural-Network Background

The website uses Three.js to generate an animated 3D node network layered with an ambient glowing particle field, set inside exponential fog for depth.

Nearby nodes are dynamically connected using lines, creating an interactive web-style visual background. A slow, independent camera/scene drift keeps the scene feeling alive even when the mouse isn't moving.

The animation reacts to mouse movement (attracting nearby nodes and tinting them) and creates dynamic color and movement effects.

### Click Energy Pulses

Clicking anywhere spawns an expanding ring inside the 3D scene at the clicked position, briefly brightening nearby nodes as it travels outward — layered on top of the existing 2D cursor ripple effect.

### Custom Cursor

A custom cursor system provides:

* Animated cursor ring with a soft glow
* Interactive hover states (links, text fields, cards)
* A magnetic click-pulse state while the mouse button is held
* Click ripple effects
* Smooth cursor tracking

The custom cursor is disabled on touch devices for improved mobile usability.

### Glassmorphism Panels

Skill, project, hackathon, and certificate cards use `backdrop-filter` blur with a subtle top-edge reflection, so they read as translucent panels floating above the neural-network background.

### Scroll Reveal Animation

The Intersection Observer API detects elements entering the viewport and triggers reveal animations.

This improves performance compared with continuously monitoring the scroll position.

### 3D Tilt Cards

Interactive cards respond to mouse movement and apply perspective-based rotation effects.

### Certificate Lightbox

Certificates can be displayed in an image lightbox.

The lightbox supports:

* Click-to-open interaction
* Close button
* Background click to close
* Escape key support

## 📱 Responsive Design

The portfolio is designed to work across:

* Desktop computers
* Laptops
* Tablets
* Mobile devices

Touch devices are detected to optimize animations and interactive features.

## ♿ Accessibility and Performance

The project includes support for the `prefers-reduced-motion` media query.

Users who prefer reduced animations can access the website without the Three.js animation being initialized.

The Three.js renderer also limits the device pixel ratio to improve rendering performance.

## 🚀 Deployment

The portfolio is deployed using Vercel.

### Deploy on Vercel

1. Fork or clone this repository.

```bash
git clone https://github.com/div007x/personal-portfolio.git
```

2. Navigate to the project directory.

```bash
cd personal-portfolio
```

3. Push the repository to your GitHub account.

4. Import the GitHub repository into Vercel.

5. Deploy the project.

Vercel automatically redeploys the website when new changes are pushed to the connected GitHub repository.

## 💻 Run Locally

Clone the repository:

```bash
git clone https://github.com/div007x/personal-portfolio.git
```

Navigate to the project folder:

```bash
cd personal-portfolio
```

Open `index.html` in your browser.

For a better development experience, use the Live Server extension in Visual Studio Code.

## 🔄 Updating the Portfolio

After making changes, run:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

If the repository is connected to Vercel, the latest version will be automatically deployed.

## 📈 Future Improvements

* Connect the contact form to a backend or email service
* Add more real-world software projects
* Improve Search Engine Optimization (SEO)
* Add project filtering functionality
* Add a blog or technical writing section
* Improve accessibility features
* Optimize Three.js rendering performance

## 🤝 Connect With Me

**GitHub:**
https://github.com/div007x

**LinkedIn:**
https://www.linkedin.com/in/divakar-rk

**Portfolio:**
https://personal-portfolio-six-omega-62.vercel.app/

## 📄 License

This project is created for personal portfolio and educational purposes.

Feel free to explore the code and use it as inspiration for your own portfolio.

## ⭐ Support

If you like this project, consider giving the repository a star.

It helps support the project and motivates me to build more software projects.

---

Built with passion and code by **Divakar R**.
