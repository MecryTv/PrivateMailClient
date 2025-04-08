import fs from "fs";
import path from "path";
import util from "util";

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  grey: '\x1b[90m',
  green: '\x1b[32m',
  orange: '\x1b[33m',
  red: '\x1b[31m'
};

class Logger {
  private logsDir: string;
  private currentLogFile: string;
  private logIndex: number = 0;
  private lineCount: number = 0;
  private lastCheckHour: number = new Date().getHours();
  private checkInterval: NodeJS.Timeout;

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.currentLogFile = path.join(this.logsDir, 'today.log');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    // Create or check today.log file
    if (fs.existsSync(this.currentLogFile)) {
      // Count existing lines
      const fileContent = fs.readFileSync(this.currentLogFile, 'utf8');
      this.lineCount = fileContent.split('\n').length - 1;
      
      // Find the highest log index
      const logIndices = fileContent.match(/\[(\d+)\]/g);
      if (logIndices && logIndices.length > 0) {
        const maxIndex = Math.max(...logIndices.map(idx => parseInt(idx.slice(1, -1))));
        this.logIndex = maxIndex + 1;
      }
    } else {
      // Create empty log file
      fs.writeFileSync(this.currentLogFile, '');
    }
    
    // Set up hourly check for day change and line count
    this.checkInterval = setInterval(() => this.checkLogFile(), 60 * 60 * 1000); // Check every hour
  }

  private getCurrentTimeString(): string {
    const now = new Date();
    return `${now.toTimeString().split(' ')[0]} ${now.toISOString().split('T')[0]}`;
  }

  private getFormattedDateTimeForFilename(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${date}-${time}`;
  }

  private checkLogFile(): void {
    const currentHour = new Date().getHours();
    const currentDate = new Date().toISOString().split('T')[0];
    const fileDate = fs.existsSync(this.currentLogFile) ? 
      new Date(fs.statSync(this.currentLogFile).mtime).toISOString().split('T')[0] : 
      currentDate;
    
    // Check if it's a new day or if line count exceeds 1000
    if (currentDate !== fileDate || this.lineCount >= 1000) {
      this.rotateLogFile();
    }
    
    this.lastCheckHour = currentHour;
  }

  private rotateLogFile(): void {
    if (fs.existsSync(this.currentLogFile)) {
      // Rename current log file
      const newFileName = `${this.getFormattedDateTimeForFilename()}.log`;
      const newFilePath = path.join(this.logsDir, newFileName);
      
      fs.renameSync(this.currentLogFile, newFilePath);
      
      // Create new today.log file
      fs.writeFileSync(this.currentLogFile, '');
      
      // Reset line count
      this.lineCount = 0;
    }
  }

  private writeToLog(level: 'info' | 'warn' | 'error', message: string): void {
    const timestamp = this.getCurrentTimeString();
    const logMessage = `${colors.grey}${timestamp} [${this.logIndex}]: ${level === 'info' ? colors.green : level === 'warn' ? colors.orange : colors.red}${level}${colors.reset} ${message}\n`;
    
    // Write to console
    process.stdout.write(logMessage);
    
    // Write to file without colors
    const logMessageForFile = `${timestamp} [${this.logIndex}]: ${level} ${message}\n`;
    fs.appendFileSync(this.currentLogFile, logMessageForFile);
    
    // Increment counters
    this.logIndex++;
    this.lineCount++;
    
    // Check if we need to rotate the log file
    if (this.lineCount >= 1000) {
      this.rotateLogFile();
    }
  }

  public info(message: any): void {
    if (typeof message !== 'string') {
      message = util.inspect(message, { depth: null });
    }
    this.writeToLog('info', message);
  }

  public warn(message: any): void {
    if (typeof message !== 'string') {
      message = util.inspect(message, { depth: null });
    }
    this.writeToLog('warn', message);
  }

  public error(message: any): void {
    if (typeof message !== 'string') {
      message = util.inspect(message, { depth: null });
    }
    this.writeToLog('error', message);
  }

  // Cleanup method to clear interval when the application shuts down
  public close(): void {
    clearInterval(this.checkInterval);
  }
}

// Create and export a singleton instance
const logger = new Logger();

// Handle process exit to properly close the logger
process.on('exit', () => {
  logger.close();
});

// Handle other termination signals
process.on('SIGINT', () => {
  logger.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.close();
  process.exit(0);
});

export default logger;
