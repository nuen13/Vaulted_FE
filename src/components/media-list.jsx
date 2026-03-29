import React, { useState, useEffect } from "react";
import MediaItem from "./media-item";
import { Row, Col } from "react-bootstrap";
import FolderStack from "./fodler-stack";





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
        

        fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/get-all-media-order-by-category`, {
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
            
            })
            .catch((err) => {
                alert("Error fetching media data");
                console.error("Error fetching media data:", err);
            });

      
       
    }

    return (
        <>
          
                {media && media.length > 0 ? ( 
                    media.map((item, index) => <FolderStack apiData={ [{ id: item.id, name: item.mediaTitle, color: "#4D4D4D" }] } key={index} />   
                
                )
                ) : (
                    <p>Loading media...</p>
                )}  
        </>
    );
};

export default MediaList;