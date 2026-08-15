import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const runFfmpeg = (inputPath, outputPlaylistPath, segmentPattern, width, height, bitrate) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .audioBitrate("128k")
      .outputOptions([
        "-preset veryfast",
        "-profile:v main",
        "-crf 20",
        "-sc_threshold 0",
        "-g 48",
        "-keyint_min 48",
        "-b:v", bitrate,
        "-maxrate", bitrate,
        "-bufsize", "2M",
        "-vf", `scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
        "-hls_time 6",
        "-hls_playlist_type vod",
        "-hls_segment_filename", segmentPattern,
      ])
      .format("hls")
      .output(outputPlaylistPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
};

const createMasterPlaylist = async (baseDir, variants) => {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3"];

  for (const variant of variants) {
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${variant.bandwidth},RESOLUTION=${variant.width}x${variant.height}`);
    lines.push(`${variant.name}/index.m3u8`);
  }

  const masterPath = path.join(baseDir, "master.m3u8");
  await fs.promises.writeFile(masterPath, `${lines.join("\n")}\n`, "utf8");

  return masterPath;
};

const listFilesRecursively = async (dirPath) => {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursively(fullPath);
      files.push(...nested);
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const transcodeToHls = async (inputPath, outputRootDir) => {
  const variants = [
    { name: "480p", width: 854, height: 480, bitrate: "1400k", bandwidth: 1400000 },
    { name: "720p", width: 1280, height: 720, bitrate: "2800k", bandwidth: 2800000 },
    { name: "1080p", width: 1920, height: 1080, bitrate: "5000k", bandwidth: 5000000 },
  ];

  await fs.promises.mkdir(outputRootDir, { recursive: true });

  for (const variant of variants) {
    const variantDir = path.join(outputRootDir, variant.name);
    await fs.promises.mkdir(variantDir, { recursive: true });

    const playlistPath = path.join(variantDir, "index.m3u8");
    const segmentPattern = path.join(variantDir, "segment_%03d.ts").replace(/\\/g, "/");

    await runFfmpeg(
      inputPath,
      playlistPath,
      segmentPattern,
      variant.width,
      variant.height,
      variant.bitrate
    );
  }

  const masterPlaylistPath = await createMasterPlaylist(outputRootDir, variants);
  const allFiles = await listFilesRecursively(outputRootDir);

  return {
    variants,
    masterPlaylistPath,
    allFiles,
  };
};

export { transcodeToHls };
