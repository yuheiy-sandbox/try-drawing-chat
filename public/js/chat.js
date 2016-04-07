(function () {
  'use strict';

  var chat = document.getElementById('chat');
  var message = document.getElementById('message');
  var chatList = document.getElementById('chat-list');

  socket.once('initChat', function (messages) {
    var frag = document.createDocumentFragment();

    messages.map(function (message) {
      var item = document.createElement('li');
      item.textContent = message;
      return item;
    }).forEach(function (el) {
      frag.insertBefore(el, frag.firstChild);
    });

    chatList.appendChild(frag);
  });

  chat.addEventListener('submit', function (evt) {
    evt.preventDefault();
    socket.emit('chat', message.value);
    message.value = '';
  });

  socket.on('chat', function (message) {
    var item = document.createElement('li');
    item.textContent = message;
    chatList.insertBefore(item, chatList.firstChild);
  });
})();
