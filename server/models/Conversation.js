import mongoose from 'mongoose';
const { Schema } = mongoose;

const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User' // This links to your User model
  }]
}, { timestamps: true }); // Automatically adds createdAt/updatedAt

export default mongoose.model('Conversation', conversationSchema);