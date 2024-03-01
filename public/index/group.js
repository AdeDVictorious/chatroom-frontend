let form = document.querySelector('form');

//adding of new group
form.addEventListener('submit', async function (e) {
  try {
    e.preventDefault(); // Prevent default form submission

    let group_name = document.querySelector('#group_name').value;
    let group_image = document.querySelector('#group_image').files[0];
    let group_limit = document.querySelector('#group_limit').value;

    // Create FormData object to handle form data
    let formData = new FormData();
    formData.append('name', group_name);
    formData.append('image', group_image);
    formData.append('limit', group_limit);

    // Make a POST request using Axios
    let response = await axios.post('/api/v1/group/group_msg', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    let status = response.data.status;

    console.log(response, 'this is what we have in response');

    if (status === 201) {
      location.assign('/groups');
    }
  } catch (error) {
    console.log(error);
    console.log(error.response.data, 'this is what we have in response');

    let status = error.response.data.message.status;
    let errMessage = error.response.data.message.message;

    if (status === 400) {
      let errMsg = document.querySelector('#modalError');

      errMsg.textContent = errMessage;

      setTimeout(() => {
        // Clear the error message
        errMsg.textContent = '';
      }, 5000);
    } else {
      location.assign('/dashboard');
    }
  }
});

// get_members function
$('.addMember').click(async function () {
  try {
    let id = $(this).attr('data-id');
    let limit = $(this).attr('data-limit');

    $('#group_id').val(id);
    $('#limit').val(limit);

    let data = {
      group_id: id,
    };

    // Make a POST request using Axios
    let response = await axios.post('api/v1/member/get_members', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let status = response.data.status;
    let users = response.data.data.users;

    console.log(users, 'this is status');

    if (status === 200) {
      let html = '';

      for (let user of users) {
        let isMemberOfGroup = user.member.length > 0 ? true : false;

        html +=
          `
          <tr>
                <td>
                <input type="checkbox" ` +
          (isMemberOfGroup ? 'checked' : '') +
          ` name="members[]" value="` +
          user._id +
          `" 
          </td>
          <td>` +
          user.nickname +
          `</td>          
          </tr>
        `;
      }
      $('.add_member_table').html(html);
    }
  } catch (error) {
    console.log(error);
  }
});

// add_members
$('#add_member_form').submit(async function (e) {
  try {
    e.preventDefault();

    let formData = $(this).serialize();

    // Function to convert serialized string to JSON object
    function convertFormDataToJson(formData) {
      const params = new URLSearchParams(formData);
      const json = {};

      params.forEach((value, key) => {
        if (key.endsWith('[]')) {
          const arrayKey = key.slice(0, -2);
          json[arrayKey] = json[arrayKey] || [];
          json[arrayKey].push(value);
        } else {
          json[key] = value;
        }
      });

      return json;
    }

    const jsonData = convertFormDataToJson(formData);

    if (!jsonData.members) {
      let formErr = document.getElementById('add_member_error');

      formErr.textContent = 'Kindly select atleast one member';

      setTimeout(() => {
        formErr.textContent = '';
        // return;
      }, 4000);
      return;
    } else if (jsonData.members.length > parseInt(jsonData.limit)) {
      // Send an error message
      let formErr = document.getElementById('add_member_error');

      formErr.textContent =
        'You cannot select more than ' + jsonData.limit + ' Members';

      setTimeout(() => {
        formErr.textContent = '';
      }, 4000);
      return;
    } else {
      // send to the server
      let response = await axios.post('/api/v1/member/addMembers', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      resp_status = response.data.status;
      resp_msg = response.data.data.message;

      if (resp_status === 201) {
        alert(resp_msg);
      }
      $('#memberModal').modal('hide');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').hide();
    }
  } catch (err) {
    console.log(err);
  }
});

// uodate_members function
$('.updateGroup').click(function () {
  let obj = JSON.parse($(this).attr('data-obj'));

  $('#update_group_id').val(obj._id);
  $('#last_limit').val(obj.limit);
  $('#groupName').val(obj.name);
  $('#groupLimit').val(obj.limit);
  $('#last_image_url').val(obj.image);
});

$('#updateChatGroupForm').submit(async function (e) {
  try {
    e.preventDefault();

    let group_id = $('#update_group_id').val();
    let group_name = $('#groupName').val().trim();
    let selected_image = $('#groupImage');
    let group_image = selected_image.prop('files')[0];
    let group_limit = $('#groupLimit').val().trim();
    let last_limit = $('#last_limit').val();
    let last_image_url = $('#last_image_url').val();

    // Create FormData object to handle form data
    let formData = new FormData();
    // formData.append('id', id);
    formData.append('group_id', group_id);
    formData.append('group_name', group_name);
    formData.append('image', group_image);
    formData.append('group_limit', group_limit);
    formData.append('last_limit', last_limit);
    formData.append('last_image', last_image_url);

    // Make a POST request using Axios
    let response = await axios.put('/api/v1/group/update_group', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    let status = response.data.status;

    if (status === 200) {
      alert(' Group was updated successfully');

      location.assign('/groups');
    }
  } catch (err) {
    console.log(err);
  }
});

// delete function
$('.deleteGroup').click(function () {
  let obj = JSON.parse($(this).attr('data-obj'));

  $('#last_image_url').val(obj.image);
  $('#delete_group_id').val($(this).attr('data-id'));
  $('#delete_group_name').text($(this).attr('data-name'));
});

$('#deleteGroupForm').submit(async function (e) {
  try {
    e.preventDefault();

    let id = $('#delete_group_id').val();
    let last_imgae = $('#last_image_url').val();

    // query params
    let resp = await axios.delete('/api/v1/group/deleteImage', {
      params: {
        last_Image: `${last_imgae}`,
      },
    });

    // Send to the server for deletion
    let response = await axios.delete(`/api/v1/group/deleteGroup/${id}`);

    let status = response.status;

    if (status === 204) {
      location.reload();
    }
  } catch (err) {
    console.log(err);
  }
});

// copy function
$('.copy').click(function () {
  $(this).prepend('<span class = "copied_text">Copied</span>');

  let group_id = $(this).attr('data-id');
  let url = window.location.host + '/shared_group/' + group_id;

  let temp = $('<input>');
  $('body').append(temp);
  temp.val(url).select();
  document.execCommand('copy');

  temp.remove();

  setTimeout(() => {
    $('.copied_text').remove();
  }, 2000);
});
