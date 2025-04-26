import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Ensure this exports a Sequelize instance

const User = sequelize.define(
  'User',
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Ensure the email is valid
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users", // Model tableName will be the same as the model name
    timestamps: false, // Automatically adds `createdAt` and `updatedAt` fields
    underscored: true, // Use snake_case for column names (optional)
  }
);

export default User;