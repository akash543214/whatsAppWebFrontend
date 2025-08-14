const BASE_URL = "https://tsbackendwhatsappweb-1.onrender.com/api";
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUsers = async () => {

 try {
    const response = await axiosInstance.get(`/users`);
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || `HTTP error! Status: ${error.response?.status}`;
      console.error("Error getting users:", errorMessage);
      throw new Error(errorMessage);
    }
    console.error("Error getting users:", error);
    throw error;
  }
    
};

export const getMessages = async (wa_id:string) => {

 try {
    const response = await axiosInstance.get(`/messages/${wa_id}`);
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || `HTTP error! Status: ${error.response?.status}`;
      console.error("Error getting users:", errorMessage);
      throw new Error(errorMessage);
    }
    console.error("Error getting users:", error);
    throw error;
  }
    
};

export const handleSendMessage = async (message:any) => {

 try {
    const response = await axiosInstance.post(`/send-message`,message);
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || `HTTP error! Status: ${error.response?.status}`;
      console.error("Error sending message:", errorMessage);
      throw new Error(errorMessage);
    }
    console.error("Error sending message:", error);
    throw error;
  }
    
};





