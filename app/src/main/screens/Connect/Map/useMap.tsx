const US_BBOX = {
  sw: { lat: 24.396308, lon: -125.0 },
  ne: { lat: 49.3457868, lon: -66.9513812 },
};

const CAN_BBOX = {
  sw: { lat: 41.0, lon: -141.0 },
  ne: { lat: 83.0, lon: -52.0 },
};

// US polygon (rectangle)
const US_POLY: [number, number][] = [
  [-125, 24.396308],
  [-66.9513812, 24.396308],
  [-66.9513812, 49.3457868],
  [-125, 49.3457868],
  [-125, 24.396308],
];

// Canada southern polygon (population centers)
export const CAN_POLY_SOUTH: [number, number][] = [
  [-123.0, 45.0], // BC south
  [-114.0, 45.0], // Alberta south
  [-95.0, 45.0], // Manitoba south
  [-85.0, 45.0], // Ontario west
  [-79.0, 45.5], // Toronto area
  [-75.0, 45.5], // Ottawa area
  [-70.0, 50.0], // Quebec province
  [-65.0, 55.0], // New Brunswick
  [-60.0, 60.0], // Labrador
  [-79.0, 60.0], // Northern Ontario
  [-123.0, 60.0], // Western boundary
  [-123.0, 45.0], // Back to start
];

// Canada northern polygon (Arctic circle & islands)
export const CAN_POLY_NORTH: [number, number][] = [
  [-141.0, 60.0], // NW Islands SW corner
  [-120.0, 60.0], // NW Islands south
  [-90.0, 70.0], // Arctic islands west
  [-75.0, 72.0], // Arctic islands north
  [-55.0, 65.0], // Arctic east
  [-60.0, 70.0], // Arctic central
  [-75.0, 72.0], // Back to Arctic islands
  [-141.0, 60.0], // Back to start
];

const CENTRE_US = {
  latitude: 37.0902,
  longitude: -95.7129,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

function isPointInPolygon(
  lat: number,
  lon: number,
  polygon: [number, number][],
) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const useMap = () => {
  const isWithinBounds = (lat: number, lon: number) => {
    const inUSBox =
      lat >= US_BBOX.sw.lat &&
      lat <= US_BBOX.ne.lat &&
      lon >= US_BBOX.sw.lon &&
      lon <= US_BBOX.ne.lon;
    const inCABox =
      lat >= CAN_BBOX.sw.lat &&
      lat <= CAN_BBOX.ne.lat &&
      lon >= CAN_BBOX.sw.lon &&
      lon <= CAN_BBOX.ne.lon;

    if (!inUSBox && !inCABox) return false;

    if (
      (inUSBox && isPointInPolygon(lat, lon, US_POLY)) ||
      (inCABox &&
        (isPointInPolygon(lat, lon, CAN_POLY_SOUTH) ||
          isPointInPolygon(lat, lon, CAN_POLY_NORTH)))
    )
      return true;

    return false;
  };

  return { CENTRE_US, isWithinBounds };
};

export default useMap;
