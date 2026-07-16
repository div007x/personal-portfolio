/* ============================================
   NEURAL NETWORK PORTFOLIO — All Interactivity
   ============================================ */

// ============================================
// 1. THREE.JS 3D SPIDER-WEB BACKGROUND
// ============================================

const webCanvas = document.getElementById('web-canvas');
let scene, camera, renderer, nodes = [], lines = [], mouseX = 0, mouseY = 0;
let isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let animationId;
let isTabActive = true;
let dustParticles;         // ambient glowing dust layer (THREE.Points)
let pulses = [];           // active click-triggered energy pulses
const clock = { start: Date.now() };

// Node and line materials
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFB454 });
const nodeHoverMaterial = new THREE.MeshBasicMaterial({ color: 0xE8484B });
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xFFB454,
    transparent: true,
    opacity: 0.3,
});

function makeGlowTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 200, 130, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 180, 84, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 180, 84, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createDustField(count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 140;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 90 - 20;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.55,
        map: makeGlowTexture(),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xffb454,
    });

    return new THREE.Points(geometry, material);
}

function initThreeScene() {
    if (prefersReducedMotion) return;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050b14, 0.0095);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: webCanvas,
        alpha: true,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient glowing dust — thousands of cheap GPU-batched points for atmosphere/depth
    const dustCount = isTouchDevice ? 350 : 1400;
    dustParticles = createDustField(dustCount);
    scene.add(dustParticles);

    // Determine node count based on device
    const nodeCount = isTouchDevice ? 40 : 100;

    // Create nodes in 3D space
    for (let i = 0; i < nodeCount; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = nodeMaterial.clone();
        const node = new THREE.Mesh(geometry, material);

        node.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40
        );

        node.userData = {
            originalPos: node.position.clone(),
            velocity: new THREE.Vector3(),
        };

        scene.add(node);
        nodes.push(node);
    }

    // Connect nearby nodes with lines
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = nodes[i].position.distanceTo(nodes[j].position);
            if (dist < 18) {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    nodes[i].position,
                    nodes[j].position,
                ]);
                const line = new THREE.Line(geometry, lineMaterial.clone());
                line.userData = { nodeA: i, nodeB: j, baseOpacity: 0.2 + (1 - dist / 18) * 0.3 };
                line.material.opacity = line.userData.baseOpacity;
                scene.add(line);
                lines.push(line);
            }
        }
    }

    // Start render loop
    animate();
}

function animate() {
    if (!isTabActive) {
        animationId = requestAnimationFrame(animate);
        return;
    }

    animationId = requestAnimationFrame(animate);

    // Convert mouse to 3D world coordinates
    const mouse = new THREE.Vector3(
        (mouseX / window.innerWidth) * 2 - 1,
        -(mouseY / window.innerHeight) * 2 + 1,
        0.5
    );
    mouse.unproject(camera);
    const dir = mouse.sub(camera.position).normalize();
    const targetPos = camera.position.clone().add(dir.multiplyScalar(50));

    // Animate nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const orig = node.userData.originalPos;

        // Idle drift
        const time = Date.now() * 0.0003;
        const drift = new THREE.Vector3(
            Math.sin(time + i * 0.5) * 0.02,
            Math.cos(time + i * 0.3) * 0.02,
            Math.sin(time + i * 0.7) * 0.01
        );

        // Mouse attraction
        const distToMouse = node.position.distanceTo(targetPos);
        if (distToMouse < 15) {
            const pull = (15 - distToMouse) / 15;
            node.userData.velocity.lerp(
                new THREE.Vector3(
                    (targetPos.x - node.position.x) * pull * 0.003,
                    (targetPos.y - node.position.y) * pull * 0.003,
                    (targetPos.z - node.position.z) * pull * 0.003
                ),
                0.05
            );
            // Glow brighter
            node.material.color.lerp(nodeHoverMaterial.color, 0.1);
            node.scale.setScalar(1 + pull * 0.5);
        } else {
            node.userData.velocity.lerp(new THREE.Vector3(), 0.02);
            node.material.color.lerp(nodeMaterial.color, 0.03);
            node.scale.setScalar(1);
        }

        // Apply drift + velocity, return toward origin
        node.position.add(drift);
        node.position.add(node.userData.velocity);
        node.position.lerp(orig, 0.005);
    }

    // Update lines
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const posA = nodes[line.userData.nodeA].position;
        const posB = nodes[line.userData.nodeB].position;

        // Update line positions
        const positions = line.geometry.attributes.position;
        positions.setXYZ(0, posA.x, posA.y, posA.z);
        positions.setXYZ(1, posB.x, posB.y, posB.z);
        positions.needsUpdate = true;

        // Color shift based on mouse proximity
        const midPoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
        const distToMouse = midPoint.distanceTo(targetPos);
        const closeness = Math.max(0, 1 - distToMouse / 15);

        // Shift line color from teal to magenta near cursor
        const tealColor = new THREE.Color(0xFFB454);
        const magentaColor = new THREE.Color(0xE8484B);
        line.material.color.copy(tealColor).lerp(magentaColor, closeness);
        line.material.opacity = line.userData.baseOpacity + closeness * 0.4;
    }

    // Parallax tilt based on mouse (skip on touch), plus a slow autonomous
    // drift so the scene never feels static even when the mouse is still
    const idleT = (Date.now() - clock.start) * 0.00006;
    const idleRotX = Math.sin(idleT) * 0.05;
    const idleRotY = Math.cos(idleT * 0.7) * 0.06;

    if (!isTouchDevice) {
        const targetRotX = (mouseY / window.innerHeight - 0.5) * 0.15 + idleRotX;
        const targetRotY = (mouseX / window.innerWidth - 0.5) * 0.15 + idleRotY;
        scene.rotation.x += (targetRotX - scene.rotation.x) * 0.03;
        scene.rotation.y += (targetRotY - scene.rotation.y) * 0.03;
    } else {
        scene.rotation.x += (idleRotX - scene.rotation.x) * 0.02;
        scene.rotation.y += (idleRotY - scene.rotation.y) * 0.02;
    }

    // Ambient dust drifts very slowly on its own
    if (dustParticles) {
        dustParticles.rotation.y += 0.00006;
        dustParticles.rotation.x += 0.00002;
    }

    updatePulses();

    renderer.render(scene, camera);
}

// ============================================
// 1b. CLICK ENERGY PULSES
// ============================================

function spawnEnergyPulse(clientX, clientY) {
    if (!scene || !camera || prefersReducedMotion) return;

    // Unproject the click into the same depth plane the nodes live on
    const vec = new THREE.Vector3(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1,
        0.5
    );
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const origin = camera.position.clone().add(dir.multiplyScalar(45));

    const geometry = new THREE.RingGeometry(0.1, 0.4, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffb454,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(origin);
    ring.lookAt(camera.position);
    scene.add(ring);

    pulses.push({ mesh: ring, origin, spawnedAt: Date.now(), life: 900 });

    // Cap concurrent pulses so rapid clicking can't pile up work
    if (pulses.length > 6) {
        const old = pulses.shift();
        scene.remove(old.mesh);
        old.mesh.geometry.dispose();
        old.mesh.material.dispose();
    }
}

function updatePulses() {
    if (pulses.length === 0) return;
    const now = Date.now();

    for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const t = Math.min((now - p.spawnedAt) / p.life, 1);

        const scale = 1 + t * 22;
        p.mesh.scale.setScalar(scale);
        p.mesh.material.opacity = 0.8 * (1 - t);

        // Briefly brighten nearby hub nodes/lines as the pulse passes them
        const reach = t * 22 * 0.4 + 2;
        for (const node of nodes) {
            const d = node.position.distanceTo(p.origin);
            if (Math.abs(d - reach) < 3) {
                node.material.color.lerp(new THREE.Color(0xffe3b0), 0.5);
                node.scale.setScalar(1.6);
            }
        }

        if (t >= 1) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            pulses.splice(i, 1);
        }
    }
}

// Pause on tab hidden
document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
});

// ============================================
// 2. CUSTOM CURSOR SYSTEM
// ============================================

const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const cursorRipple = document.getElementById('cursor-ripple');
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;
let dotVisible = false;

function initCursor() {
    if (isTouchDevice) return;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorX = e.clientX;
        cursorY = e.clientY;

        if (!dotVisible) {
            dotVisible = true;
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
        }

        // Immediately position dot
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
    });

    // Lerp ring toward dot
    function animateRing() {
        ringX += (cursorX - ringX) * 0.12;
        ringY += (cursorY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    const interactiveElements = 'a, button, .project-card, .cert-card, .skill-card, .interest-pill, .cta-button';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('textarea, input')) {
            cursorDot.classList.add('hover-text');
            cursorRing.classList.add('hover-text');
        } else if (e.target.closest(interactiveElements)) {
            cursorDot.classList.add('hover-link');
            cursorRing.classList.add('hover-link');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveElements) || e.target.closest('textarea, input')) {
            cursorDot.classList.remove('hover-link', 'hover-text');
            cursorRing.classList.remove('hover-link', 'hover-text');
        }
    });

    // Click ripple (2D cursor effect + 3D energy pulse through the network)
    document.addEventListener('click', (e) => {
        cursorRipple.classList.remove('active');
        void cursorRipple.offsetWidth; // reflow
        cursorRipple.style.left = e.clientX + 'px';
        cursorRipple.style.top = e.clientY + 'px';
        cursorRipple.classList.add('active');

        spawnEnergyPulse(e.clientX, e.clientY);
    });

    document.addEventListener('mousedown', () => cursorRing.classList.add('is-clicking'));
    document.addEventListener('mouseup', () => cursorRing.classList.remove('is-clicking'));
}

// ============================================
// 3. SCROLL REVEALS
// ============================================

function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.12 });

    reveals.forEach((el) => observer.observe(el));
}

// ============================================
// 4. NAV ACTIVE STATE & SCROLL BEHAVIOR
// ============================================

function initNav() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Active link on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach((section) => observer.observe(section));

    // Navbar shadow on scroll
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu
                closeMobileMenu();
            }
        });
    });
}

// ============================================
// 5. HAMBURGER MENU
// ============================================

function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const overlay = document.getElementById('mobile-nav-overlay');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', closeMobileMenu);

    // Close on nav link click
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });
}

function closeMobileMenu() {
    document.getElementById('hamburger')?.classList.remove('active');
    document.getElementById('nav-links')?.classList.remove('open');
    document.getElementById('mobile-nav-overlay')?.classList.remove('active');
}

// ============================================
// 6. 3D TILT EFFECT ON CARDS
// ============================================

function initTilt() {
    if (isTouchDevice) return;

    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ============================================
// 7. TYPEWRITER / ROLE CYCLE
// ============================================

function initTypewriter() {
    const roleEl = document.getElementById('role-text');
    if (!roleEl) return;

    const roles = ['interactive experiences', 'creative web apps', 'clean code', '3D graphics on the web'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
        const current = roles[roleIndex];

        if (isDeleting) {
            charIndex--;
            roleEl.textContent = current.substring(0, charIndex);
            typeSpeed = 40;
        } else {
            charIndex++;
            roleEl.textContent = current.substring(0, charIndex);
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === current.length) {
            isDeleting = true;
            typeSpeed = 2000; // pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // pause before typing next
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

// ============================================
// 8. LIGHTBOX
// ============================================

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    // Open on cert card click
    document.querySelectorAll('.cert-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            // Don't open if clicking the "View Certificate" link
            if (e.target.closest('.cert-link')) return;

            const imgSrc = card.getAttribute('data-cert');
            if (imgSrc) {
                lightboxImg.src = imgSrc;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

// ============================================
// 9. THEME TOGGLE
// ============================================

// function initThemeToggle() {
//     const toggle = document.getElementById('theme-toggle');
//     const html = document.documentElement;
//     const icon = toggle.querySelector('i');

//     // Load saved preference
//     const saved = localStorage.getItem('aurora-theme');
//     if (saved) {
//         html.setAttribute('data-theme', saved);
//         updateIcon(saved);
//     }

//     toggle.addEventListener('click', () => {
//         const current = html.getAttribute('data-theme');
//         const next = current === 'dark' ? 'light' : 'dark';
//         html.setAttribute('data-theme', next);
//         localStorage.setItem('aurora-theme', next);
//         updateIcon(next);
//     });

//     function updateIcon(theme) {
//         icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
//     }
// }

// ============================================
// 10. CONTACT FORM
// ============================================

function initContactForm() {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Show success (no backend)
        form.reset();
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 4000);
    });
}

// ============================================
// 11. FOOTER YEAR
// ============================================

function initFooterYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ============================================
// INIT ALL
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initThreeScene();
    initCursor();
    initScrollReveals();
    initNav();
    initHamburger();
    initTilt();
    initTypewriter();
    initLightbox();
    // initThemeToggle();
    initContactForm();
    initFooterYear();
});

// Handle resize
window.addEventListener('resize', () => {
    if (renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
