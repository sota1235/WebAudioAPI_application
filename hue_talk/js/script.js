// Generated by CoffeeScript 1.8.0
(function() {
  var AudioContext, analyser, c_range, context, e, h, hue, hues, input, ip, lightColor, lightSwitch, user, v_range, _i, _len;

  AudioContext = window.AudioContext || window.webkitAudioContext;

  try {
    context = new AudioContext();
  } catch (_error) {
    e = _error;
    console.error('Web Audio API is not suppported in this browser');
  }

  navigator.getUserMedia = navigator.webkitGetUserMedia;

  analyser = null;

  input = null;

  hue = null;

  ip = '192.168.11.3';

  user = 'newdeveloper';

  hues = [1, 3];

  lightSwitch = false;

  lightColor = "blue";

  v_range = 50;

  c_range = 6000;

  analyser = context.createAnalyser();

  analyser.fftsize = 2048;

  analyser.smoothingTimeContant = 0;

  hue = new HueController(ip, user);

  for (_i = 0, _len = hues.length; _i < _len; _i++) {
    h = hues[_i];
    hue.changeBri(h, 255).then(function(result) {
      return console.log('Hue setting completed');
    }).fail(function(err) {
      return console.log(err);
    });
    hue.changeColor(h, lightColor).then(function(result) {
      return console.log('Hue color setting completed');
    }).fail(function(err) {
      return console.log(err);
    });
  }

  $(function() {
    var $in_slider, $interval, $status, $th_slider, $threshold, $volume, canvas, canvasContext, drawWave, getFreq;
    canvas = document.querySelector('canvas');
    canvasContext = canvas.getContext('2d');
    $th_slider = $('#th_slider');
    $in_slider = $('#in_slider');
    $threshold = $('#threshold');
    $interval = $('#interval');
    $volume = $('#volume');
    $status = $('#status');
    $th_slider.on('input', function(e) {
      $threshold.val(this.value);
      return v_range = this.value;
    });
    $in_slider.on('input', function(e) {
      $interval.val(this.value);
      c_range = this.value;
      return console.log(interval);
    });
    drawWave = function(data) {
      var f, fsDivN, height, i, len, middle, modBottom, modHeight, modWidth, n500Hz, paddingBottom, paddingLeft, paddingRight, paddingTop, spectrums, text, width, x, y, _j;
      len = data.length;
      width = canvas.width;
      height = canvas.height;
      paddingTop = 20;
      paddingBottom = 20;
      paddingLeft = 30;
      paddingRight = 30;
      modWidth = width - paddingLeft - paddingRight;
      modHeight = height - paddingTop - paddingBottom;
      modBottom = height - paddingBottom;
      middle = (modHeight / 2) + paddingTop;
      fsDivN = context.sampleRate / analyser.fftsize;
      n500Hz = Math.floor(500 / fsDivN);
      spectrums = new Uint8Array(analyser.frequencyBinCount / 4);
      analyser.getByteFrequencyData(spectrums);
      canvasContext.fillStyle = 'rgb(0, 0, 0)';
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      canvasContext.beginPath();
      for (i = _j = 0; _j <= 255; i = ++_j) {
        x = Math.floor(i / len * modWidth) + paddingLeft;
        y = Math.floor((1 - data[i] / 255) * modHeight) + paddingTop;
        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }
        if (i % n500Hz === 0) {
          f = Math.floor(500 * i / n500Hz);
          text = f < 1000 ? f + 'Hz' : (f / 1000) + 'kHz';
          canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)';
          canvasContext.fillRect(x, paddingTop, 1, modHeight);
          canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
          canvasContext.font = "16px 'Times New Roman'";
          canvasContext.fillText(text, x - canvasContext.measureText(text).width / 2, height - 3);
        }
      }
      canvasContext.strokeStyle = 'rgba(0, 0, 255, 1.0)';
      canvasContext.lineWidth = 2;
      canvasContext.lineCap = 'round';
      canvasContext.lineJoin = 'miter';
      canvasContext.stroke();
      canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)';
      canvasContext.fillRect(paddingLeft, middle, modWidth, 1);
      canvasContext.fillRect(paddingLeft, paddingTop, modWidth, 1);
      canvasContext.fillRect(paddingLeft, modBottom, modWidth, 1);
      canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
      canvasContext.font = "16px 'Times New Roman'";
      canvasContext.fillText('1.00', 3, paddingTop);
      canvasContext.fillText('0.50', 3, middle);
      return canvasContext.fillText('0.00', 3, modBottom);
    };
    getFreq = function() {
      var buffer, highSum, i, lowSum, status, volume, volumeSum, _j, _k, _l, _len1, _len2, _len3, _len4, _m, _n;
      buffer = new Uint8Array(256);
      analyser.getByteFrequencyData(buffer);
      drawWave(buffer);
      volumeSum = 0;
      lowSum = 0;
      highSum = 0;
      for (i = _j = 0; _j <= 255; i = ++_j) {
        volumeSum += buffer[i];
        if (i < 128) {
          lowSum += buffer[i];
        } else {
          highSum += buffer[i];
        }
      }
      status = lowSum - highSum;
      volume = parseInt(volumeSum / 256);
      if (volume > v_range && !lightSwitch) {
        for (_k = 0, _len1 = hues.length; _k < _len1; _k++) {
          h = hues[_k];
          hue.lightTrriger(h, true).then(function(result) {
            console.log('light on');
            return lightSwitch = true;
          }).fail(function(err) {
            return console.log(err);
          });
        }
      } else if (volume < v_range && lightSwitch) {
        for (_l = 0, _len2 = hues.length; _l < _len2; _l++) {
          h = hues[_l];
          hue.lightTrriger(h, false).then(function(result) {
            console.log('light off');
            return lightSwitch = false;
          }).fail(function(err) {
            return console.log(err);
          });
        }
      }
      if (status > c_range && lightColor === "blue") {
        for (_m = 0, _len3 = hues.length; _m < _len3; _m++) {
          h = hues[_m];
          hue.changeColor(h, 0).then(function(result) {
            console.log('change to red');
            return lightColor = "red";
          }).fail(function(err) {
            return console.log(err);
          });
        }
      } else if (status < c_range && lightColor === "red") {
        for (_n = 0, _len4 = hues.length; _n < _len4; _n++) {
          h = hues[_n];
          hue.changeColor(h, 46920).then(function(result) {
            console.log('change to blue');
            return lightColor = "blue";
          }).fail(function(err) {
            return console.log(err);
          });
        }
      }
      $volume.val((volumeSum / 255).toString());
      return setTimeout(getFreq, interval);
    };
    if (!navigator.getUserMedia) {
      alert('WebRTC(getUserMedia) is not suppported...');
    } else {
      console.log('getUserMedia suppported.');
      navigator.getUserMedia({
        audio: true
      }, function(stream) {
        input = context.createMediaStreamSource(stream);
        return input.connect(analyser);
      }, function(err) {
        return console.log('Error: ' + err);
      });
    }
    return getFreq();
  });

}).call(this);
