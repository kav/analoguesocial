import Firebase from 'firebase';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';


const rootRef = Firebase.database().ref();
const usersRef = rootRef.child('users');

const formatPhone = (phone) => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumber = phoneUtil.parse(phone, 'US');
  return phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
};

const getUser = (phone) => {
  const formattedPhone = formatPhone(phone);
  usersRef.child(formattedPhone).on('value', (snapshot) => {
    const user = snapshot.val();
    console.log(user);
    console.log(snapshot);
  });
};

getUser('2063312167');
