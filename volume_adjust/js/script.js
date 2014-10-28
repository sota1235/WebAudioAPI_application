// Generated by CoffeeScript 1.8.0
(function() {
  var buffer, context, createGainNode, gainNode, init, loadSound, makeSource, playSound, source, stopSound, url, volume;

  init = function(callback) {
    var AudioContext, context, e;
    if (callback == null) {
      callback = function() {};
    }
    try {
      AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
      return callback(null, context);
    } catch (_error) {
      e = _error;
      return callback('Web Audio API is not supported in this browser');
    }
  };

  loadSound = function(context, url, callback) {
    var request;
    if (callback == null) {
      callback = function() {};
    }
    request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.send();
    return request.onload = function() {
      return context.decodeAudioData(request.response, function(buffer) {
        return callback(buffer);
      });
    };
  };

  makeSource = function(context, buffer) {
    var source;
    source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    return source;
  };

  playSound = function(source) {
    return source.start(time);
  };

  stopSound = function(source) {
    return source.stop();
  };

  createGainNode = function(context, source) {
    var gainNode;
    gainNode = context.createGainNode();
    source.connect(gainNode);
    gainNode.connect(context.distinatio);
    return gainNoden;
  };

  context = null;

  source = null;

  gainNode = null;

  buffer = null;

  url = null;

  volume = null;

  window.onload = init(function(err, con) {
    return context = con;
  });

  $(function() {
    $('#button').click(function() {
      $('#loading').text('Now loading...');
      console.log('hello');
      url = $('#url').val();
      console.log('hello' + url);
      return loadSound(context, url, function(buf) {
        buffer = buf;
        source = makeSource(context, buf);
        gainNode = createGainNode(context, source);
        $('#loading').text('Loading is completed!');
        $('#sound_player').html('<input type="button" id="start" value="Start"> <input type="button" id="stop" value="Stop">');
        return $('#slider').slider({
          min: 0,
          max: 100,
          step: 1,
          value: 50,
          change: function(e, ui) {
            return gainNode.gain.value = ui.value / 100;
          },
          create: function(e, ui) {
            return volume = $(this).slide('option', 'value');
          }
        });
      });
    });
    $('#start').click(function() {
      return playSound(source);
    });
    return $('#stop').click(function() {
      return stopSound(source);
    });
  });

}).call(this);
