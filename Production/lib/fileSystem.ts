import { FileNode } from '@/types';

const STORAGE_KEY = 'bicepcurls_filesystem';

// Default starter project
const defaultFileSystem: FileNode[] = [
  {
    id: 'root',
    name: 'project',
    type: 'folder',
    path: '/project',
    children: [
      {
        id: 'index-html',
        name: 'index.html',
        type: 'file',
        path: '/project/index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BicepCurls IDE | Freeweight AI</title>
  
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💪</text></svg>">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <canvas id="cyber-particles"></canvas>
  
  <div class="screen-overlay"></div>

  <nav class="navbar slide-in-top">
    <div class="logo">
      <span class="bracket">&lt;</span>BicepCurls/<span class="bracket">&gt;</span>
    </div>
    <div class="status-box">
      <i class="fas fa-wifi icon-blink"></i>
      System Status: <span class="status-text blink">ONLINE</span>
    </div>
  </nav>

  <main class="hero-container">
    <div class="content-box js-tilt">
      <div class="cyber-header-wrapper">
        <h1 class="glitch-header" data-text="Welcome to BicepCurls">
          <span id="typewriter-h1"></span><span class="cursor">_</span>
        </h1>
      </div>
      
      <p class="subtitle fade-in-up delay-1">
        Next-Gen Coding with Freeweight AI Assistance
      </p>

      <div class="terminal-loader fade-in-up delay-2">
        <div class="terminal-line">Initializing neural net... [OK]</div>
        <div class="terminal-line">Loading muscle memory modules... [OK]</div>
        <div class="terminal-line active-line">> Ready to lift heavy code.</div>
      </div>
      
    </div>
     <div class="scroll-indicator fade-in-up delay-3">
        <span>SCROLL TO INITIALIZE</span>
        <i class="fas fa-chevron-down"></i>
      </div>
  </main>

  <footer class="footer slide-in-bottom">
    <div class="footer-content">
      <p>Made with <i class="fas fa-heart heart-beat"></i> by <strong>Lord Atharva</strong> | OS Version 2.4.1</p>
      
      <div class="social-links">
        <a href="https://github.com/oasis-parzival" target="_blank" rel="noopener noreferrer" class="social-btn git">
          <i class="fab fa-github"></i> <span class="link-text">GitHub</span>
        </a>
        <a href="https://www.linkedin.com/in/atharvamatale/" target="_blank" rel="noopener noreferrer" class="social-btn linked">
          <i class="fab fa-linkedin"></i> <span class="link-text">LinkedIn</span>
        </a>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'style-css',
        name: 'style.css',
        type: 'file',
        path: '/project/style.css',
        language: 'css',
        content: `/* --- CSS Variables & Reset --- */
:root {
  --neon-green: #39ff14;
  --neon-dim: rgba(57, 255, 20, 0.4);
  --bg-black: #020202;
  --bg-dark-overlay: rgba(5, 5, 5, 0.8);
  --glass-border: rgba(57, 255, 20, 0.2);
  --text-dim: #a0a0a0;
  --font-stack: 'Courier New', Courier, monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-black);
  color: var(--neon-green);
  font-family: var(--font-stack);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  perspective: 1000px; /* For 3D effects */
}

/* --- Background Effects --- */
#cyber-particles {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
}

.screen-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1;
  pointer-events: none;
  /* Scanlines */
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 3px
  );
  /* Vignette for depth */
  box-shadow: inset 0 0 150px rgba(0,0,0,0.9);
}

/* --- Navbar (Glassmorphism) --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: relative;
  z-index: 10;
  background: rgba(5, 5, 5, 0.6); /* Semi-transparent black */
  backdrop-filter: blur(5px);      /* Glass blur effect */
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 2px 20px rgba(57, 255, 20, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 1px;
  text-shadow: 0 0 10px var(--neon-dim);
}
.logo .bracket { color: var(--text-dim); }

.status-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-dim);
  border: 1px solid var(--glass-border);
  padding: 5px 12px;
  border-radius: 4px;
  background: rgba(0,0,0,0.3);
}

.status-text.blink {
  color: var(--neon-green);
  font-weight: bold;
  animation: rapid-blink 1s steps(2, start) infinite;
}
.icon-blink { animation: pulse-opacity 2s infinite; }


/* --- Main Hero Section --- */
.hero-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 5;
  padding: 2rem;
}

/* The main box that will tilt on mousemove */
.content-box {
  text-align: left; /* Terminal style left align looks better now */
  max-width: 700px;
  width: 100%;
  padding: 3rem;
  
  /* Cyber Container Styling */
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid var(--neon-green);
  box-shadow: 
    0 0 30px rgba(57, 255, 20, 0.15),
    inset 0 0 20px rgba(57, 255, 20, 0.05);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d; /* Important for tilt */
}

/* Corner accents using pseudo-elements */
.content-box::before, .content-box::after {
  content: '';
  position: absolute;
  width: 20px; height: 20px;
  border-color: var(--neon-green);
  border-style: solid;
}
.content-box::before { top: 0; left: 0; border-width: 2px 0 0 2px; }
.content-box::after { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

/* --- H1 Glitch & Typewriter --- */
.cyber-header-wrapper {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--neon-dim);
  display: inline-block;
  padding-bottom: 10px;
}

h1.glitch-header {
  font-size: 3rem;
  margin: 0;
  line-height: 1;
  text-transform: uppercase;
  position: relative;
  text-shadow: 0 0 15px var(--neon-green);
}

/* The blinking cursor for typewriter */
.cursor {
  animation: rapid-blink 0.8s infinite;
  margin-left: 2px;
}

/* --- Subtitle & Terminal Loader --- */
.subtitle {
  font-size: 1.2rem;
  color: var(--text-dim);
  margin-bottom: 2.5rem;
  letter-spacing: 1px;
}

.terminal-loader {
  font-size: 0.9rem;
  color: var(--text-dim);
  border-left: 2px solid var(--neon-dim);
  padding-left: 15px;
  opacity: 0.8;
}

.terminal-line { margin-bottom: 5px; }
.active-line { 
  color: var(--neon-green); 
  font-weight: bold;
  text-shadow: 0 0 5px var(--neon-green);
}

/* --- Scroll Indicator --- */
.scroll-indicator {
    position: absolute;
    bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.8rem;
    color: var(--neon-dim);
    gap: 5px;
    animation: bounce 2s infinite;
}


/* --- Footer --- */
.footer {
  z-index: 10;
  background: rgba(2, 2, 2, 0.9);
  border-top: 1px solid var(--neon-dim);
  padding: 1rem 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer p { font-size: 0.9rem; color: var(--text-dim); }
.heart-beat { color: #ff3939; animation: heartbeat 1.5s infinite; text-shadow: 0 0 10px red;}

/* --- Social Buttons (Revamped) --- */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-btn {
  text-decoration: none;
  color: var(--neon-green);
  border: 1px solid var(--neon-green);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
  background: rgba(0,0,0,0.5);
  z-index: 1; /* For the ::before pseudo element */
}

/* The "fill" effect on hover */
.social-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: var(--neon-green);
    transition: all 0.3s ease;
    z-index: -1;
}

.social-btn:hover {
  color: var(--bg-black);
  box-shadow: 0 0 25px var(--neon-green);
  padding-left: 20px; /* Subtle shift right */
}

.social-btn:hover::before { left: 0; }


/* ============================
   Animations Keyframes
============================ */
/* Standard Blink */
@keyframes rapid-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
/* Heartbeat */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
}
/* Subtle opacity pulse */
@keyframes pulse-opacity {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
}
/* Scroll Bounce */
@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
	40% {transform: translateY(-10px);}
	60% {transform: translateY(-5px);}
}


/* Entrance Animations */
.slide-in-top { animation: slideInDown 0.8s ease-out forwards; }
.slide-in-bottom { animation: slideInUp 0.8s ease-out forwards; }

.fade-in-up {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out forwards;
}
.delay-1 { animation-delay: 0.8s; }
.delay-2 { animation-delay: 1.4s; }
.delay-3 { animation-delay: 2.0s; }

@keyframes slideInDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@keyframes fadeInUp {
    to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .footer-content { flex-direction: column; gap: 1rem; text-align: center;}
    h1.glitch-header { font-size: 2rem; }
    .content-box { padding: 2rem 1.5rem; }
}
`,
      },
      {
        id: 'script-js',
        name: 'script.js',
        type: 'file',
        path: '/project/script.js',
        language: 'javascript',
        content: `document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. Typewriter Effect for H1
    ========================================= */
    const h1Element = document.getElementById('typewriter-h1');
    const textToType = h1Element.closest('.glitch-header').getAttribute('data-text');
    let typeIndex = 0;
    const typeSpeed = 100; // milliseconds per character

    function typeWriter() {
        if (typeIndex < textToType.length) {
            h1Element.textContent += textToType.charAt(typeIndex);
            typeIndex++;
            setTimeout(typeWriter, typeSpeed);
        } else {
            // Optional: stop blinking cursor after typing finishes
            // document.querySelector('.cursor').style.display = 'none';
        }
    }
    
    // Start typing after a short delay so initial animations can play
    setTimeout(typeWriter, 500);


    /* =========================================
       2. 3D Tilt Effect on Mousemove
    ========================================= */
    const tiltContainer = document.querySelector('.js-tilt');
    const maxTilt = 15; // Maximum tilt angle

    document.addEventListener('mousemove', (e) => {
        if(window.innerWidth < 768) return; // Disable on mobile

        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        
        // Clamp values to prevent extreme tilting
        const clampX = Math.max(Math.min(xAxis, maxTilt), -maxTilt);
        const clampY = Math.max(Math.min(yAxis, maxTilt), -maxTilt);

        tiltContainer.style.transform = \`rotateY(\${clampX}deg) rotateX(\${clampY}deg)\`;
    });

    // Reset tilt when mouse leaves window
    document.addEventListener('mouseleave', () => {
        tiltContainer.style.transform = \`rotateY(0deg) rotateX(0deg)\`;
        tiltContainer.style.transition = 'transform 0.5s ease';
    });
    
    tiltContainer.addEventListener('mouseenter', () => {
         tiltContainer.style.transition = 'none'; // Remove transition for snappy movement on enter
    });


    /* =========================================
       3. Canvas Particle Network Background
    ========================================= */
    const canvas = document.getElementById('cyber-particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;
    const numberOfParticles = (canvas.height * canvas.width) / 9000; // Density adjusted automatically

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            // Bounce off edges
            if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
            if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2; // Slow movement speed
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = '#39ff14'; // Neon Green color
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Connect nearby particles with lines
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                             + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                // If particles are close enough, draw a line
                if (distance < (canvas.width/7) * (canvas.height/7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(57, 255, 20,' + opacityValue + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    init();
    animate();
});
`,
      },
    ],
  },
];

export class FileSystemManager {
  private fileSystem: FileNode[];

  constructor() {
    this.fileSystem = JSON.parse(JSON.stringify(defaultFileSystem));
  }

  // Initialize now simply resets to defaults (static mode)
  initialize(): FileNode[] {
    this.fileSystem = JSON.parse(JSON.stringify(defaultFileSystem));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return this.getFileSystem();
  }

  private saveToStorage(): void {
    // Persistence disabled in static mode
  }

  getFileSystem(): FileNode[] {
    // Return a deep clone to ensure React detects changes when state is updated
    return JSON.parse(JSON.stringify(this.fileSystem));
  }

  findNode(path: string, nodes: FileNode[] = this.fileSystem): FileNode | null {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = this.findNode(path, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  readFile(path: string): string | null {
    const node = this.findNode(path);
    return node?.type === 'file' ? node.content || '' : null;
  }

  writeFile(path: string, content: string): boolean {
    const node = this.findNode(path);
    if (node && node.type === 'file') {
      node.content = content;
      // No need to save to storage anymore
      return true;
    }
    return false;
  }

  createFile(parentPath: string, name: string, content: string = ''): FileNode | null {
    const parent = this.findNode(parentPath);
    if (parent && parent.type === 'folder') {
      // Check if file already exists to avoid duplicates
      if (parent.children?.some(child => child.name === name)) {
        return null;
      }

      const newFile: FileNode = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: 'file',
        path: `${parentPath}/${name}`,
        content,
        language: this.getLanguageFromExtension(name),
      };
      parent.children = parent.children || [];
      parent.children.push(newFile);
      this.saveToStorage();
      return newFile;
    }
    return null;
  }

  createFolder(parentPath: string, name: string): FileNode | null {
    const parent = this.findNode(parentPath);
    if (parent && parent.type === 'folder') {
      const newFolder: FileNode = {
        id: `${parentPath}-${name}`.replace(/\//g, '-'),
        name,
        type: 'folder',
        path: `${parentPath}/${name}`,
        children: [],
      };
      parent.children = parent.children || [];
      parent.children.push(newFolder);
      this.saveToStorage();
      return newFolder;
    }
    return null;
  }

  deleteNode(path: string): boolean {
    const deleteFromChildren = (nodes: FileNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].path === path) {
          nodes.splice(i, 1);
          this.saveToStorage();
          return true;
        }
        if (nodes[i].children) {
          if (deleteFromChildren(nodes[i].children!)) return true;
        }
      }
      return false;
    };
    return deleteFromChildren(this.fileSystem);
  }

  private getLanguageFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      sh: 'shell',
    };
    return languageMap[ext || ''] || 'plaintext';
  }

  reset(): void {
    this.fileSystem = defaultFileSystem;
    this.saveToStorage();
  }
}

export const fileSystemManager = new FileSystemManager();
