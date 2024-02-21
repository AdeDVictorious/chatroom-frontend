const login = document.querySelector('#login');
const add_email = document.querySelector('#email');
const add_password = document.querySelector('#password');
const emailErr = document.querySelector('.email-error');
const pwdErr = document.querySelector('.pwd-error');

//// To disable the button /////
let clickDisable = false;
///// ----- Login script ----- /////
login.addEventListener('click', async (e) => {
  e.preventDefault();
  //Clear the error message
  emailErr.textContent = ' ';
  pwdErr.textContent = ' ';

  if (clickDisable) {
    return;
  }

  clickDisable = true;

  let email = add_email.value.trim();
  let password = add_password.value.trim();

  if (!email || !password) {
    let message = 'All required field must be filled';
    pwdErr.textContent = message;

    clickDisable = false;
    return;
  }

  // Validate email input
  function validateForm(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  }

  if (validateForm(email)) {
  } else {
    let message = 'kindly enter a valid email address';
    emailErr.textContent = message;

    clickDisable = false;
    return;
  }

  //Send data to server
  let data = {
    email: email,
    password: password,
  };

  try {
    let response = await axios.post('/api/v1/user_login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let status = response.data.status;

    if (status === 200) {
      location.assign('/dashboard');
    }
  } catch (err) {
    // console.log(err);
    let message = err.response.data.message.message;
    let status = err.response.data.status;

    if (status === 404) {
      pwdErr.textContent = message;

      clickDisable = false;
    } else if (status === 400) {
      emailErr.textContent = message;
      clickDisable = false;
    } else {
      console.log(err);

      res.redirect('/login');

      clickDisable = false;
    }
  }
});
