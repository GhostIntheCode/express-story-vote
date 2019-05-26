const express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  // postRouter = require('./routes/posts'),
  oauthRouter = require('./routes/oauth'),
  // mongoose = require('mongoose'),
  // bodyParser = require('body-parser'),
  passport = require('passport'),
  keys = require('./config/keys');

// Body parser middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// mongoose
//   .connect(keys.mongoURI, { useNewUrlParser: true })
//   .then(console.log(`Connected to cluster0-k3dow.mongodb.net`))
//   .catch(err => console.log(err));

// Cors origin Access, Http methods and headers  
// app.use((req, res, next) => {
//   // Website you wish to allow to connect || * to allow all websites
//   const allowedOrigins = ['http://localhost:4200', 'http://127.0.0.1:5500'];
//   const origin = req.headers.origin;
//   if (allowedOrigins.indexOf(origin) > -1) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   // Request methods you wish to allow
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, OPTIONS, PUT, PATCH, DELETE'
//   );
//   // Request headers you wish to allow
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin,X-Requested-With,content-type,Accept,Authorization'
//   );
//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   // res.setHeader('Access-Control-Allow-Credentials', true);

//   // next() to pass control to the next middleware function 
//   next();
// });

// passport config 
require('./config/passport')(passport)

//Routes :
app.get('/' , (req, res) => {
  res.send('working')  
});
// app.use('/api/posts', postRouter);
app.use('/oauth', oauthRouter);

app.listen(port, () => console.log('server runing on port ' + port + ' ...'));
