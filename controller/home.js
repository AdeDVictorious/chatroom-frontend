let express = require('express');
let axios = require('axios');
let Services = require('./service');

let homeRoute = express.Router();
let chatRoute = express.Router();
let my_profileRoute = express.Router();
let contactRoute = express.Router();

// render the dashboard
homeRoute.get('/dashboard', async (req, res) => {
  try {
    let user_id = req.session.user_id;
    let user = req.session.user_nickname;
    let token = req.session.token;
    req.session.message = '';

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

    if (!user_id) {
      res.redirect('/login');
    } else if (users.length > 0) {
      // let users = response.data.users;

      res.render('index', { user, user_id, users });
    } else {
      let resp = await axios.get(
        `http://localhost:5000/api/v1/user/getUser/${user_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let response = await axios.get(
        `http://localhost:5000/api/v1/contacts/check_contact/${user_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let userData = resp.data.get_user;
      let message = response.data.message;
      let isOwner = response.data.isOwner;
      let isJoined = response.data.isJoined;

      res.render('index', {
        user,
        user_id,
        users,
        userData,
        isOwner,
        isJoined,
        message,
      });
    }
  } catch (err) {
    console.log(err);
    res.redirect('/login');
  }
});

// render share_group link page
homeRoute.get('/chat_me_link/:id', async (req, res) => {
  try {
    let payload = { ...req.params };

    let user_id = req.session.user_id;
    let token = req.session.token;

    if (!user_id) {
      res.redirect('/login');
    } else {
      // check all group members using group_ids
      let response = await axios.get(
        `http://localhost:5000/api/v1/contacts/check_contact/${payload.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let userData = response.data.userData;

      let isJoined = response.data.isJoined;
      let isOwner = response.data.isOwner;
      let message = response.data.message;

      if (!userData) {
        res.render('error', { message: '404 not found ' });
      } else if (user_id == undefined) {
        res.render('error', {
          message: 'You need to login inorder to access the shared URL',
        });
      } else {
        // render the group page
        res.render('chat_me_link', {
          userData,
          isOwner,
          isJoined,
          message,
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

// render share_group link page
my_profileRoute.get('/my_profile', async (req, res) => {
  try {
    let user_id = req.session.user_id;
    let token = req.session.token;
    req.session.message = '';

    if (!user_id) {
      res.redirect('/login');
    } else {
      // check all group members using group_ids
      let response = await axios.get(
        `http://localhost:5000/api/v1/user/my_profile`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let userData = response.data.userData;

      let isOwner = response.data.isOwner;
      let message = response.data.message;
      let url = response.data.url;

      if (!userData) {
        res.render('error', { message: '404 not found ' });
      } else if (user_id == undefined) {
        res.render('error', {
          message: 'You need to login inorder to access the shared URL',
        });
      } else {
        // render the group page
        res.render('my_profile', {
          userData,
          isOwner,
          message,
          url,
        });
      }
    }
  } catch (err) {
    console.log(err);
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

// join group_member route
contactRoute.post('/join_contact', async (req, res) => {
  let payload = { ...req.body, ...req.session };
  let service = new Services();
  let resp = await service.join_contact_list(payload);
  res.status(resp.status).json(resp);
});

module.exports = { homeRoute, my_profileRoute, chatRoute, contactRoute };
