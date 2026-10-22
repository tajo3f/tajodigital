(() => {
  'use strict';
  if (window.__TAJO_RADIO_LOADED__) return;
  window.__TAJO_RADIO_LOADED__ = true;

  const currentScript = document.currentScript || [...document.scripts].find(s => /tajo-radio\.js(?:\?|$)/.test(s.src));
  if (!currentScript || !currentScript.src) return;
  const scriptBase = new URL('.', currentScript.src);
  const TRACKS = [
  {
    "artist": "AtlasAudio",
    "title": "Innovation",
    "id": "522427",
    "file": "01_atlasaudio_innovation_522427.mp3",
    "duration": 152.033
  },
  {
    "artist": "Nastelbom",
    "title": "Innovation",
    "id": "301028",
    "file": "02_nastelbom_innovation_301028.mp3",
    "duration": 118.753
  },
  {
    "artist": "Paulyudin",
    "title": "Minimal",
    "id": "164833",
    "file": "03_paulyudin_minimal_164833.mp3",
    "duration": 117.995
  },
  {
    "artist": "Kulakovka",
    "title": "Minimal Electronica",
    "id": "274978",
    "file": "04_kulakovka_minimal_electronica_274978.mp3",
    "duration": 155.455
  },
  {
    "artist": "Paulyudin",
    "title": "Minimal Tech",
    "id": "151898",
    "file": "05_paulyudin_minimal_tech_151898.mp3",
    "duration": 160.183
  },
  {
    "artist": "Kulakovka",
    "title": "Minimal Instrumental",
    "id": "275609",
    "file": "06_kulakovka_minimal_instrumental_275609.mp3",
    "duration": 119.562
  },
  {
    "artist": "Paulyudin",
    "title": "Minimal Tech",
    "id": "151890",
    "file": "07_paulyudin_minimal_tech_151890.mp3",
    "duration": 140.408
  },
  {
    "artist": "Aurec",
    "title": "Minimal House",
    "id": "612631",
    "file": "08_aurec_minimal_house_612631.mp3",
    "duration": 224.424
  },
  {
    "artist": "Nastelbom",
    "title": "Electronic Bass",
    "id": "435079",
    "file": "09_nastelbom_electronic_bass_435079.mp3",
    "duration": 126.38
  },
  {
    "artist": "Sub_Clair",
    "title": "Corporate",
    "id": "611728",
    "file": "10_sub_clair_corporate_611728.mp3",
    "duration": 162.048
  },
  {
    "artist": "Easy_Eva",
    "title": "Electronic Golden 61 sec",
    "id": "564088",
    "file": "11_easy_eva_electronic_golden_61_sec_564088.mp3",
    "duration": 60.528
  },
  {
    "artist": "Easy_Eva",
    "title": "Electronic Golden 44 sec",
    "id": "564086",
    "file": "12_easy_eva_electronic_golden_44_sec_564086.mp3",
    "duration": 43.656
  },
  {
    "artist": "Alex Morgan",
    "title": "Corporate Startup Promo",
    "id": "568146",
    "file": "13_alex_morgan_corporate_startup_promo_568146.mp3",
    "duration": 96.672
  },
  {
    "artist": "Orvien",
    "title": "Electronic Corporate",
    "id": "612068",
    "file": "14_orvien_electronic_corporate_612068.mp3",
    "duration": 182.232
  },
  {
    "artist": "LnPlusMusic",
    "title": "Technology Music",
    "id": "597962",
    "file": "15_lnplusmusic_technology_music_597962.mp3",
    "duration": 200.046
  },
  {
    "artist": "AtlasAudio",
    "title": "Technology",
    "id": "613340",
    "file": "16_atlasaudio_technology_613340.mp3",
    "duration": 72.046
  },
  {
    "artist": "The_Mountain",
    "title": "Ambient Technology",
    "id": "133250",
    "file": "17_the_mountain_ambient_technology_133250.mp3",
    "duration": 130.325
  },
  {
    "artist": "VelarioMusic",
    "title": "Technology Ambient",
    "id": "613800",
    "file": "18_velariomusic_technology_ambient_613800.mp3",
    "duration": 144.6
  }
];
  const AUDIO_BASE = new URL('audio/', scriptBase);
  const STORAGE_ENABLED = 'tajoRadioEnabled';
  const STORAGE_VOLUME = 'tajoRadioVolume';
  const EPOCH = Date.UTC(2026, 0, 1, 0, 0, 0) / 1000;
  const totalDuration = TRACKS.reduce((sum, t) => sum + Number(t.duration || 0), 0);
  const failed = new Set();
  let retryTimer = null;

  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const safeStorage = {
    get(key, fallback) { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };

  function stationPosition() {
    if (!totalDuration) return {index:0, offset:0};
    let pos = ((Date.now()/1000 - EPOCH) % totalDuration + totalDuration) % totalDuration;
    for (let i=0;i<TRACKS.length;i++) {
      if (pos < TRACKS[i].duration) return {index:i, offset:pos};
      pos -= TRACKS[i].duration;
    }
    return {index:0, offset:0};
  }

  function nextPlayable(start) {
    for (let step=0; step<TRACKS.length; step++) {
      const i = (start + step) % TRACKS.length;
      if (!failed.has(i)) return i;
    }
    failed.clear();
    return start % TRACKS.length;
  }

  function buildUI() {
    const existing = document.getElementById('tajo-radio-bar');
    if (existing) return existing;
    const root = document.createElement('div');
    root.id = 'tajo-radio-bar';
    root.innerHTML = `
      <div class="tajo-radio-inner" role="region" aria-label="TAJO Rádio 24 horas">
        <a class="tajo-radio-brand" href="/radio/" aria-label="Conhecer a TAJO Rádio 24H">
          <span class="tajo-live-dot" aria-hidden="true"></span>
          <span class="tajo-live">LIVE</span>
          <strong>TAJO RÁDIO</strong>
        </a>
        <div class="tajo-now" title="Faixa atual">
          <span id="tajo-radio-title">Preparando estação…</span>
          <span class="tajo-sep">•</span>
          <span id="tajo-radio-artist"></span>
        </div>
        <div class="tajo-radio-actions">
          <button id="tajo-radio-play" type="button" aria-label="Ativar rádio">▶</button>
          <button id="tajo-radio-mute" type="button" aria-label="Silenciar">🔊</button>
          <input id="tajo-radio-volume" type="range" min="0" max="100" step="1" aria-label="Volume da rádio" />
        </div>
      </div>`;
    document.body.insertAdjacentElement('afterbegin', root);
    return root;
  }

  const root = buildUI();
  const audio = new Audio();
  audio.preload = 'metadata';
  let currentIndex = -1;
  let enabled = safeStorage.get(STORAGE_ENABLED, '0') === '1';
  let volume = clamp(parseFloat(safeStorage.get(STORAGE_VOLUME, '0.12')) || 0.12, 0, 1);
  let loadingToken = 0;
  audio.volume = volume;

  const titleEl = $('#tajo-radio-title', root);
  const artistEl = $('#tajo-radio-artist', root);
  const playBtn = $('#tajo-radio-play', root);
  const muteBtn = $('#tajo-radio-mute', root);
  const volumeEl = $('#tajo-radio-volume', root);
  volumeEl.value = Math.round(volume * 100);

  function setPlayingUI(playing) {
    playBtn.textContent = playing ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', playing ? 'Pausar rádio' : 'Ativar rádio');
    root.classList.toggle('is-playing', playing);
  }
  function updateTrackUI(index) {
    const t = TRACKS[index];
    titleEl.textContent = t?.title || 'TAJO Rádio 24H';
    artistEl.textContent = t?.artist || '';
  }
  function waitForMetadata(token) {
    return new Promise((resolve, reject) => {
      if (token !== loadingToken) return reject(new Error('cancelled'));
      if (audio.readyState >= 1 && Number.isFinite(audio.duration)) return resolve();
      const cleanup = () => { audio.removeEventListener('loadedmetadata', ok); audio.removeEventListener('error', fail); };
      const ok = () => { cleanup(); resolve(); };
      const fail = () => { cleanup(); reject(new Error('audio-load-error')); };
      audio.addEventListener('loadedmetadata', ok, {once:true});
      audio.addEventListener('error', fail, {once:true});
      window.setTimeout(() => { cleanup(); reject(new Error('audio-timeout')); }, 12000);
    });
  }

  async function loadAt(index, offset, shouldPlay) {
    if (!TRACKS.length) return;
    const requested = nextPlayable(index);
    const track = TRACKS[requested];
    const token = ++loadingToken;
    try {
      if (currentIndex !== requested || !audio.src) {
        currentIndex = requested;
        audio.src = new URL(track.file, AUDIO_BASE).href;
        updateTrackUI(requested);
        audio.load();
        await waitForMetadata(token);
      }
      if (token !== loadingToken) return;
      const duration = Number.isFinite(audio.duration) ? audio.duration : Number(track.duration || 0);
      const max = Math.max(0, duration - 0.25);
      audio.currentTime = clamp(requested === index ? offset : 0, 0, max);
      if (shouldPlay) {
        await audio.play();
        setPlayingUI(true);
      } else { setPlayingUI(false); }
    } catch (err) {
      if (token !== loadingToken) return;
      if (err?.name === 'NotAllowedError') {
        enabled = false;
        safeStorage.set(STORAGE_ENABLED, '0');
        titleEl.textContent = 'Clique em ▶ para ouvir';
        artistEl.textContent = 'TAJO Rádio 24H';
        setPlayingUI(false);
        return;
      }
      failed.add(requested);
      titleEl.textContent = 'Reconectando à estação…';
      artistEl.textContent = '';
      setPlayingUI(false);
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => loadAt((requested + 1) % TRACKS.length, 0, shouldPlay), 1000);
    }
  }

  async function syncStation(shouldPlay = enabled) {
    const pos = stationPosition();
    await loadAt(pos.index, pos.offset, shouldPlay);
  }

  playBtn.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause(); enabled = false; safeStorage.set(STORAGE_ENABLED,'0'); setPlayingUI(false); return;
    }
    enabled = true; safeStorage.set(STORAGE_ENABLED,'1'); await syncStation(true);
  });
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', audio.muted ? 'Ativar som' : 'Silenciar');
  });
  volumeEl.addEventListener('input', () => {
    volume = clamp(Number(volumeEl.value)/100, 0, 1); audio.volume = volume; audio.muted = false;
    muteBtn.textContent = '🔊'; safeStorage.set(STORAGE_VOLUME, String(volume));
  });
  audio.addEventListener('ended', () => loadAt((currentIndex + 1) % TRACKS.length, 0, enabled));
  audio.addEventListener('error', () => { if (currentIndex >= 0) failed.add(currentIndex); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && enabled) syncStation(true); });
  window.addEventListener('online', () => { if (enabled) syncStation(true); });
  setInterval(() => {
    if (!enabled || audio.paused) return;
    const pos = stationPosition();
    if (pos.index !== currentIndex || Math.abs(audio.currentTime - pos.offset) > 3) syncStation(true);
  }, 30000);

  syncStation(enabled);
})();
