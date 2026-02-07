/**
 * Work Shifts Functions
 * Manages work shift tracking and admin dashboard API
 */

// Triggers
const { onEntranceCreated, onEntranceUpdated } = require('./onEntranceWrite');

// Callable APIs
const {
  getWorkShifts,
  getWorkShiftStats,
  getWorkers
} = require('./getWorkShifts');

const {
  createWorkShift,
  updateWorkShift,
  deleteWorkShift
} = require('./manageWorkShifts');

const { migrateEntrancesToWorkShifts } = require('./migrateEntrances');

module.exports = {
  // Triggers - automatically update workShifts when entrances change
  onEntranceCreated,
  onEntranceUpdated,

  // Read APIs
  getWorkShifts,
  getWorkShiftStats,
  getWorkers,

  // Management APIs
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,

  // Migration
  migrateEntrancesToWorkShifts
};
