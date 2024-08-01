import { initializeKnex } from "./config/knexConfig";
import Logger from "./utils/Logger"
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT;

const logger = Logger.getLogger();
const startServer = async () => {
    try {
        await initializeKnex();
        const { default: app } = await import('./app');
        await app.listen(PORT, () => {
            logger.info(`API Gateway running on port3 ${PORT}`)
        })
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to start server: ${error.message}`);
        } else {
            logger.error(`Failed to start server: Unknown error`);
        }
        process.exit(1)
    }
}

startServer()
