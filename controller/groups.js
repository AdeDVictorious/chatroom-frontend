let express = require('express');
let uploadImage = require('../middleware/uploadImage');
let axios = require('axios');
let Services = require('./service');

let group_Route = express.Router();
let groupchat_Route = express.Router();

// render group page
group_Route.get('/groups', async (req, res) => {
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
      res.render('groups', { message, groups });
    }
  } catch (err) {
    console.log(err);
  }
});

// render share_group link page
group_Route.get('/shared_group/:id', async (req, res) => {
  try {
    let payload = { ...req.params };

    let user_id = req.session.user_id;
    let token = req.session.token;
    req.session.message = '';

    if (!user_id) {
      res.redirect('/login');
    } else {
      // check all group members using group_ids
      let response = await axios.get(
        `http://localhost:5000/api/v1/members/check_member/${payload.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );
 
      let groupData = response.data.groupData;

      let total_members = response.data.total_members;
      let available = response.data.available;
      let isJoined = response.data.isJoined;
      let isOwner = response.data.isOwner;
      let message = response.data.message;

      if (!groupData) {
        res.render('error', { message: '404 not found ' });
      } else if (user_id == undefined) {
        res.render('error', {
          message: 'You need to login inorder to access the shared URL',
        });
      } else {
        // render the group page
        res.render('shared_link', {
          group: groupData,
          available,
          total_members,
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

// post/create a group chat
groupchat_Route.post(
  '/group_msg',
  uploadImage.single('image'),
  async (req, res) => {
    let req_data = { ...req.body, ...req.file, ...req.session };
    let service = new Services();
    let resp = await service.group_chat(req_data);
    if (resp.status === 201) {
      // let msg = resp.data.message;
      let group_name = resp.data.new_group.name;
      req.session.message =
        group_name + ' ' + 'this group was created successfully';
      res.status(resp.status).json(resp);
    } else {
      res.status(resp.status).json(resp);
    }
  }
);

// Update a group chat
groupchat_Route.put(
  '/update_group',
  uploadImage.single('image'),
  async (req, res) => {
    let payload = { ...req.body, ...req.file, ...req.session };
    let service = new Services();
    let resp = await service.updateGroup_ById(payload);
    res.status(resp.status).json(resp);
  }
);

// Delete a group chat
groupchat_Route.delete('/deleteGroup/:id', async (req, res) => {
  let payload = { ...req.params, ...req.session };
  let service = new Services();
  let resp = await service.deleteGroup_ById(payload);
  if (resp.status === 204) {
    req.session.message = '';
    res.status(resp.status).json(resp);
  } else {
    res.status(resp.status).json(resp);
  }
});

// Delete a group chat image
groupchat_Route.delete('/deleteImage', async (req, res) => {
  let payload = { ...req.query };
  let service = new Services();
  let resp = await service.deleteGroup_Image(payload);
  res.status(resp.status).json(resp);
});

module.exports = { group_Route, groupchat_Route };
