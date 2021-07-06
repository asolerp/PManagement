import {useSelector} from 'react-redux';
import {userSelector} from '../Store/User/userSlice';

const useAuth = () => {
  const user = useSelector(userSelector);

  const isAdmin = user.role === 'admin';
  const isWorker = user.role === 'role';
  const isOwner = user.role === 'owner';

  return {
    isAdmin,
    isWorker,
    isOwner,
  };
};

export default useAuth;
