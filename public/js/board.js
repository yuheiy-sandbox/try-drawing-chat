(function () {
  'use strict';

  var socket = io('/board');
  var board = document.getElementById('board');
  var clearButton = document.getElementById('clear-button');
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

  var drawing = function (points) {
    ctx.beginPath();
    ctx.moveTo(points.from.x, points.from.y);
    ctx.lineTo(points.to.x, points.to.y);
    ctx.stroke();
    saveCache();
  };

  var erasing = function () {
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

    drawing(points);
    socket.emit('draw', points);

    points.from.x = points.to.x;
    points.from.y = points.to.y;
  });

  board.addEventListener('mouseenter', function (evt) {
    points.from.x = evt.clientX - rect.left;
    points.from.y = evt.clientY - rect.top;
  });

  clearButton.addEventListener('click', function () {
    erasing();
    socket.emit('clear');
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

  socket.on('draw', function (points) {
    drawing(points);
  });

  socket.on('clear', function () {
    erasing();
  });
})();
