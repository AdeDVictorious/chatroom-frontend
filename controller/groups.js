let express = require('express');
let uploadImage = require('../middleware/uploadImage');
let axios = require('axios');

let Services = require('./service');

let group_Route = express.Router();
let group_chatRoute = express.Router();

// render page for group
group_Route.get('/groups', async (req, res) => {
  try {
    let user_id = req.session.user_id;
    // let user = req.session.user_nickname;
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

// render page for share_group link
group_Route.get('/shared_group/:id', async (req, res) => {
  try {
    let payload = { ...req.params };

    console.log(payload, 'what is inside the ID');

    let user_id = req.session.user_id;
    let token = req.session.token;
    req.session.message = '';

    if (!user_id) {
      res.redirect('/login');
    } else {
      // check if group exist
      let response = await axios.get(
        `http://localhost:5000/api/v1/group_chat/groupChat/${payload.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let groupData = response.data.get_Group;

      if (!groupData) {
        res.render('error', { message: '404 not found ' });
      } else if (user_id == undefined) {
        res.render('error', {
          message: 'You need to login inorder to access the shared URL',
        });
      } else {
        // check if group exist
        let response = await axios.get(
          `http://localhost:5000/api/v1/members/get_members/${payload.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${token}`,
            },
          }
        );

        let total_members = response.data.get_member;
        let avaliable = groupData.limit - total_members;

        let isOwner = groupData.creator_id == user_id ? true : false;

        // // check if group exist
        // let resp = await axios.get(
        //   'http://localhost:5000/api/v1/members/get_member',
        //   {
        //     headers: {
        //       'Content-Type': 'application/json',
        //       authorization: `Bearer ${token}`,
        //     },
        //   }
        // );

        let isJoined = response.data.get_mmber;

        // render the group page
        res.render('shared_link', {
          group: groupData,
          avaliable: avaliable,
          total_members,
          avaliable,
          isOwner,
          isJoined,
        });
      }
    }
  } catch (err) {
    console.log(err);
    console.log(err.response.data);
  }
});

// Create a group chat
group_chatRoute.post(
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
group_chatRoute.put(
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
group_chatRoute.delete('/deleteGroup/:id', async (req, res) => {
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
group_chatRoute.delete('/deleteImage', async (req, res) => {
  let payload = { ...req.query };
  let service = new Services();
  let resp = await service.deleteGroup_Image(payload);
  res.status(resp.status).json(resp);
});

module.exports = { group_Route, group_chatRoute };
