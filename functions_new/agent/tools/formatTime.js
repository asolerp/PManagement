/**
 * Formatea un Timestamp de Firestore o objeto { seconds } a HH:MM.
 */
function formatTime(val) {
  if (!val) return "—";
  const d = val?.toDate ? val.toDate() : new Date(val.seconds * 1000);
  return d.toTimeString().slice(0, 5);
}

module.exports = { formatTime };
