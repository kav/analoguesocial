import express from 'express';
import fetch from 'node-fetch';
import FormData from 'form-data';

import Firebase from 'firebase';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';


Firebase.initializeApp({
  apiKey: 'AIzaSyBE67a9yY679V3XSYuG58z-AiaLzVfvNuM',
  authDomain: 'analoguesocial.firebaseapp.com',
  databaseURL: 'https://analoguesocial.firebaseio.com',
  storageBucket: 'analoguesocial.appspot.com',
});
const rootRef = Firebase.database().ref();


const usersRef = rootRef.child('users');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/', (req, res, ) => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumber = phoneUtil.parse(req.body.number, 'US');
  const tel = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);

  const envUrl = `http://${req.headers.host}/signup/token?tel=${tel}`;
  res.redirect('https://api.instagram.com/oauth/authorize/' +
  '?client_id=9b6c05b9a31643ea9abcd7651f7a6bd2' +
  '&scope=follower_list+likes+comments' +
  `&redirect_uri=${envUrl}` +
  '&response_type=code');
});

router.get('/token', (req, res) => {
  const code = req.query.code;
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumber = phoneUtil.parse(req.query.tel, 'US');
  const tel = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);

  const body = new FormData();
  body.append('client_id', '9b6c05b9a31643ea9abcd7651f7a6bd2');
  body.append('client_secret', 'dc67648b48f3412b92a02e6bd817b68f');
  body.append('code', code);
  body.append('grant_type', 'authorization_code');
  body.append('redirect_uri', `http://${req.headers.host}/signup/token?tel=${tel}`);

  fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body,
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);

      usersRef.child(tel).set(json);
      res.redirect('/');
    });
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
