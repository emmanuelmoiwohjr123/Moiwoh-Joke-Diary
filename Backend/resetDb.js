import sequelize from './config/database.js';
import { User } from './models/user.js';
import { Joke } from './models/joke.js';
import { Like } from './models/like.js';
import { Comment } from './models/comment.js';

const resetDatabase = async () => {
    try {
        // Force sync will drop all tables and recreate them
        await sequelize.sync({ force: true });
        console.log('Database has been reset and tables have been recreated');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};

resetDatabase();
