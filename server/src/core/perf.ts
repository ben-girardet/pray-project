import chalk from 'chalk';
import { GraphQLRequestContext } from 'apollo-server-core';

const enablePerf = true;
const logPerf = true;

export const apolloPerfPlugin = {

  // Fires whenever a GraphQL request is received from a client.
  requestDidStart(requestContext) {
  //   console.log('Request started! Query:\n' +
  //     requestContext.request.query);

  requestContext.apolloPerfPlugin__hrstart = process.hrtime();
  requestContext.p1 = true;

    return {

      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      // parsingDidStart(requestContext) {

      // },

      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      willSendResponse(requestContext: GraphQLRequestContext) {
        const r: any = requestContext;
        if (r.apolloPerfPlugin__hrstart) {
          const hrend = process.hrtime(r.apolloPerfPlugin__hrstart);
          let color: 'green' | 'blue' | 'red' = 'green';
          if (hrend[0] > 0) {
              color = 'red'
          } else if (hrend[1] / 1000000 > 300) {
              color = 'blue';
          }
          if (logPerf) {
              console.info(chalk[color](hrend[0], Math.round(hrend[1] / 1000) / 1000), chalk.grey(requestContext.request.query));
          }
          // console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
        }
      },

    }
  },
};


export class Perf {

  private hrstart: any;
  private previousstephrstart: any;
  private name: string;

  constructor(name: string) {
    this.hrstart = process.hrtime();
    this.previousstephrstart = process.hrtime();
    this.name = name;
  }

  public log(step: string) {
    const hrend = process.hrtime(this.hrstart);
    const hrenddiff = process.hrtime(this.previousstephrstart);
    this.previousstephrstart = process.hrtime();

    let color: 'green' | 'blue' | 'red' = 'green';
    if (hrenddiff[0] > 0) {
      color = 'red'
    } else if (hrenddiff[1] / 1000000 > 300) {
      color = 'blue';
    }
    if (logPerf) {
        console.info(
          chalk.grey(hrend[0], Math.round(hrend[1] / 1000) / 1000),
          chalk.grey(this.name),
          chalk.magenta(step),
          chalk[color]('+', hrenddiff[0], Math.round(hrenddiff[1] / 1000) / 1000),
          );
    }
  }
}
