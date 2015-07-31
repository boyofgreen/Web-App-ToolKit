var logger = {
  log: function () {
    if (process.env.NODE_ENV !== 'test') {
      console.log.apply(this, arguments)
    }
  },
  warn: function() {
    if (process.env.NODE_ENV !== 'test') {
      console.warn.apply(this, arguments)
    }
  }
};

module.exports = logger;
