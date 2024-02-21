let express = require('express');
let axios = require('axios');
let Services = require('./service');

let homeRoute = express.Router();
let chatRoute = express.Router();

homeRoute.get('/dashboard', async (req, res) => {
  try {
    let user_id = req.session.user_id;
    let user = req.session.user_nickname;
    let token = req.session.token;
    req.session.message = '';

    if (!user_id) {
      res.redirect('/login');
    } else {
      let response = await axios.get(
        `http://localhost:5000/api/v1/user/dashboard?id=${user_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let users = response.data.users;

      res.render('index', { user, user_id, users });
    }
  } catch (err) {
    console.log(err);
    res.redirect('/login');
  }
});

chatRoute.post('/chat_msg', async (req, res) => {
  let req_data = { ...req.body };
  let service = new Services();
  let resp = await service.chat_msg(req_data);
  res.status(resp.status).json(resp);
});

// I dont need this
chatRoute.get('/new_chat_id', async (req, res) => {
  let data = { ...req.query };
  let service = new Services();
  let resp = await service.new_chat_id(data);
  res.status(resp.status).json(resp);
});

module.exports = { homeRoute, chatRoute };
