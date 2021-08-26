import {useState} from 'react';
import {error as errorLog} from '../lib/logging';

export const useUploadCloudinaryImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const upload = async (photo, folder = '/') => {
    setLoading(true);
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

    const url = await fetch('https://api.cloudinary.com/v1_1/enalbis/upload', {
      method: 'post',
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        return data.secure_url;
      })
      .catch((err) => {
        errorLog({
          message: err.message,
          track: true,
          asToast: true,
        });
        setError(err);
      });

    return url;
  };

  return {
    upload,
    loading,
    error,
  };
};
