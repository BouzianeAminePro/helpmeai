import { useEffect, useState } from 'preact/hooks';

export const ONE_MINUTE_MS = 60 * 1000;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const ONE_WEEK_MS = 7 * ONE_DAY_MS;
export const ONE_MONTH_MS = 30 * ONE_DAY_MS;

export default function useSyncStorage(key, lifeDuration = null) {
    const [value, setValue] = useState(null);

    useEffect(() => {
        const getFromStorage = () => {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.get(key, (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error retrieving data:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        const storedData = result[key];

                        if (storedData && typeof storedData === 'object' &&
                            '_value' in storedData && '_timestamp' in storedData) {

                            if (lifeDuration) {
                                const currentTime = Date.now();
                                const age = currentTime - storedData._timestamp;

                                if (age > lifeDuration) {
                                    chrome.storage.sync.set({ [key]: null }, () => {
                                        if (chrome.runtime.lastError) {
                                            console.error('Error clearing expired data:', chrome.runtime.lastError);
                                        }
                                    });
                                    resolve(null);
                                    return;
                                }
                            }

                            resolve(storedData._value);
                        } else {
                            resolve(storedData);
                        }
                    }
                });
            });
        };

        getFromStorage().then(setValue).catch(console.error);
    }, [key, lifeDuration]);

    const setInStorage = (newValue) => {
        return new Promise((resolve, reject) => {
            const wrappedValue = {
                _value: newValue,
                _timestamp: Date.now()
            };

            chrome.storage.sync.set({ [key]: wrappedValue }, () => {
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
}
