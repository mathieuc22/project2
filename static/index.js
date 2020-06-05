document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, configure buttons
  socket.on('connect', () => {
    // Send content of the input text on submit
    document.querySelector('#btn-username').onclick = () => {
      const username = document.querySelector('#username').value;
      const room = 'General';
      document.querySelector('#General').checked = true;
      //document.querySelector('#current-room').innerHTML = `Current room: ${room}`;
      socket.emit('join', {'username': username, 'room': room});
    };

    // Each button should emit a "submit vote" event
    document.querySelectorAll('[data-room]').forEach(button => {

      button.onclick = () => {
          const username = document.querySelector('#username').value;
          const room = button.dataset.room;
          console.log(room)
          document.querySelector('#msg_history').innerHTML='';
          socket.emit('join', {'username': username, 'room': room});
      };
    });

  });

  // Send content of the input text on submit
  document.querySelector('#send-msg').onclick = () => {
    var msg = document.querySelector('#message').value;
    const room = document.querySelector('[name="options"]:checked').dataset.room;
    document.querySelector('#message').value= '';
    socket.emit('send message', {'msg': msg, 'room': room});
  };

  // When a new vote is announced, add to the unordered list
  socket.on('broadcast message', data => {
    console.log(`Broadcast in ${socket.rooms}`);
    const username = document.querySelector('#username').value;
    const d0 = document.querySelector('#msg_history')
    const d1 = document.createElement('div');
    const dmsg = document.createElement('div');
    const p = document.createElement('p');
    const s = document.createElement('span');
    var today = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date = months[today.getMonth()]+' '+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes();
    var dateTime = date+' | '+time;

    if (username != data.username) {
      const d2 = document.createElement('div');
      d1.setAttribute('class', 'incoming_msg');
      d2.setAttribute('class', 'received_msg');
      dmsg.setAttribute('class', 'received_withd_msg');
      d0.appendChild(d1);
      d1.appendChild(d2);
      d2.appendChild(dmsg);
      p.innerHTML = `${data.username}: ${data.msg}`;
    } else {
      d1.setAttribute('class', 'outgoing_msg');
      dmsg.setAttribute('class', 'sent_msg');
      d0.appendChild(d1);
      d1.appendChild(dmsg);
      p.innerHTML = data.msg;
    }

    dmsg.appendChild(p);
    s.setAttribute('class', 'time_date');
    s.innerHTML =dateTime;
    dmsg.appendChild(s);

    d0.scrollTop = d0.scrollHeight;
  });

});
