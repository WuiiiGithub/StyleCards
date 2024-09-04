function createFireworksEffect(cardElement, effect, effectSeconds, speedFactor = 1) {
    if (effect === 'crackers') {
        const overlay = document.createElement('div');
        overlay.className = 'fireworks-overlay';
        cardElement.appendChild(overlay);

        const canvas = document.createElement('canvas');
        overlay.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Set canvas size to full dimensions of the advCard
        canvas.width = cardElement.offsetWidth;
        canvas.height = cardElement.offsetHeight;

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.velocity = {
                    x: (Math.random() - 0.5) * 8 * speedFactor,
                    y: (Math.random() - 0.5) * 8 * speedFactor
                };
                this.alpha = 1;
                this.friction = 0.99;
            }

            draw() {
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2 * speedFactor, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                this.velocity.x *= this.friction;
                this.velocity.y *= this.friction;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.alpha -= 0.01 * speedFactor;
            }
        }

        class Firework {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.velocity = { x: 0, y: Math.random() * -2.5 - 0.5 * speedFactor };
                this.particles = [];
                this.trail = [];
                this.lifespan = 60;
                this.hasExploded = false;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3 * speedFactor, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();

                // Draw trail
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                this.trail.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2 * speedFactor;
                ctx.stroke();
            }

            explode() {
                for (var i = 0; i < (50 * speedFactor); i++) {
                    this.particles.push(new Particle(this.x, this.y, this.color));
                }
            }

            update() {
                this.lifespan--;
                if (this.lifespan <= 0 && !this.hasExploded) {
                    this.explode();
                    this.velocity = { x: 0, y: 0 };
                    this.hasExploded = true;
                } else if (this.lifespan > 0) {
                    this.y += this.velocity.y;
                    this.trail.push({ x: this.x, y: this.y });
                    if (this.trail.length > 10) {
                        this.trail.shift(); // Maintain a limited length of trail
                    }
                }
                for (let i = 0; i < this.particles.length; i++) {
                    this.particles[i].update();
                    this.particles[i].draw();
                }
                this.draw();
            }
        }

        let fireworks = [];

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas with transparent background
            fireworks.forEach((firework, index) => {
                firework.update();
                if (firework.lifespan <= 0 && firework.particles.every(p => p.alpha <= 0)) {
                    fireworks.splice(index, 1);
                }
            });
            if (Math.random() < 0.015 * speedFactor) {
                const x = Math.random() * canvas.width;
                const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
                fireworks.push(new Firework(x, canvas.height, color));
            }
        }

        // Start the animation
        animate();

        // Show the overlay
        overlay.style.display = 'block';

        if (effectSeconds !== -1) {
            // Stop the effect after specified time if effectSeconds is not -1
            setTimeout(() => {
                overlay.style.display = 'none';
                cardElement.removeChild(overlay);
            }, effectSeconds * 1000);
        }
    }
}

function addAdvCard(title, description, imageUrl, btnName, linkOrFunction, effect, effectSeconds, speedFactor = 1) {
    const cardHTML = `
    <div class="advCard">
        <img src="${imageUrl}" alt="Image">
        <div class="advCard-content">
            <h2 class="advCard-title">${title}</h2>
            <p class="advCard-description">${description}</p>
            <a class="advCard-btn" id="advCard-btn">${btnName}</a>
        </div>
    </div>`;

    let container = document.getElementById('card-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'card-container';
        document.body.appendChild(container);
    }

    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHTML;
    container.appendChild(cardElement);

    if (effect) {
        createFireworksEffect(cardElement.querySelector('.advCard'), effect, effectSeconds, speedFactor);
    }

    const button = cardElement.querySelector('#advCard-btn');
    if (typeof linkOrFunction === 'string') {
        // If linkOrFunction is a string, treat it as a URL
        button.href = linkOrFunction;
        button.target = "_blank"; // Open link in a new tab
    } else if (typeof linkOrFunction === 'function') {
        // If linkOrFunction is a function, bind it to the button click event
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior
            linkOrFunction(); // Call the function
        });
    }
}
