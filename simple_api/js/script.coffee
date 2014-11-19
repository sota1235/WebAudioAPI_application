url = 'http://sota1235.net/webAudioAPI/sound/coin.wav'
buffer = null
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
loadSound context, url, (buf) ->
  buffer = buf

# add click events
$ ->
  $('#coin').click ->
    playSound context, buffer, 0
