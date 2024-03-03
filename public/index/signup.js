const form = document.querySelector('form');
const nick_name = document.querySelector('.nicknameErr');
const full_name = document.querySelector('.fullnameErr');
const email_err = document.querySelector('.emailErr');
const pwd_err = document.querySelector('.pwdErr');

//// To disable the button /////
let clickDisable = false;
///// ----- Register/New User script ----- /////
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  //clear the error message
  nick_name.textContent = '';
  full_name.textContent = '';
  email_err.textContent = '';
  pwd_err.textContent = '';

  if (clickDisable) {
    return;
  }

  clickDisable = true;
  //query the form ID
  let nickname = document.querySelector('#nickname').value.trim();
  let fullname = document.querySelector('#fullname').value.trim();
  let image = document.querySelector('#image').files[0];
  let email = document.querySelector('#email').value.trim();
  let password = document.querySelector('#password').value.trim();

  // Create FormData object to handle form data
  let formData = new FormData();
  formData.append('nickname', nickname);
  formData.append('fullname', fullname);
  formData.append('email', email);
  formData.append('image', image);
  formData.append('password', password);

  // To validate if input is omitted by the users
  if (!nickname || !fullname || !image || !email || !password) {
    pwd_err.textContent = 'Kindly enter all required field';

    clickDisable = false;
    return;
  }

  ///////--------To look for a better later inorder to reduce the long line of code--------//////////

  //Validate User firstName for numbers
  // The reg exp is not working well
  function validatenickname(nickname) {
    const regex = /[0-9!@#$%^&*()_+-=[]{};':"|\\,.<>/;
    // const regex = /^[a-zA-Z]+$/;
    return regex.test(nickname);
  }

  // To validate if nickname for numbers
  if (validatenickname(nickname)) {
    nick_name.textContent = 'Only alphabet is allowed';

    clickDisable = false;
    return;
  }

  //Validate User fullname for numbers
  function validatefullname(fullname) {
    const regex = /[0-9!@#$%^&*()_+-=[]{};':"|\\,.<>/;
    return regex.test(fullname);
  }

  // To validate if fullname for numbers
  if (validatefullname(fullname)) {
    full_name.textContent = 'Only alphabet is allowed';

    clickDisable = false;
    return;
  }

  //Validate if User email is valid
  function validateForm(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  }

  // To validate if email is valid
  if (validateForm(email)) {
    // console.log(Email is valid);
  } else {
    email_err.textContent = 'enter a valid email';

    clickDisable = false;
    return;
  }
  ///////--------To look for a better later inorder to reduce the long line of code between the comment line--------//////////

  ////Send data to the server
  try {
    let response = await axios.post('/api/v1/sign_up', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    let status = response.data.message.status;
    let message = response.data.message.message;

    let errMsg1 = 'This email has been used';
    let errMsg2 = 'All field must be filled';

    if (message === errMsg2 && status === 404) {
      pwd_err.textContent = message;

      clickDisable = false;
      return;
    } else if (message === errMsg1 && status === 200) {
      email_err.textContent = message;

      clickDisable = false;
      return;
    } else {
      location.assign('/dashboard');
    }
  } catch (err) {
    console.log(err);
  }
});
