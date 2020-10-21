import contextService from 'request-context';

export function identity(this: any, next: any) {
    const user = contextService.get('request').user;
    if (!user) {
        throw new Error('Missing user in request');
    }
    const doc: any = this;
    if (!doc.createdBy) {
        doc.createdBy = user._id;
    }
    doc.updatedBy = user._id;
    next();
}
