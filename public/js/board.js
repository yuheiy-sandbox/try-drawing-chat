(function () {
  'use strict';

  var board = document.getElementById('board');
  var clear = document.getElementById('clear');
  var ctx = board.getContext('2d');
  var startX = 0;
  var startY = 0;
  var x = 0;
  var y = 0;
  var isDrawing = false;
  var rect = board.getBoundingClientRect();

  var drawing = function (data) {
    ctx.beginPath();
    ctx.moveTo(data.from.x, data.from.y);
    ctx.lineTo(data.to.x, data.to.y);
    ctx.stroke();
  };

  var erasing = function () {
    ctx.clearRect(0, 0, board.width, board.height);
  };

  var sendCache = function () {
    var dataURL = board.toDataURL();
    socket.emit('cache', dataURL);
  };

  var hideLoading = function () {
    var loading = document.getElementById('loading');
    loading.parentNode.removeChild(loading);
  };

  socket.once('initBoard', function (dataURL) {
    if (!dataURL) {
      hideLoading();
      return;
    }

    var image = new Image();
    image.addEventListener('load', function () {
      ctx.drawImage(image, 0, 0);
      hideLoading();
    });
    image.src = dataURL;
  });

  document.addEventListener('mousedown', function (evt) {
    startX = evt.clientX - rect.left;
    startY = evt.clientY - rect.top;
    isDrawing = true;
  });

  document.addEventListener('mouseup', function () {
    isDrawing = false;
  });

  board.addEventListener('mousemove', function (evt) {
    if (!isDrawing) {
      return;
    }

    x = evt.clientX - rect.left;
    y = evt.clientY - rect.top;

    var data = {
      from: {
        x: startX,
        y: startY
      },
      to: {
        x: x,
        y: y
      }
    };

    drawing(data);
    socket.emit('draw', data);

    startX = x;
    startY = y;
  });

  board.addEventListener('mouseenter', function (evt) {
    startX = evt.clientX - rect.left;
    startY = evt.clientY - rect.top;
  });

  socket.on('draw', function (data) {
    drawing(data);
    sendCache();
  });

  clear.addEventListener('click', function () {
    erasing();
    socket.emit('clear');
  });

  socket.on('clear', function () {
    erasing();
    sendCache();
  });

  window.addEventListener('scroll', function () {
    rect = board.getBoundingClientRect();
  });
})();
