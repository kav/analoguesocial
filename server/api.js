import express from 'express';
import fetch from 'node-fetch';
import FormData from 'form-data';
import Firebase from 'firebase';

const router = express.Router();

const rootRef = Firebase.database().ref();
const usersRef = rootRef.child("users");

const fetchFollows = (tel, snapshot, cb) => {
  const user = snapshot[tel];
  const apiUrl = `https://api.instagram.com/v1/users/self/follows?access_token=${user.access_token}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((json) => cb(json));
}

router.get('/follows', (req, res) => {
  const tel = req.query.tel;

  usersRef.on("value", function(snapshot) {
    console.log(snapshot.val());
    fetchFollows(tel, snapshot.val(), function(response){
      res.send(response);
    });
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
});

router.get('/followby', (req, res) => {
  const apiUrl = `https://api.instagram.com/v1/users/self/follows?access_token=${req.query.access_token}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then(res.send);
});

export default router;
