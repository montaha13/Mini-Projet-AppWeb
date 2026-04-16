/**
 * Checks if a requested time slot overlaps with any existing bookings for a room.
 * 
 * @param {Object} room - The room object containing bookedSlots.
 * @param {string|Date} requestedDate - The date of the requested booking.
 * @param {string} startTime - The start time in "HH:mm" format.
 * @param {string} endTime - The end time in "HH:mm" format.
 * @returns {boolean} - True if available, false if there is an overlap.
 */
function isAvailable(room, requestedDate, startTime, endTime) {
  if (!room.bookedSlots || room.bookedSlots.length === 0) return true;

  const reqDate = new Date(requestedDate).toISOString().split('T')[0];

  return !room.bookedSlots.some(slot => {
    const slotDate = new Date(slot.date).toISOString().split('T')[0];
    
    // Only check slots on the same day
    if (slotDate !== reqDate) return false;

    // Convert "HH:mm" to comparable numbers (e.g., "09:30" -> 930)
    const s1 = parseInt(startTime.replace(':', ''), 10);
    const e1 = parseInt(endTime.replace(':', ''), 10);
    const s2 = parseInt(slot.startTime.replace(':', ''), 10);
    const e2 = parseInt(slot.endTime.replace(':', ''), 10);

    // Check for overlap: (StartA < EndB) and (EndA > StartB)
    return (s1 < e2 && e1 > s2);
  });
}

module.exports = { isAvailable };
