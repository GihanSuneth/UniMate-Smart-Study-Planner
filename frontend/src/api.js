/**
 * Centralized API configuration for UniMate Smart Study Planner.
 * Using a central BASE_URL makes it easier to change the backend endpoint
 * without editing multiple files.
 */

export const BASE_URL = "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: `${BASE_URL}/auth`,
  ATTENDANCE: `${BASE_URL}/attendance`,
  ANALYTICS: `${BASE_URL}/analytics`,
};

export default { BASE_URL, API_ENDPOINTS };
