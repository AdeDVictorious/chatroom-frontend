// for user to user chat
let receiver_id;

// for users in group chat
let group_id;
let creator_id;

let senderId = document.querySelector('.sender-id');
let sender_id = senderId.getAttribute('id');

let socket = new WebSocket(`ws://localhost:3000?user_id=${sender_id}`);

document.addEventListener('DOMContentLoaded', function () {
  // // ------- Personal chat section ----------//
  // This is for user one to one chat
  $(document).ready(function () {
    $('.user-list').click(function () {
      let userId = $(this).attr('data-id');
      receiver_id = userId;
      $('.start-head').hide();
      $('.chat-section').show();

      console.log(receiver_id, sender_id, 'What do we have here');

      let data = { sender_id: sender_id, receiver_id: receiver_id };

      socket.send(JSON.stringify({ load_chat: 'load_chat', data }));
    });
  });

  //save user to user chat (i.e. one to one message)
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

  // // ------- Group chat section ----------//
  // This is for user chat in a group chatroom
  $(document).ready(function () {
    $('.group-list').click(function () {
      // Get the group_id
      let groupId = $(this).attr('data-id');
      group_id = groupId;

      // get the myGroup_id and JoinedGroup_id
      let creatorId = $(this).attr('id');
      creator_id = creatorId;

      console.log(creator_id, '@creator_id');

      $('.group-start-head').hide();
      $('.group-chat-section').show();

      let data = { group_id: group_id };

      socket.send(JSON.stringify({ load_group_chat: 'load_group_chat', data }));
    });
  });

  //save user chat sent in a group
  $('#group-chat-form').submit(async function (event) {
    event.preventDefault();

    let message = $('#group-message').val();

    // format data to send to the backend
    let data = {
      sender_id: sender_id,
      group_id: group_id,
      message: message,
      creator_id: creator_id,
    };

    console.log(data, 'Data');

    // send to websocket
    socket.send(JSON.stringify({ send_group_chat: 'send_group_chat', data }));

    // Reset the form
    $('#group-chat-form')[0].reset();
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
    } else if (
      status === 'chat_received' &&
      receiver_id === data.payload.sender
    ) {
      let chat = data.payload.message;
      let chat_id = data.payload.new_msg._id;

      console.log(chat_id, 'chat_id');

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
    } else if (status === 'load_group_chats') {
      // dynamically inject the data into the chat div
      $('#group-chat-container').html('');

      let html = '';

      let chats = data.payload.chats;

      for (let chat of chats) {
        let addClass = '';
        //loop through the chat array
        if (chat.sender_id._id === sender_id) {
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

        if (chat.sender_id._id === sender_id) {
          html +=
            `  <i class="fa fa-edit editGroupChat" aria-hidden="true" data-id='` +
            chat._id +
            `'data-toggle='modal' data-target="#editGroupChatModal"></i>`;

          html +=
            `<i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='` +
            chat._id +
            `'data-toggle='modal' data-target="#deleteGroupChatModal"></i>`;
        }

        html += `</h5>`;

        let date = new Date(chat.createdAt);
        let cDate = date.getDate();
        let cMonth =
          date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : '0' + (date.getMonth() + 1);

        let cYear = date.getFullYear();
        let getFullDate = cDate + '-' + cMonth + '-' + cYear;

        if (chat.sender_id._id === sender_id) {
          html +=
            `
          <div class="user-data "><b>Me </b> ` +
            getFullDate +
            `</div>
          `;
        } else {
          html +=
            `
          <div class="user-data ">
            <img src="` +
            chat.sender_id.image +
            `"width="25px" height="25px">
          <b>` +
            chat.sender_id.nickname +
            ` </b> ` +
            getFullDate +
            `</div>
          `;
        }
        html += `
           </div>
         `;
      }
      $('#group-chat-container').append(html);
      //Scroll function
      scroll_group_chat();
    } else if (
      status === 'group_chat_received' &&
      group_id === data.payload.group_id
    ) {
      let chat = data.payload.message;
      let chat_id = data.payload.new_msg._id;
      let chat_sender_id = data.payload.sender_id;
      let chats = data.payload.new_msg;

      let date = new Date(chats.createdAt);
      let cDate = date.getDate();
      let cMonth =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : '0' + (date.getMonth() + 1);

      let cYear = date.getFullYear();
      let getFullDate = cDate + '-' + cMonth + '-' + cYear;

      if (sender_id === chat_sender_id) {
        let html =
          `<div class="current-user-chats" id="` +
          chat_id +
          `">
      <h5>` +
          chat +
          `  <i class="fa fa-edit editGroupChat" aria-hidden="true" data-id='` +
          chat_id +
          `'data-toggle='modal' data-target="#editGroupChatModal"></i>
         <i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='` +
          chat_id +
          `'data-toggle='modal' data-target="#deleteGroupChatModal"></i>`;

        html += `</h5>`;

        if (sender_id === chat_sender_id) {
          html +=
            `
              <div class="user-data "><b>Me </b> ` +
            getFullDate +
            `</div>
              `;
        }
        $('#group-chat-container').append(html);

        // scroll down function
        scroll_group_chat();
      } else {
        let html =
          `
          <div class="distance-user-chats" id="` +
          chat_id +
          `">
            <h5> <span>` +
          chat +
          `</span></h5>`;

        html +=
          `
        <div class="user-data ">
          <img src="` +
          chats.sender_id.image +
          `"width="25px" height="25px">
        <b>` +
          chats.sender_id.nickname +
          ` </b> ` +
          getFullDate +
          `</div>
        `;
        html += `
        </div>
      `;

        $('#group-chat-container').append(html);
        // scroll down function
        scroll_group_chat();
      }
    } else if (status === 'updateGroup_recipient_chat') {
      let chat_id = data.payload.new_msg._id;
      let message = data.payload.new_msg.message;
      let chat_sender_id = data.payload.new_msg.sender_id._id;
      let chats = data.payload.new_msg;

      let date = new Date(chats.createdAt);
      let cDate = date.getDate();
      let cMonth =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : '0' + (date.getMonth() + 1);

      let cYear = date.getFullYear();
      let getFullDate = cDate + '-' + cMonth + '-' + cYear;

      if (sender_id === chat_sender_id) {
        // Using jQuery to get the ID and update the element
        let new_msg = $('#' + chat_id).html('');

        let html =
          `<div class="current-user-chats" id="` +
          chat_id +
          `">
          <h5>` +
          message +
          `  <i class="fa fa-edit editGroupChat" aria-hidden="true" data-id='` +
          chat_id +
          `'data-toggle='modal' data-target="#editGroupChatModal"></i>
            <i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='` +
          chat_id +
          `'data-toggle='modal' data-target="#deleteGroupChatModal"></i>`;

        html += `</h5>`;

        html +=
          `
          <div class="user-data "><b>Me </b> ` +
          getFullDate +
          `</div>
          `;
        //  append the new updated message
        new_msg.append(html);
      } else {
        // Using jQuery to get the ID and update the element
        let new_msg = $('#' + chat_id).html('');

        let html =
          `
          <div class="distance-user-chats" id="` +
          chat_id +
          `">
            <h5><span> ` +
          message +
          `</span></h5>`;

        html +=
          `
        <div class="user-data ">
          <img src="` +
          chats.sender_id.image +
          `">
        <b>` +
          chats.sender_id.nickname +
          ` </b> ` +
          getFullDate +
          `</div>
        `;
        html += `
        </div>
      `;
        //  append the new updated message
        new_msg.append(html);
      }
    }
  });

  ///// ------- User to User Chat Section ----------/////
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
  });

  ///// ------- Group Chat Section ----------/////
  // modal function to delete group chat
  $(document).on('click', '.deleteGroupChat', function () {
    let msg = $(this).parent().text();

    $('#delete-group-message').text(msg);

    $('#delete-group-message-id').val($(this).attr('data-id'));
  });

  // Send to the server to delete group selected chat
  $('#delete-group-chat-form').submit(function (event) {
    event.preventDefault();
    let delete_chat_id = $('#delete-group-message-id').val();

    // Send to the server
    let data = {
      id: delete_chat_id,
      sender_id: sender_id,
      group_id: group_id,
      creator_id: creator_id,
    };

    socket.send(
      JSON.stringify({ delete_group_chat: 'delete_group_chat', data })
    );

    // jquery of deleting selected element
    $('#' + data.id).remove();

    $('#deleteGroupChatModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').hide();
  });

  // modal function to delete a chat
  $(document).on('click', '.editGroupChat', function () {
    let msg = $(this).parent().text().trim();

    $('#edit-group-message').val(msg);

    $('#edit-group-message-id').val($(this).attr('data-id'));
  });

  // Send to the server to edit and update group selected chat
  $('#edit-group-chat-form').submit(function (event) {
    event.preventDefault();
    let edit_chat_id = $('#edit-group-message-id').val();
    let new_text = $('#edit-group-message').val().trim();

    // Send to the server
    let data = {
      id: edit_chat_id,
      message: new_text,
      sender_id: sender_id,
      group_id: group_id,
      creator_id: creator_id,
    };

    socket.send(JSON.stringify({ edit_group_chat: 'edit_group_chat', data }));

    $('#editGroupChatModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').hide();
  });
});

// Connection closed
socket.addEventListener('close', (event) => {
  console.log(`WebSocket connection closed: ${event.data}`);
});

//Scroll function for personal chat
function scrollChat() {
  var chatContainer = document.getElementById('chat-container');

  // Calculate the target scroll position
  var targetScroll = chatContainer.scrollHeight;

  // Scroll to the bottom
  chatContainer.scrollTop = targetScroll;
}

// // ------- Group chat section ----------//
//Scroll function for group chat
function scroll_group_chat() {
  var chatContainer = document.getElementById('group-chat-container');

  // Calculate the target scroll position
  var targetScroll = chatContainer.scrollHeight;

  // Scroll to the bottom
  chatContainer.scrollTop = targetScroll;
}

// chat link copy function
$('.copy').click(function () {
  let chat_link = document.querySelector('#chat_link');

  chat_link.textContent = '';
  $(this).prepend('<span class = "copied_text">Copied</span>');

  let my_id = sender_id;
  let url = window.location.host + '/chat_me_link/' + my_id;

  let temp = $('<input>');
  $('body').append(temp);
  temp.val(url).select();
  document.execCommand('copy');

  temp.remove();

  setTimeout(() => {
    $('.copied_text').remove();

    chat_link.textContent = 'Copy chat link';
  }, 2000);
});
