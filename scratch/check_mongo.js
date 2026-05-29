const mongoose = require('mongoose');

const uri = 'mongodb+srv://duongevil123_db_user:TnIrhdn1BSKoBD44@vn-jp-connect.eraedra.mongodb.net/GnoudCRM?appName=VN-JP-CONNECT';

async function main() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas!");
    
    // Get list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Check if there are other collections
    for (const col of collections) {
      if (col.name.includes('profile') || col.name.includes('log') || col.name.includes('backup') || col.name.includes('old') || col.name.includes('temp')) {
        console.log(`Found interesting collection: ${col.name}`);
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`Count in ${col.name}: ${count}`);
      }
    }
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

main();
