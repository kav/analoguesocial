import Firebase from 'firebase';
import fetch from 'node-fetch';

import { formatPhone } from './ivr-common';

const rootRef = Firebase.database().ref();
const facebookRef = rootRef.child('facebook');
const usersRef = facebookRef.child('users');
const postsRef = facebookRef.child('posts');


export const getFbData = (phone, cb) => {
  if (!phone) throw new Error('Need phone');
  if (!cb) throw new Error('Need cb');
  const formattedPhone = formatPhone(phone);
  usersRef.child(formattedPhone).once('value', (snapshot) => {
    const user = snapshot.val();
    cb(user);
  });
};

export const getPostForUser = (phone, index, cb) => {
  const userRef = postsRef.child(user);
  userRef.once('value', (snapshot) => {
    console.log(posts);
    const posts = Object.values(snapshot.val());
    const i = (posts.length > index ? index : 0);
    const post = posts[i];
    cb(post);
  });
};

export const precacheFbPosts = (phone, token) => {
  fetch(`https://graph.facebook.com/me/feed?limit=10&access_token=${token}`)
  .then((res) => res.json())
  .then((json) => {
    json.forEach((fbPost) => {
      const post = {
        description: `${fbPost.story} ${fbPost.message ? `with message; ${fbPost.message}` : ''}`,
      };
      postsRef.child(phone).push(post);
    });
  });
};
precacheFbPosts('EAACe39enYZCoBAOAZCZAa3puW6OpRr10kcBbSVKhUJnFQyCDDpz0hm1I010zsiLJ0uJIYtIFxdkAylr0BFqgPHxDvNvNqRoKM7ZCB1C86RoZAwlZAnZBs4yNUfo3dbQirDuJjhSBhO9BWQbvzFHPufedmrycgL0sIJZCBNAhFr3vYQZDZD');
