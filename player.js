document.addEventListener('DOMContentLoaded', function () {
    console.log('[player] start');

    /*  Бургер меню  */
    const burger  = document.getElementById('burger');
    const navMenu = document.getElementById('navMenu');

    if (burger && navMenu) {
        burger.addEventListener('click', function () {
            const opened = navMenu.classList.toggle('open');
            burger.classList.toggle('active', opened);
            burger.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('open');
                burger.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /*  ПЛЕЕР  */
    const tracks = [
        { title: 'Sabbath',         src: 'audio/sabbath.mp3' },
        { title: 'Song Of Saya',    src: 'audio/song_of_saya.mp3' },
        { title: 'Seek',            src: 'audio/seek.mp3' },
        { title: 'Song of Saya II', src: 'audio/song_of_saya_2.mp3' },
        { title: 'Song of Saya I',  src: 'audio/song_of_saya_1.mp3' }
    ];

    /*  элементы  */
    const audio     = document.getElementById('audioPlayer');
    const player    = document.getElementById('musicPlayer');
    const toggleBtn = document.getElementById('playerToggle');
    const playBtn   = document.getElementById('playBtn');
    const prevBtn   = document.getElementById('prevBtn');
    const nextBtn   = document.getElementById('nextBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const likeBtn   = document.getElementById('likeBtn');
    const titleEl   = document.getElementById('playerTitle');
    const seekBar   = document.getElementById('seekBar');
    const volumeBar = document.getElementById('volumeBar');
    const curEl     = document.getElementById('currentTime');
    const durEl     = document.getElementById('duration');

    /*  защита от отсутствующих элементов  */
    if (!audio)   { console.error('[player] нет #audioPlayer');   return; }
    if (!player)  { console.error('[player] нет #musicPlayer');   return; }
    if (!playBtn) { console.error('[player] нет #playBtn');       return; }

    if (!repeatBtn) console.warn('[player] нет #repeatBtn — повтор отключён');
    if (!likeBtn)   console.warn('[player] нет #likeBtn — избранное отключено');
    if (!prevBtn)   console.warn('[player] нет #prevBtn');
    if (!nextBtn)   console.warn('[player] нет #nextBtn');
    if (!seekBar)   console.warn('[player] нет #seekBar — перемотка отключена');
    if (!volumeBar) console.warn('[player] нет #volumeBar — громкость отключена');
    if (!titleEl)   console.warn('[player] нет #playerTitle');
    if (!curEl)     console.warn('[player] нет #currentTime');
    if (!durEl)     console.warn('[player] нет #duration');

    /*  константы  */
    const ICON_PLAY  = '▷';
    const ICON_PAUSE = 'II';
    const REPEAT_OFF = 0, REPEAT_ALL = 1, REPEAT_ONE = 2;

    /*  переменные состояния (используем let, так как они меняются)  */
    let repeatMode = REPEAT_OFF;
    let current    = 0;
    let seeking    = false;

    /* На телефоне плеер стартует свёрнутым */
    if (window.innerWidth <= 768) player.classList.remove('open');

    /*  ПОВТОР  */
    function applyRepeatUI() {
        if (!repeatBtn) return;
        repeatBtn.classList.toggle('active', repeatMode !== REPEAT_OFF);
        repeatBtn.classList.toggle('one', repeatMode === REPEAT_ONE);
        repeatBtn.textContent = repeatMode === REPEAT_ONE ? '↻' : '↺';
        repeatBtn.title =
            repeatMode === REPEAT_OFF ? 'Повтор выключен' :
            repeatMode === REPEAT_ALL ? 'Повтор плейлиста' :
                                        'Повтор одного трека';
    }

    try {
        const savedRepeat = parseInt(localStorage.getItem('sayaRepeat'), 10);
        if (savedRepeat >= 0 && savedRepeat <= 2) repeatMode = savedRepeat;
    } catch (e) {}
    applyRepeatUI();

    if (repeatBtn) {
        repeatBtn.addEventListener('click', function () {
            repeatMode = (repeatMode + 1) % 3;
            applyRepeatUI();
            try { localStorage.setItem('sayaRepeat', String(repeatMode)); } catch (e) {}
        });
    }

    /*  избранное  */
    function getLikes() {
        try { return JSON.parse(localStorage.getItem('sayaLikes') || '[]'); }
        catch (e) { return []; }
    }
    
    function saveLikes(list) {
        try { localStorage.setItem('sayaLikes', JSON.stringify(list)); } catch (e) {}
    }

    function updateLikeUI() {
        if (!likeBtn || !tracks[current]) return;
        const liked = getLikes().indexOf(tracks[current].src) !== -1;
        likeBtn.textContent = liked ? '♥' : '♡';
        likeBtn.classList.toggle('liked', liked);
        likeBtn.title = liked ? 'Убрать из избранного' : 'В избранное';
    }

    if (likeBtn) {
        likeBtn.addEventListener('click', function () {
            const list = getLikes();
            const src  = tracks[current].src;
            const i    = list.indexOf(src);
            if (i === -1) list.push(src);
            else          list.splice(i, 1);
            saveLikes(list);
            updateLikeUI();
        });
    }

    /*  помощник  */
    function formatTime(sec) {
        if (!isFinite(sec) || sec < 0) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function loadTrack(i, autoplay) {
        current = (i + tracks.length) % tracks.length;
        audio.src = tracks[current].src;
        console.log('[player] загрузка:', tracks[current].src);

        if (titleEl) titleEl.textContent = tracks[current].title;
        if (seekBar) seekBar.value = 0;
        if (curEl)   curEl.textContent = '0:00';
        if (durEl)   durEl.textContent = '0:00';

        updateLikeUI();
        if (autoplay) startPlay();
    }

    function startPlay() {
        const p = audio.play();
        if (p && typeof p.then === 'function') {
            p.then(function () {
                if (playBtn) playBtn.textContent = ICON_PAUSE;
                player.classList.add('playing');
                console.log('[player] играет');
            }).catch(function (err) {
                console.error('[player] ошибка play():', err.name, '—', err.message);
                if (playBtn) playBtn.textContent = ICON_PLAY;
                player.classList.remove('playing');
            });
        }
    }

    function stopPlay() {
        audio.pause();
        if (playBtn) playBtn.textContent = ICON_PLAY;
        player.classList.remove('playing');
    }

    /*  кнопки  */
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            player.classList.toggle('open');
        });
    }

    playBtn.addEventListener('click', function () {
        if (audio.paused) startPlay();
        else              stopPlay();
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            loadTrack(current + 1, true);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            /* если трек играет дольше 3 секунд — начинаем заново */
            if (audio.currentTime > 3) audio.currentTime = 0;
            else                       loadTrack(current - 1, true);
        });
    }

    /*  события аудио  */
    audio.addEventListener('ended', function () {
        if (repeatMode === REPEAT_ONE) {
            audio.currentTime = 0;
            startPlay();
        } else if (repeatMode === REPEAT_ALL) {
            loadTrack(current + 1, true);
        } else {
            /* без повтора: доигрываем плейлист и останавливаемся на последнем */
            if (current < tracks.length - 1) {
                loadTrack(current + 1, true);
            } else {
                stopPlay();
                if (seekBar) seekBar.value = 100;
            }
        }
    });

    audio.addEventListener('loadedmetadata', function () {
        if (durEl) durEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
        if (seeking || !audio.duration) return;
        if (seekBar) seekBar.value = (audio.currentTime / audio.duration) * 100;
        if (curEl)   curEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('error', function () {
        console.error('[player] не удалось загрузить:', tracks[current].src);
        if (titleEl) titleEl.textContent = 'Трек не найден';
        if (playBtn) playBtn.textContent = ICON_PLAY;
        player.classList.remove('playing');
    });

    /*  перемотка  */
    if (seekBar) {
        seekBar.addEventListener('input', function () {
            seeking = true;
            if (audio.duration && curEl) {
                curEl.textContent = formatTime((seekBar.value / 100) * audio.duration);
            }
        });

        seekBar.addEventListener('change', function () {
            if (audio.duration) {
                audio.currentTime = (seekBar.value / 100) * audio.duration;
            }
            seeking = false;
        });
    }

    /*  громкость  */
    function readVolume() {
        try {
            const v = localStorage.getItem('sayaVolume');
            return v === null ? 0.6 : parseFloat(v);
        } catch (e) { return 0.6; }
    }

    const startVolume = readVolume();
    if (!isFinite(startVolume)) startVolume = 0.6;
    if (volumeBar) volumeBar.value = startVolume;
    audio.volume = startVolume;

    if (volumeBar) {
        volumeBar.addEventListener('input', function () {
            audio.volume = parseFloat(volumeBar.value);
            try { localStorage.setItem('sayaVolume', volumeBar.value); } catch (e) {}
        });
    }

    /*  старт  */
    if (tracks.length) loadTrack(0, false);
    console.log('[player] ready');
});