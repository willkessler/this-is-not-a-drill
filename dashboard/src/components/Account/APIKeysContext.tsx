import React, { createContext, useContext, useState, useCallback } from 'react';

const APIKeysContext = createContext({
    APIKeys: [],
    fetchAPIKeys: () => {},
    APIKeysLoading: true,
});

export const useAPIKeys = () => useContext(APIKeysContext);

export const APIKeysProvider = ({ children }) => {
    const [APIKeys, setAPIKeys] = useState([]);
    const [APIKeysLastUpdated, setAPIKeysLastUpdated] = useState(null);
    const [APIKeysLoading, setAPIKeysLoading] = useState(true);

    const fetchAPIKeys = useCallback(async (clerkId) => {
        setAPIKeysLoading(true); // start loading process
        try {
            const APIUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/api-keys?clerkId=${clerkId}`;
            const response = await fetch(APIUrl);
            const data = await response.json();
            setAPIKeys(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setAPIKeysLoading(false);
        }
    }, []);
    
    const createAPIKey = useCallback(async (apiKeyType,clerkId) => {
        console.log('creating an api key for env: ', apiKeyType);
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/api-keys/create`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKeyType, clerkId }),
            });;
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                console.log('created an API key');
                setAPIKeysLastUpdated(Date.now()); // trigger to refresh API keys
            }
        } catch (error) {
            console.error(`Error creating API key of type: ( ${apiKeyType} ).`, error);
            throw error;
        }
    });

    const toggleAPIKeyStatus = useCallback(async (APIKeyId) => {
        try {
            const APIUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/api-keys/toggle-active/${APIKeyId}`;
            const response = await fetch(APIUrl);
            if (!response.ok) throw new Error(`Failed to toggle status of API key with id: ${APIKeyId}`);
            setAPIKeysLastUpdated(Date.now()); // update state to trigger the API keys list to rerender
        } catch (error) {
            console.error(`Error toggling APIKey with id:${APIKeyId}`, error);
            return false;
        } finally {
            setAPIKeysLoading(false);
        }
    }, []);
    
    return (
        <APIKeysContext.Provider value={{ 
            APIKeys,
            fetchAPIKeys,
            createAPIKey,
            APIKeysLoading,
            APIKeysLastUpdated,
            toggleAPIKeyStatus,
        }}>
            {children}
        </APIKeysContext.Provider>
    );
};