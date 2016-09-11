import Firebase from 'firebase';

const rootRef = Firebase.database().ref();
const cookiesRef = rootRef.child('cookies');

export const setCookie = (data) => {
  const cookieRef = cookiesRef.push();
  console.log(data);
  cookieRef.set(data);
  return cookieRef.key;
};

export const getCookie = (key, cb) => {
  const cookieRef = cookiesRef.child(key);
  cookieRef.on('value', (snapshot) => {
    const cookie = snapshot.val();
    return cb(cookie);
  });
};

// getCookie(setCookie({ token: 'test' }), console.log);
