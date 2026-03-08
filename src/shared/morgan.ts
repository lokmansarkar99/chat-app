import morgan , { StreamOptions} from "morgan";

import { logger, errorLogger } from "./logger"; 

// Success stream — winston logger-এ পাঠাও
const successStream: StreamOptions = {
  write: (message: string) => logger.info(message.trim()),
}

// Error stream — winston errorLogger-এ পাঠাও
const errorStream: StreamOptions = {
  write: (message: string) => errorLogger.error(message.trim()),
}

// 2xx, 3xx → success handler
const successHandler = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    skip:   (_req, res) => res.statusCode >= 400,
    stream: successStream,
  }
)

// 4xx, 5xx → error handler
const errorHandler = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    skip:   (_req, res) => res.statusCode < 400,
    stream: errorStream,
  }
)

export const Morgan = { successHandler, errorHandler }