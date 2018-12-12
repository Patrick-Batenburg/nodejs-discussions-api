let url = "mongodb://admin:YqJVdvGdx6V6Bu4@ds024748.mlab.com:24748/threadapi";

if (process.env.NODE_ENV === "development") {
    url = "mongodb://localhost:27017/threadapi";
}

module.exports = {
    MONGO_CONNECT_URL: url
};