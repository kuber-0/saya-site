/* Глитч текста */
(() => {
    const glyphs = '█▓▒░█▓▒░#@%&*<>?/\\|';
    const titles = document.querySelectorAll('h2, h3');

    titles.forEach(el => {
        const original = el.innerHTML;
        const plain = el.textContent;

        const scheduleNext = () => {
            const delay = 900 + Math.random() * 1800; 
            
            setTimeout(() => {
                if (Math.random() > 0.05) {
                    let out = '';
                    for (let ch of plain) {
                        out += Math.random() < 0.30
                            ? glyphs[Math.floor(Math.random() * glyphs.length)]
                            : ch;
                    }
                    el.textContent = out;
                    setTimeout(() => { el.innerHTML = original; }, 120 + Math.random() * 200);
                }
                scheduleNext();
            }, delay);
        };
        
        scheduleNext();
    });
})();

/* Споры плавают */
(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'dustCanvas';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: '1',
        opacity: '0.55'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];

    const resize = () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);

    const COUNT = window.innerWidth < 700 ? 40 : 90;

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.8 + 0.4,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -Math.random() * 0.25 - 0.05,
            a: Math.random() * 0.6 + 0.2,
            // красноватые/мясные оттенки
            hue: Math.random() < 0.6 ? 350 : 170 
        });
    }

    const loop = () => {
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 65%, 55%, ${p.a})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.8)`;
            ctx.fill();
        }
        requestAnimationFrame(loop);
    };
    
    loop();
})();

/* пасхалка 5 раз нажать на сердце */
(() => {
    const heart = document.querySelector('footer .heart');
    if (!heart) return;

    let clicks = 0;
    let timer = null;

    heart.style.cursor = 'pointer';
    heart.style.pointerEvents = 'auto';

    const revealTruth = () => {
        const veil = document.createElement('div');
        Object.assign(veil.style, {
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(120,0,0,0.85), rgba(20,0,0,0.98))',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0',
            transition: 'opacity 1s ease',
            pointerEvents: 'none',
            backdropFilter: 'blur(3px)'
        });

        const text = document.createElement('div');
        text.innerHTML = 'ты всё ещё человек?<br><span style="font-size:16px;letter-spacing:4px;">или уже как я?</span>';
        Object.assign(text.style, {
            color: '#ffb3b3',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: '36px',
            textAlign: 'center',
            textShadow: '0 0 30px #ff0000',
            lineHeight: '1.4'
        });
        
        veil.appendChild(text);
        document.body.appendChild(veil);

        requestAnimationFrame(() => { veil.style.opacity = '1'; });

        setTimeout(() => {
            veil.style.opacity = '0';
            setTimeout(() => veil.remove(), 1200);
        }, 3500);
    };

    heart.addEventListener('click', () => {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 2000);

        if (clicks >= 5) {
            clicks = 0;
            revealTruth();
        }
    });
})();

/* шепотные слова */
(() => {
    const phrases = [
        'я рядом',
        'не оборачивайся',
        'ты меня видишь?',
        'это не твои глаза',
        'мне холодно',
        'ты пахнешь человеком',
        'здесь кто-то есть',
        'я всё помню',
        'почему ты плачешь?'
    ];

    const showWhisper = () => {
        const el = document.createElement('div');
        el.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        
        Object.assign(el.style, {
            position: 'fixed',
            color: 'rgba(255, 200, 200, 0.75)',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: `${14 + Math.random() * 8}px`,
            letterSpacing: '2px',
            textShadow: '0 0 12px rgba(255, 60, 60, 0.7)',
            pointerEvents: 'none',
            zIndex: '3',
            opacity: '0',
            transition: 'opacity 2s ease',
            userSelect: 'none'
        });

        // случайная позиция по краям
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { el.style.top = `${10 + Math.random() * 80}vh`; el.style.left = '20px'; }
        if (side === 1) { el.style.top = `${10 + Math.random() * 80}vh`; el.style.right = '20px'; }
        if (side === 2) { el.style.top = '20px'; el.style.left = `${10 + Math.random() * 80}vw`; }
        if (side === 3) { el.style.bottom = '20px'; el.style.left = `${10 + Math.random() * 80}vw`; }

        document.body.appendChild(el);

        requestAnimationFrame(() => { el.style.opacity = '1'; });

        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 2200);
        }, 3000 + Math.random() * 2000);

        setTimeout(showWhisper, 9000 + Math.random() * 12000);
    };
    
    setTimeout(showWhisper, 5000);
})();