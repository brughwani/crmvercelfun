const Airtable = require('airtable');

module.exports = async (req, res) => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { category, getCategories, getAllProducts } = req.query;

    // Get all categories
    if (getCategories === 'true') {
      const categories = new Set();
      
      await base('Products')
        .select({
          view: "Grid view"
        })
        .eachPage((records, fetchNextPage) => {
          records.forEach(record => {
            const category = record.get('Category');
            if (category) {
              categories.add(category);
            }
          });
          fetchNextPage();
        });

      return res.status(200).json(Array.from(categories));
    }

    // Get all products grouped by category
    if (getAllProducts === 'true') {
      const productsByCategory = {};
      
      await base('Products')
        .select({
          view: "Grid view"
        })
        .eachPage((records, fetchNextPage) => {
          records.forEach(record => {
            const category = record.get('Category');
            const productInfo = {
              id: record.id,
              productName: record.get('Product Name'),
              category: category
            };
            
            if (category) {
              if (!productsByCategory[category]) {
                productsByCategory[category] = [];
              }
              productsByCategory[category].push(productInfo);
            }
          });
          fetchNextPage();
        });

      return res.status(200).json(productsByCategory);
    }

    // Get products by specific category
    if (category) {
      const records = [];
      await new Promise((resolve, reject) => {
        base('Products')
          .select({
            filterByFormula: `{Category} = "${category}"`,
            view: "Grid view"
          })
          .eachPage(
            function page(recordBatch, fetchNextPage) {
              recordBatch.forEach(record => {
                records.push({
                  id: record.id,
                  productName: record.get('Product Name'),
                  category: record.get('Category')
                });
              });
              fetchNextPage();
            },
            function done(err) {
              if (err) reject(err);
              else resolve();
            }
          );
      });

      return res.status(200).json(records);
    }

    // If no parameters provided, return error
    res.status(400).json({ error: 'Missing required query parameters' });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};