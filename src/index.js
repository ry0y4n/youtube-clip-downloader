'use strict'

const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const express = require('express');
const { TwitterApi } = require('twitter-api-v2');

const app = express();

const secrets = JSON.parse(fs.readFileSync('secrets.json'));

const client = new TwitterApi({
    appKey: secrets["appKey"],
    appSecret: secrets["appSecret"],
    accessToken: secrets["accessToken"],
    accessSecret: secrets["accessSecret"]
});

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
        downloadSections: `*${startTime}-${parseInt(startTime)+parseInt(duration)}`,
        // downloadSections: `*10-40`,
        o: `${__dirname}/../video/video-clip.%(ext)s`
    });
}

app.get("/download", async (req, res) => {
    const url = req.query.url;
	const startTime = req.query.start_time;
    const duration = req.query.duration;

    await downloadVideo(url, startTime, duration);
    console.log('completed downloading');

    const mediaIds = await client.v1.uploadMedia(`${__dirname}/../video/video-clip.mp4`);
    await client.v1.tweet('api test', { media_ids: mediaIds });
    console.log('completed tweeting');
    
    fs.unlink(`${__dirname}/../video/video-clip.mp4`, ((err) => {
        if (err) throw err;
        console.log('completed cleaning');
    }));

    res.sendStatus(200);
});

app.listen(process.env.PORT || 8080);
