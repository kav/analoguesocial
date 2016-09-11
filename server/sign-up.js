import express from 'express';
import fetch from 'node-fetch';
import FormData from 'form-data';

import Firebase from 'firebase';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import descriptionFromImage from './description-from-image';

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

router.post('/', (req, res) => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumber = phoneUtil.parse(req.body.number, 'US');
  const tel = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
  const igBugAvoidTel = tel.substring(1);
  const envUrl = `http://${req.headers.host}/signup/token?tel=${igBugAvoidTel}`;
  const redirectUri = 'https://api.instagram.com/oauth/authorize/' +
  '?client_id=9b6c05b9a31643ea9abcd7651f7a6bd2' +
  '&scope=follower_list+likes+comments' +
  '&response_type=code' +
  `&redirect_uri=${envUrl}`;
  res.redirect(redirectUri);
});

router.get('/token', (req, res) => {
  const code = req.query.code;
  const phoneUtil = PhoneNumberUtil.getInstance();
  const decodedTel = req.query.tel;
  const phoneNumber = phoneUtil.parse(decodedTel, 'US');
  const tel = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
  const igBugAvoidTel = tel.substring(1);
  const redirectUri = `http://${req.headers.host}/signup/token?tel=${igBugAvoidTel}`;

  const body = new FormData();
  body.append('client_id', '9b6c05b9a31643ea9abcd7651f7a6bd2');
  body.append('client_secret', 'dc67648b48f3412b92a02e6bd817b68f');
  body.append('code', code);
  body.append('grant_type', 'authorization_code');
  body.append('redirect_uri', redirectUri);

  fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body,
  })
    .then((response) => response.json())
    .then((json) => {
      descriptionFromImage(json.user.profile_picture, (description) => {
        const user = json.user;
        user.description = description;
        usersRef.child(tel).set(json);
      });
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
