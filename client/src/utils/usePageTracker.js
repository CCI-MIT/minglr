import { useEffect} from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga";

const trackingId = "G-FQBQMJY156";
const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        ReactGA.initialize(trackingId);
        ReactGA.pageview(location.pathname + location.search);
    }, [location]);
};

export default usePageTracking;