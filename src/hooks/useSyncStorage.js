import { useEffect, useState } from 'preact/hooks';

export default function useSyncStorage(key) {
    const [value, setValue] = useState(null);

    useEffect(() => {
        const getFromStorage = () => {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.get(key, (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error retrieving data:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result[key]);
                    }
                });
            });
        };

        getFromStorage().then(setValue).catch(console.error);
    }, [key]);

    const setInStorage = (newValue) => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ [key]: newValue }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error setting data in storage:", chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    setValue(newValue);
                    resolve();
                }
            });
        });
    };

    return [value, setInStorage];
};
