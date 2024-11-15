require ("dotenv").config();

const express = require('express')
const app = express()
const logger = require('./config/config.logger')
const morganMiddleware = require("./config/config.httplogger");

const customerRoute = require("./api/customer/customer.routes");
const userRoute = require("./api/user/user.routes");

app.use(morganMiddleware)
app.use(express.json());

app.use(process.env.API_CUSTOMER, customerRoute);
app.use(process.env.API_USER,userRoute);



app.listen(process.env.APP_PORT, () =>
    logger.info('Express.js listening on port 3000.'))
