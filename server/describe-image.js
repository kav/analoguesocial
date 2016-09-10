import fetch from 'node-fetch';
import FormData from 'form-data';

const describeImage = (url, cb) => {
  console.log(`describing: ${url}`);
  const body = new FormData();
  body.append('image_request[remote_image_url]', url);
  body.append('image_request[locale]',
    'en-US'
  );

  fetch('https://api.cloudsightapi.com/image_requests', {
    method: 'POST',
    headers: {
      Authorization: 'CloudSight YRDG0utyNHJuRGcfnLGcZg',
    },
    body,
  }).then((res) => res.json())
  .then((json) => {
    fetch(`https://api.cloudsightapi.com/image_responses/${json.token}`, {
      headers: {
        Authorization: 'CloudSight YRDG0utyNHJuRGcfnLGcZg',
      },
    }).then((res) => res.json())
    .then((json1) => {
      console.log(`description: ${json1.name}`);
      if (cb) cb(json1.name);
    });
  }).catch((error) => {
    console.log(error);
  });
};

export default describeImage;
//
  // "url": "//images.cloudsightapi.com/uploads/image_request/image/19/19404/19404152/Image.jpg",
  // "token": "AJKAWHKGLjqMd9KDNIXQfg",
