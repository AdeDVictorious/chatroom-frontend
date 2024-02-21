const register = document.querySelector('#register');
const nickname = document.querySelector('.nickname');
const fullname = document.querySelector('.fullname');
const signUp = document.querySelector('.signUp');
let signUpEmail = document.querySelector('.signUpEmail');

//// To disable the button /////
let clickDisable = false;
///// ----- Register/New User script ----- /////
register.addEventListener('click', async (e) => {
  e.preventDefault();
  //clear the error message
  nickname.textContent = '';
  fullname.textContent = '';
  signUp.textContent = '';
  signUpEmail.textContent = '';
  signUpNumber.textContent = '';

  if (clickDisable) {
    return;
  }

  clickDisable = true;
  //query the form ID
  let nickname = document.querySelector('#nickname').value.trim();
  let fullname = document.querySelector('#fullname').value.trim();
  let image = document.querySelector('#image').value.trim();
  let email = document.querySelector('#email').value.trim();
  let password = document.querySelector('#password').value.trim();

  // To validate if input is omitted by the users
  if (!nickname || !fullname || !image || !email || !password) {
    signUp.textContent = 'Kindly enter all required field';

    clickDisable = false;
    return;
  }

  ///////--------To look for a better way to do this later--------//////////
  //Validate User Nickname for non-alphabet
  function validatenickname(nickname) {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(nickname);
  }

  if (validatenickname(nickname)) {
    // The input contains only alphabet letters
  } else {
    // The input contains non-alphabet characters
    nickname.textContent = 'only alphabet is allowed';

    clickDisable = false;
    return;
  }

  // //Validate User fullname for non-alphabet
  function validatefullname(fullname) {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(fullname);
  }

  if (validatefullname(fullname)) {
    // The input contains only alphabet letters
  } else {
    // The input contains non-alphabet characters
    fullname.textContent = 'only alphabet is allowed';

    clickDisable = false;
    return;
  }
  ///////--------To look for a better later inorder to reduce the long line of code--------//////////

  //Validate User firstName for numbers
  function validatenickname(nickname) {
    const regex = /^-?\d+(\.\d+)?$/;
    // const regex = /^[a-zA-Z]+$/;
    return regex.test(nickname);
  }

  // To validate if nickname for numbers
  if (validatenickname(nickname)) {
    nickname.textContent = 'Only alphabet is allowed';

    clickDisable = false;
    return;
  }

  //Validate User fullname for numbers
  function validatefullname(fullname) {
    const regex = /^-?\d+(\.\d+)?$/;
    return regex.test(fullname);
  }

  // To validate if fullname for numbers
  if (validatefullname(fullname)) {
    last_Name.textContent = 'Only alphabet is allowed';

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
    signUpEmail.textContent = 'enter a valid email';

    clickDisable = false;
    return;
  }

  ////Send data to the server
  let data = {
    nickname: nickname,
    fullname: fullname,
    image: image,
    email: email,
    password: password,
  };

  try {
    let response = await axios.post('/api/v1/signup/new_user', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(response.data, 'Am inside the data');

    let status = response.data.message.result.status;
    let message = response.data.message.result.message;

    let errMsg1 = 'This email has been used';
    let errMsg2 = 'All field must be filled';
    let errMsg3 = 'Kindly confirm your phone number';

    if (message === errMsg2 && status === 404) {
      signUp.textContent = message;

      clickDisable = false;
      return;
    } else if (message === errMsg3 && status === 404) {
      signUpNumber.textContent = message;

      clickDisable = false;
      return;
    } else if (message === errMsg2 && status === 404) {
      signUp.textContent = message;

      clickDisable = false;
      return;
    } else if (message === errMsg1 && status === 404) {
      signUpEmail.textContent = message;

      clickDisable = false;
      return;
    } else {
      location.assign('/');
    }
  } catch (err) {
    console.log(err);

    let netwkErr = err.config.message;

    if (netwkErr) {
      signUp.textContent = 'Network error, try again later';

      clickDisable = false;

      location.href = '/error-page';
    }
  }
});
