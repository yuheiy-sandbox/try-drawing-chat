(function () {
  'use strict';

  var socket = io('/board');
  var board = document.getElementById('board');
  var toolButtons = document.querySelectorAll('[type="radio"][name="tool"]');
  var clearButton = document.getElementById('clear-button');
  var saveButton = document.getElementById('save-button');
  var ctx = board.getContext('2d');
  var points = {
    from: {
      x: 0,
      y: 0
    },
    to: {
      x: 0,
      y: 0
    }
  };
  var currentTool = 'pencil';
  var isDrawing = false;
  var rect = board.getBoundingClientRect();

  var hideLoading = function () {
    var loading = document.getElementById('loading');
    loading.parentNode.removeChild(loading);
  };

  var saveCache = function () {
    var dataURL = board.toDataURL();
    socket.emit('save cache', dataURL);
  };

  var drawing = function (tool, points) {
    ctx.beginPath();
    ctx.moveTo(points.from.x, points.from.y);
    ctx.lineTo(points.to.x, points.to.y);

    switch (tool) {
      case 'pencil':
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1;
        ctx.lineCap = 'butt';
        break;

      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
        ctx.lineCap = 'square';
        break;
    }

    ctx.stroke();
    saveCache();
  };

  var clearAll = function () {
    ctx.clearRect(0, 0, board.width, board.height);
    saveCache();
  };

  document.addEventListener('mousedown', function (evt) {
    points.from.x = evt.clientX - rect.left;
    points.from.y = evt.clientY - rect.top;
    isDrawing = true;
  });

  document.addEventListener('mouseup', function () {
    isDrawing = false;
  });

  board.addEventListener('mousemove', function (evt) {
    if (!isDrawing) {
      return;
    }

    points.to.x = evt.clientX - rect.left;
    points.to.y = evt.clientY - rect.top;

    drawing(currentTool, points);
    socket.emit('draw', currentTool, points);

    points.from.x = points.to.x;
    points.from.y = points.to.y;
  });

  board.addEventListener('mouseenter', function (evt) {
    points.from.x = evt.clientX - rect.left;
    points.from.y = evt.clientY - rect.top;
  });

  [].slice.call(toolButtons).forEach(function (toolButtton) {
    toolButtton.addEventListener('change', function (evt) {
      currentTool = this.value;

      switch (currentTool) {
        case 'pencil':
          board.style.cursor = 'crosshair';
          break;
        case 'eraser':
          board.style.cursor = 'url("/eraser.cur") 10 10, pointer';
          break;
      }
    });
  });

  clearButton.addEventListener('click', function () {
    if (!confirm('アートボードを白紙に戻します。よろしいですか？')) {
      return;
    }

    clearAll();
    socket.emit('clear all');
  });

  saveButton.addEventListener('click', function () {
    var dataURL = board.toDataURL();
    window.open(dataURL);
  });

  window.addEventListener('scroll', function () {
    rect = board.getBoundingClientRect();
  });

  socket.once('init', function (dataURL) {
    hideLoading();

    if (!dataURL) {
      return;
    }

    var preloader = new Image();
    preloader.addEventListener('load', function () {
      ctx.drawImage(preloader, 0, 0);
    });
    preloader.src = dataURL;
  });

  socket.on('draw', function (tool, points) {
    drawing(tool, points);
  });

  socket.on('clear all', function () {
    clearAll();
  });
})();
