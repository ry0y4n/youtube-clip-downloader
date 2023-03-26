'use strict'

const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const express = require('express')

const getInfo = (url, flags) => {
    return youtubedl(url, { dumpSingleJson: true, ...flags });
}

const getVideo = (url, flags) => {
    return youtubedl(url, {...flags})
}

async function main (url) {
    const info = await getInfo(url);
    const formats = info.formats;

    // console.log(formats)
    formats.forEach((format, index) => {
        if (format.ext == 'mp4' && format.vcodec != 'none' && format.acodec != 'none') console.log(`${index}: ${format.format_id} (resolution: ${format.resolution}), (fps: ${format.fps}), (ext: ${format.ext})`);
    });

    // 22→1280*720, 18→640*360
    getVideo(url, {
        f: "22/18",
        downloadSections: "*0:30-1:00",
        o: `${__dirname}/../video/video-clip.%(ext)s`
    });
}

main("https://www.youtube.com/watch?v=992_EydsfFY");
