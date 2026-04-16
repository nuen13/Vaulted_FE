import React from 'react';
import './tool-buttons.css';



const ToolButtons = ({ onAction }) => {
    return (
        <>
            <div className = "tool-buttons d-flex flex-row align-items-end gap-2">
                <button
                    type="button"
                    title="Add Media"
                    onClick={() => onAction('add')}
                    className={`btn m-1 btn-outline-secondary border-0 align-self-end `}
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
                <button
                    type="button"
                    title="Share Media"
                    onClick={() => onAction('share')}
                    className={`btn m-1 btn-outline-secondary border-0 align-self-end `}
                >
                    <i className="fa-solid fa-share"></i>
                </button>
                <button
                    type="button"
                    title="Setting"
                    onClick={() => onAction('settings')}
                    className={`btn m-1 btn-outline-secondary border-0 align-self-end `}
                >
                    <i className="fa-solid fa-gear"></i>
                </button>
            </div>
        </>

    );
}

export default ToolButtons;