// import React, { useEffect, useState } from 'react';
// import Sidebar from './Sidebar';
// import ChatWindow from './ChatWindow';
// import API from '../../services/api';

// const ChatApp = () => {
//   const [contacts, setContacts] = useState([]);
//   const [activeUser, setActiveUser] = useState(null);

//   useEffect(() => {
//     const fetchContacts = async () => {
//       try {
//         const res = await API.get('/users/mutual-followers', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });
//         setContacts(res.data);
//       } catch (err) {
//         console.error('Error fetching mutual followers:', err);
//       }
//     };

//     fetchContacts();
//   }, []);

//   return (
//     <div className="flex h-screen bg-gradient-to-r from-slate-100 via-white to-slate-200">
//       <Sidebar contacts={contacts} onUserSelect={setActiveUser} />
//       <ChatWindow activeUser={activeUser} />
//     </div>
//   );
// };

// export default ChatApp;
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import API from '../../services/api';

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await API.get('/users/mutual-followers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setContacts(res.data);

        // 👇 Check if user was passed from navigation
        if (location.state?.receiverId) {
          const preselected = res.data.find(u => u._id === location.state.receiverId);
          if (preselected) {
            setActiveUser(preselected);
          }
        }
      } catch (err) {
        console.error('Error fetching mutual followers:', err);
      }
    };

    fetchContacts();
  }, [location.state]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-slate-100 via-white to-slate-200">
      <Sidebar contacts={contacts} onUserSelect={setActiveUser} />
      <ChatWindow activeUser={activeUser} />
    </div>
  );
};

export default ChatApp;
