import firestore from '@react-native-firebase/firestore';

const fetchUsers = async () => {
    try {
      const snapshot = await firestore()
        .collection('users')
        .orderBy('name')
        .get();
  
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return users;
    } catch (error) {
      console.error("Error fetching users: ", error);
      throw error; // o manejar el error como prefieras
    }
  };

  const fetchUser = async (userId) => {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
  
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error fetching user: ", error);
      throw error; // o manejar el error como prefieras
    }
  }

  export {
        fetchUsers,
        fetchUser
  }