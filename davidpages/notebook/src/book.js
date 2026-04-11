const Comic = {
    // which notebook
    notebookID: null,

    // current index
    // (index 0 is cover, index 1 is pages 0-1, index 2 is p2-3, index 3 is p4-5)
    currentIndex: 0,

    SoundEngine: {},

    ImageLoader: {},

    init() {
        this.notebookID = document.body.getAttribute("data-notebookID");
//        console.log("notebookid: " + this.notebookID);

        // LOAD IMAGES
        this.ImageLoader = {
            urlTemplate: null,
            totalImages: null,
            images: [],
            status: [],
            isProcessing: false,

            init() {
                // set totalImages and urlTemplate
                this.setupThisNotebook();

                // set starting status for images
                for (let i = 0; i < this.totalImages; i++) {
                    this.images[i] = null;
                    this.status[i] = "pending";
                }

                // start loading right away
                this.processQueue();
            },

            async processQueue() {
                // mark that we are loading
                this.isProcessing = true;

                // find all indices that arent done or loading
                let pendingIndices = [];
                for (let i = 0; i < this.totalImages; i++) {
                    if (this.status[i] === "pending") pendingIndices.push(i);
                }

                // check for completion
                if (pendingIndices.length === 0) {
                    this.isProcessing = false;
                    console.log("all " + this.totalImages + "images loaded!!")
                    return;
                }

                pendingIndices.sort((a, b) => {
                    // load immediate vicinity at top priority, then stuff near beginning/end in case they jump
                    const weightA = Math.min(Math.abs(a - 0) * 3, Math.abs(a - Comic.currentIndex), Math.abs(a - this.totalImages + 1) * 3);
                    const weightB = Math.min(Math.abs(b - 0) * 3, Math.abs(b - Comic.currentIndex), Math.abs(b - this.totalImages + 1) * 3);
                    return weightA - weightB;
                });

                // see what order images are being loaded in
//                console.log(pendingIndices.toString());

                // process highest priority (lowest weight) unloaded one
                const nextToLoad = pendingIndices[0];
                await this.loadSingleImage(nextToLoad);

                // recurse
                this.processQueue();
            },

            async loadSingleImage(index) {
                this.status[index] = "loading";

                let paddedIndex = null;
                let url = null;

                paddedIndex = ('0' + index).slice(-2); // 00 01 02 ... 09 10 11 ...
                url = (this.urlTemplate + paddedIndex + '.jpg');

                try {
                    const img = await this.loadImagePromise(url);
                    //no hover texts for now
//                    img.title = Comic.hoverTexts[index];
                    this.images[index] = img;
                    this.status[index] = "done";
                    console.log(`loaded image at index ${index}`);

                    // If the user is currently looking at THIS page, update the view!
                    if (index === Comic.currentIndex) {
                        Comic.updateDisplay();
                    }
                } catch (e) {
                    console.error(`failed loading image at index ${index}`, e);
                    this.status[index] = "pending"; // try again later
                }
            },

            loadImagePromise(url) {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = url;
                });
            },

            // NOTEBOOK DEPENDENT ----------------------------------
            setupThisNotebook() {
                switch (Comic.notebookID) {
                    case "blue":
                        this.totalImages = 75;
                        this.urlTemplate = "img/blue/blue";
                        break;
                    case "spiral":
                        this.totalImages = 50;
                        this.urlTemplate = "img/spiral/spiral";
                        break;
                }
            }
        }
        this.ImageLoader.init();

        // LOAD SOUNDS
        this.SoundEngine = {
            turnOpenSounds: [],
            turnClosedSounds: [],
            turnPageSounds: [],
            flipCoverToCoverSounds: [],
            flipPageToCoverSounds: [],

            urlTemplate: null,
            total: null, //25 for blue
            loaded: 0,

            context: new (window.AudioContext || window.webkitAudioContext)(),
            cache: {},

            loadSounds() {
                this.setupThisNotebook();

                // turnOpenSounds
                for (let i = 1; i <= 4; i++) {
                    const sound = {name: 'turnOpen' + i, url: this.urlTemplate + 'turn_open_' + i + '.wav'};
                    this.turnOpenSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // turnClosedSounds
                for (let i = 1; i <= 4; i++) {
                    const sound = {name: 'turnClosed' + i, url: this.urlTemplate + 'turn_closed_' + i + '.wav'};
                    this.turnClosedSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // turnPageSounds
                for (let i = 1; i <= 11; i++) {
                    const sound = {name: 'turnPage' + i, url: this.urlTemplate + 'turn_page_' + i + '.wav'};
                    this.turnPageSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // flipCoverToCoverSounds
                for (let i = 1; i <= 2; i++) {
                    const sound = {name: 'flipCoverToCover' + i, url: this.urlTemplate + 'flip_cover_to_cover_' + i + '.wav'};
                    this.flipCoverToCoverSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
                // flipPageToCoverSounds
                for (let i = 1; i <= 3; i++) {
                    const sound = {name: 'flipPageToCover' + i, url: this.urlTemplate + 'flip_page_to_cover_' + i + '.wav'};
                    this.flipPageToCoverSounds.push(sound);
                    this.loadSound(sound.name, sound.url)
                }
            },

            async loadSound(name, url) {
                try {
                    const response = await fetch(url);
//                    console.log(`${name} file size: ${response.headers.get('content-length')} bytes`);

                    const arrayBuffer = await response.arrayBuffer();

                    // Decode the raw binary into an AudioBuffer
                    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

                    this.cache[name] = audioBuffer;
//                    console.log(`Decoded: ${name}`);
                } catch (e) {
                    console.error(`Failed to load sound: ${name}`, e);
                }
            },

            // plays literal sound file
            play(name) {
                console.log("playing sound " + name);
                if (!this.cache[name]) return;

                // In Web Audio, you create a "Source Node" every time you play
                const source = this.context.createBufferSource()
                source.buffer = this.cache[name];

                // Connect it to the "Speakers" (destination)
                source.connect(this.context.destination);

                // Start immediately
                source.start(0);
            },

            // input sound category, play one of its variations
            playSound(type) {
                let randomIndex = 0;
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

            // NOTEBOOK DEPENDENt --------------------------------
            setupThisNotebook() {
                switch (Comic.notebookID) {
                    case "blue":
                        this.total = 25;
                        this.urlTemplate = "aud/blue/";
                        break;
                    default:
                        this.total = 25;
                        this.urlTemplate = "aud/blue/";
                        break;
                }
            }
        }
        this.SoundEngine.loadSounds();

        // link buttons to their actions (also un-focus the button)
        document.getElementById('btn-first').onclick = () => {
            document.getElementById('btn-first').blur();
            this.firstButton()
        };
        document.getElementById('btn-last').onclick = () => {
            document.getElementById('btn-last').blur();
            this.lastButton()
        };
        document.getElementById('btn-prev').onclick = () => {
            document.getElementById('btn-prev').blur();
            this.prevButton();
        }
        document.getElementById('btn-next').onclick = () => {
            document.getElementById('btn-next').blur();
            this.nextButton();
        }

        // link left/right arrows to actions
        window.addEventListener('keydown', (e) => {
            if (e.key === "ArrowLeft") this.prevButton();
            if (e.key === "ArrowRight") this.nextButton();
        });

        // Check if there is a hash in the URL on load; go to that page, otherwise default to page 1
        const hash = window.location.hash.substring(1); // remove the '#'
        const startingIndex = hash ? parseInt(hash) : 0;
        this.goTo(startingIndex);

        // also update page when user types new id in url
        window.addEventListener('hashchange', (event) => {
            const hash = window.location.hash.substring(1); // remove the '#'
            const indexFromUrl = hash ? parseInt(hash) : 0;
            console.log("url change detected: " + indexFromUrl);
            Comic.goTo(indexFromUrl);
        });
    },

    prevButton() {
        if (this.currentIndex == 0) return; // dont play sound if arrow key pressed
        if (this.currentIndex == 1) {
            this.SoundEngine.playSound("turnClosed");
        } else if (this.currentIndex == this.ImageLoader.totalImages - 1) {
            this.SoundEngine.playSound("turnOpen");
        } else {
            this.SoundEngine.playSound("turnPage");
        }
        this.changePage(-1);
    },

    nextButton() {
        if (this.currentIndex == this.ImageLoader.totalImages - 1) return; // dont play sound if arrow key pressed
        if (this.currentIndex == this.ImageLoader.totalImages - 2) {
            this.SoundEngine.playSound("turnClosed");
        } else if (this.currentIndex == 0) {
            this.SoundEngine.playSound("turnOpen");
        } else {
            this.SoundEngine.playSound("turnPage");
        }
        this.changePage(1);
    },

    firstButton() {
        if (this.currentIndex == this.ImageLoader.totalImages - 1) {
            this.SoundEngine.playSound("flipCoverToCover");
        } else if (this.currentIndex > 1) {
            this.SoundEngine.playSound("flipPageToCover");
        } else {
            this.SoundEngine.playSound("turnClosed");
        }
        this.goTo(0);
    },

    lastButton() {
        if (this.currentIndex == 0) {
            this.SoundEngine.playSound("flipCoverToCover");
        } else if (this.currentIndex < this.ImageLoader.totalImages - 2) {
            this.SoundEngine.playSound("flipPageToCover");
        } else {
            this.SoundEngine.playSound("turnClosed");
        }
        this.goTo(this.ImageLoader.totalImages - 1);
    },

    // prev/next page
    changePage(step) {
        const newIndex = this.currentIndex + step;
        // Clamp the index so it doesn't go out of bounds (NaN protection!)
        if (newIndex >= 0 && newIndex < this.ImageLoader.totalImages) {
            this.goTo(newIndex);
        }
    },

    goTo(index) {
        clampedIndex = this.clampIndex(index);
        this.currentIndex = clampedIndex;
        this.updateDisplay();
        history.replaceState(null, "", "#" + this.currentIndex)
    },

    updateDisplay() {
        // set image (if loaded)
        const container = document.getElementById('stage');
        const loadedImage = this.ImageLoader.images[this.currentIndex];
        if (loadedImage) {
            // Clear the old image and drop in the pre-loaded one
            container.innerHTML = '';
            container.appendChild(loadedImage);

            // Ensure it still fits your layout
            loadedImage.id = "page-image";
        }

        // set page number display
        const text = document.getElementById('page-label');
        switch (this.currentIndex) {
            case 0:
                text.innerText = "front";
                break;
            case this.ImageLoader.totalImages - 1:
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
        document.getElementById('btn-next').disabled = (this.currentIndex === this.ImageLoader.totalImages - 1);
        document.getElementById('btn-last').disabled = (this.currentIndex === this.ImageLoader.totalImages - 1);
    },

    clampIndex(input) {
        if (input < 0) return 0;
        const lastIndex = this.ImageLoader.totalImages - 1;
        if (input > lastIndex) return lastIndex;
        return input;
    }
};

Comic.init();

// scrapyard ---------------------------------------------------

// todo stuff that will be different across notebooks:
// perhaps background color
// images, total num of images
// page turn sounds
// perhaps page display? although for now i really like just "p0-1"

// todo maybe bonus elements under comic page