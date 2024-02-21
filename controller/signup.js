let express = require('express');
let uploadImage = require('../middleware/uploadImage');
let Service = require('../controller/service');

let signupRoute = express.Router();
let registerRoute = express.Router();

// Render the signup page
signupRoute.get('/signup', async (req, res) => {
  try {
    res.render('signup');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// the signup route
registerRoute.post(
  '/new_user',
  uploadImage.single('image'),
  async (req, res) => {
    let data = { ...req.body };
    console.log(data, req.file);
    let service = new Service();
    let resp = await service.new_user(data);
    res.status(resp.status).json(resp);
  }
);

module.exports = { signupRoute, registerRoute };
