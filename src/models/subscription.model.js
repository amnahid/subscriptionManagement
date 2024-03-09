const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  user: { type: String, required: true},
  key: { type: String, required: true, unique:true },
  // plan: { type: String, enum: ['basic', 'premium'], default: 'basic' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  month:{type:Number},
  deviceLimit:{type: Number, default:3},
  deviceList:[{type:String}],
  Logs:[{
    time:Date,
    deviceId:String
  }]
});

// Add 1 month to endDate from startDate
subscriptionSchema.pre('save', function(next) {
  if (this.month && this.startDate){
    const startDate = new Date(this.startDate);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + this.month, startDate.getDate());
    this.endDate = endDate;
    this.month = undefined
  }else if (!this.endDate && this.startDate) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    this.endDate = endDate;
    this.month = undefined
  }
  next();
});

// Add 1 month to endDate from startDate
subscriptionSchema.pre('findOneAndUpdate', async function(next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  const setDoc = this._update;
  if (setDoc.month && docToUpdate.startDate){
    console.log(setDoc.month)
    const startDate = new Date(docToUpdate.startDate);
    console.log(startDate.getMonth())
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + setDoc.month, startDate.getDate());
    setDoc.endDate = endDate;
    console.log(endDate)
    setDoc.month = undefined
  }
  next()
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
