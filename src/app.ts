import Express from 'express';
import Path from 'path';
import createError from 'http-errors';
import 'reflect-metadata';
import { orderRouter } from './routes/api-v1/order-router';
import { initializeDataSource } from './data-sources/typeorm-datasource';
import passport from 'passport';
import { AuthenticationController } from './auth/auth';
import { authRouter } from './routes/api-v1/auth-router';
import { userRouter } from './routes/api-v1/user-routers';
import Cors from 'cors';

const app = Express();
const port = 3001;

// initialize data source/connect to DB
initializeDataSource()
.then((dataSource)=>{
    console.log(`[database]: Successfully connected to data source.`);
    main();
})
.catch(reason => {
    console.error(`[error] Failed to database: ${reason}`);
    process.exit(1);
});

function main(){
    // middle wares
    // allow cors
    app.use(Cors());
    app.use(Express.urlencoded({ extended: false }));
    app.use(Express.json());
    app.use(Express.static(Path.join(process.cwd(), 'public')));


    //auth
    passport.use(AuthenticationController.getBasicStrategy());
    passport.use(AuthenticationController.getBearerStrategy());
    //passport.use(new AnonymousStrategy());

    // routes
    //  orders
    app.use('/api/v1', orderRouter());
    // registration & authentication
    app.use('/api/v1', authRouter);
    // users
    app.use('/api/v1', userRouter);

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
        res.send(`${err}`, );
    });

    app.listen(port, () => {
        console.log(`[server]: Server is running at https://localhost:${port}`);
    });
}

module.exports = app;
