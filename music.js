const colors = require('colors');

colors.enable();

const STATE_FINISHED = 254;

const STATE_PLAY_MUSIC = 0;
const STATE_STOP_MUSIC = 1;

const STATE_MUSIC_INIT = 0;
const STATE_MUSIC_SELECT_SONG = 1;
const STATE_MUSIC_OPEN_DISK = 2;
const STATE_MUSIC_READ_FILES = 3;
const STATE_MUSIC_SHOW_FILENAMES = 4;
const STATE_MUSIC_HANDLE_SELECTION = 5;
const STATE_MUSIC_READ_FILE = 6;
const STATE_MUSIC_PLAY_AUDIO = 7;
const STATE_MUSIC_PLAYING_AUDIO = 8;
const STATE_MUSIC_STOP_AUDIO = 9;
const STATE_MUSIC_FINAL_STOP = 10;


const MUSIC_TASK = 20;
const SUBJECT_MUSIC = 3;

const messages = new Map();

function post_message(subj, msg) {
    messages.set(subj, msg);
}
function get_message(subj) {
    const msg = messages.get(subj);
    messages.delete(subj);
    return msg;
}
function clear_message(subj) {
    messages.delete(subj);
}

function update_music_event(event) {
    switch (event.route) {
        case STATE_PLAY_MUSIC:
            play_route(event);
            break;
        case STATE_STOP_MUSIC:
            stop_route(event);
            break;
        default:
            break;
    }
}

function play_route(event) {
    // console.log("play_route".bgGreen.white);
    const new_state = get_message('play');
    if(new_state !== undefined) {
        event.state = new_state;
        console.log(`Found new state: ${new_state}`.bgBlue.white);
    }

    switch (event.state) {
        case STATE_MUSIC_INIT:
            event.state = STATE_MUSIC_SELECT_SONG;
            event.cb = select_song;
            event.log = "State SELECT SONG";
            break;
        case STATE_MUSIC_SELECT_SONG:
            event.state = STATE_MUSIC_OPEN_DISK;
            event.cb = open_disk;
            event.log = "State OPEN DISK";
            break;
        case STATE_MUSIC_OPEN_DISK:
            event.state = STATE_MUSIC_READ_FILES;
            event.cb = read_files;
            event.log = "State READ FILES";
            break;
        case STATE_MUSIC_READ_FILES:
            event.state = STATE_MUSIC_SHOW_FILENAMES;
            event.cb = show_filenames;
            event.log = "State SHOW FILENAMES";
            break;
        case STATE_MUSIC_SHOW_FILENAMES:
            event.state = STATE_MUSIC_HANDLE_SELECTION;
            event.cb = handle_selection;
            event.log = "State HANDLE SELECTION";
            break;
        case STATE_MUSIC_HANDLE_SELECTION:
            event.state = STATE_MUSIC_READ_FILE;
            event.cb = read_file;
            event.log = "State READ FILES";
            break;
        case STATE_MUSIC_READ_FILE:
            event.state = STATE_MUSIC_PLAY_AUDIO;
            event.cb = play_audio;
            event.log = "State PLAY AUDIO";
            break;
        case STATE_MUSIC_PLAY_AUDIO:
            event.state = STATE_MUSIC_PLAYING_AUDIO;
            event.cb = audio_playing;
            event.log = "State PLAYING AUDIO";
            break;
        case STATE_MUSIC_PLAYING_AUDIO:
            event.state = STATE_MUSIC_PLAYING_AUDIO;
            event.cb = audio_playing;
            event.log = "State REPEAT PLAYING AUDIO";
            break;
        case STATE_MUSIC_STOP_AUDIO:
            event.state = STATE_MUSIC_FINAL_STOP;
            event.cb = audio_stopped;
            event.log = "State AUDIO STOPPED";
            break;
        case STATE_MUSIC_FINAL_STOP:
            event.state = STATE_FINISHED;
            event.cb = null;
            event.log = "State AUDIO STOPPED COMPLETED";
            break;
        default:
            event.state = STATE_MUSIC_UNKNOWN;
            event.cb = error;
            event.log = "State SELECT SONG";
            break;
    }
    
}
function stop_route(event) {
    // console.log("stop_route".bgRed.white);
    
    switch (event.state) {
        case STATE_MUSIC_INIT:
            event.state = STATE_MUSIC_STOP_AUDIO;
            event.cb = stop_playing_audio;
            break;
        case STATE_MUSIC_STOP_AUDIO:
            event.state = STATE_FINISHED;
            event.cb = null;
            break;
        default:
            console.log("Stop route undefined state".bgRed.white);
            break;
    }
}

function select_song() {
    console.log("Event: Select Song".yellow);
}

function open_disk() {
    console.log("Event: Open disk".yellow);
}

function read_files() {
    console.log("Event: Read files".yellow);
}

function show_filenames() {
    console.log("Event: Show filenames".yellow);
}

function handle_selection() {
    console.log("Event: Handle selection".yellow);
}

function read_file() {
    console.log("Event: Read file".yellow);
}

function play_audio() {
    console.log("Event: Play audio".yellow);
}

function audio_playing() {
    console.log("Event: Audio playing".yellow);
}

function stop_playing_audio(event) {
    console.log("Event: Stop playing audio".yellow);
    post_message('play', STATE_MUSIC_STOP_AUDIO);
}

function audio_stopped(event) {
    console.log("Event: Audio stopped".yellow);
    clear_message('play');
}

function error() {
    console.log("Event: Error when playing music".red);
}

module.exports = { update_music_event};