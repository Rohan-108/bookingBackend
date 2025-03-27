/**
 * Calculates the difference in days between two dates.
 * @param {string|Date} startDate - The start date.
 * @param {string|Date} endDate - The end date.
 * @returns {number} The number of days difference.
 */
function getDaysDiff(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMilliseconds = end - start;
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
  return diffInDays;
}

export default getDaysDiff;
