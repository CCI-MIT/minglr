const { Log } = require("../schemas/Log");

module.exports = function (kind, current_id, content_id = "") {
    const log = new Log({
        kind: kind,
        content: content_id,
        user: current_id,
    });

    log.save((err, doc) => {
        if (err) console.error(err)
    });
}