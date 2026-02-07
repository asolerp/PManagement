import {useState} from 'react';
import { Logger } from '../lib/logging';

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
        const errorObj = err instanceof Error ? err : new Error(String(err));
        Logger.error('Error uploading image to Cloudinary', errorObj, { folder }, { showToast: true });
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
