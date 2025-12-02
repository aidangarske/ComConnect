// Assumes the API is running on port 8080
import { API_URL } from '../config/api.js';

/**
 * Finds an existing conversation or creates a new one with a recipient ID.
 * @param {string} recipientId - The MongoDB ID of the user to chat with.
 * @param {Function} navigate - The useNavigate hook from react-router-dom.
 */
export const startChatWithRecipient = async (recipientId, navigate) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please log in to start a chat.");
    navigate('/login');
    return;
  }

  try {
    // 1. Call the backend API to find or create the conversation
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipientId: recipientId })
    });

    const data = await response.json();

    if (data.success && data.conversationId) {
      // 2. If successful, navigate to the messages page
      //    We use the 'state' prop to pass the new conversation ID directly.
      navigate('/messages', { state: { newConvoId: data.conversationId } });
    } else {
      alert("Failed to start chat: " + (data.error || 'Unknown error'));
    }
  } catch (err) {
    console.error("Chat setup error:", err);
    alert("Connection Error. Could not start chat.");
  }
};