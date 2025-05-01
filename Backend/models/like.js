import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { User } from './user.js';
import { Joke } from './joke.js';

const Like = sequelize.define('Like', {
    like_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },
    joke_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Jokes',
            key: 'joke_id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export { Like };
