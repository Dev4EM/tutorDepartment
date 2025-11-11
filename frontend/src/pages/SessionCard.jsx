import React from 'react';

const SessionCard = ({ session }) => {
  return (
    <div className="p-4 bg-white border rounded shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-1">{session.title}</h3>
      <p className="text-sm text-gray-600">Date: {new Date(session.date).toLocaleString()}</p>
      <p className="text-sm text-gray-600">Tutor: {session.tutorName || 'N/A'}</p>
      <p className="text-sm text-gray-600">Duration: {session.duration || '45 mins'}</p>
    </div>
  );
};

export default SessionCard;
