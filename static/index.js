document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, configure buttons
  socket.on('connect', () => {

    const username = document.querySelector('#username').innerHTML;
    const room = 'General';
    // Log the connection
    console.log(`connect ${username} on room ${room}`);
    socket.emit('join', {'username': username, 'room': room});

    // Each button should emit a "submit vote" event
    document.querySelectorAll('[data-room]').forEach(button => {
      button.onclick = () => {
        document.querySelectorAll('[data-room]').forEach(button => {
          button.setAttribute('class', 'nav-link');
        });
        //const username = document.querySelector('#username').innerHTML;
        const room = button.dataset.room;
        button.setAttribute('class', 'nav-link active');
        // Log the connection
        console.log(`connect ${username} on room ${room}`);
        document.querySelector('.msg_history').innerHTML='';
        socket.emit('join', {'username': username, 'room': room});
      };
    });

  });

  // Send content of the input text on submit
  document.querySelector('#form-msg').onsubmit = () => {
    var msg = document.querySelector('#message').value;
    const room = document.querySelector('[data-room].active').dataset.room;
    document.querySelector('#message').value= '';
    socket.emit('send message', {'msg': msg, 'room': room});
    // Stop form from submitting
    return false;
  };

  // When a new vote is announced, add to the unordered list
  socket.on('broadcast message', data => {

    const username = document.querySelector('#username').innerHTML;
    const d0 = document.querySelector('.msg_history');
    const d1 = document.createElement('div');

    // Log the connection
    console.log(`current user ${username} message from ${data.username}`);
    if (username != data.username) {
      d1.setAttribute('class', 'alert alert-dark');
      d1.innerHTML = `${data.date} <br> ${data.username}: ${data.msg}`;
    } else {
      d1.setAttribute('class', 'alert ml-auto alert-info text-right');
      d1.innerHTML = `${data.date} <br> ${data.msg}`;
    }

    d0.prepend(d1);

  });

});
/* globals Chart:false, feather:false */

(function () {
  'use strict'

  feather.replace()

}())
