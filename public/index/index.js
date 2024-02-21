let receiver_id;

let senderId = document.querySelector('.sender-id');
let sender_id = senderId.getAttribute('id');

let socket = new WebSocket('ws://localhost:3000', [sender_id]);

document.addEventListener('DOMContentLoaded', function () {
  $(document).ready(function () {
    $('.user-list').click(function () {
      let userId = $(this).attr('data-id');
      receiver_id = userId;
      $('.start-head').hide();
      $('.chat-section').show();

      let data = { sender_id: sender_id, receiver_id: receiver_id };

      socket.send(JSON.stringify({ load_chat: 'load_chat', data }));
    });
  });

  //chat save of user
  $('#chat-form').submit(async function (event) {
    event.preventDefault();

    let message = $('#message').val();

    let data = {
      sender_id: sender_id,
      receiver_id: receiver_id,
      message: message,
    };

    // send to websocket
    socket.send(JSON.stringify({ send_chat: 'send_chat', data }));

    // Reset the form
    $('#chat-form')[0].reset();

    // scroll down function
    scrollChat();
  });

  // Connection opened
  socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened');
  });

  // Listen for messages
  socket.addEventListener('message', (event) => {
    // console.log(`Message from server: ${event.data}`);

    var data = JSON.parse(event.data, 'what we have inside');

    let status = data.payload.status;

    console.log(data);
    console.log(status, 'This is for the update');

    if (status === 'online') {
      var user_id = data.payload.user_id;

      var status_state = document.getElementById(user_id + '-status');

      if (status_state) {
        status_state.textContent = 'Online';
        status_state.classList.remove('offline-status');
        status_state.classList.add('online-status');
      }
    } else if (status === 'offline') {
      var user_id = data.payload.user_id;

      var status_state = document.getElementById(user_id + '-status');

      if (status_state) {
        status_state.textContent = 'Offline';
        status_state.classList.remove('online-status');
        status_state.classList.add('offline-status');
      }
    } else if (status === 'load_chats') {
      // dynamically inject the data into the chat div
      $('#chat-container').html('');

      let html = '';

      let chats = data.payload.chats;

      for (let chat of chats) {
        let addClass = '';
        //loop through the chat array
        if (chat.sender_id === sender_id) {
          addClass = 'current-user-chats';
        } else {
          addClass = 'distance-user-chats';
        }

        html +=
          `<div class='` +
          addClass +
          `' id='` +
          chat._id +
          `'>
          <h5>` +
          chat.message +
          ``;

        if (chat.sender_id === sender_id) {
          html +=
            `  <i class="fa fa-edit" aria-hidden="true" data-id='` +
            chat._id +
            `'data-toggle='modal' data-target="#editChatModal"></i>`;

          html +=
            `<i class="fa fa-trash" aria-hidden="true" data-id='` +
            chat._id +
            `'data-toggle='modal' data-target="#deleteChatModal"></i>`;
        }

        html += `</h5>
           </div>
         `;
      }
      $('#chat-container').append(html);
      //Scroll function
      scrollChat();
    } else if (status === 'chat_received') {
      let chat = data.payload.message;
      let chat_id = data.payload.new_msg._id;

      let html =
        `
          <div class="distance-user-chats" id="` +
        chat_id +
        `">
            <h5>` +
        chat +
        `</h5>
          </div>
           `;
      $('#chat-container').append(html);
      // scroll down function
      scrollChat();
    } else if (status === 'sender_chat') {
      let chat = data.payload.new_msg.message;
      let chat_id = data.payload.new_msg._id;

      let html =
        `<div class="current-user-chats" id="` +
        chat_id +
        `">
        <h5>` +
        chat +
        `  <i class="fa fa-edit" aria-hidden="true" data-id='` +
        chat_id +
        `'data-toggle='modal' data-target="#editChatModal"></i>
          <i class="fa fa-trash" aria-hidden="true" data-id='` +
        chat_id +
        `'data-toggle='modal' data-target="#deleteChatModal"></i>

        </h5>
            </div>
             `;
      $('#chat-container').append(html);

      // scroll down function
      scrollChat();
    } else if (status === 'update_recipient_chat') {
      let chat_id = data.payload.new_msg._id;
      let message = data.payload.new_msg.message;

      // Using jQuery to get the ID and update the element
      let new_msg = $('#' + chat_id).html('');

      let html =
        `
          <div class="distance-user-chats" id="` +
        chat_id +
        `">
            <h5>` +
        message +
        `</h5>
          </div>
           `;
      //  append the new updated message
      new_msg.append(html);
    } else if (status === 'update_sender_chat') {
      let chat_id = data.payload.new_msg._id;
      let message = data.payload.new_msg.message;

      // Using jQuery to get the ID and update the element
      let new_msg = $('#' + chat_id).html('');

      let html =
        `<div class="current-user-chats" id="` +
        chat_id +
        `">
        <h5>` +
        message +
        `  <i class="fa fa-edit" aria-hidden="true" data-id='` +
        chat_id +
        `'data-toggle='modal' data-target="#editChatModal"></i>
          <i class="fa fa-trash" aria-hidden="true" data-id='` +
        chat_id +
        `'data-toggle='modal' data-target="#deleteChatModal"></i>

        </h5>
            </div>
             `;
      //  append the new updated message
      new_msg.append(html);
    } else if (status === 'chat_deleted') {
      let chat_id = data.payload.chat_id;

      // using jquery to get  id & delete the element and delete it
      $('#' + chat_id).remove();

      // using javascript to get delete the element and delete it
      // get_element = document.getElementById(chat_id);
      // get_element.remove();
    }
  });

  // modal function to delete a chat
  $(document).on('click', '.fa-trash', function () {
    let msg = $(this).parent().text();

    $('#delete-message').text(msg);

    $('#delete-message-id').val($(this).attr('data-id'));
  });

  // Send to the server to delete user selected chat
  $('#delete-chat-form').submit(function (event) {
    event.preventDefault();
    let delete_chat_id = $('#delete-message-id').val();

    // Send to the server
    let data = {
      id: delete_chat_id,
      sender_id: sender_id,
      receiver_id: receiver_id,
    };

    socket.send(JSON.stringify({ delete_chat: 'delete_chat', data }));

    // jquery of deleting element
    $('#' + data.id).remove();

    // javascript of deleting element
    // get_element = document.getElementById(delete_chat_id);
    // get_element.remove();

    $('#deleteChatModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').hide();
    // $('.modal fade').hide();
  });

  // modal function to delete a chat
  $(document).on('click', '.fa-edit', function () {
    let msg = $(this).parent().text().trim();

    $('#edit-message').val(msg);

    $('#edit-message-id').val($(this).attr('data-id'));
  });

  // Send to the server to edit and update user selected chat
  $('#edit-chat-form').submit(function (event) {
    event.preventDefault();
    let edit_chat_id = $('#edit-message-id').val();
    let new_text = $('#edit-message').val().trim();

    // Send to the server
    let data = {
      id: edit_chat_id,
      message: new_text,
      sender_id: sender_id,
      receiver_id: receiver_id,
    };

    socket.send(JSON.stringify({ edit_chat: 'edit_chat', data }));

    $('#editChatModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').hide();
    // $('.modal fade').hide();
  });
});

// Connection closed
socket.addEventListener('close', (event) => {
  console.log(`WebSocket connection closed: ${event.data}`);
});

//Scroll function
function scrollChat() {
  var chatContainer = document.getElementById('chat-container');

  // Calculate the target scroll position
  var targetScroll = chatContainer.scrollHeight;

  // Scroll to the bottom
  chatContainer.scrollTop = targetScroll;
}
