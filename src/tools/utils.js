export const getFromStorage = (key, callback) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving data:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        callback?.(result);
        resolve(result);
      }
    });
  });
};

export const setInStorage = (key, value, callback) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error setting data in storage:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        callback?.(value)
        resolve();
      }
    });
  });
};

export const parseResponseChunk = (chunkValue) => {
  try {
    return JSON.parse(chunkValue === "" ? null : chunkValue);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};
