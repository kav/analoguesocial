import express from 'express';
// import twilio from 'twilio';
import fetch from 'node-fetch';
import FormData from 'form-data';
import Firebase from 'firebase';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/', (req, res, ) => {
  console.log('REQ MADE');
  const envUrl = `http://${req.headers.host}/signup/token?tel=${req.body.number}`;
  res.redirect('https://api.instagram.com/oauth/authorize/' +
  '?client_id=9b6c05b9a31643ea9abcd7651f7a6bd2' +
  '&scope=follower_list+likes+comments' +
  `&redirect_uri=${envUrl}` +
  '&response_type=code');
});

router.get('/token', (req, res) => {
  const code = req.query.code;
  const tel = req.query.tel;

  const body = new FormData();
  body.append('client_id', '9b6c05b9a31643ea9abcd7651f7a6bd2');
  body.append('client_secret', 'dc67648b48f3412b92a02e6bd817b68f');
  body.append('code', code);
  body.append('grant_type', 'authorization_code');
  body.append('redirect_uri', `http://${req.headers.host}/signup/token?tel=${tel}`);

  fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body
  })
    .then((response) => response.json())
    .then((json) =>{
      console.log(json);
      res.redirect('/');
    })
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
