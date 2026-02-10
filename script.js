document.addEventListener('DOMContentLoaded', () => {
    
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

        tiltContainer.style.transform = `rotateY(${clampX}deg) rotateX(${clampY}deg)`;
    });

    // Reset tilt when mouse leaves window
    document.addEventListener('mouseleave', () => {
        tiltContainer.style.transform = `rotateY(0deg) rotateX(0deg)`;
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
