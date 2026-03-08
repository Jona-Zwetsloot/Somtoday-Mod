let somtodayEnabled;
const particles = [];
const particleCount = 25;
let canvas, ctx, animationId;

function initParticles() {
    canvas = document.getElementById('particle-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }

    animateParticles();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
    });

    animationId = requestAnimationFrame(animateParticles);
}

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = event.clientY - rect.top - size / 2 + 'px';

    button.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
}

document.addEventListener('DOMContentLoaded', () => {
    initParticles();

    document.querySelectorAll('button, a').forEach(el => {
        el.addEventListener('click', createRipple);
    });
});

document.getElementById('icon-checked').style.display = 'none';
document.getElementById('confirmation').style.display = 'none';

chrome.storage.local.get(['enabled']).then((result) => {
    somtodayEnabled = result['enabled'];
    updateCheckbox();
});

document.getElementById('txt-enable-disable').innerHTML = chrome.i18n.getMessage('enableDisable');
document.getElementById('txt-to-somtoday').innerHTML = chrome.i18n.getMessage('toSomtoday');
document.getElementById('txt-reset-all').innerHTML = chrome.i18n.getMessage('resetAll');
document.getElementById('txt-confirm').innerHTML = chrome.i18n.getMessage('confirmReset');
document.getElementById('yes').innerHTML = '<p>' + chrome.i18n.getMessage('yes') + '</p>';
document.getElementById('no').innerHTML = '<p>' + chrome.i18n.getMessage('no') + '</p>';

document.getElementById('reset-all').addEventListener('click', function () {
    document.getElementById('settings').style.display = 'none';
    document.getElementById('confirmation').removeAttribute('style');
});

document.getElementById('yes').addEventListener('click', function () {
    chrome.storage.local.clear();
    chrome.storage.local.set({ enabled: true });
    somtodayEnabled = true;
    updateCheckbox();
    document.getElementById('settings').removeAttribute('style');
    document.getElementById('confirmation').style.display = 'none';
});

document.getElementById('no').addEventListener('click', function () {
    document.getElementById('settings').removeAttribute('style');
    document.getElementById('confirmation').style.display = 'none';
});

document.getElementById('enable-disable').addEventListener('click', function () {
    somtodayEnabled = !somtodayEnabled;
    updateCheckbox();
    chrome.storage.local.set({ enabled: somtodayEnabled });
    this.classList.add('toggle-pulse');
    setTimeout(() => this.classList.remove('toggle-pulse'), 500);
});

function updateCheckbox() {
    chrome.action.setBadgeText({ text: somtodayEnabled ? 'on' : 'off' });
    chrome.action.setBadgeBackgroundColor({ color: somtodayEnabled ? '#6366f1' : '#888888' });
    document.getElementById('icon-checked').style.display = somtodayEnabled ? 'inline-block' : 'none';
    document.getElementById('icon-unchecked').style.display = somtodayEnabled ? 'none' : 'inline-block';
}

window.addEventListener('resize', resizeCanvas);