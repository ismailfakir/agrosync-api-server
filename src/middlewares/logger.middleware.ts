import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'credit_card'];

/**
 * Recursively redacts sensitive keys from an object
 */
const redact = (data: any, keysToHide: string[]): any => {
  if (!data || typeof data !== 'object') return data;

  // Create a copy to avoid mutating the actual request body
  const copy = Array.isArray(data) ? [...data] : { ...data };

  for (const key in copy) {
    if (keysToHide.includes(key.toLowerCase())) {
      copy[key] = '*****';
    } else if (typeof copy[key] === 'object') {
      copy[key] = redact(copy[key], keysToHide);
    }
  }
  return copy;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  const { method, url, body } = req;

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const status = res.statusCode;

    // Color code the status
    const statusColor = status >= 500 ? chalk.red.bold : status >= 400 ? chalk.yellow : chalk.green;

    console.log(
      `${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ` +
      `${chalk.bold.white(method)} ${chalk.blue(url)} ` +
      `${statusColor(status)} ${chalk.gray(`(${timeInMs}ms)`)}`
    );

    if (method !== 'GET' && Object.keys(body).length > 0) {
      // Redact the body before logging
      const safeBody = redact(body, SENSITIVE_KEYS);
      console.log(chalk.magenta('  ↳ Body:'), JSON.stringify(safeBody, null, 2));
    }
  });

  next();
};