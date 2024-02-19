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
const { count } = require("node:console");
const { init_music, open_music, stop_music } = require("./music");

/* In plaats van constantes te gebruiken,
 * is het beter om enums te gebruiken
 * */
const STATE_INACTIVE = 255;
const STATE_SYSTEM_IDLE = 1;
const STATE_SYSTEM_EXIT = 0;
const STATE_SYSTEM_PANIC = -1;
const STATE_PROMPT = 10;
const STATE_PROMPT_SYSTEM_START = 11;
const STATE_PROMPT_SYSTEM_STOP = 12;
const STATE_PROMPT_PLAY_AUDIO = 13;
const STATE_PROMPT_STOP_AUDIO = 14;

const SUBJECT_SYSTEM = 1;
const SUBJECT_PROMPT = 2;
const SUBJECT_MUSIC = 3;
const SUBJECT_GAME = 4;
const SUBJECT_GPS = 5;
/**
 * main_queue is where to push the events in, that
 * will be dispatched later
 */
const main_queue = [];
const event_pool = [];
let event_count = 0;
let max_event_count = 0;
/**
 * I use for each category a separate Event object,
 * but that was just for testing. The important thing is to make
 * sure all event objects have the same properties.
 *
 * We also need to make sure we have enough event objects for all
 * needed events. We need to figure out how we can determine the
 * amount of event objects.
 *
 * Basically we need a pool of inactive event objects.
 * When we need an event object, we pop if from a queue. When we're
 * done with it, we push it back. That's the theory.
 */

/* fill up event_pool with event objects */
function setup_event_pool() {
  for (let i = 0; i < 100; i++) {
    event_pool.push({
      state: STATE_INACTIVE,
      cb: null,
    });
  }
}
function pop_event_from_pool() {
  const e = event_pool.pop();
  if (e) {
    event_count++;
    if (event_count > max_event_count) max_event_count = event_count;

    console.log("Total events: ", event_count);
    console.log("Max events created: ", max_event_count);
  }
  return e;
}
function push_event_to_pool(e) {
  if (e) {
    event_count--;
    e.state = STATE_INACTIVE;
    e.cb = null;
    event_pool.push(e);
  }
}

const systemEvent = {
  cb: system_idle,
  state: STATE_SYSTEM_IDLE,
};
const promptEvent = {
  cb: null,
  state: STATE_PROMPT,
};

function start_system() {
  const se = pop_event_from_pool();
  se.cb = system_start;
  se.state = STATE_SYSTEM_IDLE;
  se.subject = SUBJECT_SYSTEM;
  update_event(se);
}
function start_prompt() {
  const se = pop_event_from_pool();
  se.cb = processPrompt;
  se.state = STATE_PROMPT;
  se.subject = SUBJECT_PROMPT;
  update_event(se);
}

function update_event(e) {
  switch (e.subject) {
    case SUBJECT_SYSTEM:
      console.log("Needs implementation");
      update_system_event(e);
      break;
    case SUBJECT_PROMPT:
      console.log("Needs implementation");
      update_prompt_event(e);
      break;
    case SUBJECT_MUSIC:
      console.log("Needs implementation");
      break;
    case SUBJECT_GAME:
      console.log("Needs implementation");
      break;
    case SUBJECT_GPS:
      console.log("Needs implementation");
      break;
    default:
      break;
  }
}

function update_system_event(e) {
  switch (e.state) {
    case STATE_SYSTEM_IDLE:
      e.state = STATE_SYSTEM_IDLE;
      e.cb = system_idle;
      break;
    case STATE_SYSTEM_EXIT:
        e.state = STATE_INACTIVE;
        // e.cb = null;
      break;
    default:
      e.state = STATE_SYSTEM_PANIC;
      e.cb = system_panic;
      break;
  }
  main_queue.push(e);
}

function update_prompt_event(e) {
  switch (e.state) {
    case STATE_SYSTEM_IDLE:
      break;
    case STATE_PROMPT_SYSTEM_START:
      e.state = STATE_PROMPT_SYSTEM_START;
      e.cb = system_start;
      break;
    case STATE_PROMPT_SYSTEM_STOP:
      e.state = STATE_PROMPT_SYSTEM_STOP;
      e.cb = system_stop;
      break;
    case STATE_PROMPT_PLAY_AUDIO:
      break;
    case STATE_PROMPT_STOP_AUDIO:
      break;
    default:
      e.state = STATE_INACTIVE;
    //   e.cb = processPrompt;
      break;
  }
  main_queue.push(e);
}

function run_event_loop() {
  setInterval(() => {
    const event = main_queue.shift();

    if (event && event.cb) {
        event.cb();
        // update state
        update_event(event);
        // check if state is set to INACTIVE
        // in that case put it back to event_pool
        if(event.state === STATE_INACTIVE) push_event_to_pool(event);
    } else system_idle();
  }, 1000);
}

function system_idle() {
  console.log("State Idle...");
  console.log("Putting system to sleep...");
//   update_system_event();
}
function system_panic() {
  console.log("System in panic state, saved stack trace and than restart!");
//   update_system_event();
}
function system_start() {
  console.log("System Started!");
//   update_system_event();
}
function system_stop() {
  console.log("System stopped!");
//   update_system_event();
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
        {
          console.log("Start playing music");
          const evt = pop_event_from_pool();
          evt.state = STATE_PROMPT_PLAY_AUDIO;
          evt.subject = SUBJECT_PROMPT;
          evt.cb = open_music;
        //   update_prompt_event();
        }
        break;
      case "stop":
        {
          console.log("Stop music");
          const evt = pop_event_from_pool();
          evt.state = STATE_PROMPT_STOP_AUDIO;
          evt.subject = SUBJECT_PROMPT;
          evt.cb = stop_music;
        //   update_prompt_event();
        }
        break;
      case "exit":
        {
          console.log("Exiting program...");
          const evt = pop_event_from_pool();
          evt.state = STATE_SYSTEM_EXIT;
          evt.subject = SUBJECT_SYSTEM;
          evt.cb = system_exit;
          update_event(evt);
        }
        break;
      default:
        break;
    }
    readline.prompt();
  });
  readline.on("close", () => {
    systemEvent.state = STATE_SYSTEM_EXIT;
    systemEvent.cb = () => process.exit(0);
    update_system_event();
  });
}

setup_event_pool();
init_music(main_queue);
run_event_loop();
start_system();
start_prompt();
