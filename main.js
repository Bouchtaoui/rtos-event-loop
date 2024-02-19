// setInterval(() => mainEvent.cb(), 2500);
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

const readline = require("node:readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { init_music, open_music, stop_music } = require("./music");

const STATE_SYSTEM_IDLE = 1;
const STATE_SYSTEM_EXIT = 0;
const STATE_SYSTEM_PANIC = -1;
const STATE_PROMPT = 10;
const STATE_PROMPT_SYSTEM_START = 11;
const STATE_PROMPT_SYSTEM_STOP = 12;
const STATE_PROMPT_PLAY_AUDIO = 13;
const STATE_PROMPT_STOP_AUDIO = 14;

const main_queue = [];
const systemEvent = {
  cb: system_idle,
  state: STATE_SYSTEM_IDLE,
};
const promptEvent = {
  cb: null,
  state: STATE_PROMPT,
};

function update_system_event() {
  switch (systemEvent.state) {
    case STATE_SYSTEM_IDLE:
      systemEvent.state = STATE_SYSTEM_IDLE;
      systemEvent.cb = system_idle;
      break;
    case STATE_SYSTEM_EXIT:
      break;
    default:
      systemEvent.state = STATE_SYSTEM_PANIC;
      systemEvent.cb = system_panic;
      break;
  }
  main_queue.push(systemEvent);
}

function update_prompt_event() {
  switch (promptEvent.state) {
    case STATE_SYSTEM_IDLE:
      break;
    case STATE_PROMPT_SYSTEM_START:
      promptEvent.state = STATE_PROMPT_SYSTEM_START;
      promptEvent.cb = system_start;
      break;
    case STATE_PROMPT_SYSTEM_STOP:
      promptEvent.state = STATE_PROMPT_SYSTEM_STOP;
      promptEvent.cb = system_stop;
      break;
    case STATE_PROMPT_PLAY_AUDIO:
      break;
    case STATE_PROMPT_STOP_AUDIO:
      break;
    default:
      promptEvent.state = STATE_PROMPT;
      promptEvent.cb = processPrompt;
      break;
  }
  main_queue.push(promptEvent);
}

function run_event_loop() {
  setInterval(() => {
    const event = main_queue.shift();

    if (event) {
      if (event.cb) event.cb();
    } else system_idle();
  }, 1000);
}

function system_idle() {
  console.log("State Idle...");
  console.log("Putting system to sleep...");
  update_system_event();
}
function system_panic() {
  console.log("System in panic state, saved stack trace and than restart!");
  update_system_event();
}
function system_start() {
  console.log("System Started!");
  update_system_event();
}
function system_stop() {
  console.log("System stopped!");
  update_system_event();
}
function system_exit() {
  console.log("System exiting!");
  process.exit(0);
}
function processPrompt() {
  readline.setPrompt("EL> ");
  readline.prompt();
  readline.on("line", (input) => {
    console.log("You entered: ", input);
    switch (input) {
      case "start":
        console.log("Start playing music");
        promptEvent.state = STATE_PROMPT_PLAY_AUDIO;
        promptEvent.cb = open_music;
        update_prompt_event();
        break;
      case "stop":
        console.log("Stop music");
        promptEvent.state = STATE_PROMPT_STOP_AUDIO;
        promptEvent.cb = stop_music;
        update_prompt_event();
        break;
      case "exit":
        console.log("Exiting program...");
        systemEvent.state = STATE_SYSTEM_EXIT;
        systemEvent.cb = system_exit;
        update_system_event();
        break;
      default:
        break;
    }
    readline.prompt();
  });
  readline.on('close', () => {
        systemEvent.state = STATE_SYSTEM_EXIT;
        systemEvent.cb = () => process.exit(0);
        update_system_event();
  })
}

init_music(main_queue);
run_event_loop();
processPrompt();
