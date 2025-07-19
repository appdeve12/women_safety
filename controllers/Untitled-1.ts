// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:5000'); // adjust if using different domain/port

// function App() {
//   const [notifications, setNotifications] = useState([]);
// console.log("notifications",notifications)
//   const policeId = "687b2e21cb182508cd61f819"; // replace with actual ID

//   useEffect(() => {
//     // Join police room
//     socket.emit("joinPoliceRoom", policeId);

//     // Listen for nearby woman notifications
//     socket.on("woman-nearby", (data) => {
//       setNotifications((prev) => [...prev, data]);
//     });

//     // Cleanup
//     return () => {
//       socket.off("woman-nearby");
//     };
//   }, [policeId]);

//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>🔔 Real-time Notifications</h2>
//       <ul>
//         {notifications.map((note, index) => (
//           <li key={index}>
//             👩‍🦰 <strong>{note.woman.name}</strong> is near: {note.woman.distance} away from <strong>{note.nearestPolice.stationName}</strong> at {note.woman.time} on {note.woman.date}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;
