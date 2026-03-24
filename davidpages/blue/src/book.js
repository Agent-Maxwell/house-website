const Comic = {

    // SECRET
    // secret page filepaths
    secretPages: [
        "/img/secret_test_pages/p1.png",
        "/img/secret_test_pages/p2.jpg",
        "/img/secret_test_pages/p3.jpg",
        "/img/secret_test_pages/p4.jpg",
        "/img/secret_test_pages/p5.jpg",
    ],

    // secet hover text
    secretTitles: [
        "awesome old pixel font i think its like DOS",
        "me",
        "recursive drawing",
        "",
        "my house!!",
    ],

    // page filepaths; populated in init()
    pages: [],

    // corresponding hover text
    titles: [
        "cover",
        "p0-1",
        "p2-3",
        "etc",
    ],

    // current index
    // (index 0 is cover, index 1 is pages 0-1, index 2 is p2-3, index 3 is p4-5)
    currentIndex: 0,

    SoundEngine: {},

    // todo sounds

    init() {
        // LOAD SOUNDSS
        this.SoundEngine = {
            turnOpenSounds: [],
            turnClosedSounds: [],
            turnPageSounds: [],
            flipCoverToCoverSounds: [],
            flipPageToCoverSounds: [],

            total: 25,
            loaded: 0,

            context: new (window.AudioContext || window.webkitAudioContext)(),
            cache: {},

            loadSounds() {
                // turnOpenSounds
                for (let i = 1; i <= 4; i++) {
                    const sound = {name: 'turnOpen' + i, url: 'aud/turn_open_' + i + '.wav'};
                    this.turnOpenSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // turnClosedSounds
                for (let i = 1; i <= 4; i++) {
                    const sound = {name: 'turnClosed' + i, url: 'aud/turn_closed_' + i + '.wav'};
                    this.turnClosedSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // turnPageSounds
                for (let i = 1; i <= 11; i++) {
                    const sound = {name: 'turnPage' + i, url: 'aud/turn_page_' + i + '.wav'};
                    this.turnPageSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // flipCoverToCoverSounds
                for (let i = 1; i <= 2; i++) {
                    const sound = {name: 'flipCoverToCover' + i, url: 'aud/flip_cover_to_cover_' + i + '.wav'};
                    this.flipCoverToCoverSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // flipPageToCoverSounds
                for (let i = 1; i <= 3; i++) {
                    const sound = {name: 'flipPageToCover' + i, url: 'aud/flip_page_to_cover_' + i + '.wav'};
                    this.flipPageToCoverSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
            },

            async loadSound(name, url) {
//                console.log("loading sound" + name + " at " + url);
                try {
                    const response = await fetch(url);
                    console.log(`${name} file size: ${response.headers.get('content-length')} bytes`);

                    const arrayBuffer = await response.arrayBuffer();

                    // Decode the raw binary into an AudioBuffer
                    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

                    this.cache[name] = audioBuffer;
                    console.log(`Decoded: ${name}`);
                } catch (e) {
                    console.error(`Failed to load sound: ${name}`, e);
                }
            },

            play(name) {
                console.log(name);
                if (!this.cache[name]) return;

                // In Web Audio, you create a "Source Node" every time you play
                const source = this.context.createBufferSource()
                source.buffer = this.cache[name];
//                console.log(source.buffer);

                // Connect it to the "Speakers" (destination)
                source.connect(this.context.destination);

                // Start immediately
                source.start(0);
            },

            playSound(type) {
                let randomIndex = 0;
                //currerntly playing sound 1 nio matter what rand index is
                switch (type) {
                    case "turnOpen":
                        randomIndex = Math.floor(Math.random() * this.turnOpenSounds.length + 1);
                        this.play('turnOpen' + randomIndex);
                        break;
                    case "turnClosed":
                        randomIndex = Math.floor(Math.random() * this.turnClosedSounds.length + 1);
                        this.play('turnClosed' + randomIndex);
                        break;
                    case "turnPage":
                        randomIndex = Math.floor(Math.random() * this.turnPageSounds.length + 1);
                        this.play('turnPage' + randomIndex);
                        break;
                    case "flipCoverToCover":
                        randomIndex = Math.floor(Math.random() * this.flipCoverToCoverSounds.length + 1);
                        this.play('flipCoverToCover' + randomIndex);
                        break;
                    case "flipPageToCover":
                        randomIndex = Math.floor(Math.random() * this.flipPageToCoverSounds.length + 1);
                        this.play('flipPageToCover' + randomIndex);
                        break;
                }
            },
        }
        this.SoundEngine.loadSounds();
//        console.log(this.SoundEngine);


        // populate pages with blue00-blue74
        for (let i = 0; i <= 74; i++) {
            const paddedIndex = ('0' + i).slice(-2); // 00 01 02 ... 09 10 11 ...
            const path = ('/img/blue/blue' + paddedIndex + '.jpg');
            this.pages.push(path);
        }

        // link buttons to their actions
        document.getElementById('btn-first').onclick = () => this.firstButton();
        document.getElementById('btn-last').onclick = () => this.lastButton();
        document.getElementById('btn-prev').onclick = () => this.prevButton();
        document.getElementById('btn-next').onclick = () => this.nextButton();

        // Check if there is a hash in the URL on load; go to that page, otherwise default to page 1
        const hash = window.location.hash.substring(1); // remove the '#'
        const startingIndex = hash ? parseInt(hash) : 0;
        this.goTo(startingIndex);

        // link left/right arrows to actions
        window.addEventListener('keydown', (e) => {
            if (e.key === "ArrowLeft") this.prevButton();
            if (e.key === "ArrowRight") this.nextButton();
        });

        this.updateDisplay();
    },

    prevButton() {
        initialIndex = this.currentIndex;
        this.changePage(-1);
        if (initialIndex == 1) {
            this.SoundEngine.playSound("turnClosed");
        } else {
            this.SoundEngine.playSound("turnPage");
        }
    },

    nextButton() {
        initialIndex = this.currentIndex;
        this.changePage(1);
        if (initialIndex == this.pages.length - 2) {
            this.SoundEngine.playSound("turnClosed");
        } else {
            this.SoundEngine.playSound("turnPage");
        }
    },

    firstButton() {
        initialIndex = this.currentIndex;
        this.goTo(0)
        if (initialIndex == this.pages.length - 1) {
            this.SoundEngine.playSound("flipCoverToCover");
        } else if (initialIndex > 1) {
            this.SoundEngine.playSound("flipPageToCover");
        } else {
            this.SoundEngine.playSound("turnClosed");
        }
    },

    lastButton() {
        initialIndex = this.currentIndex;
        this.goTo(this.pages.length - 1);
        if (initialIndex == 0) {
            this.SoundEngine.playSound("flipCoverToCover");
        } else if (initialIndex < this.pages.length - 2) {
            this.SoundEngine.playSound("flipPageToCover");
        } else {
            this.SoundEngine.playSound("turnClosed");
        }
    },

    // prev/next page
    changePage(step) {
        const newIndex = this.currentIndex + step;
        // Clamp the index so it doesn't go out of bounds (NaN protection!)
        if (newIndex >= 0 && newIndex < this.pages.length) {
            this.goTo(newIndex);
        }
    },

    goTo(index) {
        this.currentIndex = index;
        this.updateDisplay();
//        window.location.hash = "#" + this.currentIndex;
        history.replaceState(null, "", "#" + this.currentIndex)
    },

    updateDisplay() {
        // get page elements
        const img = document.getElementById('page-image');
        const text = document.getElementById('page-label');

        // set image and hovertext
        img.src = this.pages[this.currentIndex];
        img.title = this.titles[this.currentIndex];

        // set page number display
        switch (this.currentIndex) {
            case 0:
                text.innerText = "front";
                break;
            case this.pages.length - 1:
                text.innerText = "back";
                break;
            default:
                const leftPageNum = (this.currentIndex - 1) * 2;
                const rightPageNum = leftPageNum + 1;
                text.innerText = `p${leftPageNum}-${rightPageNum}`;
            break;
        }

        // disable buttons at the edges
        document.getElementById('btn-prev').disabled = (this.currentIndex === 0);
        document.getElementById('btn-first').disabled = (this.currentIndex === 0);
        document.getElementById('btn-next').disabled = (this.currentIndex === this.pages.length - 1);
        document.getElementById('btn-last').disabled = (this.currentIndex === this.pages.length - 1);
    }
};

Comic.init();

// scrapyard ---------------------------------------------------

// todo maybe bonus elements under comic page, links to relevan tsuff, longer descripions