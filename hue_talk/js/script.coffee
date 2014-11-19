
# Analyser
#
# Description:
#   マイク入力の音でHueを制御する
#
# Design:
#   音量 -> 光量
#   一定の周波数の値 -> 色
#
# Author:
#   sota1235

# Web Audio API
AudioContext = window.AudioContext || window.webkitAudioContext
try
  context = new AudioContext()
catch e
  console.error 'Web Audio API is not suppported in this browser'

# WebRTC
navigator.getUserMedia = navigator.webkitGetUserMedia # for Chrome

# Web Audio API
analyser = null
input    = null

# Hue
hue      = null
ip       = '192.168.1.100'
user     = 'newdeveloper'

# Other
range    = 50

# analyser setting
analyser = context.createAnalyser()
analyser.fftsize = 1024
analyser.smoothingTimeContant = 0

# hue setting
hue = new HueController(ip, user)
hue.changeBri 3, 255
.then (result) ->
  console.log 'onloaded'
.fail (err) ->
  console.log err

# DOMが読み込まれたあとの処理
$ ->
  # canvasオブジェクト
  canvas = document.querySelector 'canvas'
  # canvasコンテクスト
  canvasContext = canvas.getContext '2d'
  # キャッシュされたjQuery-DOMパーツ
  $startButton = $ '#startButton'
  $slider = $ '#slider'
  $num = $ '#num'
  $volume = $ '#volume'

  # スタートボタンのコールバック処理
  $startButton.on 'click', (e) ->
    if !navigator.getUserMedia
      alert 'WebRTC(getUserMedia) is not suppported...'
    else
      console.log 'getUserMedia suppported.'
      navigator.getUserMedia
        audio: true
        , (stream) ->
          input = context.createMediaStreamSource stream
          input.connect analyser
        , (err) ->
          console.log 'Error: ' + err
  # スライダー
  $slider.slider
    min: 0
    max: 255
    step: 1
    value: 50
    change: (e, ui) ->
      $num.text ui.value
      range = ui.value
    create: (e, ui) ->
      $num.text $(this).slider 'option', 'value'

  # 波形をドローするメソッド
  drawWave = (data) ->
    len = data.length
    width  = canvas.width
    height = canvas.height

    paddingTop    = 20
    paddingBottom = 20
    paddingLeft   = 30
    paddingRight  = 30

    modWidth  = width  - paddingLeft - paddingRight
    modHeight = height - paddingTop  - paddingBottom
    modBottom = height - paddingBottom

    middle = (modHeight / 2) + paddingTop

    fsDivN = context.sampleRate / analyser.fftsize

    n500Hz = Math.floor 500 / fsDivN

    canvasContext.clearRect 0, 0, canvas.width, canvas.height
    canvasContext.beginPath()
    for i in [0..255]
      x = Math.floor i / len * modWidth + paddingLeft
      y = Math.floor (1 - data[i] / 255) * modHeight + paddingTop

      if i == 0
        canvasContext.moveTo x, y
      else
        canvasContext.lineTo x, y

      if i % n500Hz == 0
        f    = Math.floor 500 * i / n500Hz
        text = if f < 1000 then (f + 'Hz') else ((f / 1000) + 'kHz')

        canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)'
        canvasContext.fillRect x, paddingTop, 1, modHeight

        canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)'
        canvasContext.font      = "16px 'Times New Roman'"
        canvasContext.fillText text, x - canvasContext.measureText(text).width / 2, height - 3

    canvasContext.strokeStyle = 'rgba(0, 0, 255, 1.0)'
    canvasContext.lineWidth   = 2
    canvasContext.lineCap     = 'round'
    canvasContext.lineJoin    = 'miter'
    canvasContext.stroke()

    canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)'
    canvasContext.fillRect paddingLeft, middle, modWidth, 1
    canvasContext.fillRect paddingLeft, paddingTop, modWidth, 1
    canvasContext.fillRect paddingLeft, modBottom, modWidth, 1

    canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)'
    canvasContext.font      = "16px 'Times New Roman'"
    canvasContext.fillText '1.00', 3, paddingTop
    canvasContext.fillText '0.50', 3, middle
    canvasContext.fillText '0.00', 3, modBottom
  # 周波数を
  getFreq = ->
    buffer = new Uint8Array(256)
    analyser.getByteFrequencyData buffer
    drawWave buffer
    sum = 0
    for i in [0..255]
      sum += buffer[i]
    hue.lightTrriger 3, parseInt(sum/256) > range
      .then (result) ->
        console.log result
        console.log parseInt(sum/255)
        $volume.text (sum/255).toString()
      .fail (err) ->
        console.log err

  setInterval getFreq, 80
