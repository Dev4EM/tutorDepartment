import React from 'react';

const ScheduleCard = ({ item }) => {
  return (
    <div className="p-4 bg-white border-l-4 border-blue-500 rounded shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
      <p className="text-sm text-gray-700">{item.description}</p>
      <p className="text-sm text-gray-600 mt-1">Date: {new Date(item.date).toLocaleString()}</p>
      {item.isBookmarked && (
        <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 mt-2 rounded">
          📌 Bookmarked
        </span>
      )}
    </div>
  );
};

export default ScheduleCard;
