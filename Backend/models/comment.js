import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { User } from './user.js';
import { Joke } from './joke.js';

export const Comment = sequelize.define('Comment', {
    comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    joke_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Joke,
            key: 'joke_id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Set up associations
Comment.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

Comment.belongsTo(Joke, {
    foreignKey: 'joke_id',
    onDelete: 'CASCADE'
});

// Add reverse associations
User.hasMany(Comment, {
    foreignKey: 'user_id'
});

Joke.hasMany(Comment, {
    foreignKey: 'joke_id'
});
