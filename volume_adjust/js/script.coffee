# Volume Adjust
#
# Description:
#   周りの環境に合わせて音量調整する音楽プレーヤー
#
# Author:
#   sota1235

init = (callback = ->) ->
  try
    AudioContext = window.AudioContext || window.webkitAudioContext
    context = new AudioContext()

    callback null, context
  catch e
    callback 'Web Audio API is not supported in this browser'

loadSound = (context, url, callback = ->) ->
  request = new XMLHttpRequest()
  request.open 'GET', url, true
  request.responseType = 'arraybuffer'
  request.send()
  # Decode asynchronously
  request.onload = ->
    context.decodeAudioData request.response, (buffer) ->
      callback buffer

makeSource = (context, buffer) ->
  source = context.createBufferSource()
  source.buffer = buffer
  source.connect context.destination
  return source

playSound = (source) ->
  source.start(0)

stopSound = (source) ->
  source.stop()

createGainNode = (context, source) ->
  gainNode = context.createGain()
  source.connect gainNode
  gainNode.connect context.destination
  return gainNode

# variable declaration
context  = null
source   = null
gainNode = null
buffer   = null
url      = null
volume   = null
analyser = null
# WebRTC(getUserMedia) init
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || msGetUserMedia

getFreq = () ->
  data = new Uint8Array 256
  analyser.getByteFrequencyData data
  sum = 0
  for i in [0..256]
    sum += i
  $('#env_volume').text sum.toString()

window.onload = init (err, con) ->
  context = con
  analyser = context.createAnalyser
  analyser.fftsize = 1024
  analyser.smoothingTimeContant = 0.9

$ ->
  $('#audio').click ->
    if !navigator.getUserMedia
      console.log 'WebRTC(getUserMedia) is not supported...'
    else
      console.log 'getUserMedia supported'
      navigator.getUserMedia
        audio: true
        , (stream) ->
          input = context.createMediaStreamSource stream
          input.connect analyser
        , (err) ->
          console.log 'Error: ' + err

  $('#button').click ->
    $('#loading').text('Now loading...')
    url = $('#url').val()
    loadSound context, url, (buf) ->
      buffer = buf
      source = makeSource context, buf
      gainNode = createGainNode context, source
      $('#loading').text('Loading is completed!')
      $('#sound_player').html('
        <input type="button" id="start" value="Start">
        <input type="button" id="stop" value="Stop">
        ')
      $('#slider').slider
        min: 0
        max: 100
        step: 1
        value: 50
        change: (e, ui) ->
          gainNode.gain.value = ui.value
        create: (e, ui) ->
          volume = $(this).slider 'option', 'value'

  setInterval getFreq, 100
