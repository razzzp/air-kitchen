import Express from 'express';
import Path from 'path';
import CookieParser from 'cookie-parser';
import createError from 'http-errors';
import "reflect-metadata";
import { orderRouter } from './routes/api-v1/order-router';
import { initializeDataSource } from './repositories/data-sources';


const app = Express();
const port = 3000;

// initialize data source/connect to DB
initializeDataSource()
.then((dataSource)=>{
    console.log(`⚡[database]: Successfully connected to data source.`);
})
.catch(err => {
    throw err;
});

// middle wares
app.use(CookieParser());
app.use(Express.static(Path.join(process.cwd(), 'public')));

// routes
//  orders
app.use('/api/v1', orderRouter);

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
