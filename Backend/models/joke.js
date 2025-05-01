import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { User } from './user.js';

const Joke = sequelize.define('Joke', {
    joke_id: {
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
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
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
    tableName: 'Jokes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export { Joke };
