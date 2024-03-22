let express = require('express');
let axios = require('axios');

let group_Chat_Route = express.Router();

// render group page
group_Chat_Route.get('/group_chat', async (req, res) => {
  try {
    let user_id = req.session.user_id;
    let token = req.session.token;

    if (!user_id) {
      res.redirect('/login');
    } else {
      // Get all group created and group joined
      let response = await axios.get(
        'http://localhost:5000/api/v1/group_chat/get_groups',
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      let myGroups = response.data.myGroup;
      let joinedGroups = response.data.joinedGroup;

      // render the group page
      res.render('groupChat', { myGroups, user_id, joinedGroups });
    }
  } catch (err) {
    console.log(err);
    // console.log(err.response);
  }
});

module.exports = { group_Chat_Route };
