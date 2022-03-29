import { useEffect} from "react";
import { useLocation } from "react-router-dom";
import GA4React from 'ga-4-react';

const trackingId = "G-FQBQMJY156";
const ga4react = new GA4React(trackingId);

const usePageTracking = () => {
    const location = useLocation();




    useEffect(() => {
        //ReactGA.initialize(trackingId);
        //ReactGA.pageview(location.pathname + location.search);

        ga4react.initialize().then((ga4) => {
            ga4.pageview(location.pathname + location.search)
            //ga4.gtag('event','pageview',location.pathname + location.search) // or your custiom gtag event
        },(err) => {
            console.error(err)
        })

    }, [location]);
};

export default usePageTracking;