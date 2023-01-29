const { selectAll, selectGet } = require("../middleware/query");

const tableName = "services";

const getAllServices = async () => {
  let result = [];
  try {
    let sql = `SELECT * FROM ${tableName}`;
    let services = await selectAll(sql);

    services.forEach((service) => {
      result.push({ id: service.id, service_name: service.service_name });
    });

    return result;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return { error: err.message };
  }
};

const getServiceNameById = async (service_id) => {
  try {
    var sql = `select * from ${tableName} where id = ?`;
    var params = [service_id];
    const row = await selectGet(sql, params);
    return row.service_name;
  } catch (err) {
    return { error: err.message };
  }
};

const getServiceByName = async (service_name) => {
  try {
    var sql = `select * from ${tableName} where service_name = ?`;
    var params = [service_name];
    const row = await selectGet(sql, params);
    return row;
  } catch (err) {
    return { error: err.message };
  }
};

module.exports = {
  getAllServices,
  getServiceNameById,
  getServiceByName,
};
