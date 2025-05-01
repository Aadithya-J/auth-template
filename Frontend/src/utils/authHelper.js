import { backendURL } from "../definedURL";

export const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

export const getUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
};

export const clearAuth = () => {
    // console.log('Auth being cleared. Stack trace:', new Error().stack);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
};

// Add token validation logging
export const validateToken = async (token) => {
    try {
        // console.log('Validating token:', token);
        const response = await fetch(`${backendURL}/validateUser`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const isValid = response.ok;
        if (!isValid) {
            console.log('Token validation failed:', response.status, response.statusText);
        }
        return isValid;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};
