import React from 'react';

const Sidebar = ({ contacts, onUserSelect }) => {
  return (
    <div className="w-72 bg-white border-r shadow h-full overflow-y-auto">
      <h2 className="text-xl font-semibold p-4 border-b bg-slate-100">💬 Chats</h2>
      {contacts.map((user) => (
        <div
          key={user._id}
          className="p-4 cursor-pointer hover:bg-slate-100 transition border-b"
          onClick={() => onUserSelect(user)}
        >
          <p className="font-medium text-gray-800">{user.name}</p>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
