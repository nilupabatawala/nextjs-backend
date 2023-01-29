const { db } = require("../middleware/connection");
const { selectGet } = require("../middleware/query");
const table_name = "location_detail";

const { getAllSites: allSites } = require("./siteController");

const getAll = async (req, res, next) => {
  try {
    let sites = await allSites();

    var sql = `select * from ${table_name}`;
    var sql_count = `select count(*) as totalRecords from ${table_name}`;
    var params = [];
    let count_rows = 0;

    db.get(sql_count, params, (err, row) => {
      count_rows = row;
    });

    if (!count_rows) {
      return res.status(400).json("No records found.");
    }

    db.all(sql, params, (err, row) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(200).json({
        message: "success",
        result: {
          data: { row },
          count: count_rows,
        },
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    return res.status(err.statusCode).json({ error: err.message });
  }
};

const getByID = async (req, res, next) => {
  const id = req.params.id;
  try {
    var sql = `select * from ${table_name} where id = ?`;
    var params = [id];
    const row = await selectGet(sql, params);
    return res.status(200).json({
      message: "success",
      result: {
        data: row,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    return res.status(err.statusCode).json({ error: err.message });
  }
};

module.exports = {
  getAll,
  getByID,
};
