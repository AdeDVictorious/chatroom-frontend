document.addEventListener('DOMContentLoaded', () => {
  const ws = new WebSocket('ws://localhost:5000'); // Change the URL to match your WebSocket server address

  // Event listener for when the WebSocket connection is opened
  ws.addEventListener('open', () => {
    console.log('User is online');
  });

  // Event listener for when a message is received from the server
  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    console.log(JSON.parse(event.data));
    console.log(data.jsonData);
    displayMessage(data);

    // Implement this function to display the message in the chat window
  });

  // Event listener for when the WebSocket connection is closed
  ws.addEventListener('close', () => {
    console.log('User is offline');
  });

  // Event listener for the new chat form submission
  document.querySelector('.new-chat').addEventListener('submit', (event) => {
    event.preventDefault();
    const messageInput = document.querySelector('#message');
    const message = messageInput.value.trim();

    if (message !== '') {
      const chatroom = getCurrentChatroom(); // Implement this function to get the current chatroom

      // To delete this later
      const name = 'AdeDVictorious'; // Implement this function to get the current user's name

      // const name = getCurrentName(); // Implement this function to get the current user's name

      const data = {
        chatroom,
        name,
        message,
      };

      ws.send(JSON.stringify(data));
      messageInput.value = '';
    }
  });

  // Event listener for the update name form submission
  document.querySelector('.new-name').addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name');
    const newName = nameInput.value.trim();

    if (newName !== '') {
      // Implement logic to update the user's name on the server (if needed)
      // You can emit a specific message to the server to update the name
      // For example: socket.send(JSON.stringify({ action: 'updateName', newName }));
      document.querySelector('.update-mssg').innerText =
        'Name updated successfully';
      nameInput.value = '';
    }
  });

  // You may want to implement functions like displayMessage, getCurrentChatroom, and getCurrentName
  function getCurrentChatroom() {
    const buttons = document.querySelectorAll('.chat-rooms btn');

    for (const button of buttons) {
      button.addEventListener('click', () => {
        const currentChatroom = getCurrentName(button);
        // Perform actions with the current chatroom, e.g., update UI or fetch messages
        console.log(currentChatroom, '12345');
      });
    }

    // Return a default chatroom or handle the case when no chatroom is selected
    const defaultChatroom = 'general';
    const activeButton = document.querySelector('.chat-rooms btn.active');
    return activeButton ? getCurrentName(activeButton) : defaultChatroom;
  }

  // Function to get the current user's name from the update name form
  function getCurrentName() {
    let nameInput = document.getElementById('name');

    return nameInput.value.trim();
  }

  // Function to display a chat message in the chat list
  function displayMessage(data) {
    const chatList = document.querySelector('.chat-list');

    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const messageText = document.createElement('div');
    messageText.innerText = `${data.name}: ${data.message}`;

    listItem.appendChild(messageText);
    chatList.appendChild(listItem);
  }

  // to handle message display and retrieving the current chatroom and user's name.
  function handleMessage(data) {
    const { name, message, chatroom } = data;

    // Display the message in the chat window
    displayMessage({ name, message });

    // Update the current chatroom if needed
    updateCurrentChatroom(chatroom);

    // Retrieve the current user's name
    const currentName = getCurrentName();
    console.log("Current User's Name:", currentName);
  }

  // Helper function to update the current chatroom based on the received message
  function updateCurrentChatroom(chatroom) {
    const buttons = document.querySelectorAll('.chat-rooms button');

    for (const button of buttons) {
      button.classList.remove('active');
      if (button.id === '#' + chatroom) {
        button.classList.add('active');
      }
    }
  }

  // For simplicity, the above code assumes your server is running on ws://localhost:5000.
  // Make sure to replace it with the actual WebSocket server address.
});
