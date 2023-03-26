'use strict'

const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const express = require('express');
const { start } = require('repl');

const ytdlpPath = require.resolve('youtube-dl-exec');
console.log(ytdlpPath)

const app = express();

const getInfo = (url, flags) => {
    return youtubedl(url, { dumpSingleJson: true, ...flags });
}

const getVideo = (url, flags) => {
    return youtubedl(url, {...flags})
}

async function downloadVideo (url, startTime, duration) {
    const info = await getInfo(url);
    const formats = info.formats;

    // console.log(formats)
    formats.forEach((format, index) => {
        if (format.ext == 'mp4' && format.vcodec != 'none' && format.acodec != 'none') console.log(`${index}: ${format.format_id} (resolution: ${format.resolution}), (fps: ${format.fps}), (ext: ${format.ext})`);
    });

    // 22→1280*720, 18→640*360
    return getVideo(url, {
        f: "22/18",
        downloadSections: `*${startTime}-${startTime+duration}`,
        o: `${__dirname}/../video/video-clip.%(ext)s`
    });
}

app.get("/download", async (req, res) => {
    const url = req.query.url;
	const startTime = req.query.start_time;
    const duration = req.query.duration;

    await downloadVideo(url, startTime, duration);

    console.log('completed downloading');

    res.sendStatus(200);
});

app.listen(process.env.PORT || 8080);
