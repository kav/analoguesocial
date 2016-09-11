import Firebase from 'firebase';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';


const rootRef = Firebase.database().ref();
const usersRef = rootRef.child('users');

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
