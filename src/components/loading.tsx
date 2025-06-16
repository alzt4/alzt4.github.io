
import loading_gif from "../assets/loader-5500_512.gif";  //https://pixabay.com/gifs/loader-app-mobile-loading-spinning-5500/

export function Loading() {
    return <img src={loading_gif} alt="loading spinner gif" className="fillContainer"></img>
}