import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  const { method, url, body } = req;

  // Listen for the moment the response is sent back to the client
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const status = res.statusCode;

    // Color code the status code
    let statusColor = chalk.green; // 2xx
    if (status >= 500) statusColor = chalk.red.bold; // 5xx
    else if (status >= 400) statusColor = chalk.yellow; // 4xx
    else if (status >= 300) statusColor = chalk.cyan; // 3xx

    // Format: [HH:MM:SS] METHOD /url STATUS (TIME ms)
    console.log(
      `${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ` +
      `${chalk.bold.white(method)} ` +
      `${chalk.blue(url)} ` +
      `${statusColor(status)} ` +
      `${chalk.gray(`(${timeInMs}ms)`)}`
    );

    // Optionally log body for non-GET requests
    if (method !== 'GET' && Object.keys(body).length > 0) {
      console.log(chalk.magenta('  ↳ Body:'), JSON.stringify(body, null, 2));
    }
  });

  next();
};