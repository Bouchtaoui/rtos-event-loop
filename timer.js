let pop_event;
let set_event;

function init_timer(se, pe) {
  set_event = se;
  pop_event = pe;
}

const STATE_FINISHED = 254;
const STATE_INACTIVE = 255;

const STATE_START_DELAY = 1;
const STATE_DELAY_FINISHED = 2;

// Update prompt states
function update_timer_event(e) {
  switch (e.state) {
    case STATE_START_DELAY:
      e.state = STATE_FINISHED;
      e.cb = perform_delay;
      break;
    case STATE_DELAY_FINISHED:
      e.state = STATE_FINISHED;
      e.cb = null;
      break;
    default:
      e.state = STATE_INACTIVE;
      break;
  }
}

function perform_delay(evt) {
  console.log("perform delay\r".yellow);
  setTimeout(() => {
    console.log("delay ended\r".yellow);
    const next = evt.next;
    set_event(next);
    evt.nextEvt = null;
    console.log("delay finished\r".bgBlue);
  }, evt.param);
}

function create_event(subj, state, cb) {
  const evt = pop_event();
  evt.state = state;
  evt.subject = subj;
  evt.cb = cb;
  evt.log = "Prompt cmd start playing music\r";
}

module.exports = { init_timer, update_timer_event };
