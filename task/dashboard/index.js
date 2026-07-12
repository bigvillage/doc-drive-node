const util = require("../../lib/util");
const svc = require("./service");

const get = async (req, res, qObj) => {

    svc.getDashboard(req, res, qObj, (error, result) => {
        if (error) return util.writeError(error, res);
        util.writeSuccess(result, res);
    });

};

module.exports = {
    get
};