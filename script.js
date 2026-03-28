const searchCointainer = document.querySelector(".search-cointainer");
const searchBox = document.getElementById("searchBox");
const plaseholder = document.querySelector(".plaseholder");
const letterBox = document.querySelector(".letter-box");
const crossBtn = document.getElementById("crossBtn");
const browes = document.getElementById("browes");

searchBox.addEventListener('mouseleave', () => letterBox.style.display = 'none');
searchBox.addEventListener('mouseenter', () => {
    if (searchBox.value == "") {
        letterBox.style.display = 'block';
    }
});
searchBox.addEventListener('focus', () => {
    searchCointainer.style.border = '2px solid #fff';
    searchCointainer.style.filter = 'brightness(1.3)';
});
searchBox.addEventListener('blur', () => {
    searchCointainer.style.border = '2px solid #000';
    searchCointainer.style.filter = 'brightness(1)';
});
searchBox.addEventListener('input', () => {
    if (searchBox.value == "") {
        plaseholder.style.display = 'block';
        crossBtn.style.display = 'none';
        browes.firstElementChild.src = "icon/browse.svg";
    } else {
        letterBox.style.display = 'none';
        plaseholder.style.display = 'none';
        crossBtn.style.display = 'block';
        browes.firstElementChild.src = "icon/browse-outline.svg";
    }
});

const resizer = document.querySelector(".resizer");
const aside = document.getElementsByTagName("aside")[0];

let x = 0;
let asideCurrentWidth = 0;

resizer.addEventListener('mousedown', (e) => {
    x = e.clientX;
    asideCurrentWidth = aside.getBoundingClientRect().width;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    document.addEventListener('mousemove', mouseDragging);
    document.addEventListener('mouseup', mouseUp);
});

function mouseDragging(e) {
    let dx = e.clientX - x;
    let newWidth = asideCurrentWidth + dx;

    if (newWidth >= 280 && newWidth <= 420) {
        aside.style.width = `${newWidth}px`;
    }
}
function mouseUp() {
    document.removeEventListener('mousemove', mouseDragging);
    document.removeEventListener('mouseup', mouseUp);

    document.body.style.userSelect = 'auto';
    document.body.style.cursor = 'default';
}


// Library Load
function formattedTime(x) {
    const minutes = Math.floor(x / 60);
    const seconds = Math.floor(x % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}


const libraryAdd = document.getElementById("libraryAdd");
const inputFile = document.getElementById("inputFile");
libraryAdd.addEventListener("click", () => inputFile.click());

inputFile.addEventListener("change", (e) => {
    const ul = document.querySelector(".library-contain ul");
    const songs = Array.from(e.target.files);
    ul.innerHTML = "";

    songs.forEach((song) => {
        if (song.type.startsWith('audio/')) {
            const tempAudio = new Audio();
            const objectUrl = URL.createObjectURL(song);
            tempAudio.src = objectUrl;

            tempAudio.onloadedmetadata = () => {
                const duration = tempAudio.duration;

                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="li-left">
                        <div class="song-name">${song.name.replace(/\.[^/.]+$/, "")}</div>
                        <div class="duration">${formattedTime(duration)}</div>
                    </div>
                    <div class="li-right" style="display: none;">
                        <img src="icon/music.gif" class="playing-gif"">
                    </div>
                `;

                li.addEventListener('click', () => {
                    playSong(objectUrl, li);
                });

                ul.appendChild(li);
            };
        }
    });
});


// Audio Playing
const audio = new Audio();
let currentli = null;
const previous = document.getElementById("previous");
const playPause = document.getElementById("playPause");
const next = document.getElementById("next");
const timeLine = document.getElementById("timeLine");

function playSong(url, li) {
    setupAudioContext(); 
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (audio.src == url) {
        togglePlay();
        return;
    }

    currentli = li;
    audio.src = url;
    audio.play();
    uiUpdate();
    playPause.querySelector('img').src = 'icon/pause.svg';
}

audio.addEventListener('loadedmetadata', () => {
    document.querySelector('.duration-time').innerHTML = formattedTime(audio.duration);
})

function uiUpdate() {
    const lis = document.querySelectorAll(".li-right");
    lis.forEach(li => li.style.display = "none");
    currentli.querySelector(".li-right").style.display = "block";
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playPause.querySelector('img').src = 'icon/pause.svg';
    } else {
        audio.pause();
        playPause.querySelector('img').src = 'icon/play.svg';
    }
}
playPause.addEventListener('click', togglePlay);

next.addEventListener('click', () => {
    if (currentli && currentli.nextElementSibling) {
        currentli.nextElementSibling.click();
    }
});

previous.addEventListener('click', () => {
    if (currentli && currentli.previousElementSibling) {
        currentli.previousElementSibling.click();
    }
});


audio.addEventListener('timeupdate', () => {
    const currentTimeText = document.querySelector(".current-time");

    currentTimeText.innerHTML = formattedTime(audio.currentTime);

    if (!isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        timeLine.value = progress;
    }
});

timeLine.addEventListener('input', (event) => {
    if (!isNaN(audio.duration)) {
        const seekTo = (event.target.value / 100) * audio.duration;
        audio.currentTime = seekTo;
    }
});


audio.addEventListener('ended', () => {
    next.click();
});


//  Music Leveler 

//  Music Leveler 
const barCount = 50;
const boxCount = 20;
const mainLeveler = document.getElementById("mainLeveler");
const reflectLeveler = document.getElementById("reflectLeveler");

function createGrid(container) {
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar'); // ফিক্সড: ডট ছাড়া এবং add() ব্যবহার করে
        for (let j = 0; j < boxCount; j++) {
            const box = document.createElement('div'); // ফিক্সড: সরাসরি div তৈরি
            bar.appendChild(box);
        }
        container.appendChild(bar);
    }
}

createGrid(mainLeveler);
createGrid(reflectLeveler);

let audioContext, analyser, dataArray, source;

// অডিও প্লে হওয়ার সময় অডিও কন্টেক্সট সেটআপ করা নিরাপদ
function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        renderFrame(); // অ্যানিমেশন শুরু
    }
}

function renderFrame() {
    requestAnimationFrame(renderFrame);
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    const mainBars = mainLeveler.querySelectorAll(".bar");
    const reflectBars = reflectLeveler.querySelectorAll(".bar");

    for (let i = 0; i < barCount; i++) {
        // ডেটা ইনডেক্স ঠিক করা যাতে বার অনুযায়ী ভ্যালু পায়
        const value = dataArray[i];
        // ০ থেকে ১৭ এর স্কেলে ভ্যালু আনা (যেহেতু ১৭টি বক্স)
        const activeBoxes = Math.floor((value / 255) * (boxCount-1));

        updateBar(mainBars[i], activeBoxes);
        updateBar(reflectBars[i], activeBoxes);
    }
}

function updateBar(barElement, activeCount) {
    if (!barElement) return;
    const boxes = barElement.querySelectorAll("div");
    // নিচ থেকে উপরে কালার করার জন্য বক্সগুলোকে রিভার্স বা ইনডেক্স উল্টে দেওয়া ভালো
    const total = boxes.length;
    
    boxes.forEach((box, index) => {
        // বক্সগুলোকে নিচ থেকে একটিভ দেখানোর লজিক
        if (index >= (total - activeCount)) {
            if (index > 10) box.style.background = "#40E0D0"; // সায়ান
            else if (index > 5) box.style.background = "#4facfe"; // ব্লু
            else box.style.background = "#A364FF"; // পার্পল
        } else {
            box.style.background = "#1a1a1a";
        }
    });
}