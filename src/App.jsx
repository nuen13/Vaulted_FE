import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import React from "react";
import MediaList from "./components/media-list";
import FolderStack from "./components/fodler-stack";
import FolderInstance from "./components/folder-instance";



export default function App() {
  return (
    <div className="App">
      {/* Align content to the center */}
      <div className="container">
        <h4 className="text-center p-3">Media: Vaulted</h4>

        {/* <FolderStack apiData={[{ id: 1, name: "My Folder", color: "#4D4D4D" }, { id: 2, name: "Work", color: "#204391" }, { id: 3, name: "Photos", color: "#800" }]} /> */}

        {/* <div className="card"> */}
          {/* show media items here */}
          {/* <MediaList />
        </div>
         */}





          <MediaList />



      </div>




    </div>
  );
}

