const express = require("express");
var app = express();
var path = require("path");
const fs = require("fs");
const hls = require("hls-server");
var cors = require("cors");

app.use(cors());

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// const url =
//   "https://gatbk.cooperativaespecializada.co/co/wp-content/media/sites/2/2022/07/video-9_1.mp4";
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const urlBase = "https://pzmg4x.sse.codesandbox.io";
const urlBaseVideos = urlBase + "/videos/";
const urlBaseScreen = urlBase + "/screenshots/";

var tt = "";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

app.get("/convertVideo", cors(corsOptions), (req, res) => {
  const url_video_req = req.query.url;
  if (url_video_req) {
    const lastSegment = url_video_req.split("/").pop();
    const output_url = "videos/" + lastSegment + ".m3u8";
    const url_video_ser = urlBaseVideos + lastSegment + ".m3u8";
    ffmpeg(url_video_req, {
      timeout: 432000
    })
      .addOptions([
        "-profile:v baseline",
        // "-level 3.0",
        "-start_number 0",
        "-hls_time 1",
        "-hls_list_size 0",
        "-f hls",
        "-hls_base_url " + urlBaseVideos
      ])
      .output(output_url)
      .on("end", () => {
        console.log("end");
        res.send({
          url_video: url_video_ser
        });
      })
      .run();
  } else {
    res.send({
      error: "No se ha encontrado la url del video"
    });
  }
});

app.get("/generateScreenshot", cors(corsOptions), (req, res) => {
  const url_screen_req = req.query.url;
  if (url_screen_req !== "") {
    const lastSegment_screenshot = url_screen_req.split("/").pop();
    const output_url_screenshot = lastSegment_screenshot + ".jpg";

    ffmpeg(url_screen_req)
      .on("filenames", function (filenames) {
        console.log("screenshots are " + filenames);
        tt = filenames.join(", ");
      })
      .on("end", function () {
        console.log("screenshots were saved");
        res.send({
          url_screen: urlBaseScreen + tt
        });
      })
      .on("error", function (err) {
        console.log("an error happened: " + err.message);
      })
      .takeScreenshots(
        {
          count: 1,
          timemarks: ["0"],
          size: "540x960",
          filename: output_url_screenshot
        },
        "screenshots/"
      );
  } else {
    res.send({
      error: "No se ha encontrado la url del video"
    });
  }
});

app.get("/", cors(corsOptions), (req, res) => {
  res.send("Bienvenido");
});

const server = app.listen(3000);
app.use("/videos", express.static(__dirname + "/videos"));
app.use("/screenshots", express.static(__dirname + "/screenshots"));
