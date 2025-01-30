import posthog from 'posthog-js/dist/module.full.no-external'
    
posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_API_HOST,
        persistence: "localStorage",
        autocapture: true,
        disable_session_recording: false,
        capture_pageview: true,
        loaded: (posthog) => {
            posthog.register({
                full_url: window.location.href,
                domain: window.location.hostname
            });
        }
    });

console.log("posthig lloaded")