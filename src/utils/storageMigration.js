export async function migrateStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error getting all storage data:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }
            
            const updates = {};
            const keysToRemove = [];
            
            // Process all keys in storage
            Object.keys(result).forEach(key => {
                // Skip timestamp keys and already migrated data
                if (key.endsWith('_timestamp')) {
                    keysToRemove.push(key);
                    return;
                }
                
                const value = result[key];
                const timestampKey = `${key}_timestamp`;
                const timestamp = result[timestampKey] || Date.now();
                
                // Skip if already in new format
                if (value && typeof value === 'object' && 
                    '_value' in value && '_timestamp' in value) {
                    return;
                }
                
                // Create wrapped value
                updates[key] = {
                    _value: value,
                    _timestamp: timestamp
                };
            });
            
            // Apply updates if any
            if (Object.keys(updates).length > 0) {
                chrome.storage.sync.set(updates, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error updating storage format:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    
                    // Remove old timestamp keys
                    if (keysToRemove.length > 0) {
                        chrome.storage.sync.remove(keysToRemove, () => {
                            if (chrome.runtime.lastError) {
                                console.error('Error removing old timestamp keys:', chrome.runtime.lastError);
                                reject(chrome.runtime.lastError);
                                return;
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
} 