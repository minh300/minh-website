var FFTSIZE = 256;


function AudioManager() {
    this.audioInfo = {};
    var sound;
    var player = document.getElementById('player');
    var audioCtx = new(window.AudioContext || window.webkitAudioContext);
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    player.crossOrigin = "anonymous";
    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    this.analyser = analyser;

    this.playSound = function(path, listener, onCompletes) {

        player.setAttribute('src', path);
        var audioInfo = this.audioInfo;
        var audioLoader = new THREE.AudioLoader();
        var playOnComplete = function() {
            player.play();
        }
        onCompletes.push(playOnComplete);
        audioLoader.load(path, function(buffer) {
            getTempo(buffer, audioInfo, onCompletes);
            audioInfo.startTime = clock.getElapsedTime();
        });



    }

    this.playSound2 = function(path, listener, onCompletes) {
        var audioLoader = new THREE.AudioLoader();
        if (sound) sound.stop();
        var listener = listener || new THREE.AudioListener();
        sound = new THREE.Audio(listener);
        var audioInfo = this.audioInfo;
        audioInfo.temp = 0;
        audioLoader.load(path, function(buffer) {
            getTempo(buffer, audioInfo, onCompletes);
            sound.setBuffer(buffer);
            sound.setVolume(1);
            sound.play();
            console.log(sound)
            audioInfo.startTime = clock.getElapsedTime()
        });

        var FFTSIZE = 256;
        this.analyser = new THREE.AudioAnalyser(sound, FFTSIZE);
    }

    this.isPlaying = function() {
        return !player.paused;
    }

    this.getCurrentTime = function() {
        if (sound) {
            return sound.context.currentTime;
        }
        return 0;
    }
}
/*
AudioManager.prototype.getAverageFrequency = function() {


    return this.analyser.getAverageFrequency();
}

AudioManager.prototype.getByteTimeDomainData = function() {
    var dataArray = new Uint8Array(this.analyser.analyser.frequencyBinCount);
    this.analyser.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
}

AudioManager.prototype.getByteFrequencyData = function() {
    var dataArray = new Uint8Array(this.analyser.analyser.frequencyBinCount);
    this.analyser.analyser.getByteFrequencyData(dataArray);
    return dataArray;
}

*/
AudioManager.prototype.getBassVol = function() {
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    var total = 0;
    for (var i = 0, l = 3; i < l; i++) {
        total += dataArray[i];
    }

    return total;
}

AudioManager.prototype.getLoudestSection = function() {
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    var totals = [0, 0, 0, 0, 0];
    for (var i = 0, l = dataArray.length; i < l; i++) {
        var index = Math.floor((i / (l / 5)));
        totals[index] += dataArray[i];
    }
    var loudestIndex = 0;
    var loudest = 0;
    for (var i = 0, l = totals.length; i < l; i++) {
        if (totals[i] > loudest) {
            loudestIndex = i;
        }
    }
    return loudestIndex;

}

AudioManager.prototype.getAverageFrequency = function() {
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    var total = 0;
    for (var i = 0, l = dataArray.length; i < l; i++) {
        total += dataArray[i];
    }

    return total / dataArray.length;
}

AudioManager.prototype.getByteTimeDomainData = function() {
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
}

AudioManager.prototype.getByteFrequencyData = function() {
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
}


AudioManager.prototype.onBeat = function() {
    var currentTime = (clock.getElapsedTime() - this.audioInfo.startTime) * 1000;
    var ret = currentTime > (1000 * 60 / this.audioInfo.tempo);
    if (ret) {
        this.audioInfo.startTime = clock.getElapsedTime();

    }
    return ret;
}

//borrowed from https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
function getTempo(buffer, audioInfo, onCompletes) {
    // Create offline context
    var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var offlineContext = new OfflineContext(2, 30 * 44100, 44100);

    // Create buffer source
    var source = offlineContext.createBufferSource();
    source.buffer = buffer;

    // Beats, or kicks, generally occur around the 100 to 150 hz range.
    // Below this is often the bassline.  So let's focus just on that.

    // First a lowpass to remove most of the song.

    var lowpass = offlineContext.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 150;
    lowpass.Q.value = 1;

    // Run the output of the source through the low pass.

    source.connect(lowpass);

    // Now a highpass to remove the bassline.

    var highpass = offlineContext.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 100;
    highpass.Q.value = 1;

    // Run the output of the lowpass through the highpass.

    lowpass.connect(highpass);

    // Run the output of the highpass through our offline context.

    highpass.connect(offlineContext.destination);

    // Start the source, and render the output into the offline conext.

    source.start(0);
    offlineContext.startRendering();
    offlineContext.oncomplete = function(e) {
        var buffer = e.renderedBuffer;
        var peaks = getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
        var groups = getIntervals(peaks);

        var top = groups.sort(function(intA, intB) {
            return intB.count - intA.count;
        }).splice(0, 5);

        var avgVol = peaks.reduce(function(acc, val) {
            return acc + val.volume;
        }, 0);

        audioInfo.tempo = top[0].tempo;
        audioInfo.vol = avgVol / peaks.length;
        audioInfo.duration = source.buffer.duration;
        audioInfo.decay = Math.max(top[0].tempo / 107 * 1.5, 1);
        if (onCompletes) {
            for (var i = 0; i < onCompletes.length; i++) {
                onCompletes[i](audioInfo);
            }
        }
    }
}

function getPeaks(data) {

    // What we're going to do here, is to divide up our audio into parts.

    // We will then identify, for each part, what the loudest sample is in that
    // part.

    // It's implied that that sample would represent the most likely 'beat'
    // within that part.

    // Each part is 0.5 seconds long - or 22,050 samples.

    // This will give us 60 'beats' - we will only take the loudest half of
    // those.

    // This will allow us to ignore breaks, and allow us to address tracks with
    // a BPM below 120.

    var partSize = 22050,
        parts = data[0].length / partSize,
        peaks = [];

    for (var i = 0; i < parts; i++) {
        var max = 0;
        for (var j = i * partSize; j < (i + 1) * partSize; j++) {
            var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
            if (!max || (volume > max.volume)) {
                max = {
                    position: j,
                    volume: volume
                };
            }
        }
        peaks.push(max);
    }

    // We then sort the peaks according to volume...

    peaks.sort(function(a, b) {
        return b.volume - a.volume;
    });

    // ...take the loundest half of those...

    peaks = peaks.splice(0, peaks.length * 0.5);

    // ...and re-sort it back based on position.

    peaks.sort(function(a, b) {
        return a.position - b.position;
    });

    return peaks;
}

function getIntervals(peaks) {

    // What we now do is get all of our peaks, and then measure the distance to
    // other peaks, to create intervals.  Then based on the distance between
    // those peaks (the distance of the intervals) we can calculate the BPM of
    // that particular interval.

    // The interval that is seen the most should have the BPM that corresponds
    // to the track itself.

    var groups = [];

    peaks.forEach(function(peak, index) {
        for (var i = 1;
            (index + i) < peaks.length && i < 10; i++) {
            var group = {
                tempo: (60 * 44100) / (peaks[index + i].position - peak.position),
                count: 1
            };

            while (group.tempo < 90) {
                group.tempo *= 2;
            }

            while (group.tempo > 180) {
                group.tempo /= 2;
            }

            group.tempo = Math.round(group.tempo);

            if (!(groups.some(function(interval) {
                    return (interval.tempo === group.tempo ? interval.count++ : 0);
                }))) {
                groups.push(group);
            }
        }
    });
    return groups;
}
