import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Draw } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { LineString, Polygon } from "ol/geom";
import { Style, Stroke, Fill, Icon } from "ol/style";
import Feature from "ol/Feature";
import Modal from "react-modal";
import { AiOutlineClose } from "react-icons/ai";
import { MdOutlineFileUpload } from "react-icons/md";
import { FaEllipsisV } from "react-icons/fa";

const OpenLayersMap = ({ drawType }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [distances, setDistances] = useState([]);

  const calculateDistances = (coords) => {
    const toRadians = (deg) => (deg * Math.PI) / 180;
    return coords.slice(1).map((coord, idx) => {
      const [lon1, lat1] = coords[idx];
      const [lon2, lat2] = coord;

      const R = 6371000; // Earth radius in meters
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    });
  };

  useEffect(() => {
    const source = new VectorSource();
    const vectorLayer = new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({
          color: "purple",
          width: 2,
          lineDash: [6, 4],
        }),
        fill: new Fill({ color: "rgba(128, 0, 128, 0.2)" }),
      }),
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({ center: [0, 0], zoom: 2 }),
    });
    setMap(initialMap);

    return () => initialMap.setTarget(null);
  }, []);

  useEffect(() => {
    if (!map || !drawType) return;

    const draw = new Draw({
      source: map.getLayers().item(1).getSource(),
      type: drawType,
    });

    map.addInteraction(draw);

    draw.on("drawend", (event) => {
      const geometry = event.feature.getGeometry();
      const newCoords =
        geometry.getType() === "Polygon"
          ? geometry.getCoordinates()[0]
          : geometry.getCoordinates();

      setCoordinates(newCoords);
      setDistances(calculateDistances(newCoords));
      setModalOpen(true);

      if (geometry instanceof LineString || geometry instanceof Polygon) {
        const arrowFeature = new Feature({
          geometry: new LineString(newCoords),
        });
        arrowFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "purple",
              width: 2,
            }),
            image: new Icon({
              src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24'><path fill='purple' d='M12 2l-10 20h20z'/></svg>",
              rotateWithView: true,
            }),
          })
        );

        map.getLayers().item(1).getSource().addFeature(arrowFeature);
      }
    });

    return () => {
      map.removeInteraction(draw);
    };
  }, [map, drawType]);

  return (
    <div className="relative w-full h-[600px] border-2 border-gray-300">
      <div ref={mapRef} className="w-full h-full"></div>
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto mt-20"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="flex items-center justify-between shadow-lg py-3 px-6 bg-gray-100 rounded-t-lg ">
            <div className="text-lg font-medium">Mission Creation</div>
            <button onClick={() => setModalOpen(false)}>
              <AiOutlineClose size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="overflow-y-auto max-h-96 rounded-lg ">
              <table className="table-auto border-collapse w-full text-left ">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">WP</th>
                    <th className="border px-4 py-2">Coordinates</th>
                    <th className="border px-4 py-2">Distance (m)</th>
                    <th className="border px-4 py-2 text-center">
                      <MdOutlineFileUpload className="inline-block text-xl" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coordinates.map((coord, idx) => (
                    <tr key={idx} className="even:bg-gray-100">
                      <td className="border px-4 py-2 font-semibold">
                        WP({String(idx).padStart(2, "0")})
                      </td>
                      <td className="border px-4 py-2 whitespace-nowrap">
                        {coord.join(", ")}
                      </td>
                      <td className="border px-4 py-2">
                        {idx > 0 ? distances[idx - 1]?.toFixed(2) : "--"}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <FaEllipsisV className="inline-block text-gray-500 cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => alert("Data generated!")}
              className="mt-6 px-6 py-3 bg-purple-700 text-white rounded hover:bg-purple-800 block ml-auto"
            >
              Generate Data
            </button>
            <div className="bg-gray-200 border-black border-dashed p-4 border-2 mt-4 rounded-md">
              Click on the map to mark points of the route and then press Enter
              to complete the route.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OpenLayersMap;
