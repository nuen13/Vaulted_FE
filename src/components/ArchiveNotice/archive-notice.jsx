// -- file: src/components/ArchiveNotice/archive-notice.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast, ToastContainer } from 'react-bootstrap';

import { setMediaArchived, dismissArchiveNotice, selectArchiveNotice } from '../../slices/media-slice.js';

import './archive-notice.css';

// --- --- --- --- --- // --- --- --- --- --- //

// "Archived “title” · Undo" at the bottom of the screen after archiving or restoring
const ArchiveNotice = () => {
    const dispatch = useDispatch();
    const notice = useSelector(selectArchiveNotice);

    const undo = () => {
        dispatch(setMediaArchived({ mediaId: notice.id, archived: !notice.archived }));
    };

    return (
        <ToastContainer position="bottom-center" className="archive-notice-container" containerPosition="fixed">
            <Toast
                // key: a new notice restarts the timer even if one is already showing
                key={notice ? `${notice.id}:${notice.archived}` : 'none'}
                show={!!notice}
                onClose={() => dispatch(dismissArchiveNotice())}
                delay={6000}
                autohide
                className="archive-notice"
            >
                {notice && (
                    <Toast.Body className="d-flex align-items-center gap-3">
                        <i className={`fa-solid ${notice.archived ? 'fa-box-archive' : 'fa-box-open'}`}></i>
                        <span className="archive-notice-text" role="status">
                            {notice.archived ? 'Archived' : 'Restored'} “{notice.title}”
                        </span>
                        <button type="button" className="btn btn-sm btn-light ms-auto" onClick={undo}>
                            Undo
                        </button>
                        <button type="button" className="btn-close btn-close-white" aria-label="Dismiss" onClick={() => dispatch(dismissArchiveNotice())} />
                    </Toast.Body>
                )}
            </Toast>
        </ToastContainer>
    );
};

export default ArchiveNotice;
