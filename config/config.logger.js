const winston = require('winston')
const { combine, timestamp, printf, colorize, align } = winston.format;
const options = {
    file: {
        level: 'http',
        filename: './files/logs/app.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        colorize: false,
    },

};

const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD hh:mm:ss A'}),
        winston.format.printf(
                (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
        )
    ),
    transports: [
        new winston.transports.File( options.file),
        //new winston.transports.File({level: 'http'}, options.file)
    ],
    exitOnError: false
})



module.exports = logger
