//Join Group script
$('.join-now').on('click', async function () {
  try {
    $(this).text('Wait...');
    $(this).attr('disabled', 'disabled');

    let group_id = $(this).attr('data-id');

    let data = {
      group_id: group_id,
    };

    // Send to the server exist
    let resp = await axios.post('/api/v1/member/join_member', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let status = resp.data.status;

    if (status === 201) {
      alert('Congratulation you have joined the group successfully');
      location.reload();
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
