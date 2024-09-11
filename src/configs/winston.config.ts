import winston, { transports } from 'winston';

const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, service, message, timestamp }) => {
  return `${timestamp} [${level}, ${service}]: ${message}`;
});

const logger = winston.createLogger({
    level: "info",
    defaultMeta: { service: 'service' },
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: '/logs/combined.log' }), // Update the path to /logs/combined.log
        new transports.File({ filename: '/logs/error.log', level: 'error' }) // Update the path to /logs/error.log
    ]
})

export default logger;