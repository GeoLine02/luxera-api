import winston from "winston";

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
  },
};

// add colors to the custom levels
winston.addColors(customLevels.colors);

// define a logger with custom levels
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),

  transports: [new winston.transports.Console()],
});
export default logger;
