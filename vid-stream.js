const { spawn } = require("node:child_process");
const ffmpeg = require("fluent-ffmpeg");
const fs = require('fs');

const writableStream = fs.createWriteStream('/dev/stdin')
const readableStream = fs.createReadStream('/dev/stdout')


// This is a working snippet!
// ffmpeg("/dev/video0")
//   .videoCodec('libx264')
//   .audioCodec('libmp3lame')
//   .size("320x240")
//   .outputOptions('-movflags frag_keyframe+empty_moov')
//   .toFormat("mp4")
//   .pipe(outStream, { end: true })

function test() {
//   const mpvProcess = spawn("mpv", ["i", "-"]);

//   if (!mpvProcess) console.log("Zwaar mislukt".bgRed);

//   mpvProcess.on("error", (err) => {
//     console.error("mpv error:", err);
//   });
//   mpvProcess.on("close", (code) => {
//     console.log("mpv closed with code:", code);
//   });

  ffmpeg()
    .input("/dev/video0")
    .native()
    .size("320x240")
    .outputOptions("-movflags frag_keyframe+empty_moov")
    .toFormat("mp4")
    // .pipe(mpvProcess.stdin, { end: true })
    .output(writableStream, { end: true })
    .on("data", (chunk) => {
    //   console.log("chunk");
    })
    .on("end", () => {
    //   mpvProcess.stdin.end();
    })
    .on("error", (err) => {
        // console.log(err)
    });
  //   .output('temp.mp4')
  //   .run()
  //   .ffprobe(0, function(err, data) {
  //     console.log('file1 metadata:');
  //     console.dir(data);
  //   })
}
// test();

const ffPlay = spawn("ffplay", ["/dev/stdout"]);

  if (!ffPlay) console.log("Zwaar mislukt".bgRed);

  ffPlay.on("error", (err) => {
    console.error("ffplay error:", err);
  });
  ffPlay.on("close", (code) => {
    console.log("ffplay closed with code:", code);
  });

  ffPlay.stdout.on('data', data => {
    console.log("Camera data: ", data);
  })

// writableStream.on('data', chunk => {
// //   ffPlay.stdin.write(chunk);
// });

writableStream.on('open', () => {
  console.log('Writable Stream opened...');
});

writableStream.on('end', () => {
  console.log('Writable Stream Closed...');
});


readableStream.on('data', chunk => {
  console.log('---------------------------------');
  console.log("Receiving data...");
  ffPlay.stdin.write(chunk);
  console.log('---------------------------------');
});

readableStream.on('open', () => {
  console.log('Readable Stream opened...');
});

readableStream.on('end', () => {
  console.log('Readable Stream Closed...');
});

test();