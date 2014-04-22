'use strict';

var FFmpeg = require('fluent-ffmpeg');
var validator = require('validator');
var url = require('url');
var colors = require('colors');
var request = require('request');
var exec = require('child_process').exec;
var fs = require('fs');
var config = require('../config/config');
var path = require('path');
var mime = require('mime');

/**
 * Removes the temporary uploaded file from the server
 * @param  {string}   filePath The path of the file
 * @param  {function} callback The callback function to send back
 * @return {function} callback ^
 */
function _removeFile(filePath, callback) {
  fs.unlink(filePath, function(err) {
    if(err) {
      return callback(err);
    }
    return callback();
  });
}

function _convertVideo(filePath, uploadDir, fileNoExt) {
  var mkvextract = 'mkvextract tracks ' + filePath + ' 2:' + uploadDir + fileNoExt.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '.ass';
  var subtitleLine;
  var child = exec(mkvextract, function (err, stdout, stderr) {
    if (err) {
      console.log('Mkvextract error: ', err.red);
    } else {
      console.log('Mkvextract completed.'.green);
      var command;
      if ('development' === config.env) {
        subtitleLine = '-vf ass=' + uploadDir + '/' + fileNoExt.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '.ass';
        // FFMPEG time!
        command = new FFmpeg({source: filePath})
          .withVideoCodec('libx264')
          .withVideoBitrate('512k')
          .withAudioCodec('libfdk_aac')
          .withAudioBitrate('128k')
          .setDuration('2:00')
          .withSize('1280x720')
          .withFps(30)
          .withAudioFrequency(48000)
          .toFormat('mp4')
          .addOptions(['-profile:v main', '-movflags faststart', subtitleLine])
          .on('start', function(commandLine) {
              console.log('Spawned FFmpeg with command: ' + commandLine.blue);
          })
          .on('codecData', function(data) {
              // The 'codecData' event is emitted when FFmpeg first
              // reports input codec information. 'data' contains
              // the following information:
              // - 'format': input format
              // - 'duration': input duration
              // - 'audio': audio codec
              // - 'audio_details': audio encoding details
              // - 'video': video codec
              // - 'video_details': video encoding details
              console.log('Input is ' + data.audio + ' audio with ' + data.video + ' video'.blue);
          })
          .on('progress', function(progress) {
              // The 'progress' event is emitted every time FFmpeg
              // reports progress information. 'progress' contains
              // the following information:
              // - 'frames': the total processed frame count
              // - 'currentFps': the framerate at which FFmpeg is
              //   currently processing
              // - 'currentKbps': the throughput at which FFmpeg is
              //   currently processing
              // - 'targetSize': the current size of the target file
              //   in kilobytes
              // - 'timemark': the timestamp of the current frame
              //   in seconds
              // - 'percent': an estimation of the progress
              console.log('Processing: ' + progress.percent + '% done');
          })
          .on('error', function(err, stdout, stderr) {
              console.log("ffmpeg stdout:\n" + stdout);
              console.log("ffmpeg stderr:\n" + stderr);
              // The 'error' event is emitted when an error occurs,
              // either when preparing the FFmpeg process or while
              // it is running
              console.log('Cannot process video: ' + err.message.red);
              console.log(err);
          })
          .on('end', function() {
              // The 'end' event is emitted when FFmpeg finishes
              // processing.
              console.log('Processing finished successfully'.green);
          })
          .saveToFile(path.resolve(uploadDir + '/' + fileNoExt + '.mp4'));
      } else{
        subtitleLine = '-vf ass=' + uploadDir + '/' + fileNoExt.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '.ass';
        // FFMPEG time!
        command = new FFmpeg({source: filePath})
          .withVideoCodec('libx264')
          .withVideoBitrate('512k')
          .withAudioCodec('libfdk_aac')
          .withAudioBitrate('128k')
          .withSize('1280x720')
          .withFps(30)
          .withAudioFrequency(48000)
          .toFormat('mp4')
          .addOptions(['-profile:v main', '-movflags faststart', subtitleLine])
          .on('start', function(commandLine) {
              console.log('Spawned FFmpeg with command: ' + commandLine.blue);
          })
          .on('codecData', function(data) {
              // The 'codecData' event is emitted when FFmpeg first
              // reports input codec information. 'data' contains
              // the following information:
              // - 'format': input format
              // - 'duration': input duration
              // - 'audio': audio codec
              // - 'audio_details': audio encoding details
              // - 'video': video codec
              // - 'video_details': video encoding details
              console.log('Input is ' + data.audio + ' audio with ' + data.video + ' video'.blue);
          })
          .on('progress', function(progress) {
              // The 'progress' event is emitted every time FFmpeg
              // reports progress information. 'progress' contains
              // the following information:
              // - 'frames': the total processed frame count
              // - 'currentFps': the framerate at which FFmpeg is
              //   currently processing
              // - 'currentKbps': the throughput at which FFmpeg is
              //   currently processing
              // - 'targetSize': the current size of the target file
              //   in kilobytes
              // - 'timemark': the timestamp of the current frame
              //   in seconds
              // - 'percent': an estimation of the progress
              console.log('Processing: ' + progress.percent + '% done');
          })
          .on('error', function(err, stdout, stderr) {
              console.log("ffmpeg stdout:\n" + stdout);
              console.log("ffmpeg stderr:\n" + stderr);
              // The 'error' event is emitted when an error occurs,
              // either when preparing the FFmpeg process or while
              // it is running
              console.log('Cannot process video: ' + err.message.red);
          })
          .on('end', function() {
              // The 'end' event is emitted when FFmpeg finishes
              // processing.
              console.log('Processing finished successfully'.green);
          })
          .saveToFile(path.resolve(uploadDir + '/' + fileNoExt + '.mp4'));
        }
    }
  });
  child.stdout.on('data', function(data) { console.log(data.toString()); });
  child.stderr.on('data', function(data) { console.log(data.toString()); });
  child.on('exit', function() {  console.error('Child process exited'.blue); });
}


function _uploadURL(videoURL, uploadDir, uploadRelative, res) {
  // Get the name of the video including the extension
  var filenameArr = url.parse(videoURL).pathname.split('/');
  var filename = filenameArr[filenameArr.length - 1];
  // Create file and relative paths based on type of video
  var filePath = null;
  var relativePath = null;
  var fileNoExt = filename.slice(0, -4).replace(/ /g, "_");
  filePath = path.resolve(config.root + '/' + uploadDir + filename);
  relativePath = uploadRelative + filename;
  // Download the video
  var videoReq = request(videoURL);
  // Pipe the video to the chosen path
  videoReq.pipe(fs.createWriteStream(filePath.replace(/ /g, '_')));
  videoReq.on('response', function(resp) {
    if(resp.statusCode !== 200 && resp.statusCode !== 304) {
      return res.json(400, {message: 'Video could not be downloaded.'});
    }
    // If file is not an video, failed.
    if(!validator.isVideo(filePath)) {
      _removeFile(filePath, function (err) {
        return res.json(400, {message: 'Only video is allowed.'});
      });
    }
    // Get video size
    var videoSize = fs.statSync(filePath).size;
    _convertVideo(filePath.replace(/ /g, "_"), uploadDir, fileNoExt);
    return res.json({message: 'Video uploaded, conversion has started.'});
  });
}

function _uploadFile(video, uploadDir, uploadRelative, res) {
  // Check to see if video is an video based on MIME-type
  var videoPath = video.path;
  var fileNoExt = video.originalFilename.slice(0, -4).replace(/ /g, "_");
  if(!validator.isVideo(videoPath)) {
    _removeFile(videoPath, function (err) {
      return res.json(400, {message: 'Only video is allowed.'});
    });
  }
  var targetPath = path.resolve(uploadDir + '/' + video.originalFilename).replace(/ /g, "_");
  // Move from temp path to new path
  fs.rename(videoPath, targetPath, function(err) {
    if(err) {
      console.log('File Rename');
      console.log(err);
      return res.json(500, {message: 'Problem moving video.'});
    }
    _convertVideo(targetPath, uploadDir, fileNoExt);
    return res.json({message: 'Video uploaded, conversion has started.'});
  });
}

exports.uploadVideo = function(req, res) {
  var video = req.files.file[0];
  var videoURL = req.body.url;
  // If the video is a string and its not a url
  if(!validator.isNull(videoURL) && !validator.isURL(videoURL)) {
    return res.json(400, {message: 'Invalid URL.'});
  }
  if(validator.isURL(videoURL)) {
    return _uploadURL(videoURL, req.uploadDir, req.uploadRelative, res);
  } else {
    return _uploadFile(video, req.uploadDir, req.uploadRelative, res);
  }
};

validator.extend('isVideo', function(str) {
  var videoTypes = ['application/annodex','application/mp4','application/ogg','application/vnd.rn-realmedia','application/x-matroska','video/3gpp','video/3gpp2','video/annodex','video/divx','video/flv','video/h264','video/mp4','video/mp4v-es','video/mpeg','video/mpeg-2','video/mpeg4','video/ogg','video/ogm','video/quicktime','video/ty','video/vdo','video/vivo','video/vnd.rn-realvideo','video/vnd.vivo','video/webm','video/x-bin','video/x-cdg','video/x-divx','video/x-dv','video/x-flv','video/x-la-asf','video/x-m4v','video/x-matroska','video/x-motion-jpeg','video/x-ms-asf','video/x-ms-dvr','video/x-ms-wm','video/x-ms-wmv','video/x-msvideo','video/x-sgi-movie','video/x-tivo','video/avi','video/x-ms-asx','video/x-ms-wvx','video/x-ms-wmx'];
    var videotype = mime.lookup(str);
    for(var typeCtr = 0; typeCtr < videoTypes.length; typeCtr++) {
      if(videoTypes[typeCtr] === videotype) {
        return true;
      }
    }
    return false;
});