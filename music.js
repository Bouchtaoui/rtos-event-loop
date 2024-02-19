const STATE_MUSIC_SELECT_SONG = 1;
const STATE_MUSIC_OPEN_DISK = 2;
const STATE_MUSIC_READ_FILES = 3;
const STATE_MUSIC_SHOW_FILENAMES = 4;
const STATE_MUSIC_HANDLE_SELECTION = 5;
const STATE_MUSIC_READ_FILE = 6;
const STATE_MUSIC_PLAY_AUDIO = 7;
const STATE_MUSIC_PLAYING_AUDIO = 8;
const STATE_MUSIC_STOP_AUDIO = 9;

const MUSIC_TASK = 20;

const musicEvent = {
    cb: select_song,
    state: STATE_MUSIC_SELECT_SONG,
    subject: MUSIC_TASK
};

let queue;

function init_music(q){
    queue = q;
}

function open_music() {
    console.log("Opening music");
    musicEvent.state = STATE_MUSIC_SELECT_SONG;
    update_event();
}

function stop_music() {
    musicEvent.state = STATE_MUSIC_STOP_AUDIO;
    musicEvent.cb = stop_playing_audio;
    update_event();
}

function update_event() {
    switch (musicEvent.state) {
        case STATE_MUSIC_SELECT_SONG:
            musicEvent.state = STATE_MUSIC_OPEN_DISK;
            musicEvent.cb = open_disk;
            break;
        case STATE_MUSIC_OPEN_DISK:
            musicEvent.state = STATE_MUSIC_READ_FILES;
            musicEvent.cb = read_files;
            break;
        case STATE_MUSIC_READ_FILES:
            musicEvent.state = STATE_MUSIC_SHOW_FILENAMES;
            musicEvent.cb = show_filenames;
            break;
        case STATE_MUSIC_SHOW_FILENAMES:
            musicEvent.state = STATE_MUSIC_HANDLE_SELECTION;
            musicEvent.cb = handle_selection;
            break;
        case STATE_MUSIC_HANDLE_SELECTION:
            musicEvent.state = STATE_MUSIC_READ_FILE;
            musicEvent.cb = read_file;
            break;
        case STATE_MUSIC_READ_FILE:
            musicEvent.state = STATE_MUSIC_PLAY_AUDIO;
            musicEvent.cb = play_audio;
            break;
        case STATE_MUSIC_PLAY_AUDIO:
            musicEvent.state = STATE_MUSIC_PLAYING_AUDIO;
            musicEvent.cb = audio_playing;
            break;
        case STATE_MUSIC_PLAYING_AUDIO:
            musicEvent.state = STATE_MUSIC_PLAYING_AUDIO;
            musicEvent.cb = audio_playing;
            break;
        case STATE_MUSIC_STOP_AUDIO:
            musicEvent.state = STATE_MUSIC_STOP_AUDIO;
            musicEvent.cb = stop_playing_audio;
            break;
        default:
            musicEvent.state = STATE_MUSIC_UNKNOWN;
            musicEvent.cb = error;
            break;
    }

    if(musicEvent.cb) queue.push(musicEvent);
}

function select_song() {
    console.log("Event: Select Song");
    update_event();
}

function open_disk() {
    console.log("Event: Open disk");
    update_event();
}

function read_files() {
    console.log("Event: Read files");
    update_event();
}

function show_filenames() {
    console.log("Event: Show filenames");
    update_event();
}

function handle_selection() {
    console.log("Event: Handle selection");
    update_event();
}

function read_file() {
    console.log("Event: Read file");
    update_event();
}

function play_audio() {
    console.log("Event: Play audio");
    update_event();
}

function audio_playing() {
    console.log("Event: Audio playing");
    update_event();
}

function stop_playing_audio() {
    console.log("Event: Stop playing audio");
    // update_event();
}
function error() {
    console.log("Event: Error when playing music");
}

module.exports = {init_music, open_music, stop_music};