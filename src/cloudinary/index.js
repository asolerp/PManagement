import {Alert} from 'react-native';

export const cloudinaryUpload = (photo, folder = '/') => {
  const source = {
    uri: photo.fileUri,
    type: photo.fileType,
    name: photo.fileName,
  };
  const data = new FormData();
  data.append('file', source);
  data.append('upload_preset', 'port_management');
  data.append('cloud_name', 'enalbis');
  data.append('folder', folder);
  const url = fetch('https://api.cloudinary.com/v1_1/enalbis/upload', {
    method: 'post',
    body: data,
  })
    .then((res) => res.json())
    .then((data) => {
      return data.secure_url;
    })
    .catch((err) => {
      console.log(err);
    });

  return url;
};
