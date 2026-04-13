import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMediaByCategory } from "./media-slice"; // Adjust path as needed
import FolderStack from "../../components/category/folder-stack";

const MediaList = () => {
    const dispatch = useDispatch();
    const { items, status } = useSelector((state) => state.media);

    useEffect(() => {
        dispatch(fetchMediaByCategory(null));
    }, [dispatch]);

    // 3. Handle Loading State
    if (status === 'loading') {
        return <p>Loading media...</p>;
    }

    // 4. Handle Error or Empty State
    if (status === 'succeeded' && (!items || items.length === 0)) {
        return <p>No media found.</p>;
    }

    return (
        <>
            {/* 5. items is now your Redux-managed media list */}
            {items && items.length > 0 && (
                <FolderStack apiData={items} />
            )}
        </>
    );
};

export default MediaList;