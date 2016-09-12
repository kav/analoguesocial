import express from 'express';
import fetch from 'node-fetch';
import FormData from 'form-data';
import bodyParser from 'body-parser';


import Firebase from 'firebase';
import descriptionFromImage from './description-from-image';
import { formatPhone } from './ivr-common';


const rootRef = Firebase.database().ref();
const facebookRef = rootRef.child('facebook');
const usersRef = facebookRef.child('users');
// eslint-disable-next-line new-cap
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.post('/', (req, res) => {
  res.redirect('/');

  const token = req.body.token;
  const phoneNumber = req.body.phone;
  const tel = formatPhone(phoneNumber);
  fetch(`https://graph.facebook.com/v2.7/me?access_token=${token}`)
  .then((response) => response.json())
  .then((json) => {
    const data = { token, user: json };
    usersRef.child(tel).set(data);
  });
});

export default router;
