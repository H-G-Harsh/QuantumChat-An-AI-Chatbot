// API helper functions for authenticated requests

const API_URL = import.meta.env.VITE_API_URL;

// Helper to get auth token from context
let getAuthToken = null;

export const setAuthTokenGetter = (tokenGetter) => {
  getAuthToken = tokenGetter;
};

// Helper to make authenticated requests
const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken ? getAuthToken() : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// API functions
export const createChat = async (text) => {
  const response = await authenticatedFetch('/api/chats', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  const data = await response.json();
  return data.id;
};

export const getUserChats = async () => {
  const response = await authenticatedFetch('/api/userchats');
  return response.json();
};

export const getChat = async (id) => {
  const response = await authenticatedFetch(`/api/chat/${id}`);
  return response.json();
};

export const updateChat = async (id, data) => {
  const response = await authenticatedFetch(`/api/chats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};