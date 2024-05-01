import { SDK } from './SDK';

// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded');
  const scriptTag = document.getElementById('api-script') as HTMLScriptElement;
  const apiKey = scriptTag.getAttribute('data-api-key') || '';
  const apiEndpoint = scriptTag.getAttribute('data-api-endpoint') || 'https://api.this-is-not-a-drill.com';
  const displayMode = scriptTag.getAttribute('data-api-display-mode') || 'inline';
  const toastPosition = scriptTag.getAttribute('data-api-toast-position') || 'top-left';
  const toastDuration = parseInt(scriptTag.getAttribute('data-api-toast-duration')) || 5000;
  const apiEnvironments = scriptTag.getAttribute('data-api-environments') || 'Development';
  const apiDomains = scriptTag.getAttribute('data-api-domains') || '';
  const userId = scriptTag.getAttribute('data-api-user-id') || 'user-1';
  const sdk = new SDK(apiEndpoint,
                      apiKey,
                      apiEnvironments,
                      apiDomains,
                      displayMode,
                      toastPosition,
                      toastDuration,
                      userId );
  try {
    await sdk.pollApi();
  } catch (error) {
    console.error(`Failed to poll TINAD API: ${error}`);
  }

  // Listen for custom events
  document.addEventListener('dismissToast', () => {
    console.log('Toast dismissed!');
  });
});
