import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This links to your User model
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Automatically adds createdAt/updatedAt

export default mongoose.model('Message', messageSchema);