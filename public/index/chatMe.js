// chat link copy function
$('.copy').click(function () {
  let chat_link = document.querySelector('#chat_link');

  chat_link.textContent = '';
  $(this).prepend('<span class = "copied_text">Copied</span>');

  let my_id = $(this).attr('data-id');
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

//Join Group script
$('.join-now').on('click', async function () {
  try {
    $(this).text('Wait...');
    $(this).attr('disabled', 'disabled');

    let contact_id = $(this).attr('data-id');

    let data = {
      contact_id: contact_id,
    };

    // Send to the server exist
    let resp = await axios.post('/api/v1/user/join_contact', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let status = resp.data.status;

    if (status === 201) {
      location.assign('/dashboard');
    } else if (status === 200) {
      location.assign('/dashboard');
    } else {
      alert(`${resp.data.data.message}`);
      location.reload();
    }
  } catch (error) {
    console.log(error);

    alert('Error adding to Group membership');

    $(this).text('Wait...');
    $(this).attr('disabled', 'disabled');
  }
});
