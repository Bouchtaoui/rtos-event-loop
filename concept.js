const main_queue = [];

/**
 * Stel we hebben een menu met verschillende programmaatjes,
 * waaruit we kunnen kiezen. Bijv.:
 * - Speel muziek af
 * - Speel een game
 * - Verstuur GPS locatie
 * - enz.
 * 
 * We willen dan bijv. muziek afspelen, maar kunnen ondertussen
 * een ander programma tegelijjkertijd uitvoeren.
 * 
 * Hoe zouden we dat op basis van Event-Loop kunnen doen?
 */

/**
 * Ten eerste gaan we ervan uit dat we een vaste aantal
 * programmaatjes hebben.
 * Verder heeft elk programma een reeks statussen.
 * Laten we als voorbeeld nemen, het afspelen van muziek.
 * Wat komt er bij kijken om een muziek van een sd kaart af
 * te spelen?
 * Het hoofdmenu is eigenlijk niks anders dan een lijst/array.
 * Elk element is een object met een pointer naar een functie,
 * die de volgende scherm toont met daarin weer andere functies.
 * Verder bevat het een status van de state waar het programma
 * zicht bevindt in de state diagram.
 * 
 * Laten we kijken hoe dat zou kunnen verlopen:
 * - we klikken op muziek:
 *      - state 1-1: toon muziek menu -> display(music_menu) -> update_state(STATE_1_2, &app)
 *      - state 1-2: open media -> fatfs.open() -> res = SUCCES/ERROR -> update_state(STATE_1_3, &app)
 *      - state 1-3: read media files -> res = SUCCES/ERROR -> update_state(STATE_1_4, &app)
 *      - state 1-4: show media files -> res = SUCCES/ERROR -> update_state(STATE_1_5, &app)
 *      - state 1-5: handle selection -> res = SUCCES/ERROR -> update_state(STATE_1_6, &app)
 *      - state 1-6: read media file -> res = SUCCES/ERROR -> update_state(STATE_1_7, &app)
 * 
 * Het programma verloopt dus via states en niet sequentieel.
 * Dus we moeten ons programma zien als een reeks van states!
 * Dit is dus wennen, als je gewend bent om sequentieel te denken.
 */

const STATE_MUSIC_SELECT_SONG = 1;
const STATE_MUSIC_OPEN_DISK = 2;
const STATE_MUSIC_READ_FILES = 3;
const STATE_MUSIC_SHOW_FILENAMES = 4;
const STATE_MUSIC_HANDLE_SELECTION = 5;
const STATE_MUSIC_READ_FILE = 6;
const STATE_MUSIC_PLAY_AUDIO = 7;
const STATE_MUSIC_PLAYING_AUDIO = 8;

const mainEvent = {
    cb: select_song,
    state: STATE_MUSIC_SELECT_SONG
};

const currentMusicEvent = {
    cb: select_song,
    state: STATE_MUSIC_SELECT_SONG
}

setInterval(() => mainEvent.cb(), 2500);

function open_music(params) {
    
}

function update_event() {
    switch (mainEvent.state) {
        case STATE_MUSIC_SELECT_SONG:
            mainEvent.state = STATE_MUSIC_OPEN_DISK;
            mainEvent.cb = open_disk;
            break;
        case STATE_MUSIC_OPEN_DISK:
            mainEvent.state = STATE_MUSIC_READ_FILES;
            mainEvent.cb = read_files;
            break;
        case STATE_MUSIC_READ_FILES:
            mainEvent.state = STATE_MUSIC_SHOW_FILENAMES;
            mainEvent.cb = show_filenames;
            break;
        case STATE_MUSIC_SHOW_FILENAMES:
            mainEvent.state = STATE_MUSIC_HANDLE_SELECTION;
            mainEvent.cb = handle_selection;
            break;
        case STATE_MUSIC_HANDLE_SELECTION:
            mainEvent.state = STATE_MUSIC_READ_FILE;
            mainEvent.cb = read_file;
            break;
        case STATE_MUSIC_READ_FILE:
            mainEvent.state = STATE_MUSIC_PLAY_AUDIO;
            mainEvent.cb = play_audio;
            break;
        case STATE_MUSIC_PLAY_AUDIO:
            mainEvent.state = STATE_MUSIC_PLAYING_AUDIO;
            mainEvent.cb = audio_playing;
            break;
        case STATE_MUSIC_PLAYING_AUDIO:
            mainEvent.state = STATE_MUSIC_PLAYING_AUDIO;
            mainEvent.cb = audio_playing;
            break;
        default:
            mainEvent.state = STATE_MUSIC_UNKNOWN;
            mainEvent.cb = error;
            break;
    }
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

function error() {
    console.log("Event: Error when playing music");
}

