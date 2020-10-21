import { RoleType } from '../core/config';

export const verify = (roleName: RoleType) => (req, res, next) => {
    const { roles } = req.user as any;

    const containsRole = roles.some(r => r.name === roleName);

    if (!containsRole) {
        return res.status(400).send('Insufficient privileges');
    }

    next();
};