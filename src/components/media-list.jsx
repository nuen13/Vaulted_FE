import React, { useState, useEffect } from "react";
import MediaItem from "./media-item";





const MediaList = () => {
    const [media, setMedia] = useState(null);
    const [mediaCount, setMediaCount] = useState(0);

    useEffect(() => {
        // Fetch media data from the backend API
        getMedia();
    }, []);

    const getMedia = () => {
        // This function will fetch media data from the backend API
        // and update the media state variable with the fetched data.

        // set up api with no pagenation, just get all media items
        

        fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/get-all-media`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(async (response) => {
                const text = await response.text();
                const payload = text ? JSON.parse(text) : null;

                if (!response.ok) {
                    throw new Error(payload?.message || `Request failed with status ${response.status}`);
                }

                return payload;
            })
            .then((res) => {
                if (Array.isArray(res) && res.length > 0) {
                    setMedia(res);
                    setMediaCount(res.length);
                    return;
                }

                setMedia([]);
                setMediaCount(0);
                alert("No media found");    
                
                // print fetched meida to console
                console.log("Fetched media data:", res);

                // how to check console log in react app? open dev tools and go to console tab, you should see the log there
                // what if these is nothing? then you know the fetch request failed, check network tab to see if the request was made and what response you got back
                // it return 200 but the response is empty, then you know the backend is not returning any media data, check backend code to see if there is any issue with fetching media data from database
                // back end work is fine, cuz when i run swagger it still show the media data, but when i run react app it show no media found, then you know the issue is in the react app, check the fetch request and see if you are calling the correct endpoint and if you are handling the response correctly
                
            
            })
            .catch((err) => {
                alert("Error fetching media data");
                console.error("Error fetching media data:", err);
            });

      
       
    }

    return (
        <>
          
                {media && media.length > 0 ? ( 
                    media.map((item, index) => <MediaItem key={index} data={item} />)
                ) : (
                    <p>Loading media...</p>
                )}  
        </>
    );
};

export default MediaList;