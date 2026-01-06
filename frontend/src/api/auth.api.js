import api from './axios';

// Register
export const registerUser = (data) => {
  return api.post('/users/register', data);
};

// Login
export const loginUser = (data) => {
  return api.post('/users/login', data);
};
