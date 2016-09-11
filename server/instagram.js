import Firebase from 'firebase';
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
  usersRef.child(formattedPhone).on('value', (snapshot) => {
    const user = snapshot.val();
    cb(user);
  });
};

export const getPostForUser = (user, index, cb) => {
  const userRef = postsRef.child(user);
  const postRef = userRef.child(index);
  postRef.on('value', (snapshot) => {
    const post = snapshot.val();
    cb(post);
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
    descriptionFromImage(post.media, (description) => {
      post.description = description;
      if (counter < 5) {
        userRef.child(counter).set(post);
        counter++;
      }
    });
  });
};
