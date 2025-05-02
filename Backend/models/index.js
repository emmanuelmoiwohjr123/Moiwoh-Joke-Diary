import { User } from './user.js';
import { Joke } from './joke.js';
import { Like } from './like.js';
import { Comment } from './comment.js';

// Define associations
User.hasMany(Joke, { foreignKey: 'user_id' });
Joke.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });

Joke.hasMany(Like, { foreignKey: 'joke_id' });
Like.belongsTo(Joke, { foreignKey: 'joke_id' });

// Comment associations
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Joke.hasMany(Comment, { foreignKey: 'joke_id' });
Comment.belongsTo(Joke, { foreignKey: 'joke_id' });

export { User, Joke, Like, Comment };

