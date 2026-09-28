/* =========================================================================
           1. CONTENIDO DE LOS DESEOS
           ========================================================================= */
const wishes = [
    {
        num: "Mensaje I",
        title: "Tu Talento Creativo",
        text: "Admiro un montón la paciencia y el arte que le pones a cada cosplay y a cada cosa que tejes. Crear cosas desde cero con tus propias manos demuestra la pasión, la dedicación y el talento que llevas dentro."
    },
    {
        num: "Mensaje II",
        title: "Dúo chistoso en Partidas",
        text: "Las horas jugando juntos nunca faltan. Ya sea carreando, trolleando un poco o sobreviviendo como en fortnite, no hay partida que no se vuelva mil veces mejor cuando estamos en llamada riéndonos de cualquier tontería."
    },
    {
        num: "Mensaje III",
        title: "En las buenas y en las malas",
        text: "Valoro mucho saber que estás ahí, ya sea para celebrar cuando algo sale bien o simplemente cuando te desahogas de los momentos difíciles. Saber que cuentas conmigo de verdad no tiene precio."
    },
    {
        num: "Mensaje IV",
        title: "La Buena Vibra que Transmites",
        text: "La energía que le pones a tus streams y la forma en que conectas con el chat es algo único. Haces que cualquiera que llegue a tu canal se sienta bienvenido, cómodo y con ganas de quedarse a pasar un buen rato."
    },
    {
        num: "Mensaje V",
        title: "Sigue siendo exactamente tú",
        text: "Lo más valioso que tienes es tu forma de ser. Lo que quiero es que el mundo nunca te cambie esa esencia tan tuya y que sigas brillando con luz propia donde sea que estés."
    }
];

let currentWishIndex = 0;
let isTransitioning = false;
let finalCelebrationStarted = false;

/* =========================================================================
   2. ELIMINADO: MOTOR DE AUDIO
   ========================================================================= */

/* =========================================================================
   3. CANVAS NOCTURNO: ESTRELLAS, LUCIÉRNAGAS Y FORMACIÓN DE TEXTO
   ========================================================================= */
const canvas = document.getElementById('skyCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Estrellas de fondo
const backgroundStars = Array.from({ length: 150 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.02 + 0.005,
    pulse: Math.random() * Math.PI
}));

// Luciérnagas libres en el cielo
const skyFireflies = [];

// Partículas del texto final "¡FELIZ CUMPLEAÑOS!"
let textTargetPoints = [];
let textParticles = [];

function generateTextPoints(message) {
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    offCanvas.width = width;
    offCanvas.height = height;

    const lines = message.split('\n');

    // Tamaño adaptativo según la pantalla
    const fontSize = Math.min(width * 0.15, 90);
    // Usamos una fuente gruesa (Arial/sans-serif) para que los puntos llenen bien la letra
    offCtx.font = `900 ${fontSize}px 'Arial', sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = '#ffffff';

    // Centrado: En móviles lo bajamos un poco más para no chocar con el título agrandado
    const startY = width < 768 ? height * 0.32 : height * 0.24;
    lines.forEach((line, index) => {
        offCtx.fillText(line, width / 2, startY + (index * fontSize * 1.15));
    });

    const imgData = offCtx.getImageData(0, 0, width, height).data;
    const points = [];
    // Densidad más estrecha para que las letras sean más legibles y sólidas
    const density = width < 768 ? 3 : 4; 

    for (let y = 0; y < height; y += density) {
        for (let x = 0; x < width; x += density) {
            const index = (y * width + x) * 4;
            if (imgData[index + 3] > 140) {
                points.push({ x, y });
            }
        }
    }
    return points;
}

// Luciérnaga que vuela libre en el cielo
class SkyFirefly {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -Math.random() * 2.5 - 1.5;
        this.r = Math.random() * 2.5 + 2;
        this.color = Math.random() > 0.4 ? '#fde047' : '#bef264';
        this.glowPhase = Math.random() * Math.PI;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.glowPhase += 0.05;

        // Fricción suave y mecida por el viento
        this.vx += (Math.random() - 0.5) * 0.2;
        this.vy += (Math.random() - 0.5) * 0.15;
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Si se sale de los bordes, reingresa suave
        if (this.x < 10) this.vx += 0.5;
        if (this.x > width - 10) this.vx -= 0.5;
        if (this.y < 30) this.vy += 0.3;
        if (this.y > height * 0.7) this.vy -= 0.5;
    }
    draw(c) {
        const glow = (Math.sin(this.glowPhase) + 1) / 2;
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.r * (0.8 + glow * 0.4), 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.shadowColor = '#facc15';
        c.shadowBlur = 15 + glow * 15;
        c.fill();
        c.restore();
    }
}

// Cometas (estrellas fugaces) para el fondo
class Comet {
    constructor() {
        this.reset();
    }
    reset() {
        // Nacen justo a la derecha, en la mitad superior, para que atraviesen el centro
        this.x = width + 50 + Math.random() * 150;
        this.y = Math.random() * (height * 0.4) - 50;
        this.vx = - (Math.random() * 4 + 5); // Velocidad más suave y relajada
        this.vy = Math.random() * 2 + 3;
        this.length = Math.random() * 200 + 150; // Más largas
        this.thickness = Math.random() * 2 + 1.5; // Más gruesas
        this.opacity = 1;
        this.active = false;
    }
    spawn() {
        this.reset();
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity -= 0.005; // Se desvanece más lento debido a que viaja más lento
        if (this.opacity <= 0 || this.x < -100 || this.y > height + 100) {
            this.active = false;
        }
    }
    draw(c) {
        if (!this.active) return;
        const tailX = this.x - this.vx * (this.length / 10);
        const tailY = this.y - this.vy * (this.length / 10);

        c.save();
        c.globalAlpha = Math.max(0, this.opacity);

        const gradient = c.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(tailX, tailY);
        c.strokeStyle = gradient;
        c.lineWidth = this.thickness;
        c.stroke();

        c.beginPath();
        c.arc(this.x, this.y, this.thickness * 1.5, 0, Math.PI * 2);
        c.fillStyle = '#ffffff';
        c.shadowColor = '#ffffff';
        c.shadowBlur = 15;
        c.fill();

        c.restore();
    }
}

const comets = [new Comet(), new Comet(), new Comet()];

// Spawnear una estrella fugaz cada 6 segundos para que no sature la vista
setInterval(() => {
    const inactiveComet = comets.find(c => !c.active);
    if (inactiveComet) inactiveComet.spawn();
}, 6000);

// Partículas que forman las letras de "¡FELIZ CUMPLEAÑOS!"
class TextParticle {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12 - 4;
        this.ease = 0.035 + Math.random() * 0.03;
        // Partículas un poco más grandes para rellenar mejor el texto
        this.r = Math.random() * 1.5 + 1.2;
        this.color = Math.random() > 0.3 ? '#fef08a' : '#fde047';
        this.alpha = 0;
        this.forming = false;
        this.dispersing = false;
    }
    update() {
        if (this.dispersing) {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha = Math.max(0, this.alpha - 0.015);
        } else if (!this.forming) {
            // Fase 1: Explosión suave inicial
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.92;
            this.vy *= 0.92;
            this.alpha = Math.min(this.alpha + 0.05, 1);
        } else {
            // Fase 2: Vuelo magnético hacia el trazo de la letra
            this.x += (this.targetX - this.x) * this.ease;
            this.y += (this.targetY - this.y) * this.ease;
            // Ligero pulso orgánico una vez en posición
            this.alpha = 0.85 + Math.sin(Date.now() * 0.005 + this.x) * 0.15;
        }
    }
    draw(c) {
        if (this.alpha <= 0) return;
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.shadowColor = '#eab308';
        c.shadowBlur = 10;
        c.fill();
        c.restore();
    }
}

// Bucle principal de animación Canvas
function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    // Cometas (dibujados primero para quedar al fondo)
    comets.forEach(c => {
        c.update();
        c.draw(ctx);
    });

    // 1. Dibujar estrellas de fondo
    backgroundStars.forEach(st => {
        st.pulse += st.speed;
        const currentAlpha = st.alpha * (0.6 + Math.sin(st.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
    });

    // 2. Dibujar luciérnagas libres
    skyFireflies.forEach(f => {
        f.update();
        f.draw(ctx);
    });

    // 3. Dibujar partículas del texto si se activó el clímax
    if (textParticles.length > 0) {
        textParticles.forEach(p => {
            p.update();
            p.draw(ctx);
        });

        // Halo dorado suave detrás del texto completo
        if (textParticles[0] && textParticles[0].forming && !textParticles[0].dispersing) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(width / 2, height * 0.30, width * 0.42, 110, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.04)';
            ctx.filter = 'blur(30px)';
            ctx.fill();
            ctx.restore();
        }
    }

    requestAnimationFrame(animateCanvas);
}
animateCanvas();

/* =========================================================================
   4. LUCIÉRNAGAS INTERNAS DEL FRASCO (DOM)
   ========================================================================= */
const insideContainer = document.getElementById('firefliesInside');
let insideFlyElements = [];

function setupInsideFireflies() {
    insideContainer.innerHTML = '';
    insideFlyElements = [];

    for (let i = 0; i < 5; i++) {
        const el = document.createElement('div');
        el.className = 'absolute w-3.5 h-3.5 rounded-full bg-yellow-200 glow-yellow transition-transform duration-700 pointer-events-none';

        // Posiciones relativas adentro del frasco
        const x = 30 + Math.random() * 40;
        const y = 30 + Math.random() * 45;

        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        insideContainer.appendChild(el);

        insideFlyElements.push({
            element: el,
            baseX: x,
            baseY: y,
            seed: Math.random() * 100,
            speed: 0.02 + Math.random() * 0.02
        });
    }
}
setupInsideFireflies();

// Movimiento orgánico de las luciérnagas dentro del frasco
function animateInsideFlies() {
    const time = Date.now() * 0.002;
    insideFlyElements.forEach((fly, i) => {
        if (!fly.liberated) {
            const dx = Math.sin(time * fly.speed * 25 + fly.seed) * 16;
            const dy = Math.cos(time * fly.speed * 30 + fly.seed) * 18;
            const pulse = (Math.sin(time * 3 + fly.seed) + 1.2) / 2;
            fly.element.style.transform = `translate(${dx}px, ${dy}px) scale(${0.8 + pulse * 0.4})`;
            fly.element.style.opacity = `${0.4 + pulse * 0.6}`;
        }
    });
    requestAnimationFrame(animateInsideFlies);
}
animateInsideFlies();

/* =========================================================================
   5. INTERACCIÓN Y LIBERACIÓN DE CADA DESEO
   ========================================================================= */
const jarContainer = document.getElementById('jarContainer');
const cork = document.getElementById('cork');
const wishModal = document.getElementById('wishModal');
const wishNumber = document.getElementById('wishNumber');
const wishTitle = document.getElementById('wishTitle');
const wishText = document.getElementById('wishText');
const closeWishBtn = document.getElementById('closeWishBtn');
const counterTag = document.getElementById('counterTag');
const tapPrompt = document.getElementById('tapPrompt');

jarContainer.addEventListener('click', () => {
    if (isTransitioning || currentWishIndex >= wishes.length) return;
    releaseNextWish();
});

function releaseNextWish() {
    isTransitioning = true;
    
    // 1. Animación del corcho
    cork.classList.remove('animate-cork');
    void cork.offsetWidth; // trigger reflow
    cork.classList.add('animate-cork');

    // 2. Extraer la posición física del frasco para hacer nacer la luciérnaga libre
    const jarRect = jarContainer.getBoundingClientRect();
    const spawnX = jarRect.left + jarRect.width / 2;
    const spawnY = jarRect.top + 40;

    // 3. Ocultar la luciérnaga del frasco y crearla en el cielo
    const currentFly = insideFlyElements[currentWishIndex];
    if (currentFly) {
        currentFly.liberated = true;
        currentFly.element.style.transition = 'transform 0.4s ease-out, opacity 0.4s';
        currentFly.element.style.transform = 'translateY(-80px) scale(0)';
        currentFly.element.style.opacity = '0';
    }

    // Luciérnaga ascendente
    setTimeout(() => {
        skyFireflies.push(new SkyFirefly(spawnX, spawnY));
    }, 200);

    // 4. Actualizar contador
    const remaining = wishes.length - (currentWishIndex + 1);
    counterTag.textContent = remaining > 0 ? `${remaining} Mensajes adentro` : "Todos los mensajes en el cielo";

    // 5. Desplegar tarjeta con el deseo
    setTimeout(() => {
        const wish = wishes[currentWishIndex];
        wishNumber.textContent = wish.num;
        wishTitle.textContent = wish.title;
        wishText.textContent = `"${wish.text}"`;

        wishModal.classList.remove('opacity-0', 'pointer-events-none', 'scale-90');
        wishModal.classList.add('opacity-100', 'scale-100');
    }, 450);
}

closeWishBtn.addEventListener('click', () => {
    // Cerrar tarjeta del deseo actual
    wishModal.classList.remove('opacity-100', 'scale-100');
    wishModal.classList.add('opacity-0', 'pointer-events-none', 'scale-90');

    currentWishIndex++;

    setTimeout(() => {
        isTransitioning = false;

        // Si ya se liberaron los 5 deseos -> DISPARAR EL CLÍMAX FINAL
        if (currentWishIndex >= wishes.length) {
            startFinalPhraseClimax();
        }
    }, 500);
});

/* =========================================================================
   6. CLÍMAX: LAS LUCIÉRNAGAS ESCRIBEN "¡FELIZ CUMPLEAÑOS!"
   ========================================================================= */
function startFinalPhraseClimax() {
    if (finalCelebrationStarted) return;
    finalCelebrationStarted = true;

    // 1. Ocultar suavemente el frasco y el subtítulo para despejar la vista
    document.getElementById('mainJarArea').style.transition = 'opacity 1.5s, transform 1.5s';
    document.getElementById('mainJarArea').style.opacity = '0';
    document.getElementById('mainJarArea').style.transform = 'scale(0.85) translateY(40px)';
    document.getElementById('mainJarArea').style.pointerEvents = 'none';

    document.getElementById('subHeaderInstruction').textContent = 'Observa cómo se reúnen en el firmamento...';

    // 2. Extraer los puntos que forman las letras
    textTargetPoints = generateTextPoints('Feliz\nCumpleaños\nSilver');

    // 3. Crear enjambre de partículas convergiendo desde las posiciones de las luciérnagas
    const centerX = width / 2;
    const centerY = height * 0.45;

    textTargetPoints.forEach(target => {
        // Nacen distribuidas cerca del centro o de las luciérnagas existentes
        const startX = centerX + (Math.random() - 0.5) * 80;
        const startY = centerY + (Math.random() - 0.5) * 80;
        const p = new TextParticle(startX, startY, target.x, target.y);
        textParticles.push(p);
    });

    // 4. (Sonidos eliminados)

    // 5. Atraer partículas magnéticamente hacia las letras
    setTimeout(() => {
        textParticles.forEach(p => {
            p.forming = true;
        });
        document.getElementById('subHeaderInstruction').textContent = 'El cielo celebra tu vida.';
    }, 1000);

    // 6. Revelar botón de la Carta Final
    setTimeout(() => {
        const finalBtnContainer = document.getElementById('finalActions');
        finalBtnContainer.classList.remove('opacity-0', 'pointer-events-none');
        finalBtnContainer.classList.add('opacity-100');
    }, 3500);
}

/* =========================================================================
   7. CARTA FINAL
   ========================================================================= */
const letterModal = document.getElementById('letterModal');
const letterBox = document.getElementById('letterBox');
const openLetterBtn = document.getElementById('openLetterBtn');
const closeLetterBtn = document.getElementById('closeLetterBtn');

openLetterBtn.addEventListener('click', () => {

    const env = document.getElementById('envelopeEl');
    const paper = document.querySelector('.envelope-paper');
    if (!env.classList.contains('open')) {
        env.classList.add('open');

        // Esperar a que termine la animación del sobre antes de mostrar el modal
        setTimeout(() => {
            paper.style.transition = 'opacity 0.4s';
            paper.style.opacity = '0';

            letterModal.classList.remove('opacity-0', 'pointer-events-none');
            letterModal.classList.add('opacity-100');
            letterBox.classList.remove('scale-[0.2]', '-translate-y-24', 'opacity-0');
            letterBox.classList.add('scale-100', 'translate-y-0', 'opacity-100');
        }, 1000);
    } else {
        // Si ya estaba abierto, mostrar modal directo
        paper.style.transition = 'opacity 0.4s';
        paper.style.opacity = '0';

        letterModal.classList.remove('opacity-0', 'pointer-events-none');
        letterModal.classList.add('opacity-100');
        letterBox.classList.remove('scale-[0.2]', '-translate-y-24', 'opacity-0');
        letterBox.classList.add('scale-100', 'translate-y-0', 'opacity-100');
    }
});

closeLetterBtn.addEventListener('click', () => {
    letterModal.classList.remove('opacity-100');
    letterModal.classList.add('opacity-0', 'pointer-events-none');
    letterBox.classList.remove('scale-100', 'translate-y-0', 'opacity-100');
    letterBox.classList.add('scale-[0.2]', '-translate-y-24', 'opacity-0');

    setTimeout(() => {
        const paper = document.querySelector('.envelope-paper');
        paper.style.opacity = '1';

        // Cerrar el sobre
        const env = document.getElementById('envelopeEl');
        env.classList.remove('open');

        // Esperar a que cierre el sobre, luego desvanecerlo y mostrar el frasco
        setTimeout(() => {
            const finalBtnContainer = document.getElementById('finalActions');
            finalBtnContainer.classList.remove('opacity-100');
            finalBtnContainer.classList.add('opacity-0', 'pointer-events-none');

            setTimeout(() => {
                const mainJarArea = document.getElementById('mainJarArea');
                mainJarArea.style.opacity = '1';
                mainJarArea.style.transform = 'scale(1) translateY(0)';
                mainJarArea.style.pointerEvents = 'auto';

                document.getElementById('subHeaderInstruction').textContent = 'El firmamento está lleno de luz.';

                // Dispersar el texto de Feliz Cumpleaños
                textParticles.forEach(p => {
                    p.dispersing = true;
                    p.vx = (Math.random() - 0.5) * 3;
                    p.vy = -Math.random() * 3 - 1; // Vuelan suavemente hacia arriba
                });
            }, 1000);
        }, 1200);
    }, 500);
});