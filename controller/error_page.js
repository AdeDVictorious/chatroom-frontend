let express = require('express');

let errorRoute = express.Router();

// Render the signup page
errorRoute.get('/error_page', async (req, res) => {
  try {
    res.render('error');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

module.exports = { errorRoute };
