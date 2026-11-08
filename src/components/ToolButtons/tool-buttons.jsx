// -- file: src/components/ToolButtons/tool-buttons.jsx
// Header tools: file a new item, open Settings
import React from 'react';
import './tool-buttons.css';

const ToolButtons = ({ onAction }) => {
    return (
        <div className="tool-buttons">
            <button type="button" className="tool-button is-primary" onClick={() => onAction('add')}>
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                <span className="tool-button-label">File new item</span>
            </button>
            <button type="button" className="tool-button" onClick={() => onAction('settings')} aria-label="Settings" title="Settings">
                <i className="fa-solid fa-gear" aria-hidden="true"></i>
            </button>
        </div>
    );
};

export default ToolButtons;
