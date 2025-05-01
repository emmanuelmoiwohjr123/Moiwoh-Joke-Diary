import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    profile_picture: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    registration_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Users',
    timestamps: false
});

export { User };
