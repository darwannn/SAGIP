import { useEffect, useState, useRef } from "react";

import { useParams, useNavigate, Link } from "react-router-dom";

import { useSelector } from "react-redux";

import { request } from "../../utils/axios";
import { emergencyFacilityCategory } from "../../utils/categories";

import { toast } from "react-toastify";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const defaultCenter = { lat: 14.8448, lng: 120.8103 };
const malolosBounds = {
  north: 14.881784,
  south: 14.795797,
  east: 120.855111,
  west: 120.781636,
};

const restrictions = {
  country: "ph",
};
const libraries = ["places"];
function EmergencyFacility() {
  const mapAPI = process.env.REACT_APP_MAP_API;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: mapAPI,
    libraries,
  });

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [isFull, setIsFull] = useState("");
  const [isModalShown, setisModalShown] = useState(false);

  const [emergencyFacility, setEmergencyFacility] = useState([]);
  const [filteredEmergencyFacility, setFilteredEmergencyFacility] = useState(
    []
  );
  const [isDirectionShown, setIsDirectionShown] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    emergencyFacilityCategory[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [shouldFetchData, setShouldFetchData] = useState(true);
  const [transit, setTransit] = useState("");

  useEffect(() => {
    const fetchEmergencyFacility = async () => {
      try {
        const data = await request("/emergency-facility/", "GET");
        setEmergencyFacility(data);
        setFilteredEmergencyFacility(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (shouldFetchData) {
      fetchEmergencyFacility();
      setShouldFetchData(false);
    }
  }, [shouldFetchData]);

  /* ------------------- */

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [steps, setSteps] = useState([]);
  const [markerLatLng, setMarkerLatLng] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef();

  if (!isLoaded) {
    return "<SkeletonText />";
  }

  function handleMarkerClick(event, emergencyFacility) {
    const { latLng } = event;
    const latitude = latLng.lat();
    const longitude = latLng.lng();

    setLatitude(latitude);
    setLongitude(longitude);
    setMarkerLatLng({ latitude, longitude });
    console.log(emergencyFacility);

    setName(emergencyFacility.name);

    setCategory(emergencyFacility.category);
    setImage(
      `https://res.cloudinary.com/dantwvqrv/image/upload/v1687796337/sagip/media/emergency-facility/${emergencyFacility.image}`
    );

    setIsFull(emergencyFacility.isFull);
  }

  async function calculateRoute(transitType) {
    try {
      if (originRef.current.value === "") {
        return toast.error("Please input origin or your current location");
      }
      const directionsService = new window.google.maps.DirectionsService();
      let mapOptions = {};
      /*  destination: destiantionRef.current.value, */
      if (transit) {
        mapOptions = {
          origin: originRef.current.value,
          destination: `${latitude}, ${longitude}`,
          travelMode: transitType,
        };
      } else {
        mapOptions = {
          origin: originRef.current.value,
          destination: `${latitude}, ${longitude}`,
          travelMode: transitType,
        };
      }

      const results = await directionsService.route(mapOptions);
      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
      setSteps(results.routes[0].legs[0].steps);

      console.log(results);
    } catch (error) {
      /*  if (results.includes("no result")) { */
      toast.error("no direction available");
      /*  } */
    }
  }

  function getCurrentLocation() {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
      };
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          console.log(latitude);
          console.log(longitude);
          // Fly to marker location with animation
          /*    map.panTo({ lat:latitude, lng:longitude  }); */
          originRef.current.value = `${latitude},${longitude} `;
        },
        (error) => {
          console.log("Error getting current location:", error);
        },
        options
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  return (
    <div
      style={{
        position: "relative",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* Display the marker's latitude and longitude */}
      {isModalShown && (
        <div>
          <>
            <div
              onClick={() => {
                setisModalShown(false);
                setIsDirectionShown(false);
              }}
            >
              Back
            </div>
            <br />
            Longitude: {markerLatLng.longitude}
            Latitude: {markerLatLng.latitude}
            <br />
            category: {category}
            name: {name}
            <br />
            {isFull && "Full"}
            <img src={image} alt="" height={"100px"} />
            <button
              onClick={() => {
                setIsDirectionShown(true);

                /*  destiantionRef.current.value = `${latitude}, ${longitude} `; */
              }}
            >
              Show Direction
            </button>
          </>
          <>
            {isDirectionShown && (
              <div
                style={{
                  padding: 16,
                  borderRadius: "lg",
                  margin: 16,
                  backgroundColor: "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  minWidth: "container.md",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Autocomplete
                    bounds={malolosBounds}
                    restrictions={restrictions}
                    options={{
                      strictBounds: true,
                    }}
                  >
                    <input type="text" placeholder="Origin" ref={originRef} />
                  </Autocomplete>

                  <div>
                    <button
                      style={{ marginLeft: 8 }}
                      onClick={getCurrentLocation}
                    >
                      Get Current Location
                    </button>
                  </div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>Distance: {distance}</div>
                  <div>Duration: {duration}</div>
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() =>
                      calculateRoute(transit ? transit : "DRIVING")
                    }
                  >
                    Get Direction
                  </button>
                </div>

                {/* Display the steps */}
                <div>
                  {steps.map((step, index) => (
                    <div key={index}>
                      <div>{step.duration.text}</div>
                      <div>{step.distance.text}</div>
                      <div
                        dangerouslySetInnerHTML={{ __html: step.instructions }}
                        onClick={() => {
                          map.panTo({
                            lat: step.end_location.toJSON().lat,
                            lng: step.end_location.toJSON().lng,
                          });
                          console.log();
                        }}
                      />
                      <br></br>
                    </div>
                  ))}
                </div>
                <>
                  <label>Walking</label>
                  <input
                    type="radio"
                    value="WALKING"
                    onChange={(e) => {
                      setTransit(e.target.value);
                      calculateRoute(transit);
                    }}
                    name="transitMode"
                    defaultChecked // Use defaultChecked instead of checked
                  />
                  <label>DRIVING</label>
                  <input
                    type="radio"
                    value="DRIVING"
                    onChange={(e) => {
                      setTransit(e.target.value);
                      calculateRoute(transit);
                    }}
                    name="transitMode"
                  />
                  <label>BICYCLING</label>
                  <input
                    type="radio"
                    value="BICYCLING"
                    onChange={(e) => {
                      setTransit(e.target.value);
                      calculateRoute(transit);
                    }}
                    name="transitMode"
                  />
                  <label>TRANSIT</label>
                  <input
                    type="radio"
                    value="TRANSIT"
                    onChange={(e) => {
                      setTransit(e.target.value);
                      calculateRoute(transit);
                    }}
                    name="transitMode"
                  />
                </>
              </div>
            )}
          </>
        </div>
      )}
      {/* should be hidden - opacity:0 */}
      {/*  <Autocomplete
        bounds={malolosBounds}
        restrictions={restrictions}
        options={{
          strictBounds: true,
        }}
      >
        <input type="text" placeholder="Destination" ref={destiantionRef} />
      </Autocomplete> */}
      <div style={{ height: "50%", width: "100%" }}>
        <GoogleMap
          center={defaultCenter}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            restriction: {
              latLngBounds: malolosBounds,
              strictBounds: true,
            },
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                  {
                    visibility: "off",
                  },
                ],
              },
            ],
          }}
          onLoad={(map) => setMap(map)}
        >
          {userLocation && isModalShown && <Marker position={userLocation} />}
          {/*   <Marker position={center} onClick={(marker) => handleMarkerClick(marker)} /> */}
          <div>
            {filteredEmergencyFacility.map((emergencyFacility, index) => (
              <Marker
                position={{
                  lat: emergencyFacility.latitude,
                  lng: emergencyFacility.longitude,
                }}
                onClick={(marker) => {
                  setisModalShown(true);
                  handleMarkerClick(marker, emergencyFacility);
                }}
                key={index}
              />
            ))}
          </div>

          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

export default EmergencyFacility;
