/**
 * SafeHer — Women Safety Platform
 * Main Application Logic
 * Features: SOS Signal, Live Tracking, Voice-Activated Camera, Emergency Contacts
 */

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollAnimations();
    initHeroCounters();
    initSOS();
    initLiveTracking();
    initCamera();
    initContacts();
    initFakeCall();
});

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: '✅',
        danger: '🚨',
        warning: '⚠️',
        info: '💡'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.4s ease reverse forwards';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ==========================================
// NAVBAR
// ==========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = navLinks.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section highlighting
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('open');
    });

    // Close mobile nav on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('open');
        });
    });
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .info-card, .helpline-card').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// HERO STAT COUNTERS
// ==========================================
function initHeroCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * easeOut);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ==========================================
// SOS EMERGENCY SYSTEM
// ==========================================
let sosTimeout = null;
let sosHoldTimer = null;
let sirenAudioContext = null;
let sirenOscillator = null;

function initSOS() {
    const sosButton = document.getElementById('sosButton');
    const sirenToggle = document.getElementById('sirenToggle');

    let holdStart = 0;

    // SOS button hold functionality
    sosButton.addEventListener('mousedown', startSosHold);
    sosButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startSosHold();
    });

    sosButton.addEventListener('mouseup', cancelSosHold);
    sosButton.addEventListener('mouseleave', cancelSosHold);
    sosButton.addEventListener('touchend', cancelSosHold);

    function startSosHold() {
        holdStart = Date.now();
        sosButton.classList.add('active');

        sosHoldTimer = setTimeout(() => {
            triggerSOS();
        }, 3000);

        // Show countdown while holding
        updateHoldCountdown();
    }

    function cancelSosHold() {
        sosButton.classList.remove('active');
        clearTimeout(sosHoldTimer);
        sosHoldTimer = null;

        const sosCountdown = document.getElementById('sosCountdown');
        sosCountdown.style.display = 'none';

        const sosStatus = document.getElementById('sosStatus');
        sosStatus.style.display = 'flex';
    }

    function updateHoldCountdown() {
        const sosCountdown = document.getElementById('sosCountdown');
        const countdownNumber = document.getElementById('countdownNumber');
        const sosStatus = document.getElementById('sosStatus');

        if (!sosHoldTimer) return;

        const elapsed = (Date.now() - holdStart) / 1000;
        const remaining = Math.max(0, 3 - Math.floor(elapsed));

        sosStatus.style.display = 'none';
        sosCountdown.style.display = 'block';
        countdownNumber.textContent = remaining;

        if (remaining > 0 && sosHoldTimer) {
            requestAnimationFrame(updateHoldCountdown);
        }
    }
}

function triggerSOS() {
    const sosStatus = document.getElementById('sosStatus');
    const sosCountdown = document.getElementById('sosCountdown');
    const sosAlertSent = document.getElementById('sosAlertSent');
    const sirenToggle = document.getElementById('sirenToggle');
    const sosButton = document.getElementById('sosButton');

    sosButton.classList.remove('active');
    sosCountdown.style.display = 'none';
    sosStatus.style.display = 'none';

    // Flash screen
    document.body.classList.add('sos-active');

    // Get location and send alert
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                sendSOSAlert(latitude, longitude);
            },
            () => {
                sendSOSAlert(null, null);
            },
            { enableHighAccuracy: true }
        );
    } else {
        sendSOSAlert(null, null);
    }

    // Activate siren if enabled
    if (sirenToggle.checked) {
        startSiren();
    }

    // Show success state
    setTimeout(() => {
        sosAlertSent.style.display = 'block';
        showToast('Emergency SOS alert sent to all contacts!', 'danger');
    }, 1000);

    // Reset after a while
    setTimeout(() => {
        document.body.classList.remove('sos-active');
        sosAlertSent.style.display = 'none';
        sosStatus.style.display = 'flex';
        stopSiren();
    }, 10000);
}

function sendSOSAlert(lat, lng) {
    const contacts = getContacts();
    const locationStr = lat && lng 
        ? `https://maps.google.com/maps?q=${lat},${lng}` 
        : 'Location unavailable';
    
    const message = `🚨 EMERGENCY SOS 🚨\n\nI need immediate help!\nLocation: ${locationStr}\n\nSent via SafeHer Safety App`;

    contacts.forEach(contact => {
        console.log(`[SOS] Sending alert to ${contact.name} (${contact.phone}): ${message}`);
        // In production, this would integrate with SMS API (Twilio, etc.)
    });

    // Log the SOS event
    const sosLog = JSON.parse(localStorage.getItem('safeher_sos_log') || '[]');
    sosLog.push({
        timestamp: new Date().toISOString(),
        location: lat && lng ? { lat, lng } : null,
        contactsNotified: contacts.length
    });
    localStorage.setItem('safeher_sos_log', JSON.stringify(sosLog));

    if (contacts.length === 0) {
        showToast('No emergency contacts added. Please add contacts first.', 'warning');
    }
}

// Siren System
function startSiren() {
    try {
        sirenAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        sirenOscillator = sirenAudioContext.createOscillator();
        const gainNode = sirenAudioContext.createGain();

        sirenOscillator.type = 'sawtooth';
        gainNode.gain.value = 0.3;

        sirenOscillator.connect(gainNode);
        gainNode.connect(sirenAudioContext.destination);

        sirenOscillator.start();

        // Create siren effect (alternating frequencies)
        let high = true;
        const sirenInterval = setInterval(() => {
            if (!sirenOscillator) {
                clearInterval(sirenInterval);
                return;
            }
            sirenOscillator.frequency.setValueAtTime(
                high ? 800 : 600,
                sirenAudioContext.currentTime
            );
            sirenOscillator.frequency.linearRampToValueAtTime(
                high ? 600 : 800,
                sirenAudioContext.currentTime + 0.5
            );
            high = !high;
        }, 500);

        showToast('Siren activated!', 'danger');
    } catch (e) {
        console.error('Could not start siren:', e);
    }
}

function stopSiren() {
    if (sirenOscillator) {
        sirenOscillator.stop();
        sirenOscillator = null;
    }
    if (sirenAudioContext) {
        sirenAudioContext.close();
        sirenAudioContext = null;
    }
}

// ==========================================
// LIVE TRACKING SYSTEM
// ==========================================
let map = null;
let userMarker = null;
let trackingWatchId = null;
let trackingPath = [];
let polyline = null;

function initLiveTracking() {
    const startBtn = document.getElementById('startTracking');
    const shareBtn = document.getElementById('shareLocation');

    startBtn.addEventListener('click', toggleTracking);
    shareBtn.addEventListener('click', shareCurrentLocation);
}

function toggleTracking() {
    const startBtn = document.getElementById('startTracking');
    const shareBtn = document.getElementById('shareLocation');
    const mapOverlay = document.getElementById('mapOverlay');

    if (trackingWatchId !== null) {
        // Stop tracking
        navigator.geolocation.clearWatch(trackingWatchId);
        trackingWatchId = null;
        startBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            Start Tracking
        `;
        shareBtn.disabled = true;
        document.getElementById('shareStatus').style.display = 'none';
        showToast('Location tracking stopped', 'info');
        return;
    }

    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'danger');
        return;
    }

    showToast('Requesting location access...', 'info');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            // Initialize Leaflet map
            if (!map) {
                mapOverlay.style.display = 'none';
                map = L.map('map', {
                    zoomControl: true
                }).setView([latitude, longitude], 16);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
            }

            // Custom marker
            const pinkIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    width: 20px; height: 20px; 
                    background: linear-gradient(135deg, #E879A8, #A855F7); 
                    border-radius: 50%; 
                    border: 3px solid #fff;
                    box-shadow: 0 0 20px rgba(232,121,168,0.5);
                "></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]);
            } else {
                userMarker = L.marker([latitude, longitude], { icon: pinkIcon }).addTo(map);
                userMarker.bindPopup('<strong>You are here</strong>').openPopup();
            }

            map.setView([latitude, longitude], 16);
            updateLocationInfo(position);

            // Start watching position
            trackingWatchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    
                    userMarker.setLatLng([lat, lng]);
                    map.panTo([lat, lng]);
                    updateLocationInfo(pos);

                    // Draw path
                    trackingPath.push([lat, lng]);
                    if (polyline) {
                        polyline.setLatLngs(trackingPath);
                    } else {
                        polyline = L.polyline(trackingPath, {
                            color: '#E879A8',
                            weight: 3,
                            opacity: 0.7
                        }).addTo(map);
                    }
                },
                (err) => {
                    console.error('Tracking error:', err);
                    showToast('Location tracking error: ' + err.message, 'danger');
                },
                { enableHighAccuracy: true, maximumAge: 5000 }
            );

            startBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                Stop Tracking
            `;
            shareBtn.disabled = false;
            showToast('Live tracking started!', 'success');
        },
        (error) => {
            showToast('Could not access your location. Please enable location services.', 'danger');
            console.error('Location error:', error);
        },
        { enableHighAccuracy: true }
    );
}

function updateLocationInfo(position) {
    document.getElementById('latValue').textContent = position.coords.latitude.toFixed(6);
    document.getElementById('lngValue').textContent = position.coords.longitude.toFixed(6);
    document.getElementById('accValue').textContent = `±${Math.round(position.coords.accuracy)}m`;
    document.getElementById('timeValue').textContent = new Date().toLocaleTimeString();
}

function shareCurrentLocation() {
    if (!userMarker) {
        showToast('Start tracking first to share your location', 'warning');
        return;
    }

    const latLng = userMarker.getLatLng();
    const shareUrl = `https://maps.google.com/maps?q=${latLng.lat},${latLng.lng}`;
    
    // Use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'My Live Location - SafeHer',
            text: '📍 Here is my current location. Track me for safety.',
            url: shareUrl
        }).then(() => {
            showToast('Location shared successfully!', 'success');
        }).catch(() => {
            copyToClipboard(shareUrl);
        });
    } else {
        copyToClipboard(shareUrl);
    }

    document.getElementById('shareStatus').style.display = 'flex';

    // Also send to emergency contacts
    const contacts = getContacts();
    contacts.forEach(contact => {
        console.log(`[SHARE] Sending location to ${contact.name}: ${shareUrl}`);
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Location link copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Could not copy link. URL: ' + text, 'info');
    });
}

// ==========================================
// VOICE-ACTIVATED CAMERA SYSTEM
// ==========================================
let cameraStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recognition = null;
let isListening = false;
let isRecording = false;
let triggerWords = ['sos', 'help me', 'emergency', 'bachao', 'save me'];

function initCamera() {
    const enableBtn = document.getElementById('enableCamera');
    const listenBtn = document.getElementById('startListening');
    const recordBtn = document.getElementById('manualRecord');
    const addWordBtn = document.getElementById('addWordBtn');

    enableBtn.addEventListener('click', toggleCamera);
    listenBtn.addEventListener('click', toggleListening);
    recordBtn.addEventListener('click', toggleManualRecord);
    addWordBtn.addEventListener('click', addTriggerWord);

    // Load saved trigger words
    const savedWords = localStorage.getItem('safeher_trigger_words');
    if (savedWords) {
        triggerWords = JSON.parse(savedWords);
        renderTriggerWords();
    }
}

async function toggleCamera() {
    const enableBtn = document.getElementById('enableCamera');
    const listenBtn = document.getElementById('startListening');
    const recordBtn = document.getElementById('manualRecord');
    const cameraOverlay = document.getElementById('cameraOverlay');
    const cameraFeed = document.getElementById('cameraFeed');

    if (cameraStream) {
        // Stop camera
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        cameraFeed.srcObject = null;
        cameraOverlay.style.display = 'flex';
        enableBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
            </svg>
            Enable Camera & Mic
        `;
        listenBtn.disabled = true;
        recordBtn.disabled = true;

        // Stop listening if active
        if (isListening) {
            toggleListening();
        }
        if (isRecording) {
            stopRecording();
        }

        showToast('Camera stopped', 'info');
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true
        });

        cameraFeed.srcObject = cameraStream;
        cameraOverlay.style.display = 'none';

        enableBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>
            </svg>
            Disable Camera
        `;
        listenBtn.disabled = false;
        recordBtn.disabled = false;

        showToast('Camera and microphone enabled!', 'success');
    } catch (err) {
        console.error('Camera error:', err);
        showToast('Could not access camera/microphone. Please grant permission.', 'danger');
    }
}

function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Voice recognition is not supported in this browser. Please use Google Chrome.', 'warning');
        return;
    }

    if (!cameraStream) {
        showToast('Please enable Camera & Mic first before starting voice listening.', 'warning');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    const listenBtn = document.getElementById('startListening');
    const voiceIndicator = document.getElementById('voiceIndicator');
    const detectedText = document.getElementById('detectedText');
    const speechOutput = document.getElementById('speechOutput');

    recognition.onstart = () => {
        isListening = true;
        voiceIndicator.style.display = 'flex';
        detectedText.style.display = 'block';
        speechOutput.textContent = 'Listening...';
        listenBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .7-.1 1.37-.29 2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Stop Listening
        `;
        showToast('Voice recognition started. Say a trigger word!', 'success');
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

        speechOutput.textContent = transcript || 'Listening...';

        // Check for trigger words
        const lower = transcript.toLowerCase();
        for (const word of triggerWords) {
            if (lower.includes(word.toLowerCase())) {
                showToast(`Trigger word "${word}" detected! Starting recording...`, 'danger');
                if (!isRecording) {
                    startRecording();
                }
                break;
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
            showToast('Microphone access denied. Please allow microphone permission in browser settings.', 'danger');
            isListening = false;
            return;
        }
        if (event.error === 'network') {
            showToast('Network error with speech recognition. Check your internet connection.', 'warning');
            return;
        }
        showToast('Voice recognition error: ' + event.error, 'warning');
    };

    recognition.onend = () => {
        // Auto-restart if still supposed to listen
        if (isListening) {
            setTimeout(() => {
                if (isListening && recognition) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // Create a fresh instance if the old one is dead
                        console.log('Recreating recognition instance...');
                        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                        const oldOnResult = recognition.onresult;
                        const oldOnError = recognition.onerror;
                        const oldOnEnd = recognition.onend;
                        const oldOnStart = recognition.onstart;
                        recognition = new SR();
                        recognition.continuous = true;
                        recognition.interimResults = true;
                        recognition.lang = 'en-US';
                        recognition.onstart = oldOnStart;
                        recognition.onresult = oldOnResult;
                        recognition.onerror = oldOnError;
                        recognition.onend = oldOnEnd;
                        recognition.start();
                    }
                }
            }, 300);
        }
    };

    try {
        recognition.start();
    } catch (e) {
        console.error('Failed to start recognition:', e);
        showToast('Could not start voice recognition. Make sure you are using Chrome and microphone is enabled.', 'danger');
    }
}

function stopListening() {
    isListening = false;
    const listenBtn = document.getElementById('startListening');
    const voiceIndicator = document.getElementById('voiceIndicator');

    if (recognition) {
        recognition.stop();
        recognition = null;
    }

    voiceIndicator.style.display = 'none';
    listenBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        Start Voice Listening
    `;
    showToast('Voice recognition stopped', 'info');
}

function getSupportedMimeType() {
    const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4;codecs=h264',
        'video/mp4',
        ''
    ];
    for (const type of types) {
        if (type === '' || MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return '';
}

function startRecording() {
    if (isRecording) {
        showToast('Already recording!', 'warning');
        return;
    }

    if (!cameraStream) {
        showToast('Please enable Camera & Mic first before recording.', 'warning');
        return;
    }

    recordedChunks = [];
    const mimeType = getSupportedMimeType();
    
    try {
        const options = mimeType ? { mimeType } : undefined;
        mediaRecorder = new MediaRecorder(cameraStream, options);
        console.log('[SafeHer] MediaRecorder using:', mimeType || 'browser default');
    } catch (e) {
        console.error('MediaRecorder creation failed:', e);
        showToast('Recording is not supported in this browser. Try Chrome or Firefox.', 'danger');
        return;
    }

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blobType = mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunks, { type: blobType });
        saveRecording(blob, blobType);
    };

    mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        showToast('Recording error occurred. Please try again.', 'danger');
        isRecording = false;
        document.getElementById('recordingIndicator').style.display = 'none';
    };

    mediaRecorder.start(1000); // Collect data every second
    isRecording = true;

    const recordingIndicator = document.getElementById('recordingIndicator');
    const recordBtn = document.getElementById('manualRecord');
    recordingIndicator.style.display = 'flex';
    recordBtn.innerHTML = '<span class="rec-dot-btn"></span> Stop Recording';

    showToast('Recording started!', 'danger');

    // Auto-stop after 60 seconds
    setTimeout(() => {
        if (isRecording) {
            stopRecording();
            showToast('Recording auto-stopped after 60 seconds', 'info');
        }
    }, 60000);
}

function stopRecording() {
    if (!mediaRecorder || !isRecording) return;

    mediaRecorder.stop();
    isRecording = false;

    const recordingIndicator = document.getElementById('recordingIndicator');
    const recordBtn = document.getElementById('manualRecord');
    recordingIndicator.style.display = 'none';
    recordBtn.innerHTML = '<span class="rec-dot-btn"></span> Manual Record';

    showToast('Recording saved!', 'success');
}

function toggleManualRecord() {
    if (!cameraStream) {
        showToast('Please enable Camera & Mic first before recording.', 'warning');
        return;
    }
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function saveRecording(blob, mimeType) {
    const timestamp = new Date().toLocaleString();
    const url = URL.createObjectURL(blob);
    const ext = mimeType && mimeType.includes('mp4') ? 'mp4' : 'webm';

    const container = document.getElementById('recordingsContainer');
    
    // Remove "No recordings" message
    const noRec = container.querySelector('.no-recordings');
    if (noRec) noRec.remove();

    const item = document.createElement('div');
    item.className = 'recording-item';
    item.innerHTML = `
        <span class="rec-name">📹 Recording</span>
        <span class="rec-time">${timestamp}</span>
        <a class="rec-download" href="${url}" download="SafeHer_Recording_${Date.now()}.${ext}">Download</a>
    `;

    container.insertBefore(item, container.firstChild);
    showToast('Recording saved! Click Download to save the file.', 'success');
}

function addTriggerWord() {
    const input = document.getElementById('newTriggerWord');
    const word = input.value.trim();

    if (!word) {
        showToast('Please enter a trigger word', 'warning');
        return;
    }

    if (triggerWords.includes(word.toLowerCase())) {
        showToast('This trigger word already exists', 'warning');
        return;
    }

    triggerWords.push(word.toLowerCase());
    localStorage.setItem('safeher_trigger_words', JSON.stringify(triggerWords));
    renderTriggerWords();
    input.value = '';
    showToast(`Trigger word "${word}" added!`, 'success');
}

function renderTriggerWords() {
    const wordList = document.querySelector('.word-list');
    wordList.innerHTML = triggerWords.map(word => 
        `<span class="trigger-word">${word.charAt(0).toUpperCase() + word.slice(1)}</span>`
    ).join('');
}

// ==========================================
// EMERGENCY CONTACTS SYSTEM
// ==========================================
function initContacts() {
    const addBtn = document.getElementById('addContactBtn');
    addBtn.addEventListener('click', addContact);
    renderContacts();
}

function getContacts() {
    return JSON.parse(localStorage.getItem('safeher_contacts') || '[]');
}

function addContact() {
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const relation = document.getElementById('contactRelation').value;

    if (!name || !phone) {
        showToast('Please fill in name and phone number', 'warning');
        return;
    }

    const contacts = getContacts();
    contacts.push({
        id: Date.now(),
        name,
        phone,
        relation: relation || 'other'
    });

    localStorage.setItem('safeher_contacts', JSON.stringify(contacts));

    // Clear form
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactRelation').value = '';

    renderContacts();
    showToast(`${name} added as emergency contact!`, 'success');
}

function deleteContact(id) {
    let contacts = getContacts();
    contacts = contacts.filter(c => c.id !== id);
    localStorage.setItem('safeher_contacts', JSON.stringify(contacts));
    renderContacts();
    showToast('Contact removed', 'info');
}

function callContact(phone) {
    window.location.href = `tel:${phone}`;
}

function renderContacts() {
    const container = document.getElementById('contactsContainer');
    const contacts = getContacts();

    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="no-recordings" style="padding: 24px; text-align: center; color: var(--text-muted);">
                <p>No emergency contacts added yet.</p>
                <p style="font-size: 0.8rem; margin-top: 8px;">Add your trusted contacts to receive SOS alerts.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = contacts.map(contact => `
        <div class="contact-card">
            <div class="contact-info">
                <div class="contact-avatar">${contact.name.charAt(0).toUpperCase()}</div>
                <div class="contact-details">
                    <h4>${contact.name}</h4>
                    <p>${contact.phone} • ${contact.relation}</p>
                </div>
            </div>
            <div class="contact-actions">
                <button class="contact-action-btn" onclick="callContact('${contact.phone}')" title="Call">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                    </svg>
                </button>
                <button class="contact-action-btn delete" onclick="deleteContact(${contact.id})" title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// FAKE CALL SYSTEM
// ==========================================
let fakeCallTimer = null;
let fakeCallSeconds = 0;

function initFakeCall() {
    const fakeCallLink = document.getElementById('fakeCallLink');
    const acceptBtn = document.getElementById('acceptCall');
    const declineBtn = document.getElementById('declineCall');

    fakeCallLink.addEventListener('click', (e) => {
        e.preventDefault();
        showFakeCall();
    });

    acceptBtn.addEventListener('click', acceptFakeCall);
    declineBtn.addEventListener('click', declineFakeCall);
}

function showFakeCall() {
    const modal = document.getElementById('fakeCallModal');
    modal.style.display = 'flex';

    // Play ringtone vibration pattern
    if (navigator.vibrate) {
        navigator.vibrate([1000, 500, 1000, 500, 1000, 500, 1000]);
    }

    // Create ringtone
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.1;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();

        // Store for cleanup
        window._fakeCallAudio = { oscillator, audioCtx };

        // Ring pattern
        let ringCount = 0;
        const ringInterval = setInterval(() => {
            gainNode.gain.value = gainNode.gain.value > 0 ? 0 : 0.1;
            ringCount++;
            if (ringCount > 20 || !document.getElementById('fakeCallModal').style.display !== 'none') {
                clearInterval(ringInterval);
                oscillator.stop();
                audioCtx.close();
            }
        }, 500);
    } catch (e) {
        console.log('Could not play ringtone:', e);
    }
}

function acceptFakeCall() {
    const callStatus = document.getElementById('callStatus');
    const callTimerEl = document.getElementById('callTimer');

    // Stop ringtone
    if (window._fakeCallAudio) {
        try {
            window._fakeCallAudio.oscillator.stop();
            window._fakeCallAudio.audioCtx.close();
        } catch (e) {}
    }

    callStatus.textContent = 'Connected';
    callTimerEl.style.display = 'block';
    fakeCallSeconds = 0;

    fakeCallTimer = setInterval(() => {
        fakeCallSeconds++;
        const mins = String(Math.floor(fakeCallSeconds / 60)).padStart(2, '0');
        const secs = String(fakeCallSeconds % 60).padStart(2, '0');
        callTimerEl.textContent = `${mins}:${secs}`;
    }, 1000);

    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
}

function declineFakeCall() {
    const modal = document.getElementById('fakeCallModal');
    const callTimerEl = document.getElementById('callTimer');
    const callStatus = document.getElementById('callStatus');

    // Stop ringtone
    if (window._fakeCallAudio) {
        try {
            window._fakeCallAudio.oscillator.stop();
            window._fakeCallAudio.audioCtx.close();
        } catch (e) {}
    }

    modal.style.display = 'none';
    clearInterval(fakeCallTimer);
    fakeCallTimer = null;
    fakeCallSeconds = 0;
    callTimerEl.style.display = 'none';
    callTimerEl.textContent = '00:00';
    callStatus.textContent = 'Incoming Call...';

    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
}

// ==========================================
// KEYBOARD SHORTCUT - SOS
// ==========================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + S for instant SOS
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        triggerSOS();
        showToast('Emergency SOS triggered via keyboard shortcut!', 'danger');
    }
});

// ==========================================
// SERVICE WORKER REGISTRATION (for offline support)
// ==========================================
if ('serviceWorker' in navigator) {
    // Could register a service worker here for offline capabilities
    console.log('[SafeHer] App initialized successfully');
}
