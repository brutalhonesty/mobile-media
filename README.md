Mobile-Media
============

Convert media for mobile use. Give the file or url to .mkv episode and it will fetch it and convert to .mp4 format with subtitles.

Version
-------

0.0.1

Installation
------------

Current installation is for Mac OSX 10.9. I have not tested on any other system right now.

```bash
# Install deps
$ brew install automake fdk-aac git lame libass libtool libvorbis libvpx opus sdl shtool texi2html theora wget x264 xvid yasm

# Install ffmpeg with aac audio encoding and .ass subtitles (Other lines were just in case).
$ brew install ffmpeg --with-fdk-aac --with-libass --with-libvorbis --with-libvpx

# Install mkvextract tool
$ brew install mkvtoolnix

# Download repo
$ git clone <repo>.git /path/to/repo
$ cd /path/to/repo

# Install node deps
$ npm install

# Run development
$ grunt serve

# Create production use
$ grunt build
```

Testing
-------

Nothing right now, still started the application.

License
-------

[MIT](https://tldrlegal.com/license/mit-license)

TODO
----
[Here](TODO.md)