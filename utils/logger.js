import { allure } from 'allure-playwright';

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

export class Logger {
  constructor(context = 'General') {
    this.context = context;
    this.level = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];
    this.buffer = [];
  }

  _format(level, message, data) {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    return data ? `${base} ${JSON.stringify(data)}` : base;
  }

  _log(level, message, data) {
    if (LOG_LEVELS[level] >= this.level) {
      const formatted = this._format(level, message, data);
      console.log(formatted);
      this.buffer.push(formatted);
    }
  }

  debug(message, data) { this._log('debug', message, data); }
  info(message, data)  { this._log('info', message, data); }
  warn(message, data)  { this._log('warn', message, data); }
  error(message, data) { this._log('error', message, data); }

  /**
   * Сбросить накопленные логи в Allure и очистить буфер.
   */
  async flushToAllure(name = 'Test Logs') {
    if (this.buffer.length > 0) {
      await allure.attachment(name, this.buffer.join('\n'), 'text/plain');
      this.buffer = [];
    }
  }
}

/** Global API logger instance — shared across API clients, flushed to Allure in afterEach */
export const apiLogger = new Logger('API');
