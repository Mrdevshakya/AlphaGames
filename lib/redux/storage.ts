import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = AsyncStorage;

const reduxStorage = {
    setItem: (key : string, value : any) => {
        return storage.setItem(key, value);
    },
    getItem: (key : string) => {
        return storage.getItem(key);
    },
    removeItem: (key : string) => {
        return storage.removeItem(key);
    },
}

export default reduxStorage;