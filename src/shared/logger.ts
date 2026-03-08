
import path from "path"
import DailyRotateFile from "winston-daily-rotate-file"
import { createLogger, format, transports } from "winston"
import { TransformableInfo } from "logform"

const { combine, timestamp, label, printf } = format

interface IMessageProps extends TransformableInfo {
  label: string,
  timestamp: string
}

const myFormat = printf((info: TransformableInfo) => {
  const { level, message, label, timestamp } = info as IMessageProps;
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level:  "info",
  format: combine(label({ label: "BD-ICONIC" }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename:    path.join(process.cwd(), "winston", "success", "%DATE%-success.log"),
      datePattern: "DD-MM-YYYY-HH",
      maxSize:     "20m",
      maxFiles:    "1d",
    }),
  ],
})

const errorLogger = createLogger({
  level:  "error",
  format: combine(label({ label: "BD-ICONIC" }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename:    path.join(process.cwd(), "winston", "error", "%DATE%-error.log"),
      datePattern: "DD-MM-YYYY-HH",
      maxSize:     "20m",
      maxFiles:    "1d",
    }),
  ],
})

export { logger, errorLogger }
