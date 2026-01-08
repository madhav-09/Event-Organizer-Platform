import api from './api';

// ----------------------
// LOGIN
// ----------------------
export interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = ({ email, password }: LoginPayload) => {
  const formData = new URLSearchParams();

  // REQUIRED by OAuth2PasswordRequestForm
  formData.append('grant_type', 'password');
  formData.append('username', email);
  formData.append('password', password);

  // Optional fields Swagger sends as empty
  formData.append('scope', '');
  formData.append('client_id', '');
  formData.append('client_secret', '');

  return api.post('/users/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// ----------------------
// REGISTER
// ----------------------
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const registerUser = (data: RegisterPayload) => {
  // Backend expects JSON for register
  return api.post('/users/register', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
