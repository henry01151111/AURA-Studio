        const STORAGE_KEY = 'aura_focus_studio_settings';
        const MEMO_STORAGE_KEY = 'aura_focus_studio_memo';
        const WHATS_NEW_KEY = 'aura_whats_new_seen_v1_0_2';
        // 只有「第一次使用」的人會自動彈出更新說明；用過的老用戶只在設定圖示看到紅色「1」。
        // 必須在本次載入寫入任何設定之前判斷，才分得出是不是第一次來。
        const hadPriorVisit = (() => { try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; } })();
        function hasSeenWhatsNew() { try { return localStorage.getItem(WHATS_NEW_KEY) === 'true'; } catch (e) { return true; } }

        const state = {
            lowPerformance: false, thunderEnabled: false, autoHideUI: false, glassInteraction: false, showFps: false,
            speed: 1.0, density: 1.0, windAngle: -2.5, clock24h: true, showSeconds: true, showQuote: false, autoPomo: false, soundChime: true,
            customQuoteText: "", clockFont: 'sans', clockScale: 1.0, ringStyle: 'simple', theme: 'night_library', youtubeVideoId: '',
            pomoMode: 'work', pomoRunning: false, pomoSecondsLeft: 25 * 60, pomoTotalSeconds: 25 * 60, pomoInterval: null,
            masterAudioOn: false, volumes: { rain: 0.7, alpha: 0.3, fire: 0.2, chime: 0.4 }, tasks: [{ id: 1, text: '範例事項', done: false }],
            pipWindow: null, isPipActive: false
        };

        const themePalettes = {
            morning_mist: { stops: ['#e2e8f0', '#cbd5e1', '#94a3b8'], bokeh: 'rgba(56, 189, 248, 0.35)', streak: 'rgba(51, 65, 85, 0.45)', isLight: true },
            sunlit_shower: { stops: ['#fef3c7', '#fde68a', '#f59e0b'], bokeh: 'rgba(245, 158, 11, 0.35)', streak: 'rgba(120, 53, 15, 0.45)', isLight: true },
            cloudy_daylight: { stops: ['#f1f5f9', '#e2e8f0', '#cbd5e1'], bokeh: 'rgba(99, 102, 241, 0.25)', streak: 'rgba(71, 85, 105, 0.45)', isLight: true },
            night_library: { stops: ['#1c130d', '#0d0908', '#030202'], bokeh: 'rgba(251, 146, 60, 0.25)', streak: 'rgba(254, 215, 170, 0.4)', isLight: false },
            cozy_cafe: { stops: ['#1a1024', '#0b0814', '#030208'], bokeh: 'rgba(192, 132, 252, 0.25)', streak: 'rgba(233, 213, 255, 0.4)', isLight: false },
            deep_emerald: { stops: ['#0a1a15', '#050d0b', '#020504'], bokeh: 'rgba(52, 211, 153, 0.25)', streak: 'rgba(167, 243, 208, 0.4)', isLight: false },
            cyber_tokyo: { stops: ['#051024', '#030814', '#010205'], bokeh: 'rgba(56, 189, 248, 0.25)', streak: 'rgba(186, 230, 253, 0.4)', isLight: false },
            midnight_ocean: { stops: ['#031026', '#020814', '#010205'], bokeh: 'rgba(96, 165, 250, 0.25)', streak: 'rgba(191, 219, 254, 0.4)', isLight: false },
            sunset_glow: { stops: ['#260d10', '#140608', '#050102'], bokeh: 'rgba(244, 63, 94, 0.25)', streak: 'rgba(254, 205, 211, 0.4)', isLight: false },
            nordic_aurora: { stops: ['#041c1c', '#020f0f', '#010505'], bokeh: 'rgba(45, 212, 191, 0.25)', streak: 'rgba(153, 246, 228, 0.4)', isLight: false },
            starlight_zen: { stops: ['#10121c', '#08090f', '#020205'], bokeh: 'rgba(129, 140, 248, 0.25)', streak: 'rgba(199, 210, 254, 0.4)', isLight: false }
        };

        const breathingState = {
            active: false,
            technique: 'box', // 'box' (4-4-4-4), 'relax' (4-7-8), 'calm' (5-5)
            phaseIndex: 0,
            timer: 0,
            completedCycles: 0,
            interval: null,
            soundEnabled: true
        };

        const breathingTechniques = {
            box: {
                name: '4-4-4-4 箱式呼吸',
                subtitle: '美國海豹部隊專用，快速平復高壓與焦慮',
                phases: [
                    { name: '吸氣', duration: 4, scale: 1.25, glow: 'rgba(56, 189, 248, 0.4)', textCls: 'text-sky-200' },
                    { name: '屏息', duration: 4, scale: 1.25, glow: 'rgba(168, 85, 247, 0.4)', textCls: 'text-purple-200' },
                    { name: '呼氣', duration: 4, scale: 0.75, glow: 'rgba(99, 102, 241, 0.4)', textCls: 'text-indigo-200' },
                    { name: '屏息', duration: 4, scale: 0.75, glow: 'rgba(45, 212, 191, 0.4)', textCls: 'text-teal-200' }
                ]
            },
            relax: {
                name: '4-7-8 放鬆呼吸',
                subtitle: '哈佛醫師推薦，深層放鬆大腦與助眠減壓',
                phases: [
                    { name: '吸氣', duration: 4, scale: 1.3, glow: 'rgba(56, 189, 248, 0.4)', textCls: 'text-sky-200' },
                    { name: '屏息', duration: 7, scale: 1.3, glow: 'rgba(251, 146, 60, 0.4)', textCls: 'text-amber-200' },
                    { name: '呼氣', duration: 8, scale: 0.7, glow: 'rgba(244, 63, 94, 0.4)', textCls: 'text-rose-200' }
                ]
            },
            calm: {
                name: '5-5 均勻呼吸',
                subtitle: '和諧安穩節奏，引導進入深層心流冥想',
                phases: [
                    { name: '吸氣', duration: 5, scale: 1.2, glow: 'rgba(52, 211, 153, 0.4)', textCls: 'text-emerald-200' },
                    { name: '呼氣', duration: 5, scale: 0.8, glow: 'rgba(99, 102, 241, 0.4)', textCls: 'text-indigo-200' }
                ]
            }
        };

        function getClockEl(id) {
            return (state.pipWindow && state.pipWindow.document) ? (state.pipWindow.document.getElementById(id) || document.getElementById(id)) : document.getElementById(id);
        }

        function playBreathPhaseTone(pitchMultiplier = 1.0) {
            if (!breathingState.soundEnabled) return;
            try {
                if (!audioCtx) initAudioEngine();
                const ctx = audioCtx; if (!ctx) return; resumeAudio();
                const osc = ctx.createOscillator(), g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(320 * pitchMultiplier, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440 * pitchMultiplier, ctx.currentTime + 0.3);
                g.gain.setValueAtTime(0.08, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
                osc.connect(g); g.connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 1.25);
            } catch(e){}
        }

        function updateBreathingUI() {
            const tech = breathingTechniques[breathingState.technique];
            const currentPhase = tech.phases[breathingState.phaseIndex];

            const phaseTextEl = document.getElementById('breathingPhaseText');
            const timerTextEl = document.getElementById('breathingTimerText');
            const subtitleEl = document.getElementById('breathingSubtitle');
            const glowCircle = document.getElementById('breathingGlowCircle');
            const outerRing = document.getElementById('breathingOuterRing');
            const innerRing = document.getElementById('breathingInnerRing');
            const cycleCountEl = document.getElementById('breathingCycleCount');

            if (phaseTextEl) { phaseTextEl.textContent = currentPhase.name; phaseTextEl.className = `text-2xl sm:text-3xl font-light tracking-widest text-shadow-glow ${currentPhase.textCls}`; }
            if (timerTextEl) timerTextEl.textContent = breathingState.timer;
            if (subtitleEl) subtitleEl.textContent = tech.subtitle;
            if (cycleCountEl) cycleCountEl.textContent = `已完成 ${breathingState.completedCycles} 次循環`;

            const transitionSec = currentPhase.duration;
            if (glowCircle) {
                glowCircle.style.transitionDuration = `${transitionSec}s`;
                glowCircle.style.transform = `scale(${currentPhase.scale})`;
                glowCircle.style.backgroundColor = currentPhase.glow;
            }
            if (outerRing) {
                outerRing.style.transitionDuration = `${transitionSec}s`;
                outerRing.style.transform = `scale(${currentPhase.scale})`;
            }
            if (innerRing) {
                innerRing.style.transitionDuration = `${transitionSec}s`;
                innerRing.style.transform = `scale(${currentPhase.scale})`;
            }
        }

        function nextBreathingStep() {
            const tech = breathingTechniques[breathingState.technique];
            breathingState.timer--;

            if (breathingState.timer <= 0) {
                breathingState.phaseIndex = (breathingState.phaseIndex + 1) % tech.phases.length;
                if (breathingState.phaseIndex === 0) breathingState.completedCycles++;
                
                const nextPhase = tech.phases[breathingState.phaseIndex];
                breathingState.timer = nextPhase.duration;
                playBreathPhaseTone(breathingState.phaseIndex === 0 ? 1.2 : 0.9);
            }

            updateBreathingUI();
        }

        function startBreathingGuide() {
            breathingState.active = true;
            breathingState.phaseIndex = 0;
            breathingState.completedCycles = 0;
            const tech = breathingTechniques[breathingState.technique];
            breathingState.timer = tech.phases[0].duration;

            const modal = document.getElementById('breathingModal');
            if (modal) modal.classList.remove('opacity-0', 'pointer-events-none');

            updateBreathingUI();
            playBreathPhaseTone(1.0);

            clearInterval(breathingState.interval);
            breathingState.interval = setInterval(nextBreathingStep, 1000);
        }

        function stopBreathingGuide() {
            breathingState.active = false;
            clearInterval(breathingState.interval);
            const modal = document.getElementById('breathingModal');
            if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
        }

        window.setBreathingTechnique = function(type) {
            if (!breathingTechniques[type]) return;
            breathingState.technique = type;
            breathingState.phaseIndex = 0;
            breathingState.completedCycles = 0;
            const tech = breathingTechniques[type];
            breathingState.timer = tech.phases[0].duration;

            const btns = { box: 'btnBreathBox', relax: 'btnBreathRelax', calm: 'btnBreathCalm' };
            Object.keys(btns).forEach(key => {
                const btn = document.getElementById(btns[key]);
                if (!btn) return;
                if (key === type) {
                    btn.className = "bg-sky-500/20 border border-sky-400/40 text-sky-200 py-2 rounded-xl font-semibold transition active:scale-95";
                } else {
                    btn.className = "bg-white/5 border border-transparent text-white/70 hover:bg-white/10 py-2 rounded-xl font-semibold transition active:scale-95";
                }
            });

            updateBreathingUI();
            playBreathPhaseTone(1.1);
        };

        document.getElementById('breathingToggleBtn')?.addEventListener('click', startBreathingGuide);
        document.getElementById('closeBreathingBtn')?.addEventListener('click', stopBreathingGuide);
        document.getElementById('toggleBreathSoundBtn')?.addEventListener('click', () => {
            breathingState.soundEnabled = !breathingState.soundEnabled;
            const btn = document.getElementById('toggleBreathSoundBtn');
            if (btn) btn.innerHTML = breathingState.soundEnabled ? `<i class="fa-solid fa-volume-high text-sky-400 mr-1"></i><span>提示音：開</span>` : `<i class="fa-solid fa-volume-xmark text-white/40 mr-1"></i><span>提示音：關</span>`;
        });

        function syncUIFromState() {
            try {
                const lowPerfBtn = document.getElementById('lowPerfToggleBtn'), lowPerfIcon = document.getElementById('lowPerfIcon'), lowPerfText = document.getElementById('lowPerfText');
                if (state.lowPerformance) {
                    document.body.classList.add('low-performance');
                    if (lowPerfBtn) lowPerfBtn.classList.add('bg-green-900/40', 'border-green-500/50');
                    if (lowPerfText) lowPerfText.textContent = "性能: 節能";
                    if (lowPerfIcon) lowPerfIcon.className = "fa-solid fa-leaf text-green-300";
                } else {
                    document.body.classList.remove('low-performance');
                    if (lowPerfBtn) lowPerfBtn.classList.remove('bg-green-900/40', 'border-green-500/50');
                    if (lowPerfText) lowPerfText.textContent = "性能: 標準";
                    if (lowPerfIcon) lowPerfIcon.className = "fa-solid fa-leaf text-green-400";
                }

                const speedSlider = document.getElementById('speedSlider'); if (speedSlider) speedSlider.value = state.speed;
                const speedVal = document.getElementById('speedVal'); if (speedVal) speedVal.textContent = `${state.speed.toFixed(1)}x`;
                const densitySlider = document.getElementById('densitySlider'); if (densitySlider) densitySlider.value = state.density;
                const densityVal = document.getElementById('densityVal'); if (densityVal) densityVal.textContent = state.density < 0.8 ? "極簡" : state.density > 1.2 ? "密集" : "標準";
                const showFpsToggle = document.getElementById('showFpsToggle'); if (showFpsToggle) showFpsToggle.checked = state.showFps;
                const autoHideToggle = document.getElementById('autoHideToggle'); if (autoHideToggle) autoHideToggle.checked = state.autoHideUI;
                const glassInteractionToggle = document.getElementById('glassInteractionToggle'); if (glassInteractionToggle) glassInteractionToggle.checked = state.glassInteraction;
                const format24Toggle = document.getElementById('format24Toggle'); if (format24Toggle) format24Toggle.checked = state.clock24h;
                const showSecondsToggle = document.getElementById('showSecondsToggle'); if (showSecondsToggle) showSecondsToggle.checked = state.showSeconds;
                const showQuoteToggle = document.getElementById('showQuoteToggle'); if (showQuoteToggle) showQuoteToggle.checked = state.showQuote;
                const autoPomoToggle = document.getElementById('autoPomoToggle'); if (autoPomoToggle) autoPomoToggle.checked = state.autoPomo;
                const soundChimeToggle = document.getElementById('soundChimeToggle'); if (soundChimeToggle) soundChimeToggle.checked = state.soundChime;

                toggleFpsDisplay(state.showFps);
                const customQuoteInput = document.getElementById('customQuoteInput'); if (customQuoteInput) customQuoteInput.value = state.customQuoteText || '';

                const thunderBtn = document.getElementById('thunderToggleBtn'), thunderIcon = document.getElementById('thunderIcon');
                if (thunderBtn && thunderIcon) {
                    if (state.thunderEnabled) {
                        thunderBtn.classList.add('bg-amber-500/20', 'border', 'border-amber-400/40');
                        thunderIcon.className = "fa-solid fa-bolt text-xs text-amber-300 animate-pulse";
                        scheduleNextLightning();
                    } else {
                        thunderBtn.classList.remove('bg-amber-500/20', 'border', 'border-amber-400/40');
                        thunderIcon.className = "fa-solid fa-bolt text-xs text-white/50";
                        clearTimeout(lightningTimeout);
                    }
                }

                setClockFont(state.clockFont, false);
                setClockScale(state.clockScale, false);
                setRingStyle(state.ringStyle || 'simple', false);

                const masterBtn = document.getElementById('masterAudioToggle');
                if (masterBtn) {
                    masterBtn.textContent = state.masterAudioOn ? "已開啟" : "已關閉";
                    masterBtn.className = state.masterAudioOn ? "bg-indigo-600 text-white px-3 py-1 rounded-xl font-semibold transition" : "bg-white/10 text-white/50 px-3 py-1 rounded-xl font-semibold transition";
                }

                ['rain', 'alpha', 'fire', 'chime'].forEach(type => {
                    const slider = document.getElementById(`${type}VolSlider`), valLabel = document.getElementById(`${type}VolVal`);
                    if (slider && valLabel && state.volumes[type] !== undefined) {
                        slider.value = state.volumes[type];
                        valLabel.textContent = `${Math.round(state.volumes[type] * 100)}%`;
                    }
                });

                const savedMemo = localStorage.getItem(MEMO_STORAGE_KEY), memoEl = document.getElementById('memoInput');
                if (savedMemo !== null && memoEl) memoEl.value = savedMemo;

                applyTheme(state.theme);

                if (state.youtubeVideoId) loadYouTubeVideo(state.youtubeVideoId, false);
            } catch(e) { console.warn('UI 同步警告:', e); }
        }

        function saveSettings() {
            try {
                const dataToSave = { lowPerformance: state.lowPerformance, thunderEnabled: state.thunderEnabled, autoHideUI: state.autoHideUI, glassInteraction: state.glassInteraction, showFps: state.showFps, speed: state.speed, density: state.density, clock24h: state.clock24h, showSeconds: state.showSeconds, showQuote: state.showQuote, autoPomo: state.autoPomo, soundChime: state.soundChime, customQuoteText: state.customQuoteText, clockFont: state.clockFont, clockScale: state.clockScale, ringStyle: state.ringStyle, theme: state.theme, masterAudioOn: state.masterAudioOn, volumes: state.volumes, tasks: state.tasks, youtubeVideoId: state.youtubeVideoId };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
                const memoEl = document.getElementById('memoInput');
                if (memoEl) localStorage.setItem(MEMO_STORAGE_KEY, memoEl.value);
            } catch(e) { console.warn('本地儲存失敗:', e); }
        }

        function loadSettings() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    Object.assign(state, JSON.parse(saved));
                    if (!Array.isArray(state.tasks)) state.tasks = [];
                    state.volumes = Object.assign({ rain: 0.7, alpha: 0.3, fire: 0.2, chime: 0.4 }, state.volumes || {});
                }
            } catch(e) { console.warn('本地設定載入失敗:', e); }
        }

        function updateIosCardsActiveState() {
            document.querySelectorAll('.ios-theme-card').forEach(card => {
                const isCurrent = card.dataset.iosTheme === state.theme;
                const badge = card.querySelector('.active-badge');
                if (isCurrent) {
                    card.classList.add('border-indigo-400', 'ring-4', 'ring-indigo-500/30', 'scale-105', 'opacity-100');
                    card.classList.remove('border-white/20', 'opacity-70');
                    if (badge) badge.classList.remove('hidden');
                } else {
                    card.classList.remove('border-indigo-400', 'ring-4', 'ring-indigo-500/30', 'scale-105', 'opacity-100');
                    card.classList.add('border-white/20', 'opacity-70');
                    if (badge) badge.classList.add('hidden');
                }
            });
        }

        function extractYouTubeId(url) {
            if (!url) return '';
            const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/);
            const id = (match && match[2].length === 11) ? match[2] : url; return /^[\w-]{11}$/.test(id) ? id : '';
        }

        function loadYouTubeVideo(videoUrlOrId, autoPlay = true) {
            const videoId = extractYouTubeId(videoUrlOrId), playerContainer = document.getElementById('ytPlayerContainer'), iframe = document.getElementById('ytIframe'), badge = document.getElementById('ytStatusBadge');
            if (videoId) {
                state.youtubeVideoId = videoId;
                const currentOrigin = (window.location.origin && window.location.origin !== 'null' && window.location.protocol !== 'file:') ? encodeURIComponent(window.location.origin) : '';
                const originParam = currentOrigin ? `&origin=${currentOrigin}` : '';

                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&enablejsapi=1${originParam}`;
                playerContainer.classList.remove('hidden');
                badge.textContent = '播放中';
                badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-medium';
                saveSettings();
            } else {
                badge.textContent = '無效連結';
                badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium';
            }
        }

        document.getElementById('ytLoadBtn')?.addEventListener('click', () => { const val = document.getElementById('ytUrlInput').value.trim(); if (val) loadYouTubeVideo(val, true); });
        document.getElementById('ytUrlInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('ytLoadBtn').click(); } });
        document.getElementById('ytClearBtn')?.addEventListener('click', () => {
            const playerContainer = document.getElementById('ytPlayerContainer'), iframe = document.getElementById('ytIframe'), badge = document.getElementById('ytStatusBadge');
            iframe.src = ''; playerContainer.classList.add('hidden'); badge.textContent = '未載入'; badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40';
            state.youtubeVideoId = ''; document.getElementById('ytUrlInput').value = ''; saveSettings();
        });

        function toggleFpsDisplay(visible) {
            const badge = document.getElementById('fpsBadge');
            if (badge) visible ? badge.classList.remove('opacity-0', 'pointer-events-none') : badge.classList.add('opacity-0', 'pointer-events-none');
        }

        const canvas = document.getElementById('mainCanvas'), ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth, height = canvas.height = window.innerHeight;
        
        let lastWidth = window.innerWidth, lastHeight = window.innerHeight;
        let lastAspect = window.innerWidth / window.innerHeight;
        let resizePulseTimer = null, resizeEndTimer = null, resizeRainTimer = null;
        let isPageLoaded = false;

        function triggerResizePulse() {
            if (!isPageLoaded || state.lowPerformance) return;
            if (typeof isEditModeActive !== 'undefined' && isEditModeActive) return;

            const appStage = document.getElementById('appStage');
            if (!appStage) return;

            appStage.classList.add('window-resize-press');
            appStage.classList.remove('window-resize-restore');

            clearTimeout(resizePulseTimer);
            clearTimeout(resizeEndTimer);

            resizePulseTimer = setTimeout(() => {
                appStage.classList.remove('window-resize-press');
                appStage.classList.add('window-resize-restore');

                resizeEndTimer = setTimeout(() => {
                    appStage.classList.remove('window-resize-restore');
                }, 1000);
            }, 1000);
        }

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            clearTimeout(resizeRainTimer); resizeRainTimer = setTimeout(initRain, 200);

            const currentAspect = window.innerWidth / window.innerHeight;
            const widthDiff = Math.abs(window.innerWidth - lastWidth);
            const heightDiff = Math.abs(window.innerHeight - lastHeight);
            const aspectDiff = Math.abs(currentAspect - lastAspect);

            if (widthDiff > 6 || heightDiff > 6 || aspectDiff > 0.005) {
                triggerResizePulse();
                lastWidth = window.innerWidth;
                lastHeight = window.innerHeight;
                lastAspect = currentAspect;
            }
        });

        let audioCtx = null, audioNodes = { rainSource: null, rainGain: null, alphaOscL: null, alphaOscR: null, alphaGain: null, fireSource: null, fireGain: null };

        function resumeAudio() {
            if (audioCtx && (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted')) audioCtx.resume().catch(() => {});
        }

        function initAudioEngine() {
            if (audioCtx) { resumeAudio(); return; }
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();

            const bufferSize = audioCtx.sampleRate * 2, noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate), output = noiseBuffer.getChannelData(0);
            let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759; b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856; b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08; b6 = white * 0.115926;
            }
            audioNodes.rainSource = audioCtx.createBufferSource(); audioNodes.rainSource.buffer = noiseBuffer; audioNodes.rainSource.loop = true;
            const rainFilter = audioCtx.createBiquadFilter(); rainFilter.type = 'lowpass'; rainFilter.frequency.value = 1100;
            audioNodes.rainGain = audioCtx.createGain(); audioNodes.rainGain.gain.setValueAtTime(state.volumes.rain * 0.2 * (state.masterAudioOn ? 1 : 0), audioCtx.currentTime);
            audioNodes.rainSource.connect(rainFilter); rainFilter.connect(audioNodes.rainGain); audioNodes.rainGain.connect(audioCtx.destination); audioNodes.rainSource.start();

            updateBinauralFrequencies(10);

            const fireBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate), fireData = fireBuffer.getChannelData(0);
            for (let i = 0; i < audioCtx.sampleRate; i++) fireData[i] = (Math.random() * 2 - 1) * (Math.random() > 0.985 ? 0.7 : 0.03);
            audioNodes.fireSource = audioCtx.createBufferSource(); audioNodes.fireSource.buffer = fireBuffer; audioNodes.fireSource.loop = true;
            const fireFilter = audioCtx.createBiquadFilter(); fireFilter.type = 'bandpass'; fireFilter.frequency.value = 850;
            audioNodes.fireGain = audioCtx.createGain(); audioNodes.fireGain.gain.setValueAtTime(state.volumes.fire * 0.1 * (state.masterAudioOn ? 1 : 0), audioCtx.currentTime);
            audioNodes.fireSource.connect(fireFilter); fireFilter.connect(audioNodes.fireGain); audioNodes.fireGain.connect(audioCtx.destination); audioNodes.fireSource.start();

            scheduleChime();
        }

        function updateBinauralFrequencies(diffHz) {
            if (!audioCtx) return;
            if (audioNodes.alphaOscL && audioNodes.alphaOscR) { try { audioNodes.alphaOscL.stop(); audioNodes.alphaOscR.stop(); } catch(e){} try { if (audioNodes.alphaGain) audioNodes.alphaGain.disconnect(); } catch(e){} }
            const merger = audioCtx.createChannelMerger(2);
            audioNodes.alphaOscL = audioCtx.createOscillator(); audioNodes.alphaOscR = audioCtx.createOscillator();
            audioNodes.alphaOscL.type = 'sine'; audioNodes.alphaOscR.type = 'sine';
            audioNodes.alphaOscL.frequency.setValueAtTime(200, audioCtx.currentTime); audioNodes.alphaOscR.frequency.setValueAtTime(200 + parseFloat(diffHz), audioCtx.currentTime);
            audioNodes.alphaGain = audioCtx.createGain(); audioNodes.alphaGain.gain.setValueAtTime(state.volumes.alpha * 0.08 * (state.masterAudioOn ? 1 : 0), audioCtx.currentTime);
            audioNodes.alphaOscL.connect(merger, 0, 0); audioNodes.alphaOscR.connect(merger, 0, 1); merger.connect(audioNodes.alphaGain); audioNodes.alphaGain.connect(audioCtx.destination);
            audioNodes.alphaOscL.start(); audioNodes.alphaOscR.start();
        }

        function scheduleChime() {
            if (!audioCtx) return;
            if (state.masterAudioOn && state.volumes.chime > 0) {
                const notes = [261.63, 329.63, 392.00, 523.25], osc = audioCtx.createOscillator(), g = audioCtx.createGain(), note = notes[Math.floor(Math.random() * notes.length)];
                osc.type = 'sine'; osc.frequency.setValueAtTime(note, audioCtx.currentTime);
                g.gain.setValueAtTime(0.001, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(state.volumes.chime * 0.12, audioCtx.currentTime + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 6.0);
                osc.connect(g); g.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 6.1);
            }
            setTimeout(scheduleChime, 8000 + Math.random() * 6000);
        }

        function playCompletionChime() {
            if (!audioCtx || !state.soundChime) return; resumeAudio();
            const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.4);
            g.gain.setValueAtTime(0.2, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.0);
            osc.connect(g); g.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 3.1);
        }

        function updateAudioVolumes() {
            if (!audioCtx) return;
            const m = state.masterAudioOn ? 1 : 0;
            if (audioNodes.rainGain) audioNodes.rainGain.gain.setValueAtTime(state.volumes.rain * 0.2 * m, audioCtx.currentTime);
            if (audioNodes.alphaGain) audioNodes.alphaGain.gain.setValueAtTime(state.volumes.alpha * 0.08 * m, audioCtx.currentTime);
            if (audioNodes.fireGain) audioNodes.fireGain.gain.setValueAtTime(state.volumes.fire * 0.1 * m, audioCtx.currentTime);
        }

        let glassDrops = [], bgStreaks = [], microTrails = [], mousePos = { x: -1000, y: -1000, active: false }, mouseParticles = [];

        function handlePointerMove(e) {
            const x = e.touches ? e.touches[0].clientX : e.clientX, y = e.touches ? e.touches[0].clientY : e.clientY;
            mousePos.x = x; mousePos.y = y; mousePos.active = true;
            if (state.glassInteraction && !state.lowPerformance && Math.random() < 0.6) {
                mouseParticles.push({ x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 12, r: Math.random() * 4 + 2, opacity: 0.6 });
            }
        }

        window.addEventListener('mousemove', handlePointerMove, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', () => { mousePos.active = false; });
        window.addEventListener('touchend', () => { mousePos.active = false; });

        class BackgroundStreak {
            constructor() { this.reset(); }
            reset() { this.x = Math.random() * (width + 300) - 150; this.y = Math.random() * -height; this.len = Math.random() * 35 + 20; this.baseVy = Math.random() * 14 + 10; this.opacity = Math.random() * 0.3 + 0.12; this.thickness = Math.random() * 1.4 + 0.7; }
            update() { this.y += this.baseVy * state.speed; this.x += state.windAngle * state.speed; if (this.y > height) this.reset(); }
            draw() {
                const palette = themePalettes[state.theme] || themePalettes.night_library;
                ctx.strokeStyle = palette.streak || `rgba(210, 230, 255, ${this.opacity})`;
                ctx.lineWidth = this.thickness;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.len * (state.windAngle / this.baseVy), this.y + this.len);
                ctx.stroke();
            }
        }

        class GlassDroplet {
            constructor(isStatic = false) { this.reset(isStatic); }
            reset(isStatic = false) {
                this.x = Math.random() * width; this.y = Math.random() * height; this.r = Math.random() * 3.5 + 1.5; this.baseVy = 0;
                this.isDripping = !isStatic && Math.random() < 0.25; this.dripTimer = 0;
                if (this.isDripping) { this.r = Math.random() * 3 + 3.0; this.baseVy = Math.random() * 1.5 + 1.0; }
            }
            update() {
                if (state.glassInteraction && mousePos.active) {
                    const dx = this.x - mousePos.x, dy = this.y - mousePos.y, dist = Math.hypot(dx, dy);
                    if (dist < 45 && dist > 0) {
                        if (!this.isDripping) { this.isDripping = true; this.baseVy = Math.random() * 2.0 + 1.5; }
                        this.x += (dx / dist) * 1.8;
                    }
                }
                if (this.isDripping) {
                    this.dripTimer++;
                    if (Math.sin(this.dripTimer * 0.18) > -0.1) {
                        this.y += this.baseVy * state.speed * (0.9 + Math.random() * 0.5); this.r -= 0.0025;
                        if (Math.random() < 0.4 && this.r > 1.2 && !state.lowPerformance) microTrails.push({ x: this.x, y: this.y - this.r, r: Math.random() * 0.8 + 0.5, opacity: 0.65 });
                    }
                    for (let i = 0; i < glassDrops.length; i++) {
                        const other = glassDrops[i];
                        if (other !== this && other.r > 0 && Math.hypot(other.x - this.x, other.y - this.y) < this.r + other.r) {
                            this.r = Math.min(8.0, Math.sqrt(this.r * this.r + other.r * other.r)); this.baseVy = Math.min(5, this.baseVy + 0.3);
                            other.reset(true); other.y = -50;
                        }
                    }
                    if (this.y > height + 20 || this.r < 0.8) { this.reset(Math.random() > 0.3); this.y = -10; }
                } else if (Math.random() < 0.0003 * state.speed) {
                    this.isDripping = true; this.baseVy = Math.random() * 1.5 + 1.0;
                }
            }
            draw() {
                if (this.r <= 0.5) return;
                const x = this.x, y = this.y, r = this.r;
                const isLight = themePalettes[state.theme]?.isLight;
                ctx.save();

                if (isLight) {
                    const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, r * 0.1, x + r * 0.1, y + r * 0.2, r);
                    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                    grad.addColorStop(0.4, 'rgba(203, 213, 225, 0.35)');
                    grad.addColorStop(0.8, 'rgba(100, 116, 139, 0.45)');
                    grad.addColorStop(1, 'rgba(30, 41, 59, 0.65)');

                    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
                    ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'; ctx.fill();
                } else {
                    const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, r * 0.1, x + r * 0.1, y + r * 0.2, r);
                    grad.addColorStop(0, 'rgba(20, 30, 45, 0.75)'); grad.addColorStop(0.5, 'rgba(60, 90, 130, 0.25)');
                    grad.addColorStop(0.85, 'rgba(180, 220, 255, 0.6)'); grad.addColorStop(1, 'rgba(240, 250, 255, 0.9)');
                    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
                    ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'; ctx.fill();
                }
                ctx.restore();
            }
        }

        function initRain() {
            bgStreaks = []; glassDrops = []; microTrails = [];
            const multiplier = state.lowPerformance ? 0.2 : 1.0;
            const streakCount = Math.floor(120 * state.density * multiplier), dropCount = Math.floor(130 * state.density * multiplier);
            for (let i = 0; i < streakCount; i++) bgStreaks.push(new BackgroundStreak());
            for (let i = 0; i < dropCount; i++) glassDrops.push(new GlassDroplet(i >= dropCount * 0.2));
        }

        let fpsFrameCount = 0, lastFpsTime = performance.now(), currentFps = 60;

        const cardCanvasInstances = [];

        function initCardCanvases() {
            cardCanvasInstances.length = 0;
            document.querySelectorAll('.ios-theme-card').forEach(card => {
                const cCanvas = card.querySelector('.card-bg-canvas');
                if (!cCanvas) return;
                const cCtx = cCanvas.getContext('2d');
                const themeKey = card.dataset.iosTheme || 'night_library';

                cCanvas.width = card.clientWidth || 280;
                cCanvas.height = card.clientHeight || 480;

                const streaks = [];
                for (let i = 0; i < 25; i++) {
                    streaks.push({
                        x: Math.random() * cCanvas.width,
                        y: Math.random() * cCanvas.height,
                        len: Math.random() * 20 + 15,
                        vy: Math.random() * 8 + 6,
                        opacity: Math.random() * 0.4 + 0.15
                    });
                }

                cardCanvasInstances.push({ card, canvas: cCanvas, ctx: cCtx, theme: themeKey, streaks });
            });
        }

        function renderCardLiveCanvases() {
            if (!isEditModeActive) return;
            const time = Date.now() * 0.0006 * state.speed;

            cardCanvasInstances.forEach(inst => {
                const { canvas: cCanvas, ctx: cCtx, theme, streaks } = inst;
                if (!cCanvas || !cCtx) return;

                const w = cCanvas.width, h = cCanvas.height;
                const palette = themePalettes[theme] || themePalettes.night_library;

                const bgGrad = cCtx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h));
                bgGrad.addColorStop(0, palette.stops[0]);
                bgGrad.addColorStop(0.6, palette.stops[1]);
                bgGrad.addColorStop(1, palette.stops[2]);
                cCtx.fillStyle = bgGrad;
                cCtx.fillRect(0, 0, w, h);

                for (let i = 0; i < 3; i++) {
                    const bx = (Math.sin(i * 37 + time * 0.2) * 0.35 + 0.5) * w;
                    const by = (Math.cos(i * 23 + time * 0.25) * 0.35 + 0.5) * h;
                    const br = 35 + Math.sin(i * 2 + time) * 12;
                    const bGrad = cCtx.createRadialGradient(bx, by, 0, bx, by, br * 1.8);
                    bGrad.addColorStop(0, palette.bokeh);
                    bGrad.addColorStop(1, 'transparent');
                    cCtx.fillStyle = bGrad;
                    cCtx.beginPath();
                    cCtx.arc(bx, by, br * 1.8, 0, Math.PI * 2);
                    cCtx.fill();
                }

                cCtx.strokeStyle = palette.streak;
                cCtx.lineWidth = 1.2;
                streaks.forEach(s => {
                    s.y += s.vy * state.speed;
                    s.x += state.windAngle * 0.3;
                    if (s.y > h) { s.y = -20; s.x = Math.random() * w; }
                    cCtx.beginPath();
                    cCtx.moveTo(s.x, s.y);
                    cCtx.lineTo(s.x + (state.windAngle * 0.3), s.y + s.len);
                    cCtx.stroke();
                });
            });
        }

        function updateFpsCounter(now) {
            fpsFrameCount++; const delta = now - lastFpsTime;
            if (delta >= 500) {
                currentFps = Math.round((fpsFrameCount * 1000) / delta); fpsFrameCount = 0; lastFpsTime = now;
                if (state.showFps) {
                    const fpsValEl = document.getElementById('fpsValDisplay'), fpsDotEl = document.getElementById('fpsDot');
                    if (fpsValEl) {
                        fpsValEl.textContent = `${currentFps} FPS`;
                        if (currentFps >= 45) { fpsValEl.className = "text-emerald-300 font-semibold tracking-wider"; if (fpsDotEl) fpsDotEl.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse"; }
                        else if (currentFps >= 25) { fpsValEl.className = "text-amber-300 font-semibold tracking-wider"; if (fpsDotEl) fpsDotEl.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse"; }
                        else { fpsValEl.className = "text-rose-400 font-semibold tracking-wider"; if (fpsDotEl) fpsDotEl.className = "w-2 h-2 rounded-full bg-rose-500 animate-ping"; }
                    }
                }
            }
        }

        function renderRain() {
            requestAnimationFrame(renderRain);
            updateFpsCounter(performance.now());
            const time = Date.now() * 0.0006 * state.speed;
            const palette = themePalettes[state.theme] || themePalettes.night_library;

            const grad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, Math.max(width, height));
            grad.addColorStop(0, palette.stops[0]);
            grad.addColorStop(0.6, palette.stops[1]);
            grad.addColorStop(1, palette.stops[2]);
            ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);

            const bokehCount = state.lowPerformance ? 4 : 15;
            for (let i = 0; i < bokehCount; i++) {
                const bx = (Math.sin(i * 53 + time * 0.15) * 0.45 + 0.5) * width, by = (Math.cos(i * 37 + time * 0.2) * 0.4 + 0.55) * height, br = 50 + Math.sin(i * 3 + time * 0.8) * 20;
                const bokehGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br * 2);
                bokehGrad.addColorStop(0, palette.bokeh);
                bokehGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = bokehGrad; ctx.beginPath(); ctx.arc(bx, by, br * 2, 0, Math.PI * 2); ctx.fill();
            }

            bgStreaks.forEach(s => { s.update(); s.draw(); });

            if (palette.isLight) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            } else {
                ctx.fillStyle = 'rgba(10, 15, 25, 0.25)';
            }
            ctx.fillRect(0, 0, width, height);

            if (state.glassInteraction && !state.lowPerformance) {
                for (let i = mouseParticles.length - 1; i >= 0; i--) {
                    const p = mouseParticles[i]; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = palette.isLight ? `rgba(100, 116, 139, ${p.opacity * 0.35})` : `rgba(220, 240, 255, ${p.opacity * 0.35})`;
                    ctx.fill(); p.r += 0.25; p.opacity -= 0.015;
                    if (p.opacity <= 0) mouseParticles.splice(i, 1);
                }
            }

            for (let i = microTrails.length - 1; i >= 0; i--) {
                const t = microTrails[i]; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
                ctx.fillStyle = palette.isLight ? `rgba(71, 85, 105, ${t.opacity})` : `rgba(200, 230, 255, ${t.opacity})`;
                ctx.fill(); t.opacity -= 0.0015;
                if (t.opacity <= 0) microTrails.splice(i, 1);
            }

            glassDrops.forEach(d => { d.update(); d.draw(); });

            renderCardLiveCanvases();
        }

        const studyQuotes = ["「專注於眼前的小事，平靜是進入高效流道的鑰匙。」", "「大腦就像肌肉，每一次抗拒分心都是一次深層強化。」", "「寧靜並非沒有噪音，而是心靈於風浪中的安定。」", "「不積跬步，無以至千里;不積小流，無以成江海。」", "「享受深層專注的當下，結果自然隨之而來。」"];
        let quoteIndex = 0;

        function updateClock() {
            const now = new Date(); let h = now.getHours(); if (!state.clock24h) h = h % 12 || 12;
            const hStr = String(h).padStart(2, '0'), mStr = String(now.getMinutes()).padStart(2, '0'), sStr = String(now.getSeconds()).padStart(2, '0');
            const timeStr = state.showSeconds ? `${hStr}:${mStr}:${sStr}` : `${hStr}:${mStr}`;
            const timeEl = getClockEl('timeDisplay'); if (timeEl) timeEl.textContent = timeStr;
            const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
            const dateEl = getClockEl('dateDisplay'); if (dateEl) dateEl.textContent = dateStr;

            document.querySelectorAll('.card-time-display').forEach(el => el.textContent = timeStr);
            document.querySelectorAll('.card-date-display').forEach(el => el.textContent = dateStr);

            const quoteEl = getClockEl('quoteDisplay');
            if (quoteEl) {
                if (state.customQuoteText.trim()) quoteEl.textContent = `「${state.customQuoteText}」`;
                else if (now.getSeconds() === 0 && now.getMinutes() % 5 === 0) { quoteIndex = (quoteIndex + 1) % studyQuotes.length; quoteEl.textContent = studyQuotes[quoteIndex]; }
            }
        }
        setInterval(updateClock, 1000);

        const circumference = 2 * Math.PI * 200;

        function setPomoProgress(percent) {
            const circle = getClockEl('pomoProgressCircle');
            if (circle) { circle.style.strokeDasharray = `${circumference} ${circumference}`; circle.style.strokeDashoffset = circumference - (percent / 100) * circumference; }
        }

        function updatePomoDisplay() {
            const m = String(Math.floor(state.pomoSecondsLeft / 60)).padStart(2, '0'), s = String(state.pomoSecondsLeft % 60).padStart(2, '0');
            setPomoProgress(((state.pomoTotalSeconds - state.pomoSecondsLeft) / state.pomoTotalSeconds) * 100);
            const statusTextEl = getClockEl('pomoStatusText');
            if (statusTextEl) statusTextEl.textContent = { work: `專注階段 (${m}:${s})`, shortBreak: `短休息 (${m}:${s})`, longBreak: `長休息 (${m}:${s})` }[state.pomoMode];
            const foldMiniText = document.getElementById('pomoFoldMiniText'); if (foldMiniText) foldMiniText.textContent = `⏱️ ${m}:${s}`;
        }

        // ===== 番茄鐘 =====
        // 以「結束時間戳」計算剩餘秒數：背景分頁的計時器被節流時，倒數也不會變慢
        const POMO_NAMES = { work: '專注', shortBreak: '短休息', longBreak: '長休息' };
        const POMO_NEXT = { work: 'shortBreak', shortBreak: 'longBreak', longBreak: 'work' };
        Object.assign(state, { pomoDurations: { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 }, pomoEndAt: 0, pomoWorkDone: 0 });

        function syncPomoLabels() {
            const mins = m => Math.round(state.pomoDurations[m] / 60);
            const labelEl = document.getElementById('pomoBtnLabel');
            if (labelEl && !state.pomoRunning) labelEl.textContent = `開始${POMO_NAMES[state.pomoMode]} (${mins(state.pomoMode)}m)`;
            const modeBtn = document.getElementById('pomoModeBtn'), nx = POMO_NEXT[state.pomoMode];
            if (modeBtn) modeBtn.textContent = `切換${POMO_NAMES[nx]} (${mins(nx)}m)`;
        }

        function setPomoMode(mode) {
            clearInterval(state.pomoInterval); state.pomoRunning = false;
            state.pomoMode = mode;
            state.pomoSecondsLeft = state.pomoTotalSeconds = state.pomoDurations[mode];
            const icon = document.getElementById('pomoBtnIcon'); if (icon) icon.className = "fa-solid fa-play";
            syncPomoLabels(); updatePomoDisplay();
        }

        function startPomoTicking() {
            state.pomoRunning = true;
            state.pomoEndAt = Date.now() + state.pomoSecondsLeft * 1000;
            clearInterval(state.pomoInterval);
            state.pomoInterval = setInterval(tickPomo, 250);
            document.getElementById('pomoBtnIcon').className = "fa-solid fa-pause";
            document.getElementById('pomoBtnLabel').textContent = "暫停倒數";
        }

        function finishPomo() {
            clearInterval(state.pomoInterval); state.pomoRunning = false;
            playCompletionChime();
            if (state.pomoMode === 'work') state.pomoWorkDone++;
            // 每完成 4 次專注進入長休息，其餘為短休息；休息結束回到專注
            const next = state.pomoMode === 'work' ? (state.pomoWorkDone % 4 === 0 ? 'longBreak' : 'shortBreak') : 'work';
            setPomoMode(next);
            if (state.autoPomo) startPomoTicking();
        }

        function tickPomo() {
            if (!state.pomoRunning) return;
            const remaining = Math.max(0, Math.ceil((state.pomoEndAt - Date.now()) / 1000));
            if (remaining !== state.pomoSecondsLeft) { state.pomoSecondsLeft = remaining; updatePomoDisplay(); }
            if (remaining <= 0) finishPomo();
        }

        document.addEventListener('visibilitychange', () => { if (!document.hidden) { tickPomo(); resumeAudio(); } });

        document.getElementById('pomoMainBtn')?.addEventListener('click', () => {
            initAudioEngine();
            if (state.pomoRunning) {
                tickPomo(); if (!state.pomoRunning) return; // 剛好結束時交給 finishPomo 處理
                clearInterval(state.pomoInterval); state.pomoRunning = false;
                document.getElementById('pomoBtnIcon').className = "fa-solid fa-play";
                document.getElementById('pomoBtnLabel').textContent = "繼續專注";
            } else {
                startPomoTicking();
            }
        });
        document.getElementById('pomoModeBtn')?.addEventListener('click', () => setPomoMode(POMO_NEXT[state.pomoMode]));
        document.getElementById('pomoResetBtn')?.addEventListener('click', () => setPomoMode(state.pomoMode));

        async function togglePictureInPicture() {
            if (state.isPipActive) { 
                if (state.pipWindow) state.pipWindow.close(); 
                return; 
            }
            if ('documentPictureInPicture' in window) {
                try {
                    const pipWin = await window.documentPictureInPicture.requestWindow({ width: 450, height: 450 });
                    state.pipWindow = pipWin; 
                    state.isPipActive = true;

                    // 複製主頁面 CSS 樣式
                    document.querySelectorAll('link[rel="stylesheet"]').forEach(l => pipWin.document.head.appendChild(l.cloneNode(true)));
                    [...document.styleSheets].forEach(s => { 
                        try { 
                            if (s.cssRules) { 
                                const style = pipWin.document.createElement('style'); 
                                style.textContent = [...s.cssRules].map(r => r.cssText).join('\n'); 
                                pipWin.document.head.appendChild(style); 
                            } 
                        } catch(e){} 
                    });

                    // 寫入 PiP 專用版面微調
                    const pipStyle = pipWin.document.createElement('style');
                    pipStyle.textContent = `body { background-color: #030712 !important; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; } #clockScaleWrapper { transform: scale(0.9) !important; }`;
                    pipWin.document.head.appendChild(pipStyle);

                    // 移入 DOM 時鐘組件
                    const clockWrapper = document.getElementById('clockScaleWrapper'); 
                    pipWin.document.body.appendChild(clockWrapper);

                    // 關閉時自動還原 DOM 至主頁面
                    pipWin.addEventListener('pagehide', () => { 
                        document.getElementById('clockContainer').appendChild(clockWrapper); 
                        state.pipWindow = null; 
                        state.isPipActive = false; 
                        updateClock(); 
                        updatePomoDisplay(); 
                    });
                    return;
                } catch(e) { 
                    console.warn("Document PiP 啟動失敗:", e); 
                }
            } else {
                // 若瀏覽器不支援 Document PiP，顯示提示
                const zenNotice = document.getElementById('zenNotice');
                if (zenNotice) {
                    zenNotice.innerHTML = `<i class="fa-solid fa-circle-info text-amber-400 mr-2"></i>您的瀏覽器尚未支援原生懸浮視窗（建議使用 Chrome / Edge 瀏覽器）`;
                    zenNotice.classList.remove('opacity-0', '-translate-y-4');
                    setTimeout(() => { zenNotice.classList.add('opacity-0', '-translate-y-4'); }, 4000);
                }
            }
        }
        document.getElementById('pipBtn')?.addEventListener('click', togglePictureInPicture);

        const pomoCustomModal = document.getElementById('pomoCustomModal');
        document.getElementById('pomoStatusBadge')?.addEventListener('click', () => pomoCustomModal.classList.remove('opacity-0', 'pointer-events-none'));
        document.getElementById('closePomoModalBtn')?.addEventListener('click', () => pomoCustomModal.classList.add('opacity-0', 'pointer-events-none'));
        window.setQuickPomo = function(mins) { document.getElementById('customMinutesInput').value = mins; }
        document.getElementById('saveCustomPomoBtn')?.addEventListener('click', () => {
            const mins = Math.min(Math.max(parseInt(document.getElementById('customMinutesInput').value) || 25, 1), 180);
            state.pomoDurations[state.pomoMode] = mins * 60; // 自訂時間套用在目前的階段，之後自動切換也沿用
            setPomoMode(state.pomoMode);
            pomoCustomModal.classList.add('opacity-0', 'pointer-events-none');
        });

        const whatsNewModal = document.getElementById('whatsNewModal');
        function showWhatsNewModal() { if (whatsNewModal) whatsNewModal.classList.remove('opacity-0', 'pointer-events-none'); }
        
        function updateBadgeDisplay() {
            const hasNew = hadPriorVisit && !hasSeenWhatsNew(); // 老用戶且還沒看過這版的更新說明
            const settingsBadge = document.getElementById('settingsBadge');
            const whatsNewBtnText = document.getElementById('whatsNewBtnText');
            if (settingsBadge) settingsBadge.classList.toggle('hidden', !hasNew);
            if (whatsNewBtnText) {
                whatsNewBtnText.textContent = hasNew ? '發現新版本！' : '最新升級特色';
                whatsNewBtnText.className = hasNew ? 'text-rose-400 font-bold animate-pulse' : '';
            }
        }

        function clearVersionBadge() { // 標記這版更新說明「已讀」並隱藏紅點
            try { localStorage.setItem(WHATS_NEW_KEY, 'true'); } catch (e) {}
            updateBadgeDisplay();
        }

        function hideWhatsNewModal() {
            if (!whatsNewModal || whatsNewModal.classList.contains('opacity-0')) return; // 沒開著就不處理
            whatsNewModal.classList.add('opacity-0', 'pointer-events-none');
            clearVersionBadge();
        }
        document.getElementById('closeWhatsNewModalBtn')?.addEventListener('click', hideWhatsNewModal);
        document.getElementById('startFocusBtn')?.addEventListener('click', () => {
            hideWhatsNewModal();
            setTimeout(() => {
                openIosThemeModal();
            }, 300);
        });
        document.getElementById('openWhatsNewFromSettingsBtn')?.addEventListener('click', () => { 
            clearVersionBadge();
            document.getElementById('settingsModal').classList.add('opacity-0', 'pointer-events-none'); 
            showWhatsNewModal(); 
        });

        function escapeHTML(str) { return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

        function renderTasks() {
            const listEl = document.getElementById('taskList'); if (!listEl) return;
            listEl.innerHTML = ''; let uncompleted = 0;
            state.tasks.forEach(t => {
                if (!t.done) uncompleted++;
                const item = document.createElement('div');
                item.className = `flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/10 text-xs ${t.done ? 'opacity-50 line-through' : ''}`;
                item.innerHTML = `<div class="flex items-center space-x-2 truncate"><button onclick="toggleTask(${Number(t.id)})" class="text-indigo-400 hover:text-indigo-300"><i class="fa-${t.done ? 'solid' : 'regular'} fa-circle-check"></i></button><span class="text-white/90 truncate">${escapeHTML(t.text)}</span></div><button onclick="deleteTask(${Number(t.id)})" class="text-white/30 hover:text-rose-400 text-xs"><i class="fa-solid fa-trash-can"></i></button>`;
                listEl.appendChild(item);
            });
            const badge = document.getElementById('taskCountBadge'); if (badge) badge.textContent = uncompleted;
        }

        window.toggleTask = function(id) { state.tasks = state.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t); renderTasks(); saveSettings(); };
        window.deleteTask = function(id) { state.tasks = state.tasks.filter(t => t.id !== id); renderTasks(); saveSettings(); };

        document.getElementById('addTaskBtn')?.addEventListener('click', () => {
            const input = document.getElementById('taskInput'), val = input.value.trim();
            if (val) { state.tasks.push({ id: Date.now(), text: val, done: false }); input.value = ''; renderTasks(); saveSettings(); }
        });
        document.getElementById('memoInput')?.addEventListener('input', () => saveSettings());

        const taskDrawer = document.getElementById('taskDrawer'), audioMixerDrawer = document.getElementById('audioMixerDrawer');
        const taskDrawerBtn = document.getElementById('toggleTaskDrawerBtn'), audioMixerBtn = document.getElementById('toggleAudioMixerBtn');

        taskDrawerBtn?.addEventListener('click', () => {
            const isOpen = !taskDrawer.classList.contains('opacity-0');
            if (isOpen) {
                taskDrawer.classList.add('opacity-0', 'pointer-events-none', '-translate-x-full');
                taskDrawerBtn.classList.remove('ring-2', 'ring-indigo-400/60', 'border-indigo-400/60', 'bg-indigo-950/40');
            } else {
                taskDrawer.classList.remove('opacity-0', 'pointer-events-none', '-translate-x-full');
                taskDrawerBtn.classList.add('ring-2', 'ring-indigo-400/60', 'border-indigo-400/60', 'bg-indigo-950/40');
                audioMixerDrawer.classList.add('opacity-0', 'pointer-events-none', 'translate-x-full');
                audioMixerBtn?.classList.remove('ring-2', 'ring-teal-400/60', 'border-teal-400/60', 'bg-teal-950/40');
            }
        });
        document.getElementById('closeTaskDrawerBtn')?.addEventListener('click', () => {
            taskDrawer.classList.add('opacity-0', 'pointer-events-none', '-translate-x-full');
            taskDrawerBtn?.classList.remove('ring-2', 'ring-indigo-400/60', 'border-indigo-400/60', 'bg-indigo-950/40');
        });

        audioMixerBtn?.addEventListener('click', () => {
            const isOpen = !audioMixerDrawer.classList.contains('opacity-0');
            if (isOpen) {
                audioMixerDrawer.classList.add('opacity-0', 'pointer-events-none', 'translate-x-full');
                audioMixerBtn.classList.remove('ring-2', 'ring-teal-400/60', 'border-teal-400/60', 'bg-teal-950/40');
            } else {
                audioMixerDrawer.classList.remove('opacity-0', 'pointer-events-none', 'translate-x-full');
                audioMixerBtn.classList.add('ring-2', 'ring-teal-400/60', 'border-teal-400/60', 'bg-teal-950/40');
                taskDrawer.classList.add('opacity-0', 'pointer-events-none', '-translate-x-full');
                taskDrawerBtn?.classList.remove('ring-2', 'ring-indigo-400/60', 'border-indigo-400/60', 'bg-indigo-950/40');
            }
        });
        document.getElementById('closeAudioMixerBtn')?.addEventListener('click', () => {
            audioMixerDrawer.classList.add('opacity-0', 'pointer-events-none', 'translate-x-full');
            audioMixerBtn?.classList.remove('ring-2', 'ring-teal-400/60', 'border-teal-400/60', 'bg-teal-950/40');
        });

        document.getElementById('lowPerfToggleBtn')?.addEventListener('click', () => {
            state.lowPerformance = !state.lowPerformance;
            const btn = document.getElementById('lowPerfToggleBtn'), icon = document.getElementById('lowPerfIcon'), text = document.getElementById('lowPerfText');
            if (state.lowPerformance) { document.body.classList.add('low-performance'); btn.classList.add('bg-green-900/40', 'border-green-500/50'); if (text) text.textContent = "性能: 節能"; if (icon) icon.className = "fa-solid fa-leaf text-xs text-green-300"; }
            else { document.body.classList.remove('low-performance'); btn.classList.remove('bg-green-900/40', 'border-green-500/50'); if (text) text.textContent = "性能: 標準"; if (icon) icon.className = "fa-solid fa-leaf text-xs text-green-400"; }
            initRain(); saveSettings();
        });

        document.getElementById('masterAudioToggle')?.addEventListener('click', () => {
            initAudioEngine(); state.masterAudioOn = !state.masterAudioOn;
            document.getElementById('masterAudioToggle').textContent = state.masterAudioOn ? "已開啟" : "已關閉";
            document.getElementById('masterAudioToggle').className = state.masterAudioOn ? "bg-indigo-600 text-white px-3 py-1 rounded-xl font-semibold transition" : "bg-white/10 text-white/50 px-3 py-1 rounded-xl font-semibold transition";
            updateAudioVolumes(); saveSettings();
        });

        ['rain', 'alpha', 'fire', 'chime'].forEach(type => {
            document.getElementById(`${type}VolSlider`)?.addEventListener('input', e => { initAudioEngine(); state.volumes[type] = parseFloat(e.target.value); document.getElementById(`${type}VolVal`).textContent = `${Math.round(state.volumes[type] * 100)}%`; updateAudioVolumes(); saveSettings(); });
        });

        function applyTheme(themeName) {
            state.theme = themeName;
            const curPalette = themePalettes[themeName] || themePalettes.night_library;

            if (curPalette.isLight) {
                document.body.classList.add('theme-is-light');
                document.getElementById('appStage')?.classList.add('theme-is-light');
            } else {
                document.body.classList.remove('theme-is-light');
                document.getElementById('appStage')?.classList.remove('theme-is-light');
            }

            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('ring-2', 'ring-white', 'scale-110'));
            const activeThemeBtn = document.querySelector(`[data-theme="${state.theme}"]`);
            if (activeThemeBtn) activeThemeBtn.classList.add('ring-2', 'ring-white', 'scale-110');
            updateIosCardsActiveState();
            saveSettings();
        }

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                applyTheme(e.currentTarget.dataset.theme);
            });
        });

        const iosThemeModal = document.getElementById('iosThemeModal');
        const iosCardsContainer = document.getElementById('iosCardsContainer');
        const iosTopHeader = document.getElementById('iosTopHeader');
        const iosBottomFooter = document.getElementById('iosBottomFooter');
        
        let longPressTimer = null;
        let pressStartX = 0, pressStartY = 0;
        let isEditModeActive = false;

        function updateIosCardsCenteredState() {
            if (!iosCardsContainer) return;
            const containerCenter = iosCardsContainer.getBoundingClientRect().left + iosCardsContainer.clientWidth / 2;
            const cards = document.querySelectorAll('.ios-theme-card');

            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const dist = Math.abs(containerCenter - cardCenter);

                if (dist < cardRect.width * 0.45) {
                    card.classList.add('is-centered');
                    const cardTheme = card.dataset.iosTheme;
                    if (state.theme !== cardTheme && isEditModeActive) {
                        applyTheme(cardTheme);
                    }
                } else {
                    card.classList.remove('is-centered');
                }
            });
        }

        if (iosCardsContainer) {
            iosCardsContainer.addEventListener('scroll', updateIosCardsCenteredState, { passive: true });
        }

        function openIosThemeModal() {
            if (!iosThemeModal || isEditModeActive) return;
            isEditModeActive = true;

            initCardCanvases();

            const topHud = document.getElementById('topHud');
            const bottomHud = document.getElementById('bottomHud');
            if (topHud) { topHud.style.opacity = '0'; topHud.style.pointerEvents = 'none'; }
            if (bottomHud) { bottomHud.style.opacity = '0'; bottomHud.style.pointerEvents = 'none'; }

            if (navigator.vibrate) navigator.vibrate(50);

            iosThemeModal.classList.remove('opacity-0', 'pointer-events-none');
            document.body.classList.add('ios-edit-entering');

            if (iosTopHeader) iosTopHeader.classList.remove('-translate-y-8', 'opacity-0');
            if (iosBottomFooter) iosBottomFooter.classList.remove('translate-y-8', 'opacity-0');
            const prevBtn = document.getElementById('iosPrevThemeBtn');
            const nextBtn = document.getElementById('iosNextThemeBtn');
            if (prevBtn) prevBtn.classList.remove('-translate-x-8', 'opacity-0');
            if (nextBtn) nextBtn.classList.remove('translate-x-8', 'opacity-0');

            const activeCard = document.querySelector(`.ios-theme-card[data-ios-theme="${state.theme}"]`);
            if (activeCard && iosCardsContainer) {
                const scrollLeft = activeCard.offsetLeft - (iosCardsContainer.clientWidth / 2) + (activeCard.clientWidth / 2);
                iosCardsContainer.scrollLeft = scrollLeft;
            }

            if (state.lowPerformance) {
                document.body.classList.remove('ios-edit-entering');
                document.body.classList.add('ios-edit-active');
                updateIosCardsCenteredState();
            } else {
                setTimeout(() => {
                    document.body.classList.remove('ios-edit-entering');
                    document.body.classList.add('ios-edit-active');
                    updateIosCardsCenteredState();
                }, 150);
            }
        }

        function closeIosThemeModal() {
            if (!iosThemeModal || !isEditModeActive) return;
            isEditModeActive = false;

            document.body.classList.remove('ios-edit-active', 'ios-edit-entering');
            if (iosTopHeader) iosTopHeader.classList.add('-translate-y-8', 'opacity-0');
            if (iosBottomFooter) iosBottomFooter.classList.add('translate-y-8', 'opacity-0');
            const prevBtn = document.getElementById('iosPrevThemeBtn');
            const nextBtn = document.getElementById('iosNextThemeBtn');
            if (prevBtn) prevBtn.classList.add('-translate-x-8', 'opacity-0');
            if (nextBtn) nextBtn.classList.add('translate-x-8', 'opacity-0');

            iosThemeModal.classList.add('opacity-0', 'pointer-events-none');

            const topHud = document.getElementById('topHud');
            const bottomHud = document.getElementById('bottomHud');
            if (topHud) { topHud.style.opacity = '1'; topHud.style.pointerEvents = 'auto'; }
            if (bottomHud) { bottomHud.style.opacity = '1'; bottomHud.style.pointerEvents = 'auto'; }
        }

        document.getElementById('openSettingsFromIosModalBtn')?.addEventListener('click', () => {
            closeIosThemeModal();
            document.getElementById('settingsModal')?.classList.remove('opacity-0', 'pointer-events-none');
        });

        function scrollIosThemeCards(direction) {
            if (!iosCardsContainer) return;
            const cards = Array.from(document.querySelectorAll('.ios-theme-card'));
            if (!cards.length) return;
            
            const containerCenter = iosCardsContainer.getBoundingClientRect().left + iosCardsContainer.clientWidth / 2;
            let closestIndex = 0;
            let minDistance = Infinity;

            cards.forEach((card, idx) => {
                const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2;
                const dist = Math.abs(containerCenter - cardCenter);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestIndex = idx;
                }
            });

            const targetIndex = Math.min(Math.max(0, closestIndex + direction), cards.length - 1);
            const targetCard = cards[targetIndex];
            const scrollLeft = targetCard.offsetLeft - (iosCardsContainer.clientWidth / 2) + (targetCard.clientWidth / 2);
            iosCardsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }

        document.getElementById('iosPrevThemeBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            scrollIosThemeCards(-1);
        });

        document.getElementById('iosNextThemeBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            scrollIosThemeCards(1);
        });
        
        document.getElementById('quickThemeBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openIosThemeModal();
        });

        document.querySelectorAll('.ios-theme-card').forEach(card => {
            card.addEventListener('click', e => {
                const theme = e.currentTarget.dataset.iosTheme;
                applyTheme(theme);
                if (iosCardsContainer) {
                    const scrollLeft = e.currentTarget.offsetLeft - (iosCardsContainer.clientWidth / 2) + (e.currentTarget.clientWidth / 2);
                    iosCardsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }
                setTimeout(closeIosThemeModal, 280);
            });
        });

        function isInteractiveElement(target) {
            if (!target) return false;
            return !!target.closest('button, input, textarea, select, a, #clockScaleWrapper, .glass-panel, .drawer-slide, #settingsModal, #whatsNewModal, #pomoCustomModal, #iosThemeModal');
        }

        function startPressTimer(e) {
            if (isInteractiveElement(e.target) || isEditModeActive) return;
            const pt = e.touches ? e.touches[0] : e;
            pressStartX = pt.clientX;
            pressStartY = pt.clientY;

            clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                openIosThemeModal();
            }, 500);
        }

        function cancelPressTimer(e) {
            if (e.touches && e.touches.length > 0) {
                const pt = e.touches[0];
                if (Math.hypot(pt.clientX - pressStartX, pt.clientY - pressStartY) > 10) {
                    clearTimeout(longPressTimer);
                }
            } else {
                clearTimeout(longPressTimer);
            }
        }

        window.addEventListener('mousedown', startPressTimer, { passive: true });
        window.addEventListener('mouseup', cancelPressTimer, { passive: true });
        window.addEventListener('mousemove', (e) => {
            if (Math.hypot(e.clientX - pressStartX, e.clientY - pressStartY) > 10) clearTimeout(longPressTimer);
        }, { passive: true });

        window.addEventListener('touchstart', startPressTimer, { passive: true });
        window.addEventListener('touchend', cancelPressTimer, { passive: true });
        window.addEventListener('touchmove', cancelPressTimer, { passive: true });

        let isZenMode = false, autoHideTimer = null, isUIHiddenByIdle = false;
        const zenNotice = document.getElementById('zenNotice');
        const zenNoticeDefaultHTML = zenNotice ? zenNotice.innerHTML : '';

        function hideUI() {
            const topHud = document.getElementById('topHud'), bottomHud = document.getElementById('bottomHud'), quoteDisplay = getClockEl('quoteDisplay');
            if (topHud) { topHud.style.opacity = '0'; topHud.style.pointerEvents = 'none'; }
            if (bottomHud) { bottomHud.style.opacity = '0'; bottomHud.style.pointerEvents = 'none'; }
            if (quoteDisplay && state.showQuote) quoteDisplay.style.opacity = '0';
        }

        function showUI() {
            const topHud = document.getElementById('topHud'), bottomHud = document.getElementById('bottomHud'), quoteDisplay = getClockEl('quoteDisplay');
            if (topHud) { topHud.style.opacity = '1'; topHud.style.pointerEvents = 'auto'; }
            if (bottomHud) { bottomHud.style.opacity = '1'; bottomHud.style.pointerEvents = 'auto'; }
            if (quoteDisplay && state.showQuote) quoteDisplay.style.opacity = '1';
        }

        function resetAutoHideTimer() {
            clearTimeout(autoHideTimer);
            if (isUIHiddenByIdle && !isZenMode) { showUI(); isUIHiddenByIdle = false; }
            if (!state.autoHideUI || isZenMode) return;
            autoHideTimer = setTimeout(() => {
                const isDrawerOpen = (taskDrawer && !taskDrawer.classList.contains('opacity-0')) || (audioMixerDrawer && !audioMixerDrawer.classList.contains('opacity-0'));
                const isModalOpen = (settingsModal && !settingsModal.classList.contains('opacity-0')) || (whatsNewModal && !whatsNewModal.classList.contains('opacity-0')) || (pomoCustomModal && !pomoCustomModal.classList.contains('opacity-0')) || (iosThemeModal && !iosThemeModal.classList.contains('opacity-0'));
                if (!isDrawerOpen && !isModalOpen && state.autoHideUI && !isZenMode) { hideUI(); isUIHiddenByIdle = true; }
            }, 5000);
        }

        ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => window.addEventListener(evt, () => resetAutoHideTimer(), { passive: true }));

        let lightningTimeout = null; const lightningCanvas = document.getElementById('lightningCanvas'), lCtx = lightningCanvas ? lightningCanvas.getContext('2d') : null;
        function resizeLightningCanvas() { if (lightningCanvas) { lightningCanvas.width = window.innerWidth; lightningCanvas.height = window.innerHeight; } }
        window.addEventListener('resize', resizeLightningCanvas); resizeLightningCanvas();

        function drawLightningBolt(x1, y1, x2, y2, displacement) {
            if (!lCtx) return;
            lCtx.save(); lCtx.beginPath(); lCtx.moveTo(x1, y1);
            function createBranch(startX, startY, endX, endY, disp, depth) {
                if (depth <= 0) { lCtx.lineTo(endX, endY); return; }
                const midX = (startX + endX) / 2 + (Math.random() - 0.5) * disp, midY = (startY + endY) / 2 + (Math.random() - 0.5) * disp;
                createBranch(startX, startY, midX, midY, disp / 2, depth - 1); createBranch(midX, midY, endX, endY, disp / 2, depth - 1);
                if (Math.random() < 0.35 && depth > 2) createBranch(midX, midY, midX + (Math.random() - 0.5) * disp * 2, midY + Math.random() * disp * 1.5, disp / 2, depth - 2);
            }
            createBranch(x1, y1, x2, y2, displacement, 5);
            lCtx.strokeStyle = 'rgba(186, 230, 253, 0.85)'; lCtx.lineWidth = 4; lCtx.shadowBlur = 25; lCtx.shadowColor = '#38bdf8'; lCtx.stroke();
            lCtx.strokeStyle = '#ffffff'; lCtx.lineWidth = 2; lCtx.shadowBlur = 10; lCtx.shadowColor = '#ffffff'; lCtx.stroke(); lCtx.restore();
        }

        function triggerLightningFlash(isImmediate = false) {
            if (!state.thunderEnabled) return;
            const overlay = document.getElementById('lightningOverlay'); if (!overlay || !lCtx || !lightningCanvas) return;
            lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);
            for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
                drawLightningBolt(Math.random() * (lightningCanvas.width * 0.8) + (lightningCanvas.width * 0.1), 0, (Math.random() - 0.5) * 350, lightningCanvas.height * (0.55 + Math.random() * 0.35), 110);
            }
            const maxOpacity = isImmediate ? 0.75 : (Math.random() * 0.45 + 0.35);
            overlay.style.opacity = maxOpacity.toString();
            setTimeout(() => { overlay.style.opacity = '0.08'; setTimeout(() => { overlay.style.opacity = (maxOpacity * 0.8).toString(); setTimeout(() => { overlay.style.opacity = '0'; setTimeout(() => { if (lCtx && lightningCanvas) lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height); }, 120); }, 100); }, 50); }, 90);
            scheduleNextLightning();
        }

        function scheduleNextLightning() { clearTimeout(lightningTimeout); if (state.thunderEnabled) lightningTimeout = setTimeout(triggerLightningFlash, Math.random() * 9000 + 6000); }

        function toggleThunder(enable) {
            state.thunderEnabled = enable !== undefined ? enable : !state.thunderEnabled;
            const btn = document.getElementById('thunderToggleBtn'), icon = document.getElementById('thunderIcon');
            if (state.thunderEnabled) {
                if (btn) btn.classList.add('bg-amber-500/20', 'border', 'border-amber-400/40');
                if (icon) icon.className = "fa-solid fa-bolt text-xs text-amber-300 animate-pulse";
                triggerLightningFlash(true);
            } else {
                if (btn) btn.classList.remove('bg-amber-500/20', 'border', 'border-amber-400/40');
                if (icon) icon.className = "fa-solid fa-bolt text-xs text-white/50";
                clearTimeout(lightningTimeout);
                const overlay = document.getElementById('lightningOverlay'); if (overlay) overlay.style.opacity = '0';
                if (lCtx && lightningCanvas) lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);
            }
            saveSettings();
        }

        document.getElementById('thunderToggleBtn')?.addEventListener('click', () => toggleThunder());

        function toggleZenMode(enable) {
            isZenMode = enable !== undefined ? enable : !isZenMode;
            if (isZenMode) {
                hideUI(); taskDrawer?.classList.add('opacity-0', 'pointer-events-none', '-translate-x-full'); audioMixerDrawer?.classList.add('opacity-0', 'pointer-events-none', 'translate-x-full');
                if (zenNotice) { zenNotice.innerHTML = zenNoticeDefaultHTML; zenNotice.classList.remove('opacity-0', '-translate-y-4'); setTimeout(() => { if (isZenMode && zenNotice) zenNotice.classList.add('opacity-0', '-translate-y-4'); }, 3000); }
            } else {
                showUI(); isUIHiddenByIdle = false; if (zenNotice) zenNotice.classList.add('opacity-0', '-translate-y-4'); resetAutoHideTimer();
            }
        }

        document.getElementById('zenModeBtn')?.addEventListener('click', (e) => { e.stopPropagation(); toggleZenMode(true); });
        window.addEventListener('click', (e) => { if (isZenMode && !isInteractiveElement(e.target)) toggleZenMode(false); });

        const settingsModal = document.getElementById('settingsModal');
        let activeSettingsTab = 'tab-visual';
        let isMobileSettingsSubView = false;

        function updateSettingsViewMode() {
            const isMobile = window.innerWidth < 640;
            const catList = document.getElementById('settingsCategoryList');
            const detailContainer = document.getElementById('settingsDetailContainer');
            const backBtn = document.getElementById('settingsBackBtn');
            const headerTitle = document.getElementById('settingsHeaderTitle');
            const headerIcon = document.getElementById('settingsHeaderIcon');

            if (isMobile) {
                if (isMobileSettingsSubView) {
                    if (catList) {
                        catList.style.transform = 'translateX(-25%)';
                        catList.style.opacity = '0.3';
                        catList.style.filter = 'brightness(0.6)';
                        catList.style.pointerEvents = 'none';
                    }
                    if (detailContainer) {
                        detailContainer.style.transform = 'translateX(0)';
                        detailContainer.style.pointerEvents = 'auto';
                    }
                    if (backBtn) {
                        backBtn.classList.remove('hidden');
                        backBtn.classList.add('flex');
                    }
                    const activeBtn = document.querySelector(`.settings-tab-btn[data-tab="${activeSettingsTab}"]`);
                    if (activeBtn) {
                        if (headerTitle) headerTitle.textContent = activeBtn.dataset.title || '設定選項';
                        if (headerIcon) headerIcon.className = activeBtn.dataset.icon || 'fa-solid fa-sliders text-indigo-400 text-lg';
                    }
                } else {
                    if (catList) {
                        catList.style.transform = 'translateX(0)';
                        catList.style.opacity = '1';
                        catList.style.filter = 'none';
                        catList.style.pointerEvents = 'auto';
                    }
                    if (detailContainer) {
                        detailContainer.style.transform = 'translateX(100%)';
                        detailContainer.style.pointerEvents = 'none';
                    }
                    if (backBtn) {
                        backBtn.classList.add('hidden');
                        backBtn.classList.remove('flex');
                    }
                    if (headerTitle) headerTitle.textContent = '專注與顯示進階設定';
                    if (headerIcon) headerIcon.className = 'fa-solid fa-sliders text-indigo-400 text-lg';
                }
            } else {
                if (catList) {
                    catList.style.transform = '';
                    catList.style.opacity = '';
                    catList.style.filter = '';
                    catList.style.pointerEvents = '';
                }
                if (detailContainer) {
                    detailContainer.style.transform = '';
                    detailContainer.style.pointerEvents = '';
                }
                if (backBtn) {
                    backBtn.classList.add('hidden');
                    backBtn.classList.remove('flex');
                }
                if (headerTitle) headerTitle.textContent = '專注與顯示進階設定';
                if (headerIcon) headerIcon.className = 'fa-solid fa-sliders text-indigo-400 text-lg';
            }
        }

        document.getElementById('settingsBackBtn')?.addEventListener('click', () => {
            isMobileSettingsSubView = false;
            updateSettingsViewMode();
        });

        document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
            isMobileSettingsSubView = false;
            updateSettingsViewMode();
            settingsModal?.classList.remove('opacity-0', 'pointer-events-none');
        });

        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget;
                activeSettingsTab = targetBtn.getAttribute('data-tab');

                document.querySelectorAll('.settings-tab-btn').forEach(b => {
                    b.classList.remove(b.dataset.activeBg, b.dataset.activeText, b.dataset.activeBorder);
                    b.classList.add('text-white/60', 'border-transparent', 'hover:bg-white/5', 'hover:text-white/80');
                });
                targetBtn.classList.remove('text-white/60', 'border-transparent', 'hover:bg-white/5', 'hover:text-white/80');
                targetBtn.classList.add(targetBtn.dataset.activeBg, targetBtn.dataset.activeText, targetBtn.dataset.activeBorder);

                document.querySelectorAll('.settings-tab-content').forEach(c => { c.classList.remove('block'); c.classList.add('hidden'); });
                const targetContent = document.getElementById(activeSettingsTab);
                if (targetContent) { targetContent.classList.remove('hidden'); targetContent.classList.add('block'); }

                if (window.innerWidth < 640) {
                    isMobileSettingsSubView = true;
                    updateSettingsViewMode();
                }
            });
        });

        window.addEventListener('resize', updateSettingsViewMode);

        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => settingsModal?.classList.add('opacity-0', 'pointer-events-none'));

        document.getElementById('speedSlider')?.addEventListener('input', e => { state.speed = parseFloat(e.target.value); document.getElementById('speedVal').textContent = `${state.speed.toFixed(1)}x`; saveSettings(); });
        document.getElementById('densitySlider')?.addEventListener('input', e => { state.density = parseFloat(e.target.value); document.getElementById('densityVal').textContent = state.density < 0.8 ? "極簡" : state.density > 1.2 ? "密集" : "標準"; initRain(); saveSettings(); });

        window.setClockFont = function(font, autoSave = true) {
            state.clockFont = font; const tf = getClockEl('timeDisplay');
            if (tf) tf.className = `font-${font} font-light text-5xl sm:text-7xl tracking-tight text-shadow-glow text-white/95`;
            const activeCls = "font-btn bg-cyan-500/20 py-2 rounded-xl text-center text-cyan-200 font-semibold border border-cyan-500/30 transition", inactiveCls = "font-btn bg-white/5 hover:bg-white/20 py-2 rounded-xl text-center text-white/80 border border-transparent transition";
            document.querySelectorAll('.font-btn').forEach(b => b.className = inactiveCls);
            const btns = document.querySelectorAll('.font-btn');
            if (font === 'sans' && btns[0]) btns[0].className = activeCls;
            if (font === 'mono' && btns[1]) btns[1].className = activeCls;
            if (font === 'serif' && btns[2]) btns[2].className = activeCls;
            if (autoSave) saveSettings();
        }

        window.setClockScale = function(scale, autoSave = true) {
            state.clockScale = scale; const wrapper = getClockEl('clockScaleWrapper');
            if (wrapper) wrapper.style.transform = `scale(${scale})`;
            const activeCls = "size-btn bg-cyan-500/20 py-2 rounded-xl text-center text-cyan-200 font-semibold border border-cyan-500/30 transition text-[11px]", inactiveCls = "size-btn bg-white/5 hover:bg-white/20 py-2 rounded-xl text-center text-white/80 border border-transparent transition text-[11px]";
            document.querySelectorAll('.size-btn').forEach(b => b.className = inactiveCls);
            const btns = document.querySelectorAll('.size-btn');
            if (scale === 0.75 && btns[0]) btns[0].className = activeCls;
            if (scale === 1.0 && btns[1]) btns[1].className = activeCls;
            if (scale === 1.25 && btns[2]) btns[2].className = activeCls;
            if (scale === 1.5 && btns[3]) btns[3].className = activeCls;
            if (autoSave) saveSettings();
        };

        window.setRingStyle = function(style, autoSave = true) {
            state.ringStyle = style; const bg = getClockEl('frostedGlassBg');
            if (bg) { if (style === 'refined') bg.classList.remove('hidden'); else bg.classList.add('hidden'); }
            const btnSimple = document.getElementById('btnRingSimple'), btnRefined = document.getElementById('btnRingRefined');
            const activeCls = "ring-style-btn bg-cyan-500/20 py-2 rounded-xl text-center text-cyan-200 font-semibold border border-cyan-500/30 transition", inactiveCls = "ring-style-btn bg-white/5 hover:bg-white/20 py-2 rounded-xl text-center text-white/80 border border-transparent transition";
            if (btnSimple) btnSimple.className = style === 'simple' ? activeCls : inactiveCls;
            if (btnRefined) btnRefined.className = style === 'refined' ? activeCls : inactiveCls;
            if (autoSave) saveSettings();
        };

        document.getElementById('customQuoteInput')?.addEventListener('input', e => { state.customQuoteText = e.target.value; updateClock(); saveSettings(); });
        document.getElementById('binauralSelect')?.addEventListener('change', e => { updateBinauralFrequencies(e.target.value); saveSettings(); });
        document.getElementById('showFpsToggle')?.addEventListener('change', e => { state.showFps = e.target.checked; toggleFpsDisplay(state.showFps); saveSettings(); });
        document.getElementById('autoHideToggle')?.addEventListener('change', e => { state.autoHideUI = e.target.checked; resetAutoHideTimer(); saveSettings(); });
        document.getElementById('glassInteractionToggle')?.addEventListener('change', e => { state.glassInteraction = e.target.checked; saveSettings(); });
        document.getElementById('format24Toggle')?.addEventListener('change', e => { state.clock24h = e.target.checked; updateClock(); saveSettings(); });
        document.getElementById('showSecondsToggle')?.addEventListener('change', e => { state.showSeconds = e.target.checked; updateClock(); saveSettings(); });
        document.getElementById('showQuoteToggle')?.addEventListener('change', e => { state.showQuote = e.target.checked; const q = getClockEl('quoteDisplay'); if (q) q.style.display = state.showQuote ? 'block' : 'none'; saveSettings(); });
        document.getElementById('autoPomoToggle')?.addEventListener('change', e => { state.autoPomo = e.target.checked; saveSettings(); });
        document.getElementById('soundChimeToggle')?.addEventListener('change', e => { state.soundChime = e.target.checked; saveSettings(); });

        function updateFsIcon() {
            const icon = document.getElementById('fsIcon');
            if (icon) icon.className = (document.fullscreenElement || document.webkitFullscreenElement) ? "fa-solid fa-compress text-xs" : "fa-solid fa-expand text-xs";
        }
        document.addEventListener('fullscreenchange', updateFsIcon);
        document.addEventListener('webkitfullscreenchange', updateFsIcon);
        document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
            const el = document.documentElement;
            const req = el.requestFullscreen || el.webkitRequestFullscreen;
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (document.fullscreenElement || document.webkitFullscreenElement) { if (exit) exit.call(document); return; }
            if (req) { const p = req.call(el); if (p && p.catch) p.catch(() => {}); return; }
            if (zenNotice) {
                zenNotice.innerHTML = `<i class="fa-solid fa-circle-info text-amber-400 mr-2"></i>此瀏覽器不支援全螢幕（iPhone 請用「加入主畫面」以 App 模式開啟）`;
                zenNotice.classList.remove('opacity-0', '-translate-y-4');
                setTimeout(() => { zenNotice.classList.add('opacity-0', '-translate-y-4'); }, 4000);
            }
        });

        let isPomoFolded = true;
        const foldPomoBtn = document.getElementById('togglePomoFoldBtn'), fullPomoControls = document.getElementById('pomoFullControls'), foldPomoIcon = document.getElementById('pomoFoldIcon'), foldMiniText = document.getElementById('pomoFoldMiniText'), foldTooltip = document.getElementById('pomoFoldTooltip');
        foldPomoBtn?.addEventListener('click', () => {
            isPomoFolded = !isPomoFolded;
            if (isPomoFolded) { fullPomoControls?.classList.add('hidden'); if (foldPomoIcon) foldPomoIcon.className = "fa-solid fa-stopwatch text-xs text-indigo-400"; foldMiniText?.classList.remove('hidden'); if (foldTooltip) foldTooltip.textContent = "展開控制按鈕"; }
            else { fullPomoControls?.classList.remove('hidden'); if (foldPomoIcon) foldPomoIcon.className = "fa-solid fa-chevron-down text-xs"; foldMiniText?.classList.add('hidden'); if (foldTooltip) foldTooltip.textContent = "收納控制按鈕"; }
        });

        window.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement, isTyping = activeEl && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable);
            if (e.key === 'Escape') {
                if (breathingState.active) { stopBreathingGuide(); return; }
                if (isZenMode) toggleZenMode(false);
                closeIosThemeModal();
                settingsModal?.classList.add('opacity-0', 'pointer-events-none'); hideWhatsNewModal();
                pomoCustomModal?.classList.add('opacity-0', 'pointer-events-none'); taskDrawer?.classList.add('opacity-0', 'pointer-events-none', '-translate-x-full');
                audioMixerDrawer?.classList.add('opacity-0', 'pointer-events-none', 'translate-x-full'); return;
            }
            if (e.ctrlKey || e.metaKey) return; // 不攔截瀏覽器組合鍵 (Ctrl/Cmd + R、F 等)
            if (isEditModeActive) {
                if (e.key === 'ArrowLeft') { e.preventDefault(); scrollIosThemeCards(-1); return; }
                if (e.key === 'ArrowRight') { e.preventDefault(); scrollIosThemeCards(1); return; }
            }
            if (isTyping) return;
            if (e.code === 'Space') { e.preventDefault(); document.getElementById('pomoMainBtn')?.click(); }
            if (e.altKey && (e.code === 'KeyP' || e.key === 'p' || e.key === 'P')) { e.preventDefault(); togglePictureInPicture(); }
            if (e.key === 'b' || e.key === 'B') { e.preventDefault(); breathingState.active ? stopBreathingGuide() : startBreathingGuide(); }
            if (e.key === 'c' || e.key === 'C') { e.preventDefault(); foldPomoBtn?.click(); }
            if (e.key === 'r' || e.key === 'R') { e.preventDefault(); document.getElementById('pomoResetBtn')?.click(); }
            if (e.key === 'n' || e.key === 'N') { e.preventDefault(); document.getElementById('pomoModeBtn')?.click(); }
            if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); toggleZenMode(); }
            if (e.key === 'm' || e.key === 'M') { e.preventDefault(); document.getElementById('masterAudioToggle')?.click(); }
            if (e.key === 't' || e.key === 'T') { e.preventDefault(); document.getElementById('toggleTaskDrawerBtn')?.click(); }
            if (e.key === 'a' || e.key === 'A') { e.preventDefault(); document.getElementById('toggleAudioMixerBtn')?.click(); }
            if (e.key === 's' || e.key === 'S') { e.preventDefault(); settingsModal?.classList.toggle('opacity-0'); settingsModal?.classList.toggle('pointer-events-none'); }
            if (e.key === 'f' || e.key === 'F') { e.preventDefault(); document.getElementById('fullscreenBtn')?.click(); }
            if (e.key === 'l' || e.key === 'L') { e.preventDefault(); document.getElementById('lowPerfToggleBtn')?.click(); }
            if (e.key === '?' || e.key === '/') { e.preventDefault(); settingsModal?.classList.remove('opacity-0', 'pointer-events-none'); const shortcutTab = document.querySelector('[data-tab="tab-shortcuts"]'); if (shortcutTab) shortcutTab.click(); }
        });

        window.onload = () => {
            loadSettings(); syncUIFromState(); initRain(); renderRain(); renderTasks(); updatePomoDisplay(); syncPomoLabels(); updateClock(); resetAutoHideTimer();
            if (!hadPriorVisit && !hasSeenWhatsNew()) setTimeout(showWhatsNewModal, 500); // 第一次使用才彈出
            updateBadgeDisplay(); // 老用戶：只顯示設定圖示上的紅色「1」

            setTimeout(() => {
                isPageLoaded = true;
            }, 800);
        };

        if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW 註冊失敗:', err)); }); }

        let deferredPrompt; const pwaBtn = document.getElementById('pwaInstallBtn');
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); deferredPrompt = e;
            if (pwaBtn) {
                pwaBtn.classList.remove('hidden');
                pwaBtn.addEventListener('click', () => {
                    pwaBtn.classList.add('hidden');
                    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { deferredPrompt = null; }); }
                });
            }
        });

        document.getElementById('factoryResetBtn')?.addEventListener('click', () => {
            const btn = document.getElementById('factoryResetBtn');
            if (!btn) return;
            if (btn.dataset.confirm === 'true') { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(MEMO_STORAGE_KEY); localStorage.removeItem(WHATS_NEW_KEY); location.reload(); }
            else {
                btn.dataset.confirm = 'true'; btn.innerHTML = `<i class="fa-solid fa-triangle-exclamation w-4 text-center animate-pulse"></i><span>確定重設？(再點一次)</span>`;
                btn.classList.remove('text-rose-400'); btn.classList.add('bg-rose-500', 'text-white');
                setTimeout(() => {
                    if (btn.dataset.confirm === 'true') { btn.dataset.confirm = 'false'; btn.innerHTML = `<i class="fa-solid fa-rotate-left w-4 text-center group-hover:-rotate-180 transition-transform duration-500"></i><span>恢復預設值</span>`; btn.classList.remove('bg-rose-500', 'text-white'); btn.classList.add('text-rose-400'); }
                }, 3000);
            }
        });
