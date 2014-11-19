// Generated by CoffeeScript 1.8.0
(function() {
  var AudioContext, analyser, context, e, hue, input, ip, lightNum, lightSwitch, range, user;

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

  ip = '192.168.1.100';

  user = 'newdeveloper';

  lightNum = 3;

  lightSwitch = false;

  range = 50;

  analyser = context.createAnalyser();

  analyser.fftsize = 1024;

  analyser.smoothingTimeContant = 0;

  hue = new HueController(ip, user);

  hue.changeBri(3, 255).then(function(result) {
    return console.log('Hue setting completed');
  }).fail(function(err) {
    return console.log(err);
  });

  $(function() {
    var $num, $slider, $startButton, $volume, canvas, canvasContext, drawWave, getFreq;
    canvas = document.querySelector('canvas');
    canvasContext = canvas.getContext('2d');
    $startButton = $('#startButton');
    $slider = $('#slider');
    $num = $('#num');
    $volume = $('#volume');
    $startButton.on('click', function(e) {
      if (!navigator.getUserMedia) {
        return alert('WebRTC(getUserMedia) is not suppported...');
      } else {
        console.log('getUserMedia suppported.');
        return navigator.getUserMedia({
          audio: true
        }, function(stream) {
          input = context.createMediaStreamSource(stream);
          return input.connect(analyser);
        }, function(err) {
          return console.log('Error: ' + err);
        });
      }
    });
    $slider.on('input', function(e) {
      $num.text(this.value);
      return range = this.value;
    });
    drawWave = function(data) {
      var f, fsDivN, height, i, len, middle, modBottom, modHeight, modWidth, n500Hz, paddingBottom, paddingLeft, paddingRight, paddingTop, text, width, x, y, _i;
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
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.beginPath();
      for (i = _i = 0; _i <= 255; i = ++_i) {
        x = Math.floor(i / len * modWidth + paddingLeft);
        y = Math.floor((1 - data[i] / 255) * modHeight + paddingTop);
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
      var buffer, i, volume, volumeSum, _i;
      buffer = new Uint8Array(256);
      analyser.getByteFrequencyData(buffer);
      drawWave(buffer);
      volumeSum = 0;
      for (i = _i = 0; _i <= 255; i = ++_i) {
        volumeSum += buffer[i];
      }
      volume = parseInt(volumeSum / 256);
      if (volume > range && !lightSwitch) {
        hue.lightTrriger(lightNum, true).then(function(result) {
          console.log('light on');
          return lightSwitch = true;
        }).fail(function(err) {
          return console.log(err);
        });
      } else if (volume < range && lightSwitch) {
        hue.lightTrriger(lightNum, false).then(function(result) {
          console.log('light off');
          return lightSwitch = false;
        }).fail(function(err) {
          return console.log(err);
        });
      }
      return $volume.text((volumeSum / 255).toString());
    };
    return setInterval(getFreq, 80);
  });

}).call(this);
