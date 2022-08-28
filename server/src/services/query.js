
function getPagination(query) {
    const limit = Math.abs(query.limit) || 1;
    const page = Math.abs(query.page) || 0;

    const skip = (page - 1) * limit;

    return {
        skip,
        limit
    }

}

module.exports = {
    getPagination
};