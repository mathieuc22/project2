document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, configure buttons
  socket.on('connect', () => {
    // Send content of the input text on submit
    document.querySelector('#form-username').onsubmit = () => {
      const username = document.querySelector('#username').value;
      const room = 'General';
      document.querySelector('#General').checked = true;
      //document.querySelector('#current-room').innerHTML = `Current room: ${room}`;
      socket.emit('join', {'username': username, 'room': room});

      // Stop form from submitting
      return false;
    };

    // Each button should emit a "submit vote" event
    document.querySelectorAll('[data-room]').forEach(button => {

      button.onclick = () => {
          const username = document.querySelector('#username').value;
          const room = button.dataset.room;
          console.log(room)
          document.querySelector('.msg_history').innerHTML='';
          socket.emit('join', {'username': username, 'room': room});
      };
    });

  });

  // Send content of the input text on submit
  document.querySelector('#form-msg').onsubmit = () => {
    var msg = document.querySelector('#message').value;
    const room = document.querySelector('[name="options"]:checked').dataset.room;
    document.querySelector('#message').value= '';
    socket.emit('send message', {'msg': msg, 'room': room});

    // Stop form from submitting
    return false;
  };

  // When a new vote is announced, add to the unordered list
  socket.on('broadcast message', data => {
    console.log(`Broadcast in ${socket.rooms}`);

    const username = document.querySelector('#username').value;
    const d0 = document.querySelector('.msg_history');
    const d1 = document.createElement('div');
    //const s = document.createElement('span');

    var today = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date = months[today.getMonth()]+' '+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes();
    var dateTime = date+' | '+time;

    if (username != data.username) {
      d1.setAttribute('class', 'alert w-75 alert-dark');
      d1.innerHTML = `${data.username}: ${data.msg}`;
    } else {
      d1.setAttribute('class', 'alert w-75 ml-auto alert-info text-right');
      d1.innerHTML = data.msg;
    }

    d0.appendChild(d1);
    //s.setAttribute('class', 'time_date');
    //s.innerHTML =dateTime;
    //d1.appendChild(s);

    d0.scrollTop = d0.scrollHeight;
  });

});
