/*
    1. Render songs
    2. Scroll top
    3. Play/pause / seek
    4. CD rotate
    5. Next / prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER_MUSIC';

const player = $('.player');
const dashboard = $('.dashboard')
const heading = $('.header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playlist = $('.playlist');
const playPauseBtn = $('.btn-toggle-play-pause');
const propress = $('.propress');
const currentTimeDisplay = $('.currentTimeDisplay');
const nextBtn = $('.btn-next');
const previousBtn = $('.btn-previous');
const random = $('.btn-shuffle');
const repeatBtn = $('.btn-repeat');
const h2Header = $('.header h2');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    timeNext: true,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    randomArray: [],


    songs: [
        {
            name: "Nỗi Nhớ Tựa Thiên Hà-所念皆星河(Enzo LT) Nhạc Buông Tâm Trạng Không Lời",
            singer: "所念皆星河(Enzo LT)",
            path: "./assets/audios/y2mate.com - Nỗi Nhớ Tựa Thiên Hà所念皆星河Enzo LT Nhạc Buông Tâm Trạng Không Lời.mp3",
            image: "./assets/images/0.jpg"
        },
        {
            name: "Rất Muốn Vẫn Còn Nhỏ / 多想还小",
            singer: "Đậu Bao (Dou Bao)",
            path: "./assets/audios/RatMuonVanConNho-DauBaoDouBao-8291759.mp3",
            image: "./assets/images/1675741829864_500.jpg"
        },
        {
            name: "Quá nhớ nhung - Đậu Bao | 太想念 - 豆包",
            singer: "Đậu Bao (Dou Bao)",
            path: "./assets/audios/QuaNhoNhung-DauBaoDouBao-7611015.mp3",
            image: "./assets/images/1679475124419_500.jpg"
        },
        {
            name: "Tới Giang Nam - 走江南",
            singer: " 陈晓竹",
            path: "./assets/audios/Tới Giang Nam.mp3",
            image: "./assets/images/0.jpg"
        },
        
    ],


    render: function () {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                </div>
            `;
        });

        playlist.innerHTML = html.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },

    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;


        // Xử lý quay / dừng cd
        const cdThumbAnimate = cdThumb.animate(
            [
                { transform: 'rotate(360deg)' }
            ],
            {
                duration: 10000,
                iterations: Infinity
            }
        );
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scroolTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scroolTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            // cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        playPauseBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function () {
            player.classList.add('playing');
            _this.isPlaying = true;
            cdThumbAnimate.play();
            // audio.volume = 0.5;

        }

        // Khi song bị pause
        audio.onpause = function () {
            player.classList.remove('playing');
            _this.isPlaying = false;
            cdThumbAnimate.pause();
        }


        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            _this.changeTimeSong();
        }

        // Xử lý khi tua song
        propress.oninput = function (event) {
            audio.currentTime = event.target.value;
        }

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }

            audio.play();
            _this.changActiveSong();
            _this.scrollToActiveSong();
        }

        // Khi previous song
        previousBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.previousSong();
            }

            audio.play();
            _this.changActiveSong();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random song
        random.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            random.classList.toggle("active", _this.isRandom);
        }

        // Xử lý lặp lại song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        }

        // Xử lý khi next song audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Xử lý hiển thị thời gian kiểu tiến / lùi
        currentTimeDisplay.onclick = function () {
            _this.timeNext = !_this.timeNext;

            if (audio.duration) {
                _this.changeTimeSong();
            }
        }

        // Xử lý click song
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong();
                    _this.changActiveSong();
                    audio.play();
                    if(_this.isRandom) {
                        _this.changRandomArr();
                    }
                } else if (e.target.closest('.option')) {

                }
            }
        }

        // Xử lý khi trang web tải xong
        window.onload = function () {
            _this.changRandomArr();
        }

    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        h2Header.title = `"${this.currentSong.name}"`
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    previousSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    changRandomArr: function () {
        this.randomArray = this.songs.map(function (song, index) {
            return index;
        });

        this.randomArray.splice(this.currentIndex, 1);
    },

    playRandomSong: function () {
        let newIndex;
        let slicedElement;
        newIndex = Math.floor(Math.random() * this.randomArray.length);
        slicedElement = this.randomArray[newIndex];
        this.randomArray.splice(newIndex, 1);
        this.currentIndex = slicedElement;
        if (this.randomArray.length == 0) {
            this.changRandomArr();
        }
        this.loadCurrentSong();
    },

    // playRandomSong: function () {
    //     let newIndex;
    //     do {
    //         newIndex = Math.floor(Math.random() * this.songs.length);
    //     } while (newIndex === this.currentIndex);

    //     this.currentIndex = newIndex;
    //     this.loadCurrentSong();
    // },

    changeTimeSong: function () {
        if (audio.duration && this.timeNext) {
            const hour = Math.floor(audio.currentTime / 3600) > 0 ? Math.floor(audio.currentTime / 3600) + ':' : '';
            const minutes = Math.floor((audio.currentTime % 3600) / 60) > 9 ? Math.floor((audio.currentTime % 3600) / 60) : `0${Math.floor((audio.currentTime % 3600) / 60)}`;
            const seconds = Math.floor(audio.currentTime % 60) > 9 ? Math.floor(audio.currentTime % 60) : `0${Math.floor(audio.currentTime % 60)}`;

            currentTimeDisplay.textContent = `
                ${hour}${minutes}:${seconds}
                /
                ${Math.floor(audio.duration / 3600) > 0 ? Math.floor(audio.duration / 3600) + ':' : ''}
                ${Math.floor((audio.duration % 3600) / 60) > 9 ? Math.floor((audio.duration % 3600) / 60) : `0${Math.floor((audio.duration % 3600) / 60)}`}:${Math.floor(audio.duration % 60) > 9 ? Math.floor(audio.duration % 60) : `0${Math.floor(audio.duration % 60)}`}
            `


            propress.max = Math.floor(audio.duration);
            propress.value = audio.currentTime;

        } else if (audio.duration && !this.timeNext) {
            const timePrevious = audio.duration - audio.currentTime;
            const hour = Math.floor(timePrevious / 3600) > 0 ? Math.floor(timePrevious / 3600) + ':' : '';
            const minutes = Math.floor((timePrevious % 3600) / 60) > 9 ? Math.floor((timePrevious % 3600) / 60) : `0${Math.floor((timePrevious % 3600) / 60)}`;
            const seconds = Math.floor(timePrevious % 60) > 9 ? Math.floor(timePrevious % 60) : `0${Math.floor(timePrevious % 60)}`;

            currentTimeDisplay.textContent = `
                -${hour}${minutes}:${seconds}
                /
                ${Math.floor(audio.duration / 3600) > 0 ? Math.floor(audio.duration / 3600) + ':' : ''}
                ${Math.floor((audio.duration % 3600) / 60) > 9 ? Math.floor((audio.duration % 3600) / 60) : `0${Math.floor((audio.duration % 3600) / 60)}`}:${Math.floor(audio.duration % 60) > 9 ? Math.floor(audio.duration % 60) : `0${Math.floor(audio.duration % 60)}`}
            `


            propress.max = Math.floor(audio.duration);
            propress.value = audio.currentTime;

        }
    },

    changActiveSong: function () {
        $('.song.active').classList.remove('active');

        $$('.song')[this.currentIndex].classList.add('active');
    },

    scrollToActiveSong: function () {
        if ([0, 1].includes(this.currentIndex)) {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        } else {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

        }
    },

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },



    start: function () {
        // Gán cấu hình config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM event)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat & random
        console.log(this.isRandom)
        random.classList.toggle("active", !!this.isRandom);
        repeatBtn.classList.toggle("active", !!this.isRepeat);
    }

}

app.start();
