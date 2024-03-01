let express = require('express');
let axios = require('axios');
let Service = require('./service');

let loginRoute = express.Router();
let signinRoute = express.Router();
let signoutRoute = express.Router();

// render the login page
loginRoute.get('/login', async (req, res) => {
  try {
    let user_id = req.session.user_id;

    if (user_id) {
      res.redirect('/dashboard');
    } else {
      res.render('login');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/login');
  }
});

// the login route
signinRoute.post('/user_login', async (req, res) => {
  let data = { ...req.body };
  let service = new Service();
  let resp = await service.user_login(data);
  if (resp.status === 400) {
    res.status(resp.status).json(resp);
  } else if (resp.status === 404) {
    res.status(resp.status).json(resp);
  } else {
    req.session.user_nickname = resp.message.data.nickname;
    req.session.user_id = resp.message.data._id;
    req.session.token = resp.message.token;
    res.status(resp.status).json(resp);
  }
});

// the logout route
signoutRoute.get('/logout', async (req, res) => {
  req.session.user_id = '';

  req.session.message = '';

  res.redirect('/login');
});

module.exports = { loginRoute, signinRoute, signoutRoute };
