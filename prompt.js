

const STATE_SYSTEM_IDLE = 1;
const STATE_SYSTEM_EXIT = 0;
const STATE_SYSTEM_PANIC = -1;

const STATE_INACTIVE = 255;
const STATE_FINISHED = 254;

// Prompt states
const STATE_PROMPT = 10;
const STATE_PROMPT_SYSTEM_START = 11;
const STATE_PROMPT_SYSTEM_STOP = 12;
const STATE_PROMPT_PLAY_AUDIO = 13;
const STATE_PROMPT_STOP_AUDIO = 14;

// Update prompt states
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
      e.state = STATE_FINISHED;
      e.cb = null;
      break;
    case STATE_PROMPT_STOP_AUDIO:
      e.state = STATE_FINISHED;
      e.cb = null;
      break;
    default:
      e.state = STATE_INACTIVE;
      break;
  }
}



module.exports = {update_prompt_event};