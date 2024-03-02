const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  key: { type: String, require: true, unique:true },
  // plan: { type: String, enum: ['basic', 'premium'], default: 'basic' },
  // status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  deviceLimit:{type: Number, default:3},
  deviceList:[]
});

// Add 1 month to endDate from startDate
subscriptionSchema.pre('save', function(next) {
  if (!this.endDate && this.startDate) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    this.endDate = endDate;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
