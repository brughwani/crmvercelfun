const Airtable = require('airtable');

// Configure the Airtable base with your API key and base ID
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);


module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 //   let filteredFields = {};

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
    
      if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const adminRecords = await base('admin').select({
        view: "Grid view" // Adjust view as necessary
    }).all();

    const retrievedRecords = adminRecords.map(record => {
      return {
        id:record.id,
        fields:record.fields

      }
    });

    if(retrievedRecords.length>0)
    {
    //  console.log(adminRecords);
  //   console.log(retrievedRecords);

  //  console.log(retrievedRecords[fields])

      res.status(200).json(retrievedRecords);

   // res.status(200).json(adminRecords);
    }
    else
    {
        res.status(404).json({ message: 'No records found' });
    }
}



    