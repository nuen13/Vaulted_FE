import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import React from "react";
import MediaList from "./components/media-list";



export default function App() {
  return (
    <div className="App">
      {/* Align content to the center */}
      <div className="container">
        <h4 className="text-center p-3">Media: Vaulted</h4>


        <p>Organize and manage your media collection with ease.</p>


        <div className="card">
          {/* show media items here */}
          <MediaList />
        </div>
      </div>




    </div>
  );
}

