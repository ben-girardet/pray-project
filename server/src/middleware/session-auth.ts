import session from 'express-session';

export const register = (app: any) => {
    const SESSION_SECRET = process.env.SESSION_SECRET ?? '';

    app.use( session( {
        resave: true,
        saveUninitialized: false,
        secret: SESSION_SECRET
    } ) );
};