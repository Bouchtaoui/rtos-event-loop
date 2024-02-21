
const readline = require("node:readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SUBJECT_SYSTEM = 1;
const SUBJECT_PROMPT = 2;
const SUBJECT_MUSIC = 3;
const SUBJECT_GAME = 4;
const SUBJECT_GPS = 5;
const SUBJECT_TIMER = 6;

// System states
const STATE_SYSTEM_IDLE = 1;
const STATE_SYSTEM_EXIT = 0;
const STATE_SYSTEM_PANIC = -1;
// Prompt states
const STATE_PROMPT = 10;
const STATE_PROMPT_SYSTEM_START = 11;
const STATE_PROMPT_SYSTEM_STOP = 12;
const STATE_PROMPT_PLAY_AUDIO = 13;
const STATE_PROMPT_STOP_AUDIO = 14;

// Music states
const STATE_MUSIC_INIT = 0;
const STATE_PLAY_MUSIC = 0;
const STATE_STOP_MUSIC = 1;

//  Timer states
const STATE_START_DELAY = 1;


let pop_event;
let set_event;

function init_command(se, pe) {
  set_event = se;
  pop_event = pe;
}


/* prompt functions */
function play_music_cmd() {
  console.log("Play music cmd".bgBlue);
  const evt = pop_event();
  evt.state = STATE_MUSIC_INIT;
  evt.route = STATE_PLAY_MUSIC;
  evt.subject = SUBJECT_MUSIC;
  evt.log = "Initiate play music event";
  set_event(evt);
}

function stop_music_cmd() {
  const evt = pop_event();
  evt.state = STATE_MUSIC_INIT;
  evt.route = STATE_STOP_MUSIC;
  evt.subject = SUBJECT_MUSIC;
  evt.log = "Initiate stop music event";
  set_event(evt);
}
function exit_program_cmd() {
  const evt = pop_event();
  evt.state = STATE_SYSTEM_EXIT;
  evt.subject = SUBJECT_SYSTEM;
  evt.log = "Exit cmd, leaving app. Bye!";
  set_event(evt);
}
function perform_delay() {
  const evt = pop_event();
  evt.state = STATE_START_DELAY;
  evt.subject = SUBJECT_TIMER;
  evt.param = 5000;
  evt.log = "Prompt cmd stop music";
  set_event(evt);
}

function start_prompt() {
  readline.setPrompt("EL> ");
  readline.prompt();
  readline.on("line", (input) => {
    console.log("You entered: ", input);
    switch (input) {
      case "start":
        {
          console.log("Start playing music".bgBlue);
          play_music_cmd();
          return;
        }
        break;
      case "stop":
        {
          console.log("Stop music");
          stop_music_cmd();
          return;
        }
        break;
      case "delay":
        {
          console.log("Start delay");
          perform_delay();
        }
        break;
      case "exit":
        {
          console.log("Exiting program...");
          exit_program_cmd();
        }
        break;
      default:
        break;
    }
    readline.prompt();
  });
}


module.exports = { init_command, start_prompt };