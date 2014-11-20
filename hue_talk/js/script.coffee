
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
hue         = null
ip          = '192.168.11.3'
user        = 'newdeveloper'
hues        = [1, 3]
lightSwitch = false # Hueの電気のon/offを持つ
lightColor  = "blue" # Hueの色を持つ

# Other
v_range    = 50
c_range    = 6000

# analyser setting
analyser = context.createAnalyser()
analyser.fftsize = 2048
analyser.smoothingTimeContant = 0

# hue setting
hue = new HueController(ip, user)
for h in hues
  # Hueの"bri"パラメータをマックスにしておく
  hue.changeBri h, 255
    .then (result) ->
      console.log 'Hue setting completed'
    .fail (err) ->
      console.log err
  # Hueの"hs"パラメータを青にしておく
  hue.changeColor h, 46920
    .then (result) ->
      console.log 'Hue color setting completed'
    .fail (err) ->
      console.log err

# DOMが読み込まれたあとの処理
$ ->
  # canvasオブジェクト
  canvas = document.querySelector 'canvas'
  # canvasコンテクスト
  canvasContext = canvas.getContext '2d'
  # キャッシュされたjQuery-DOMパーツ
  $th_slider = $ '#th_slider'
  $in_slider = $ '#in_slider'
  $threshold = $ '#threshold'
  $interval  = $ '#interval'
  $volume    = $ '#volume'
  $status    = $ '#status'

  # スライダー
  $th_slider.on 'input', (e) ->
    $threshold.val this.value
    v_range = this.value
  $in_slider.on 'input', (e) ->
    $interval.val this.value
    c_range = this.value
    console.log interval

  # 波形をドローするメソッド
  # clone from http://curtaincall.weblike.jp/portfolio-web-sounder/webaudioapi-visualization/draw-wave
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

    # Frequency resolution
    fsDivN = context.sampleRate / analyser.fftsize

    # 500Hz毎に描画するための処理
    n500Hz = Math.floor 500 / fsDivN

    # Get data for drawing spectrum
    spectrums = new Uint8Array analyser.frequencyBinCount / 4
    analyser.getByteFrequencyData spectrums

    canvasContext.fillStyle = 'rgb(0, 0, 0)'
    canvasContext.fillRect 0, 0, canvas.width, canvas.height
    canvasContext.beginPath()
    for i in [0..255]
      x = Math.floor(i / len * modWidth) + paddingLeft
      y = Math.floor((1 - data[i] / 255) * modHeight) + paddingTop

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
  # setIntervalで各周波数の値をとり、それを元に処理
  getFreq = ->
    buffer = new Uint8Array(256)
    analyser.getByteFrequencyData buffer
    drawWave buffer
    volumeSum = 0
    lowSum  = 0
    highSum = 0
    # 各周波数の総和を計算
    for i in [0..255]
      volumeSum += buffer[i]
      if i < 128
        lowSum  += buffer[i]
      else
        highSum += buffer[i]
    # その場の雰囲気を低音 - 高音で評価
    status = lowSum - highSum
    # 各周波数の平均をその場の音量として計算
    volume = parseInt(volumeSum/256)

    # volumeがv_range以上かつlightがoffの時
    if volume > v_range and !lightSwitch
      for h in hues
        hue.lightTrriger h, true
          .then (result) ->
            console.log 'light on'
          .fail (err) ->
            console.log err
      lightSwitch = true
    # volumeがv_range以下かつlightがonの時
    else if volume < v_range and lightSwitch
      for h in hues
        hue.lightTrriger h, false
          .then (result) ->
            console.log 'light off'
          .fail (err) ->
            console.log err
      lightSwitch = false

    # statusがc_range以上かつlightがblueの時
    if status > c_range and lightColor is "blue"
      for h in hues
        hue.changeColor h, 0
          .then (result) ->
            console.log 'change to red'
          .fail (err) ->
            console.log err
      lightColor = "red"
    else if status < c_range and lightColor is "red"
      for h in hues
        hue.changeColor h, 46920
          .then (result) ->
            console.log 'change to blue'
          .fail (err) ->
            console.log err
      lightColor = "blue"
    $volume.val (volumeSum/255).toString()

    setTimeout getFreq, interval

  # RTCをスタート
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

  # メイン処理
  getFreq()
