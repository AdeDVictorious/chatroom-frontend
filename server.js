let express = require('express');
const dotenv = require('dotenv');

let ejs = require('ejs');

let cors = require('cors');

let session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

let app = express();

dotenv.config({ path: 'config.env' });

var store = new MongoDBStore({
  uri: process.env.DB_URL,
  databaseName: process.env.DB_NAME,
  collection: process.env.DB_COLLECTION,
});

// Catch errors
store.on('error', function (error) {
  console.log(error);
});

app.use(
  session({
    secret: process.env.MY_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: false,
  })
);

// console.log(session);
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

let { homeRoute, chatRoute } = require('./controller/home');
let { group_Route, groupchat_Route } = require('./controller/groups');
let { member_Route, members_Route } = require('./controller/member');
let { group_Chat_Route, group_ChatsRoute } = require('./controller/group_chat');
let { loginRoute, signinRoute, signoutRoute } = require('./controller/login');
let { signupRoute, registerRoute } = require('./controller/signup');

app.use(homeRoute);
app.use(group_Route);
app.use(member_Route);
app.use(group_Chat_Route);
app.use(loginRoute);
app.use(signoutRoute);
app.use(signupRoute);

app.use('/api/v1', registerRoute, signinRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/group', groupchat_Route);
app.use('/api/v1/member', members_Route);
app.use('/api/v1/group_chat', group_ChatsRoute);

let PORT = 8000;

app.listen(PORT, (err) => {
  if (err) {
    console.log('server failed to start');
    process.env.exit();
  } else {
    console.log(`server is running on port: ${PORT}`);
  }
});
