import fetch from 'node-fetch';
import FormData from 'form-data';

const descriptionFromImage = (url, cb) => {
  if (!url) throw new Error('Must provide a url');
  if (!cb) throw new Error('Must provide a callback');

  console.log(`describing: ${url}`);
  const body = new FormData();
  body.append('image_request[remote_image_url]', url);
  body.append('image_request[locale]',
    'en-US'
  );

  fetch('https://api.cloudsightapi.com/image_requests', {
    method: 'POST',
    headers: {
      Authorization: `CloudSight ${process.env.AS_CS_KEY}`,
    },
    body,
  }).then((res) => res.json())
  .then((json) => {
    setTimeout(() => {
      fetch(`https://api.cloudsightapi.com/image_responses/${json.token}`, {
        headers: {
          Authorization: `CloudSight ${process.env.AS_CS_KEY}`,
        },
      }).then((res) => res.json())
    .then((json1) => {
      console.log(`Described: ${url}`);
      console.log(json1);
      console.log(`Description: ${json1.name}`);
      cb(json1.name);
    });
    }, 3000);
  }).catch((error) => {
    console.log(error);
  });
};

export default descriptionFromImage;
//
// descriptionFromImage('https://scontent.cdninstagram.com/t51.2885-19/s150x150/13736009_1065003403581196_1186206105_a.jpg', console.log);
  // "url": "//images.cloudsightapi.com/uploads/image_request/image/19/19404/19404152/Image.jpg",
  // "token": "AJKAWHKGLjqMd9KDNIXQfg",
