import * as Sentry from '@sentry/node';
import { ApolloError } from 'apollo-server-express';
import { PluginDefinition } from 'apollo-server-core'

// https://blog.sentry.io/2020/07/22/handling-graphql-errors-using-sentry
export function didEncounterErrors(ctx: any) {
    // If we couldn't parse the operation, don't
    // do anything here
    if (!ctx.operation) {
        return;
    }
    for (const err of ctx.errors) {
        // Only report internal server errors,
        // all errors extending ApolloError should be user-facing
        if (err instanceof ApolloError) {
            continue;
        }
        // Add scoped report details and send to Sentry
        Sentry.withScope(scope => {
            // Annotate whether failing operation was query/mutation/subscription
            scope.setTag("kind", ctx.operation.operation);
            // Log query and variables as extras
            // (make sure to strip out sensitive data!)
            scope.setExtra("query", ctx.request.query);
            scope.setExtra("variables", ctx.request.variables);
            if (err.path) {
                // We can also add the path as breadcrumb
                scope.addBreadcrumb({
                    category: "query-path",
                    message: err.path.join(" > "),
                    level: Sentry.Severity.Debug
                });
            }
            Sentry.captureException(err);
        });
    }
}

export const apolloSentryPlugin: PluginDefinition = {
    requestDidStart(requestContext) {
        if (requestContext.request.operationName) {
            const transaction = Sentry.startTransaction({
                op: 'GraphQL',
                name: requestContext.request.operationName
            });
            Sentry.configureScope(scope => scope.setSpan(transaction));
            (requestContext as any).graphQLTransaction = transaction;
        }
        return {
            willSendResponse: (requestContext) => {
                if ((requestContext as any).graphQLTransaction) {
                    (requestContext as any).graphQLTransaction.finish();
                }
            },
            didEncounterErrors
        }
    },
  };
