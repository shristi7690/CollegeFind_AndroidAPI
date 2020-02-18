const express = require('express');
const cors = require('cors');
const userRouter = require('./route/user-route');
const collegeRouter = require('./route/college-route');
const port = process.env.PORT;
require('./db/db');

const app = express();

app.use(cors());
app.use(express.json({limit: "200mb"}));
app.use(express.urlencoded({limit: "200mb", extended: true}));
app.use(userRouter);
app.use(collegeRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
