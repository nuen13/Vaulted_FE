// src/components/media/media-list.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetchMediaByCategoryAndStatus } from "../../slices/media-slice";
import FolderStack from "./folder-stack";
// --- --- --- --- --- // --- --- --- --- --- //

const MediaList = () => {
    const dispatch = useDispatch();
    const { items, status } = useSelector((state) => state.media);

    useEffect(() => {
        dispatch(fetchMediaByCategoryAndStatus({ categoryId: null, status: null }));
    }, [dispatch]);

    // 3. Handle Loading State
    if (status === 'loading') {
        return <p>Loading media...</p>;
    }

    // 4. Handle Error or Empty State
    if (status === 'succeeded' && (!items || items.length === 0)) {
        return (

            <>
                <p className = "d-flex justify-content-center mt-5">
                    No media found. Try adjusting your filters or add new media!
                </p>
            </>
        )
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