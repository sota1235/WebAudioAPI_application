# Analyser
#
# Description:
#   入力音の各周波数を表示
#   音量調整のお勉強のためにやる
#
# Author:
#   sota1235

init = (callback = ->) ->
  try
    AudioContext = window.AudioContext || window.webkitAudioContext
    context = new AudioContext()
    callback null, context
  catch e
    callback 'Web Audio API is not suppported in this browser'

navigator.getUserMedia = navigator.webkitGetUserMedia # for Chrome
context = null
analyser = null
delay = null
input = null

window.onload = () ->
  init (err, con) ->
    if err
      alert err
      return
    context = con
    delay = context.createDelay()
    delay.delayTime.value = 0.07
    analyser = context.createAnalyser()
    analyser.fftsize = 1024
    analyser.smoothingTimeContant = 0.9
    # 表記するHzを設定
    fsDivN = context.sampleRate / analyser.fftsize
    n50hz = Math.floor 50 / fsDivN
    for i in [0..256]
      if i % n50hz == 0
        f = Math.floor(50 * (i / n50hz))
        text = if f < 1000 then  (f + 'Hz') else (f / 100 + 'kHz')
        $('.analyser').append text + '<div id="' + i.toString() + '"></div>'

$('.start').click () ->
  if !navigator.getUserMedia
    alert 'WebRTC(getUserMedia) is not suppported...'
  else
    console.log 'getUserMedia suppported.'
    navigator.getUserMedia
      audio: true
      , (stream) ->
        input = context.createMediaStreamSource stream
        input.connect delay
        input.connect analyser
        delay.connect context.destination
      , (err) ->
        console.log 'Error: ' + err

getFreq = () ->
  data = new Uint8Array(256)
  analyser.getByteFrequencyData data
  for i in [0..256]
    val = data[i]
    $('#' + i.toString()).text val

setInterval getFreq, 100
