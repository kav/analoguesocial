import Firebase from 'firebase';

const rootRef = Firebase.database().ref();
const cookieRef = rootRef.child('cookies');

export const setCookie = (data) => cookieRef.push(data).key;

export const getCookie = (key, cb) => {
  cookieRef.child(key).on('value', (snapshot) => {
    const cookie = snapshot.val();
    return cb(cookie);
  });
};
