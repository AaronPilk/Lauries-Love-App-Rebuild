import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { useFeatureFlags } from '../lib/featureFlags';

// Community map. Loads only the members inside the current viewport via the
// users_in_bbox RPC (privacy: coordinates are already coarsened to ~1km, and
// the RPC returns no email/phone). CircleMarkers avoid the Leaflet default-icon
// bundler issue. Nearby markers are grouped into clusters that show the member
// count and split apart as you zoom in.
type Marker = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  latitude: number;
  longitude: number;
};

function ViewportLoader({ onData }: { onData: (m: Marker[]) => void }) {
  const load = useCallback(async (b: L.LatLngBounds) => {
    const { data } = await supabase.rpc('users_in_bbox', {
      min_lat: b.getSouth(),
      min_lng: b.getWest(),
      max_lat: b.getNorth(),
      max_lng: b.getEast(),
      max_rows: 500,
    });
    onData(
      ((data ?? []) as Marker[]).filter(
        (u) => u.latitude != null && u.longitude != null,
      ),
    );
  }, [onData]);

  const map = useMapEvents({
    moveend: () => load(map.getBounds()),
  });
  // initial load
  useState(() => {
    load(map.getBounds());
    return null;
  });
  return null;
}

export function MapPage() {
  const { isEnabled } = useFeatureFlags();
  const [markers, setMarkers] = useState<Marker[]>([]);

  if (!isEnabled('community_map'))
    return <p className="text-gray-500">The community map is turned off.</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-brand-700">Community Map</h1>
      <div className="overflow-hidden rounded-2xl border border-brand-100" style={{ height: '70vh' }}>
        <MapContainer center={[39.5, -98.35]} zoom={4} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ViewportLoader onData={setMarkers} />
          <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
            {markers.map((m) => (
              <CircleMarker
                key={m.id}
                center={[m.latitude, m.longitude]}
                radius={8}
                pathOptions={{ color: '#a5257e', fillColor: '#d84a9a', fillOpacity: 0.8 }}
              >
                <Popup>
                  <Link
                    to={`/users/${m.id}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {m.display_name || m.first_name || 'Member'}
                  </Link>
                  <div className="text-xs text-gray-400">View profile · Message</div>
                </Popup>
              </CircleMarker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {markers.length} members in view · locations are approximate (~1km) for privacy.
      </p>
    </div>
  );
}
