import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Assume you have a function to get the token
const getToken = () => {
    // Replace this with your actual token retrieval logic
    const token = localStorage.getItem('accessToken');
    console.log("Retrieved token from localStorage:", token);
    return token;
};

// Function to decode JWT token
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

const fetchDepartments = async () => {
    console.log("Fetching departments..."); // Log before fetch

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const url = `${baseUrl}/api/departments/`;
    console.log("Constructed URL:", url);

    console.log("Token in localStorage:", localStorage.getItem('accessToken'));
    const token = getToken();

    // Decode and log the token
    const decodedToken = decodeToken(token);
    console.log("Decoded token:", decodedToken);

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token
            },
        });
        console.log("Fetch response:", response); // Log the response object

        if (!response.ok) {
            const errorData = await response.json(); // Try to get more detailed error info from the server
            throw new Error(`Failed to fetch departments: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Departments data:", data); // Log the data

        return data;
    } catch (error) {
        console.error("Error fetching departments:", error);
        throw new Error("Failed to fetch departments. Check the console for more details.");
    }
};

const createDepartment = async (department) => {
    const response = await fetch('/api/departments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(department),
    });
    if (!response.ok) {
        throw new Error('Failed to create department');
    }
    return response.json();
};

const updateDepartment = async ({ id, ...updates }) => {
    const response = await fetch(`/api/departments/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!response.ok) {
        throw new Error('Failed to update department');
    }
    return response.json();
};

const deleteDepartment = async (id) => {
    const response = await fetch(`/api/departments/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete department');
    }
    return response.json();
};

export const useDepartments = () => useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
});

export const useCreateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDepartment,
        onSuccess: () => queryClient.invalidateQueries(['departments']),
    });
};

export const useUpdateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateDepartment,
        onSuccess: () => queryClient.invalidateQueries(['departments']),
    });
};

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => queryClient.invalidateQueries(['departments']),
    });
};
