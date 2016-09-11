import express from 'express';
// import twilio from 'twilio';
// import fetch from 'node-fetch';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (req, res, ) => {
  console.log('REQ MADE');
  const envUrl = 'http://localhost:3000/signup/token';
  res.redirect('https://api.instagram.com/oauth/authorize/' +
  '?client_id=9b6c05b9a31643ea9abcd7651f7a6bd2' +
  '&scope=follower_list+likes+comments' +
  `&redirect_uri=${envUrl}` +
  '&response_type=token');
});

router.get('/token', (req, res) => {
  console.log(req);
});

// router.get('/:access_token', function(req, res, next) {
// 	const access_token = req.params;
// 	console.log(access_token);
// 	res.send(access_token);
// });

// router.get('/access', function(req, res, next) {

//   res.send(access_token);
// });

export default router;
