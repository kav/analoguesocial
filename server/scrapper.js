import express from 'express';
import Firebase from 'firebase';

const router = express.Router();

const rootRef = Firebase.database().ref();
const postsRef = rootRef.child('posts');

let InstagramPosts, streamOfPosts;
InstagramPosts = require('instagram-screen-scrape').InstagramPosts;

router.get('/:user', (req, res, next) => {
  let counter = 0;
  const user = req.params.user;
  const userRef = postsRef.child(user);

  streamOfPosts = new InstagramPosts({
    username: user,
  });

  streamOfPosts.on('data', (post) => {
    if (counter > 5) {
      return res.send();
    }
    userRef.child(counter).set(post);
    counter++;
  });
});

module.exports = router;
