url = 'http://sota1235.net/webAudioAPI/sound/'
ext = '.wav'
sounds = ['#snare', '#hihat', '#bass']
buffer = []
context = null

init = (callback = -> ) ->
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

playSound = (context, buffer, time) ->
  source = context.createBufferSource()
  source.buffer = buffer
  source.connect context.destination
  source.start(time)

window.onload = init (err, con) ->
  context = con

# load sounds of drum set
for s in sounds
  loadSound context, url + s.substring(1) + ext, (buf) ->
    buffer.push buf

# add click events
$ ->
  $('#snare').click ->
    playSound context, buffer[0], 0
  $('#hihat').click ->
    playSound context, buffer[1], 0
  $('#bass').click ->
    playSound context, buffer[2], 0

  $('#start').click ->
    startTime = context.currentTime + 0.100
    tempo = 150
    eighthNoteTime = (60 / tempo) / 2
    for i in [0..1]
      time = startTime + i * 8 * eighthNoteTime
      playSound context, buffer[0], time
      playSound context, buffer[0], time + 4 * eighthNoteTime

      playSound context, buffer[1], time + 2 * eighthNoteTime
      playSound context, buffer[1], time + 6 * eighthNoteTime

      for j in [0..7]
        playSound context, buffer[2], time + j * eighthNoteTime
