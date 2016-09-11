import Firebase from 'firebase';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { InstagramPosts } from 'instagram-screen-scrape';

import descriptionFromImage from './description-from-image';

const rootRef = Firebase.database().ref();
const usersRef = rootRef.child('users');
const postsRef = rootRef.child('posts');

export const formatPhone = (phone) => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumber = phoneUtil.parse(phone, 'US');
  return phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
};

export const getIgData = (phone, cb) => {
  if (!phone) throw new Error('Need phone');
  if (!cb) throw new Error('Need cb');
  const formattedPhone = formatPhone(phone);
  usersRef.child(formattedPhone).once('value', (snapshot) => {
    const user = snapshot.val();
    cb(user);
  });
};

export const getPostForUser = (user, index, cb) => {
  const userRef = postsRef.child(user);
  userRef.once('value', (snapshot) => {
    console.log(posts);
    const posts = Object.values(snapshot.val());
    const i = (posts.length > index ? index : 0);
    const post = posts[i];
    cb(post);
  });
};
export const likeIgPost = (user, index, token) => {
  getPostForUser(user, index, (post) => {
    const body = new FormData();
    body.append('access_token', token);
    fetch(`https://api.instagram.com/v1/media/shortcode/${post.id}?access_token=${token}`)
    .then().then((resp) => resp.json()).then((json) => {
      fetch(`https://api.instagram.com/v1/media/${json.data.id}/likes`, {
        method: 'POST',
        body,
      }).then((resp) => resp.json()).then(console.log);
    });
  });
};
export const commentIgPost = (user, index, token, comment) => {
  getPostForUser(user, index, (post) => {
    const body = new FormData();
    body.append('access_token', token);
    body.append('text', comment);

    fetch(`https://api.instagram.com/v1/media/shortcode/${post.id}?access_token=${token}`)
    .then().then((resp) => resp.json()).then((json) => {
      fetch(`https://api.instagram.com/v1/media/${json.data.id}/comments`, {
        method: 'POST',
        body,
      }).then((resp) => resp.json()).then(console.log);
    });
  });
};
export const precacheIgPosts = (username) => {
  let counter = 0;
  const user = username;
  const userRef = postsRef.child(user);

  const streamOfPosts = new InstagramPosts({
    username: user,
  });
  streamOfPosts.on('data', (post) => {
    if (post.type !== 'image') return;
    if (counter < 5) {
      descriptionFromImage(post.media, (description) => {
        if (description) {
          post.description = description;
          userRef.push(post);
        } else { counter--; }
      });
      counter++;
    }
  });
};

// precacheIgPosts('kavlatiolais');
// getPostForUser('kavlatiolais', 0, console.log);
// likePost('kavlatiolais', 0, '201652532.9b6c05b.501f9b24d82442eeb1a35e0ebafba8df');
