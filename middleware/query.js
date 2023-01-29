const { db } = require("./connection");

const selectAll = (query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row); // resolve the promise
      }
    });
  });
};

const selectGet = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row); // resolve the promise
      }
    });
  });
};

const insertSingle = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row); // resolve the promise
      }
    });
  });
};

module.exports = {
  selectAll,
  selectGet,
  insertSingle,
};
