const db = require("../../db/database");
const { createCustomer } = require("../../utils/getOrCreateCustomer");


// const addInquiry = async (req, res) => {
//     const {
//         customer_name,
//         customer_contact,
//         customer_email = "NA",
//         customer_address = "NA",
//         notes,
//         products

//     } = req.body;
//     const { signup_id } = req.user;

//     const connection = await db.getConnection();

//     try {
//         if (!customer_contact || !products || products.length === 0) {
//             return res.status(400).json({
//                 error: "Customer contact and at least one product are required"
//             });
//         }

//         await connection.beginTransaction();
//         const [existingCustomer] = await connection.query(
//             `SELECT customer_id, customer_name, customer_contact, customer_email, customer_address 
//              FROM customers 
//              WHERE signup_id=? AND customer_contact=? 
//              LIMIT 1`,
//             [signup_id, customer_contact]
//         );
        
//         let customer_id;
//         let customerInfo;
        
//         if (existingCustomer.length > 0) {
//             customer_id = existingCustomer[0].customer_id;
//             customerInfo = existingCustomer[0];
//         } else {
//             const newCustomer = await createCustomer(connection, signup_id, {
//                 customer_name,
//                 customer_contact,
//                 customer_email,
//                 customer_address
//             });
//             customer_id = newCustomer.customer_id;
//             customerInfo = {
//                 customer_id,
//                 customer_name,
//                 customer_contact,
//                 customer_email,
//                 customer_address
//             };
//         }
        
//         //  Generate inquiry serial & number
//         const now = new Date();
//         const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
//         const year = now.getFullYear().toString().slice(-2);

//         const [latest] = await connection.query(
//             "SELECT MAX(inquiry_serial) AS max_serial FROM inquires WHERE signup_id = ?",
//             [signup_id]
//         );

//         const nextSerial = (latest[0].max_serial || 0) + 1;
//         const inquiry_no = `INQ0${nextSerial}/${month}/${year}`;

//         const [inquiryResult] = await connection.query(
//             `INSERT INTO inquires 
//              (signup_id, inquiry_serial, inquiry_no, customer_id, notes) 
//              VALUES (?, ?, ?, ?, ?)`,
//             [signup_id, nextSerial, inquiry_no, customer_id, notes]
//         );
//         const inquiry_id = inquiryResult.insertId;

//         //  Insert all products into inquiry_items
//         const itemsData = products.map(items => [
//             inquiry_id,
//             items.product_name,
//             items.problem_description || "NA",
//             items.accessories_given || "NA"
//         ]);

//         await connection.query(
//             `INSERT INTO inquiry_items (inquiry_id, product_name, problem_description, accessories_given) 
//          VALUES ?`,
//             [itemsData]
//         );

//         await connection.commit();

//         return res.status(201).json({
//             message: "Inquiry created successfully",
//             inquiry_no,
//             inquiry_id,
//             inquiry_date: now.toISOString(),
//             customer: {
//                 customer_id: customerInfo.customer_id,
//                 customer_name: customerInfo.customer_name,
//                 customer_contact: customerInfo.customer_contact,
//                 customer_email: customerInfo.customer_email,
//                 customer_address: customerInfo.customer_address
//             },
//             products: products.map(item => ({
//                 product_name: item.product_name,
//                 problem_description: item.problem_description || "NA",
//                 accessories_given: item.accessories_given || "NA"
//             })),
//             notes: notes || ""
//         });

//     } catch (error) {
//         await connection.rollback();
//         console.error("Error creating inquiry:", error);
//         res.status(500).json({ error: "Internal Server Error" });

//     } finally {
//         connection.release();
//     }
// }

const addInquiry = async (req, res) => {
    const {
        customer_name,
        customer_contact,
        customer_email = "NA",
        customer_address = "NA",
        notes,
        products
    } = req.body;
    const { signup_id } = req.user;

    const connection = await db.getConnection();

    try {
        if (!customer_contact || !products || products.length === 0) {
            return res.status(400).json({
                error: "Customer contact and at least one product are required"
            });
        }

        await connection.beginTransaction();
        const [existingCustomer] = await connection.query(
            `SELECT customer_id, customer_name, customer_contact, customer_email, customer_address 
             FROM customers 
             WHERE signup_id=? AND customer_contact=? 
             LIMIT 1`,
            [signup_id, customer_contact]
        );
        
        let customer_id;
        let customerInfo;
        
        if (existingCustomer.length > 0) {
            customer_id = existingCustomer[0].customer_id;
            customerInfo = existingCustomer[0];
        } else {
            const newCustomer = await createCustomer(connection, signup_id, {
                customer_name,
                customer_contact,
                customer_email,
                customer_address
            });
            customer_id = newCustomer.customer_id;
            customerInfo = {
                customer_id,
                customer_name,
                customer_contact,
                customer_email,
                customer_address
            };
        }
        
        const now = new Date();
        const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
        const year = now.getFullYear().toString().slice(-2);

        const [latest] = await connection.query(
            "SELECT MAX(inquiry_serial) AS max_serial FROM inquires WHERE signup_id = ?",
            [signup_id]
        );

        const nextSerial = (latest[0].max_serial || 0) + 1;
        const inquiry_no = `INQ0${nextSerial}/${month}/${year}`;

        const [inquiryResult] = await connection.query(
            `INSERT INTO inquires 
             (signup_id, inquiry_serial, inquiry_no, customer_id, notes) 
             VALUES (?, ?, ?, ?, ?)`,
            [signup_id, nextSerial, inquiry_no, customer_id, notes]
        );
        const inquiry_id = inquiryResult.insertId;

        const itemsData = products.map(items => [
            inquiry_id,
            items.product_name,
            items.problem_description || "NA",
            items.accessories_given || "NA"
        ]);

        await connection.query(
            `INSERT INTO inquiry_items (inquiry_id, product_name, problem_description, accessories_given) 
         VALUES ?`,
            [itemsData]
        );

        await connection.commit();

        return res.status(201).json({
            message: "Inquiry created successfully",
            inquiry_no,
            inquiry_id,
            inquiry_date: now.toISOString(),
            customer: {
                customer_id: customerInfo.customer_id,
                customer_name: customerInfo.customer_name,
                customer_contact: customerInfo.customer_contact,
                customer_email: customerInfo.customer_email,
                customer_address: customerInfo.customer_address
            },
            products: products.map(item => ({
                product_name: item.product_name,
                problem_description: item.problem_description || "NA",
                accessories_given: item.accessories_given || "NA"
            })),
            notes: notes || ""
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error creating inquiry:", error);
        res.status(500).json({ error: "Internal Server Error" });

    } finally {
        connection.release();
    }
}

const updateInquiry = async (req, res) => {
    const { inquiry_id } = req.params;
    const {
        notes,                // optional: update notes for inquiry
        items,                // optional: add/update items [{item_id?, product_name, problem_description, accessories_given}]
        deleted_item_ids      // optional: array of inquiry_item IDs to delete
    } = req.body;

    const { signup_id } = req.user;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        //  Check if inquiry exists and belongs to the logged-in user
        const [inquiry] = await connection.query(
            `SELECT inquiry_id, customer_id 
             FROM inquires 
             WHERE inquiry_id = ? AND signup_id = ?`,
            [inquiry_id, signup_id]
        );

        if (inquiry.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Inquiry not found" });
        }

        //  Update notes only (no customer info change allowed)
        if (notes !== undefined) {
            await connection.query(
                `UPDATE inquires 
                 SET notes = ? 
                 WHERE inquiry_id = ? AND signup_id = ?`,
                [notes, inquiry_id, signup_id]
            );
        }

        //  Delete specified items (if any)
        if (deleted_item_ids && deleted_item_ids.length > 0) {
            await connection.query(
                `DELETE FROM inquiry_items 
                 WHERE inquiry_id = ? 
                 AND item_id IN (?)`,
                [inquiry_id, deleted_item_ids]
            );
        }

        //  Add or update items
        if (items && items.length > 0) {
            for (const item of items) {
                if (item.inquiry_item_id) {
                    // Update existing item
                    await connection.query(
                        `UPDATE inquiry_items 
                         SET product_name = ?, 
                             problem_description = ?, 
                             accessories_given = ? 
                         WHERE item_id = ? 
                         AND inquiry_id = ?`,
                        [
                            item.product_name,
                            item.problem_description || "NA",
                            item.accessories_given || "NA",
                            item.inquiry_item_id,
                            inquiry_id
                        ]
                    );
                } else {
                    // Insert new item
                    await connection.query(
                        `INSERT INTO inquiry_items 
                         (inquiry_id, product_name, problem_description, accessories_given) 
                         VALUES (?, ?, ?, ?)`,
                        [
                            inquiry_id,
                            item.product_name,
                            item.problem_description || "NA",
                            item.accessories_given || "NA"
                        ]
                    );
                }
            }
        }

        await connection.commit();

        return res.status(200).json({
            message: "Inquiry updated successfully",
            inquiry_id
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error updating inquiry:", error);
        res.status(500).json({ error: "Internal Server Error" });

    } finally {
        connection.release();
    }
};

const deleteInquiry = async (req, res) => {
    const { inquiry_id } = req.params;
    const { signup_id } = req.user;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [inquiry] = await connection.query(`
        SELECT * FROM inquires WHERE inquiry_id=? AND signup_id=?`, [inquiry_id, signup_id]);

        if (inquiry.length === 0) {
            return res.status(404).json({ error: "Inquiry not found or unauthorized" });
        }
        await connection.query(`
        DELETE FROM inquiry_items WHERE inquiry_id=?`, [inquiry_id]);

        await connection.query(`
        DELETE FROM inquires WHERE inquiry_id=? AND signup_id=?`, [inquiry_id, signup_id]);

        await connection.commit();

        res.status(200).json({ message: "Inquiry and its items deleted successfully", inquiry_id })

    } catch (error) {
        await connection.rollback();
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });

    }
    finally {
        connection.release();

    }
}

const getSingleInquiry = async (req, res) => {
    const { inquiry_id } = req.params;
    const { signup_id } = req.user;

    try {
        // 1. Fetch inquiry + customer + technician
        const [inquiryRows] = await db.query(`
            SELECT i.inquiry_id, i.inquiry_no, i.status, i.notes, i.created_date, i.created_time,
                   c.customer_id, c.customer_name, c.customer_contact, c.customer_email,
                   t.technician_id, t.technician_name, t.technician_phone
            FROM inquires i
            JOIN customers c ON i.customer_id = c.customer_id
            LEFT JOIN technicians t ON i.technician_id = t.technician_id
            WHERE i.signup_id = ? AND i.inquiry_id = ?
        `, [signup_id, inquiry_id]);

        if (inquiryRows.length === 0) {
            return res.status(404).json({ error: "Inquiry not found" });
        }

        const inquiry = inquiryRows[0];

        // Handle unassigned technician
        inquiry.technician_name = inquiry.technician_name || "Not Assigned";
        inquiry.technician_phone = inquiry.technician_phone || "NA";

        // 2. Fetch inquiry items
        const [items] = await db.query(`
            SELECT item_id, product_name, problem_description, accessories_given
            FROM inquiry_items
            WHERE inquiry_id = ?
        `, [inquiry_id]);
        inquiry.products = items;

        // 3. Fetch quotation (and its items)
        const [quotationRows] = await db.query(`
            SELECT q.quotation_id, q.quotation_no, q.status, q.total_amount,
                   q.quotation_date, q.quotation_time
            FROM quotation q
            WHERE q.signup_id = ? AND q.inquiry_id = ?
        `, [signup_id, inquiry_id]);

        if (quotationRows.length > 0) {
            const quotation = quotationRows[0];

            const [quotationItems] = await db.query(`
                SELECT item_id, product_name, product_description, quantity, unit_price, total_price, warranty
                FROM quotation_items
                WHERE quotation_id = ?
            `, [quotation.quotation_id]);

            quotation.items = quotationItems;
            inquiry.quotation = quotation;
        } else {
            inquiry.quotation = null;
        }

        // 4. Fetch repair (if exists)
        const [repairRows] = await db.query(`
            SELECT r.repair_id, r.repair_no, r.repair_status,
                   r.created_date AS repair_date, r.created_time AS repair_time
            FROM repairs r
            WHERE r.signup_id = ? AND r.inquiry_id = ?
        `, [signup_id, inquiry_id]);

        inquiry.repair = repairRows.length > 0 ? repairRows[0] : null;

        res.status(200).json({ data: inquiry });

    } catch (error) {
        console.error("Error fetching inquiry detail:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAllInquiries = async (req, res) => {
    const { signup_id } = req.user;
  
    try {
      const [inquiries] = await db.query(
        `
        SELECT 
          i.inquiry_id,
          i.inquiry_no,
          c.customer_name,
          i.status,
          COALESCE(t.technician_name, 'Not Assigned') AS technician_name,
          i.notes,
          i.created_date,
          i.created_time
        FROM inquires i
        JOIN customers c ON i.customer_id = c.customer_id
        LEFT JOIN technicians t ON i.technician_id = t.technician_id
        WHERE i.signup_id = ?
        ORDER BY i.inquiry_id DESC
        `,
        [signup_id]
      );
  
      if (inquiries.length === 0) {
        return res.status(200).json({ message: "No inquiries found." });
      }
  
      res.status(200).json({ total: inquiries.length, inquiries });
  
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};


const getInquiryReceipt = async (req, res) => {
    const { inquiry_id } = req.params;
    const { signup_id } = req.user;

    try {
        // Fetch inquiry with customer and user profile details
        const [inquiryRows] = await db.query(`
            SELECT 
                i.inquiry_id, i.inquiry_no, i.status, i.notes, 
                i.created_date, i.created_time,
                c.customer_id, c.customer_name, c.customer_contact, 
                c.customer_email, c.customer_address,
                up.business_name, up.business_email, up.address as business_address,
                up.mobile_number as business_phone, up.logo_url
            FROM inquires i
            JOIN customers c ON i.customer_id = c.customer_id
            LEFT JOIN user_profiles up ON i.signup_id = up.signup_id
            WHERE i.signup_id = ? AND i.inquiry_id = ?
        `, [signup_id, inquiry_id]);

        if (inquiryRows.length === 0) {
            return res.status(404).json({ error: "Inquiry not found" });
        }

        const inquiry = inquiryRows[0];

        // Fetch inquiry items
        const [items] = await db.query(`
            SELECT item_id, product_name, problem_description, accessories_given
            FROM inquiry_items
            WHERE inquiry_id = ?
        `, [inquiry_id]);

        // Fetch terms and conditions
        const [terms] = await db.query(`
            SELECT terms_id, term_text
            FROM inquiry_terms_conditions
            WHERE signup_id = ?
            ORDER BY terms_id
        `, [signup_id]);

        res.status(200).json({
            inquiry_no: inquiry.inquiry_no,
            inquiry_date: inquiry.created_date,
            inquiry_time: inquiry.created_time,
            status: inquiry.status,
            notes: inquiry.notes,
            customer: {
                customer_name: inquiry.customer_name,
                customer_contact: inquiry.customer_contact,
                customer_email: inquiry.customer_email || 'NA',
                customer_address: inquiry.customer_address || 'NA'
            },
            business: {
                business_name: inquiry.business_name || 'Your Business Name',
                business_email: inquiry.business_email || '',
                business_address: inquiry.business_address || '',
                business_phone: inquiry.business_phone || '',
                logo_url: inquiry.logo_url || null
            },
            products: items,
            terms: terms.map(t => t.term_text)
        });

    } catch (error) {
        console.error('Error fetching inquiry receipt:', error);
        res.status(500).json({ error: 'Failed to fetch inquiry receipt data' });
    }
};


module.exports = { addInquiry, updateInquiry, deleteInquiry, getSingleInquiry, getAllInquiries, getInquiryReceipt}
