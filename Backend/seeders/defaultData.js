import { User } from '../models/user.js';
import { Joke } from '../models/joke.js';
import { Like } from '../models/like.js';
import { Comment } from '../models/comment.js';
import bcrypt from 'bcrypt';

export const seedDefaultData = async () => {
    try {
        console.log('Starting to seed default data...');

        // Create default users
        const defaultUsers = [
            {
                username: 'JokeMaster',
                email: 'jokemaster@example.com',
                password_hash: await bcrypt.hash('password123', 12),
                bio: 'Professional joke teller',
                is_active: true,
                is_admin: true
            },
            {
                username: 'LaughingLarry',
                email: 'larry@example.com',
                password_hash: await bcrypt.hash('password123', 12),
                bio: 'Always laughing',
                is_active: true
            },
            {
                username: 'ComedyQueen',
                email: 'queen@example.com',
                password_hash: await bcrypt.hash('password123', 12),
                bio: 'Queen of comedy',
                is_active: true
            }
        ];

        const users = await Promise.all(
            defaultUsers.map(user => User.create(user))
        );

        console.log('Created default users');

        // Create default jokes
        const defaultJokes = [
            {
                user_id: users[0].user_id,
                title: 'Programming Joke',
                content: 'Why do programmers prefer dark mode? Because light attracts bugs!',
                category: 'Programming'
            },
            {
                user_id: users[0].user_id,
                title: 'Dad Joke Classic',
                content: "Why don't scientists trust atoms? Because they make up everything!",
                category: 'Dad Jokes'
            },
            {
                user_id: users[1].user_id,
                title: 'Coffee Humor',
                content: 'How does a tech guy drink coffee? Java!',
                category: 'Programming'
            },
            {
                user_id: users[1].user_id,
                title: 'Math Joke',
                content: 'Why was six afraid of seven? Because seven eight nine!',
                category: 'Math'
            },
            {
                user_id: users[2].user_id,
                title: 'Weather Joke',
                content: "What did the cloud say to the lightning bolt? You're shocking!",
                category: 'Nature'
            }
        ];

        const jokes = await Promise.all(
            defaultJokes.map(joke => Joke.create(joke))
        );

        console.log('Created default jokes');

        // Create some likes
        const defaultLikes = [
            { user_id: users[1].user_id, joke_id: jokes[0].joke_id },
            { user_id: users[2].user_id, joke_id: jokes[0].joke_id },
            { user_id: users[0].user_id, joke_id: jokes[2].joke_id },
            { user_id: users[2].user_id, joke_id: jokes[2].joke_id },
            { user_id: users[0].user_id, joke_id: jokes[4].joke_id },
            { user_id: users[1].user_id, joke_id: jokes[4].joke_id }
        ];

        await Promise.all(
            defaultLikes.map(like => Like.create(like))
        );

        console.log('Created default likes');

        // Create some comments
        const defaultComments = [
            {
                user_id: users[1].user_id,
                joke_id: jokes[0].joke_id,
                content: 'This is hilarious! 😂'
            },
            {
                user_id: users[2].user_id,
                joke_id: jokes[0].joke_id,
                content: 'As a programmer, I can relate!'
            },
            {
                user_id: users[0].user_id,
                joke_id: jokes[2].joke_id,
                content: 'Classic programming humor!'
            }
        ];

        await Promise.all(
            defaultComments.map(comment => Comment.create(comment))
        );

        console.log('Created default comments');
        console.log('Seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding default data:', error);
        throw error;
    }
};
