document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-card]').forEach(element => {
        const cardData = JSON.parse(element.getAttribute('data-card'));

        // Safely handle function strings
        const linkOrFunction = cardData.linkOrFunction.startsWith('function') ?
            new Function('return ' + cardData.linkOrFunction)() :
            cardData.linkOrFunction;

        addAdvCard(
            cardData.title,
            cardData.description,
            cardData.imageUrl,
            cardData.btnName,
            linkOrFunction,
            cardData.effect,
            cardData.effectSeconds,
            cardData.speedFactor
        );
    });
});

function createFireworksEffect(cardElement, effect, effectSeconds, speedFactor = 1) {
    if (effect === 'crackers') {
        const overlay = document.createElement('div');
        overlay.className = 'fireworks-overlay';
        cardElement.appendChild(overlay);

        const canvas = document.createElement('canvas');
        overlay.appendChild(canvas);
        const ctx = canvas.getContext('2d');

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
                this.velocity = {x: 0, y: Math.random() * -2.5 - 0.5 * speedFactor};
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
                for (let i = 0; i < 50 * speedFactor; i++) {
                    this.particles.push(new Particle(this.x, this.y, this.color));
                }
            }
            
            update() {
                this.lifespan--;
                if (this.lifespan <= 0 && !this.hasExploded) {
                    this.explode();
                    this.velocity = {x: 0, y: 0};
                    this.hasExploded = true;
                } else if (this.lifespan > 0) {
                    this.y += this.velocity.y;
                    this.trail.push({x: this.x, y: this.y});
                    if (this.trail.length > 10) {
                        this.trail.shift();
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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        animate();

        overlay.style.display = 'block';

        if (effectSeconds !== -1) {
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
        button.href = linkOrFunction;
        button.target = "_blank";
    } else if (typeof linkOrFunction === 'function') {
        button.href = '#';
        button.addEventListener('click', function(event) {
            event.preventDefault();
            linkOrFunction();
        });
    }
}
