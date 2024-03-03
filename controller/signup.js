let express = require('express');
let uploadImage = require('../middleware/uploadImage');
let Service = require('../controller/service');

let signupRoute = express.Router();
let registerRoute = express.Router();

// Render the signup page
signupRoute.get('/sign_up', async (req, res) => {
  try {
    res.render('signup');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// the signup route
registerRoute.post(
  '/sign_up',
  uploadImage.single('image'),
  async (req, res) => {
    let payload = { ...req.body, ...req.file };
    let service = new Service();
    let resp = await service.new_user(payload);
    if (resp.status === 400) {
      res.status(resp.status).json(resp);
    } else if (resp.status === 404) {
      res.status(resp.status).json(resp);
    } else if (resp.status === 200) {
      res.status(resp.status).json(resp);
    } else {
      req.session.user_nickname = resp.message.new_user.nickname;
      req.session.user_id = resp.message.new_user._id;
      req.session.token = resp.message.token;
      res.status(resp.status).json(resp);
    }
  }
);

module.exports = { signupRoute, registerRoute };
