// Template for new pages - src/pages/Settings.tsx
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <div className="space-y-4">
        {/* Content will go here */}
        <p className="text-gray-600">Settings page content...</p><br/>
        <p>Image Dimensions</p><br/>
        <p>7:4 | 16:9 | 3:2 | 4:3</p><br/>
        <img src="/placeholder.jpg" className="w-[100px] h-[75px]"></img>
        <input type="radio"></input>
        <p>4:3 | Large: 1200x900 | Medium: 800x600 | Small: 400x300</p><br/>
        <img src="/placeholder.jpg" className="w-[100px] h-[66px]"></img>
        <input type="radio"></input>
        <p>3:2 | Large: 1200x800 | Medium: 750x500 | Small: 375x200</p><br/>
        <img src="/placeholder.jpg" className="w-[100px] h-[56px]"></img>
        <input type="radio"></input>
        <p>16:9 | Large: 1280x720 | Medium: 960x540 | Small: 480x270</p><br/>
        <img src="/placeholder.jpg" className="w-[100px] h-[57px]"></img>
        <input type="radio"></input>
        <p>7:4 | Large: 1400x800 | Medium: 700x400 | Small: 350x200</p><br/>
        <p>Thumbnail Dimension</p><br/>
        <img src="/placeholder.jpg" className="w-[100px] h-[100px]"></img>
        <p>1:1 | Thumbnail: 150x150</p><br/>
        <select>
</select>

      </div>
    </div>
  );
};

export default Settings;