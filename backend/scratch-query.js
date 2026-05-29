const mongoose = require('mongoose');
try {
  process.loadEnvFile();
} catch (e) {}

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to DB');
    const assignmentSchema = new mongoose.Schema({}, { strict: false });
    const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');
    
    const count = await Assignment.countDocuments({});
    console.log('Total assignments:', count);
    
    const first = await Assignment.findOne({});
    console.log('First assignment document:', JSON.stringify(first, null, 2));
    
    await mongoose.disconnect();
  })
  .catch(console.error);
