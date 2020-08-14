const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys")

const redisUrl = keys.redisUrl;
const redisClient = redis.createClient(redisUrl);
redisClient.hget = util.promisify(redisClient.hget);
const exec = mongoose.Query.prototype.exec;

// add cache function to mongoose prototype

mongoose.Query.prototype.cache = function (options = {}) {
  this._cache = true;
  this.hashKey = JSON.stringify(options.key || "default");
  return this;
};

// override mongoose exec function
mongoose.Query.prototype.exec = async function () {
  if (!this._cache) {
    return await exec.apply(this, arguments);
  }
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );
  const cachedValue = await redisClient.hget(this.hashKey, key);
  if (cachedValue) {
    const doc = JSON.parse(cachedValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }
  const result = await exec.apply(this, arguments);
  redisClient.hmset(this.hashKey, key, JSON.stringify(result), "EX", 10);
  return result;
};

module.exports = {
  clearCache(hashKey) {
    redisClient.del(JSON.stringify(hashKey));
  },
};
