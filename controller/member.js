let express = require('express');
let uploadImage = require('../middleware/uploadImage');
let axios = require('axios');

let Services = require('./service');

let member_Route = express.Router();
let members_Route = express.Router();

member_Route.get('/groups', async (req, res) => {
  try {
    let user_id = req.session.user_id;
    let token = req.session.token;
    let message = req.session.message;

    if (!user_id) {
      res.redirect('/login');
    } else {
      let response = await axios.get(
        'http://localhost:5000/api/v1/group_chat/getAll_group',
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let groups = response.data.getAll_group;

      // render the group page
      res.render('groupChat', { message, groups });
    }
  } catch (err) {
    console.log(err);
    console.log(err.response.data);
  }
});

// get the users
members_Route.post('/get_members', async (req, res) => {
  let payload = { ...req.body, ...req.session };
  let service = new Services();
  let resp = await service.get_members(payload);
  res.status(resp.status).json(resp);
});

// add the users to become member
members_Route.post('/addMembers', async (req, res) => {
  let payload = req.body;
  let req_data = { ...req.session };
  let service = new Services();
  let resp = await service.add_members(payload, req_data);
  res.status(resp.status).json(resp);
});

// join group_member route
members_Route.post('/join_member', async (req, res) => {
  let payload = { ...req.body, ...req.session };
  let service = new Services();
  let resp = await service.join_members(payload);
  res.status(resp.status).json(resp);
});

module.exports = { member_Route, members_Route };
