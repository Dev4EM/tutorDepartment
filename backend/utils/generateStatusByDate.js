// utils/generateStatusByDate.js
function generateStatusByDate(startDate, endDate) {
  const status = {};
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const key = current.toISOString().split("T")[0];
    status[key] = "pending";
    current.setDate(current.getDate() + 1);
  }

  return status;
}

module.exports = { generateStatusByDate };
