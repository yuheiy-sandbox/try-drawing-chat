(function () {
  'use strict';

  var socket = io('/chat');
  var form = document.getElementById('chat-form');
  var messageField = document.getElementById('chat-message-field');
  var list = document.getElementById('chat-list');

  var createMessageElement = function (message) {
    var item = document.createElement('li');
    var text = message.text;
    var date = moment(message.date).format('h:mm');

    item.textContent = date + ' ' + text;
    return item;
  };

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    socket.emit('new message', messageField.value);
    messageField.value = '';
  });

  socket.once('init', function (messages) {
    var frag = document.createDocumentFragment();

    messages.map(function (message) {
      var item = createMessageElement(message);
      return item;
    }).forEach(function (item) {
      frag.insertBefore(item, frag.firstChild);
    });

    list.appendChild(frag);
  });

  socket.on('new message', function (message) {
    var item = createMessageElement(message);
    list.insertBefore(item, list.firstChild);
  });
})();
