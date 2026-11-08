// -- file: src/components/Header/app-header.jsx
// Top of the page: title with the number of items on file, the search box, and the tools
// (file a new item, settings), and who is signed in.
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ToolButtons from '../ToolButtons/tool-buttons.jsx';
import { useAuth } from '../../auth/auth-context.js';
import { selectMediaCounts, selectSearchTerm, setSearchTerm } from '../../slices/media-slice.js';

import './app-header.css';

const AppHeader = ({ onAction }) => {
    const dispatch = useDispatch();
    const total = useSelector((state) => selectMediaCounts(state).active.length);
    const searchTerm = useSelector(selectSearchTerm);
    const { user, signOut } = useAuth();

    return (
        <header className="app-header">
            <div className="app-header-title">
                <h1>Media: Vaulted</h1>
                <span className="app-header-count">{total} {total === 1 ? 'item' : 'items'} on file</span>
            </div>

            <label className="app-search" htmlFor="app-search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <span className="visually-hidden">Search titles</span>
                <input
                    id="app-search"
                    type="search"
                    placeholder="Search titles…"
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    onKeyDown={(e) => { if (e.key === 'Escape') dispatch(setSearchTerm('')); }}
                    autoComplete="off"
                />
            </label>

            <ToolButtons onAction={onAction} />

            <div className="app-user">
                {user.pictureUrl && <img src={user.pictureUrl} alt="" referrerPolicy="no-referrer" />}
                <span>{user.displayName}</span>
                <button type="button" onClick={signOut}>Sign out</button>
            </div>
        </header>
    );
};

export default AppHeader;
