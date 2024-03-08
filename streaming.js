const { spawn } = require("node:child_process");
 
 const ffPlay = spawn("ffplay", ["/dev/video0"]);

  if (!ffPlay) console.log("Zwaar mislukt".bgRed);

  ffPlay.on("error", (err) => {
    console.error("mpv error:", err);
  });
  ffPlay.on("close", (code) => {
    console.log("mpv closed with code:", code);
  });

  ffPlay.stdout.on('data', data => {
    console.log("Received data: ");
  })