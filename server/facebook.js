import Firebase from 'firebase';
import fetch from 'node-fetch';
import FormData from 'form-data';

import { formatPhone } from './ivr-common';

const rootRef = Firebase.database().ref();
const facebookRef = rootRef.child('facebook');
const usersRef = facebookRef.child('users');
const postsRef = facebookRef.child('posts');
