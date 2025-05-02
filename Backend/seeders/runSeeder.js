import { seedDefaultData } from './defaultData.js';
import sequelize from '../config/database.js';

const runSeeder = async () => {
    try {
        // Sync database (this will create tables if they don't exist)
        await sequelize.sync();

        // Run the seeder
        await seedDefaultData();

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

runSeeder();
