import Firebase from 'firebase';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { InstagramPosts } from 'instagram-screen-scrape';
import { instagram } from 'instagram-node';

import descriptionFromImage from './description-from-image';

const ig = instagram();
ig.use({ client_id: '9b6c05b9a31643ea9abcd7651f7a6bd2',
         client_secret: 'dc67648b48f3412b92a02e6bd817b68f' });
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
  usersRef.child(formattedPhone).on('value', (snapshot) => {
    const user = snapshot.val();
    cb(user);
  });
};

export const getPostForUser = (user, index, cb) => {
  const userRef = postsRef.child(user);
  userRef.on('value', (snapshot) => {
    const posts = Object.values(snapshot.val());
    const post = posts[index];
    cb(post);
  });
};
export const likePost = (user, index, token) => {
  ig.use({ access_token: token });
  getPostForUser(user, index, (post) => {
    console.log(post);
    console.log(ig.add_like(post.id));
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
          const postRef = userRef.push(post);
        } else { counter--; }
      });
      counter++;
    }
  });
};

// precacheIgPosts('kavlatiolais');
// getPostForUser('kavlatiolais', 0, console.log);
// likePost('kavlatiolais', 0, '201652532.9b6c05b.501f9b24d82442eeb1a35e0ebafba8df');
