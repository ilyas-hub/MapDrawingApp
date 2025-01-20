import React, { useState } from "react";
import OpenLayersMap from "./components/OpenLayersMap";

const App = () => {
  const [drawType, setDrawType] = useState(null);

  return (
    <div className="h-[100%] bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Map Drawing Application</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setDrawType("LineString")}
        >
          Draw LineString
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setDrawType("Polygon")}
        >
          Draw Polygon
        </button>
      </div>
      <OpenLayersMap drawType={drawType} />
    </div>
  );
};

export default App;
