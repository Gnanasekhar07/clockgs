// ------------------------------
// Parallax 3D Effect for Panels
// ------------------------------
document.addEventListener('mousemove', (e) => {
    const panels = document.querySelectorAll('.glass-panel');
    const x = (window.innerWidth / 2 - e.pageX) / 25;
    const y = (window.innerHeight / 2 - e.pageY) / 25;

    panels.forEach(panel => {
        panel.style.transform = `rotateY(${-x}deg) rotateX(${y}deg)`;
    });
});

// ------------------------------
// Navigation Logic
// ------------------------------
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active-view'));

        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.target);
        target.classList.add('active-view');
    });
});

// ------------------------------
// Location & Geolocation
// ------------------------------
const locationDisplay = document.querySelector('#location-display span');

function fetchLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Reverse geocoding using free OpenStreetMap Nominatim API
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || 'Unknown Location';
                const country = data.address.country || '';
                locationDisplay.innerHTML = `${city}, ${country}`;
            } catch (err) {
                locationDisplay.innerHTML = "Local Time";
            }
        }, () => {
            locationDisplay.innerHTML = "Local Time";
        });
    } else {
        locationDisplay.innerHTML = "Local Time";
    }
}
fetchLocation();

// ------------------------------
// Clock Logic
// ------------------------------
const digitalTime = document.getElementById('digital-time');
const digitalDate = document.getElementById('digital-date');
const hourHand = document.getElementById('hour-hand');
const minuteHand = document.getElementById('minute-hand');
const secondHand = document.getElementById('second-hand');
const analogFace = document.querySelector('.analog-face');
const digitalFace = document.querySelector('.digital-face');
const toggleFaceBtn = document.getElementById('toggle-face');
const themeToggle = document.getElementById('theme-toggle');

// Build analog ticks
const ticksContainer = document.querySelector('.ticks');
if (ticksContainer) {
    // Ticks removed by user request
}

// Build analog numbers
if (analogFace) {
    const numbersContainer = document.createElement('div');
    numbersContainer.className = 'numbers';
    for (let i = 1; i <= 12; i++) {
        let num = document.createElement('div');
        num.className = 'number';
        num.style.transform = `rotate(${i * 30}deg)`;

        let span = document.createElement('span');
        span.textContent = i;
        span.style.transform = `rotate(${-i * 30}deg)`;

        num.appendChild(span);
        numbersContainer.appendChild(num);
    }
    analogFace.appendChild(numbersContainer);
}

let isAnalog = false;
toggleFaceBtn.addEventListener('click', () => {
    isAnalog = !isAnalog;
    if (isAnalog) {
        analogFace.classList.remove('hidden');
        digitalFace.classList.add('hidden');
    } else {
        analogFace.classList.add('hidden');
        digitalFace.classList.remove('hidden');
    }
});

// Theme Toggle Logic
themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
});

function updateClock() {
    const now = new Date();

    // Digital format explicitly defining all parts to avoid browser inconsistencies
    digitalTime.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    digitalDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase();

    // Analog
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours();

    const sDeg = s * 6;
    const mDeg = (m * 6) + (s * 0.1);
    const hDeg = ((h % 12) * 30) + (m * 0.5);

    secondHand.style.transform = `rotate(${sDeg}deg)`;
    minuteHand.style.transform = `rotate(${mDeg}deg)`;
    hourHand.style.transform = `rotate(${hDeg}deg)`;

    requestAnimationFrame(updateClock);
}
requestAnimationFrame(updateClock);

// ------------------------------
// Stopwatch Logic
// ------------------------------
const swDisplay = document.getElementById('stopwatch-display');
const btnSwStart = document.getElementById('sw-start');
const btnSwStop = document.getElementById('sw-stop');
const btnSwReset = document.getElementById('sw-reset');
const btnSwLap = document.getElementById('sw-lap');
const lapsList = document.getElementById('laps-list');

let swStartTime = 0;
let swElapsedTime = 0;
let swInterval = null;
let lapCounter = 1;

function formatTime(ms) {
    let date = new Date(ms);
    let h = date.getUTCHours().toString().padStart(2, '0');
    let m = date.getUTCMinutes().toString().padStart(2, '0');
    let s = date.getUTCSeconds().toString().padStart(2, '0');
    let millis = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
    return `${h}:${m}:${s}<span class="ms">.${millis}</span>`;
}

function formatLapTime(ms) {
    let date = new Date(ms);
    let h = date.getUTCHours().toString().padStart(2, '0');
    let m = date.getUTCMinutes().toString().padStart(2, '0');
    let s = date.getUTCSeconds().toString().padStart(2, '0');
    let millis = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
    return `${h}:${m}:${s}.${millis}`;
}

btnSwStart.addEventListener('click', () => {
    if (!swInterval) {
        swStartTime = Date.now() - swElapsedTime;
        swInterval = requestAnimationFrame(updateStopwatch);

        btnSwStart.querySelector('i').className = 'fa-solid fa-play';
        btnSwStart.innerHTML = '<i class="fa-solid fa-play"></i> Running';
        btnSwStart.style.opacity = '0.5';
    }
});

btnSwStop.addEventListener('click', () => {
    if (swInterval) {
        cancelAnimationFrame(swInterval);
        swInterval = null;
        btnSwStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        btnSwStart.style.opacity = '1';
    }
});

btnSwReset.addEventListener('click', () => {
    cancelAnimationFrame(swInterval);
    swInterval = null;
    swElapsedTime = 0;
    swDisplay.innerHTML = '00:00:00<span class="ms">.00</span>';
    lapsList.innerHTML = '';
    lapCounter = 1;
    btnSwStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
    btnSwStart.style.opacity = '1';
});

btnSwLap.addEventListener('click', () => {
    if (swInterval) {
        const lapElem = document.createElement('div');
        lapElem.className = 'lap-item';
        lapElem.innerHTML = `<span>Lap ${lapCounter}</span><span>${formatLapTime(swElapsedTime)}</span>`;
        lapsList.prepend(lapElem);
        lapCounter++;
    }
});

function updateStopwatch() {
    swElapsedTime = Date.now() - swStartTime;
    swDisplay.innerHTML = formatTime(swElapsedTime);
    swInterval = requestAnimationFrame(updateStopwatch);
}

// ------------------------------
// Timer Logic
// ------------------------------
const timerInputGroup = document.getElementById('timer-input-group');
const timerDisplay = document.getElementById('timer-display');
const inp_h = document.getElementById('timer-h');
const inp_m = document.getElementById('timer-m');
const inp_s = document.getElementById('timer-s');

const btnTmStart = document.getElementById('tm-start');
const btnTmPause = document.getElementById('tm-pause');
const btnTmReset = document.getElementById('tm-reset');
const timerRing = document.getElementById('timer-ring');

let tmTotalSeconds = 0;
let tmRemaining = 0;
let tmInterval = null;
const ringCircumference = 565.48; // 2 * pi * 90

function getTimerInput() {
    let h = parseInt(inp_h.value) || 0;
    let m = parseInt(inp_m.value) || 0;
    let s = parseInt(inp_s.value) || 0;
    return (h * 3600) + (m * 60) + s;
}

function formatTimerTxt(secs) {
    let h = Math.floor(secs / 3600).toString().padStart(2, '0');
    let m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    let s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

btnTmStart.addEventListener('click', () => {
    if (!tmInterval) {
        if (tmRemaining === 0) {
            tmTotalSeconds = getTimerInput();
            tmRemaining = tmTotalSeconds;
        }

        if (tmRemaining > 0) {
            timerInputGroup.classList.add('hidden');
            timerDisplay.classList.remove('hidden');
            timerDisplay.textContent = formatTimerTxt(tmRemaining);

            tmInterval = setInterval(updateTimer, 1000);
            btnTmStart.style.opacity = '0.5';
            btnTmStart.disabled = true;
        }
    }
});

btnTmPause.addEventListener('click', () => {
    clearInterval(tmInterval);
    tmInterval = null;
    btnTmStart.style.opacity = '1';
    btnTmStart.disabled = false;
    btnTmStart.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
});

btnTmReset.addEventListener('click', () => {
    clearInterval(tmInterval);
    tmInterval = null;
    tmRemaining = 0;

    timerInputGroup.classList.remove('hidden');
    timerDisplay.classList.add('hidden');

    timerRing.style.strokeDashoffset = 0;
    timerRing.style.stroke = 'var(--accent-timer)';

    btnTmStart.style.opacity = '1';
    btnTmStart.disabled = false;
    btnTmStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
});

function updateTimer() {
    if (tmRemaining > 0) {
        tmRemaining--;
        timerDisplay.textContent = formatTimerTxt(tmRemaining);

        // Update SVG Ring
        let progress = tmRemaining / tmTotalSeconds;
        let offset = ringCircumference - (progress * ringCircumference);
        timerRing.style.strokeDashoffset = offset;

        // Change color when low
        if (progress < 0.2) {
            timerRing.style.stroke = '#ff3366'; // Red when running out
        }

        if (tmRemaining === 0) {
            clearInterval(tmInterval);
            tmInterval = null;
            playAlarmSound();
            btnTmStart.style.opacity = '1';
            btnTmStart.disabled = false;
            btnTmStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
            timerDisplay.textContent = "00:00:00";
            timerDisplay.style.color = "#ff3366";

            setTimeout(() => {
                timerDisplay.style.color = "var(--text-primary)";
            }, 3000); // Reset color after alarm
        }
    }
}

function playAlarmSound() {
    // Generate a simple pleasant electronic beep using AudioContext without external files
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Hz
                oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.5);

                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
            }, i * 600);
        }
    } catch (e) {
        console.warn("Web Audio API not supported", e);
    }
}
