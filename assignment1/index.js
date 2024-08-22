const express = require('express')
const sqlite3= require('sqlite3')

const db = new sqlite3.Database('./assignment.db',sqlite3.OPEN_READWRITE)



const app  = express()
app.listen(8000)

app.get('/categories/:categoryname', (req, res) => {
    const categoryName = req.params.categoryname;


    const topN = parseInt(req.query.n) || 5; // Default to 10 if `n` is not provided
  
    const sql = `
      SELECT p.*
      FROM product p
      JOIN categories c ON p.category = c.id
      WHERE c.category = ?
      ORDER BY p.price ASC
      LIMIT ?;
    `;

    db.all(sql, [categoryName, topN], (err, rows) =>{
        res.send(rows)
    })
  
})
  

app.get('/categories/:categoryname/products/:productid', (req, res) => {
    const { categoryname, productid } = req.params;

   
    db.get('SELECT id FROM categories WHERE category = ?', [categoryname], (err, categoryRow) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!categoryRow) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const categoryId = categoryRow.id;

       
        db.get(
            'SELECT * FROM product WHERE id = ? AND category = ?',
            [productid, categoryId],
            (err, productRow) => {
                if (err) {
                    console.error('Error executing query:', err.message);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if (!productRow) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                res.json(productRow);
            }
        );
    });
});




app.get('/companies/:company/categories/:category/products', (req, res) => {
    const { company, category } = req.params;
    const { top, minPrice, maxPrice } = req.query;

    const limit = parseInt(top) || 10;

    const query = `
        SELECT p.* 
        FROM product p
        JOIN companies c ON p.company = c.id
        JOIN categories cat ON p.category = cat.id
        WHERE c.company = ?
        AND cat.category = ?
        AND p.price BETWEEN ? AND ?
        LIMIT ?`;


    db.all(query, [company, category, minPrice, maxPrice, limit], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});
