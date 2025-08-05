import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabaseClient';

// Simple blue dot for current user
const userIcon = new L.DivIcon({
  html: `<div style="width:12px;height:12px;background-color:#3B82F6;border-radius:50%;border:2px solid white;"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const otherUserIcon = new L.DivIcon({
  html: `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="white" stroke="#10B981" stroke-width="2"/>
  <g transform="translate(4, 4)">
    <path fill="#10B981" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/>
  </g>
</svg>
`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function UserLocationMarker({ position, onMarkerClick }: { 
  position: [number, number]; 
  onMarkerClick: () => void; 
}) {
  return (
    <Marker
      position={position}
      icon={userIcon}
      eventHandlers={{ click: onMarkerClick }}
    />
  );
}

interface MapProps {
  onMarkerClick?: () => void;
}

export default function Map({ onMarkerClick }: MapProps) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [otherUsers, setOtherUsers] = useState<
    { user_id: string; latitude: number; longitude: number; updated_at: string }[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<{
    user_id: string;
    latitude: number;
    longitude: number;
    updated_at: string;
    profile?: {
      username: string;
      display_name: string;
      avatar_url: string;
      bio: string;
    };
  } | null>(null);

  // Get user location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        console.log("📍 Got position:", coords);
        setUserPos(coords);

        try {
          const user = await supabase.auth.getUser();
          console.log("👤 Got user:", user.data?.user?.id);

          if (user.data?.user?.id) {
            const { error } = await supabase.from('live_locations').upsert({
              user_id: user.data.user.id,
              latitude: coords[0],
              longitude: coords[1],
              updated_at: new Date().toISOString(),
            });

            if (error) {
              console.error("❌ Upload error:", error);
            } else {
              console.log("✅ Uploaded location to Supabase");
            }
          }
        } catch (e) {
          console.error("❌ Unexpected error:", e);
        }
      },
      (err) => console.error("📛 Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch nearby users when user position is available
  useEffect(() => {
    if (!userPos) return;

    const fetchNearbyUsers = async () => {
      try {
        const { data, error } = await supabase.rpc('get_nearby_users', {
          lat: userPos[0],
          lng: userPos[1],
          radius_m: 1000,
        });

        if (error) throw error;
        if (data) setOtherUsers(data);
      } catch (err) {
        console.error('Failed to fetch nearby users:', err);
      }
    };

    fetchNearbyUsers(); // initial

    const intervalId = setInterval(fetchNearbyUsers, 60000); // every 60s
    return () => clearInterval(intervalId);
  }, [userPos]);

  return (
    <div className="relative w-full h-full">
      {userPos ? (
        <>
          <MapContainer
            center={userPos}
            zoom={18}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

                         {otherUsers.map((user) => (
               <Marker
                 key={user.user_id}
                 position={[user.latitude, user.longitude]}
                 icon={otherUserIcon}
                 eventHandlers={{
                   click: async () => {
                     try {
                       // Fetch user profile data
                       const { data: profileData, error: profileError } = await supabase
                         .from('profiles')
                         .select('username, display_name, avatar_url, bio')
                         .eq('uuid', user.user_id)
                         .single();

                       if (profileError) {
                         console.error('Failed to fetch profile:', profileError);
                       }

                       setSelectedUser({
                         ...user,
                         profile: profileData || undefined
                       });
                     } catch (err) {
                       console.error('Error fetching user profile:', err);
                       setSelectedUser(user);
                     }
                   },
                 }}
               />
             ))}

            <UserLocationMarker
              position={userPos}
              onMarkerClick={onMarkerClick || (() => {})}
            />
          </MapContainer>

          {/* Other User Details Popup */}
          {selectedUser && (
            <div className="fixed inset-0 z-[9999] flex justify-end items-center">
              <div className="relative w-80 h-[90%] bg-white bg-opacity-50 shadow-lg mr-5 rounded-xl">
                <div className="p-4">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl border-none bg-transparent cursor-pointer"
                  >
                    ×
                  </button>
                                     <div className="mt-8">
                     <h2 className="text-xl font-bold mb-4">User Details</h2>
                     <div className="space-y-3">
                       {selectedUser.profile ? (
                         <>
                           <div>
                             <span className="font-semibold">Name:</span>
                             <p className="text-sm text-gray-600">
                               {selectedUser.profile.display_name || 'Not set'}
                             </p>
                           </div>
                           <div>
                             <span className="font-semibold">Username:</span>
                             <p className="text-sm text-gray-600">
                               @{selectedUser.profile.username}
                             </p>
                           </div>
                           {selectedUser.profile.bio && (
                             <div>
                               <span className="font-semibold">Bio:</span>
                               <p className="text-sm text-gray-600">
                                 {selectedUser.profile.bio}
                               </p>
                             </div>
                           )}
                           {selectedUser.profile.avatar_url && (
                             <div>
                               <span className="font-semibold">Avatar:</span>
                               <img 
                                 src={selectedUser.profile.avatar_url} 
                                 alt="Profile" 
                                 className="w-12 h-12 rounded-full mt-1"
                               />
                             </div>
                           )}
                         </>
                       ) : (
                         <div>
                           <span className="font-semibold">User ID:</span>
                           <p className="text-sm text-gray-600 break-all">{selectedUser.user_id}</p>
                         </div>
                                               )}
                        <div>
                          <span className="font-semibold">Last Updated:</span>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedUser.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">Distance:</span>
                          <p className="text-sm text-gray-600">
                            {userPos ? (
                              `${Math.round(
                                Math.sqrt(
                                  Math.pow(selectedUser.latitude - userPos[0], 2) +
                                  Math.pow(selectedUser.longitude - userPos[1], 2)
                                ) * 111000
                              )}m away`
                            ) : (
                              "Calculating..."
                            )}
                          </p>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p>Getting your location...</p>
        </div>
      )}
    </div>
  );
}

