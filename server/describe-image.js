import fetch from 'node-fetch';

const describeImage = (url, cb) => {
  fetch('api.cloudsightapi.com', {
    method: 'POST',
    headers: {
      Authorization: ' CloudSight YRDG0utyNHJuRGcfnLGcZg',
    },
    body: {
      url: 'https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg',
    },
  }).then((res) => {
    console.log(res);
    cb(res);
  });
};

export default describeImage;
//
  // "url": "//images.cloudsightapi.com/uploads/image_request/image/19/19404/19404152/Image.jpg",
  // "token": "AJKAWHKGLjqMd9KDNIXQfg",
