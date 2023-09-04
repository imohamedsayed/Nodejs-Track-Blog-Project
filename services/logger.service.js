const { format, createLogger, transports } = require("winston");
const { timestamp, combine, printf, errors, json } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  let logMessage = `${timestamp} | ${level.toLocaleUpperCase()} | ${
    stack || (typeof message == "object" ? JSON.stringify(message) : message)
  }`;

  return logMessage;
});

const getLogger = (filename) => {
  const logger = createLogger({
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      json(),
      logFormat
    ),
    transports: [
      new transports.File({ filename: `./logs/${filename}.log` }),
      new transports.File({ filename: `./logs/all.log` }),
      new transports.Console(),
    ],
  });

  return logger;
};

module.exports = getLogger;
