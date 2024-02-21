const colors = require("colors");
colors.enable();
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
const { update_music_event } = require("./music");
const { update_prompt_event } = require("./prompt");
const { init_timer, update_timer_event } = require("./timer");
const { init_command, start_prompt } = require("./command");

/* In plaats van constantes te gebruiken,
 * is het beter om enums te gebruiken
 * */
const SUBJECT_SYSTEM = 1;
const SUBJECT_PROMPT = 2;
const SUBJECT_MUSIC = 3;
const SUBJECT_GAME = 4;
const SUBJECT_GPS = 5;
const SUBJECT_TIMER = 6;

const STATE_INACTIVE = 255;
const STATE_FINISHED = 254;

// System states
const STATE_SYSTEM_IDLE = 1;
const STATE_SYSTEM_EXIT = 0;
const STATE_SYSTEM_PANIC = -1;

// // Prompt states
// const STATE_PROMPT = 10;
// const STATE_PROMPT_SYSTEM_START = 11;
// const STATE_PROMPT_SYSTEM_STOP = 12;
// const STATE_PROMPT_PLAY_AUDIO = 13;
// const STATE_PROMPT_STOP_AUDIO = 14;

// // Music states
// const STATE_MUSIC_INIT = 0;
// const STATE_PLAY_MUSIC = 0;
// const STATE_STOP_MUSIC = 1;

// //  Timer states
// const STATE_START_DELAY = 1;

/**
 * main_queue is where to push the events in, that
 * will be dispatched later
 */
const main_queue = [];
const event_pool = [];
const states = new Map();
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

function register_state_flow(id, state_updater) {
  states.set(id, state_updater);
}
function get_state_updater(id) {
  return states.get(id);
}

/* fill up event_pool with event objects */
function setup_event_pool() {
  for (let i = 0; i < 100; i++) {
    event_pool.push({
      state: STATE_INACTIVE,
      cb: null,
      id: 0,
    });
  }
}
function pop_event_from_pool() {
  const e = event_pool.pop();
  if (e) {
    event_count++;
    if (event_count > max_event_count) max_event_count = event_count;

    e.id = event_count;

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


function update_event_new(e) {
  const update_state = get_state_updater(e.subject);
  if (update_state) {
    update_state(e);
    set_event(e);
  } else {
    console.log("update state not found!".bgRed);
  }
}
function update_system_event(e) {
  switch (e.state) {
    case STATE_SYSTEM_IDLE:
      e.state = STATE_SYSTEM_IDLE;
      break;
    case STATE_SYSTEM_EXIT:
      e.state = STATE_INACTIVE;
      e.cb = system_exit;
      break;
    default:
      e.state = STATE_SYSTEM_PANIC;
      e.cb = system_panic;
      break;
  }
}

function run_event_loop() {
  setInterval(() => {
    logEventQueue(false);

    // get next event from queue
    const event = main_queue.shift();

    if (event) {
      logExecutingEvent(false, event);

      // call callback if available
      if (event.cb) event.cb(event);

      // check if state is set to INACTIVE or FINISHED
      // in that case put it back to event_pool
      if (event.state === STATE_INACTIVE || event.state === STATE_FINISHED)
        push_event_to_pool(event);
      else update_event_new(event); // update_event(event); // update state
    } // else system_idle();
  }, 100);
}

function logEventQueue(enable) {
  if (enable) {
    console.log("----------Queue----------".bgCyan);
    main_queue.forEach((e) => console.log(`ID: ${e.id} - ${e.log})`.bgMagenta));
    console.log("-------------------------".bgCyan);
  }
}
function logExecutingEvent(enable, event) {
  if (enable) {
    console.log("--------Executing--------".bgCyan);
    if (event.id) console.log(`ID: ${event.id} - ${event.log})`.bgGreen);
    else console.log(event);
    console.log("-------------------------".bgCyan);
  }
}

function system_panic() {
  console.log("System in panic state, saved stack trace and than restart!");
}
function system_start() {
  console.log("System Started!");
}
function system_stop() {
  console.log("System stopped!");
}
function system_exit() {
  console.log("System exiting!");
  process.exit(0);
}

function set_event(event) {
  main_queue.push(event);
}

setup_event_pool();

// inits
init_timer(set_event, pop_event_from_pool);
init_command(set_event, pop_event_from_pool);


// register states
register_state_flow(SUBJECT_SYSTEM, update_system_event);
register_state_flow(SUBJECT_PROMPT, update_prompt_event);
register_state_flow(SUBJECT_MUSIC, update_music_event);
register_state_flow(SUBJECT_TIMER, update_timer_event);

run_event_loop();
start_prompt();