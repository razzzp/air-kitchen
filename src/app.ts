import express, { NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import createError, { HttpError } from 'http-errors';
import "reflect-metadata";


const app = express();
const port = 3000;

// middle wares
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));


app.get('/', function(req : any, res : any, next : any){
    res.send('hiiiii');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err : any, req : any, res : any, next : any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error', );
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

module.exports = app;
