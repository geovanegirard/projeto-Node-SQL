import db from '../db';
import User from '../models/user.model';
import DataBaseError from '../models/errors/database.error.model';

class UserRepository {

    async findAllUsers(): Promise<User[]> {
        const query = `
        SELECT uuid, username 
        FROM application_User
        `;

        const { rows } = await db.query<User>(query);
        return rows || [];
    }

    async findById(uuid: string): Promise<User> {
        try {
            const query = `
            SELECT uuid, username 
            FROM application_User
            WHERE uuid = $1
            `;
    
            const values = [uuid];
    
            const { rows } = await db.query<User>(query, values);
            const [user] = rows;
            
            return user;
        } catch (error) {
            throw new DataBaseError('Erro na consulta por ID', error);
            
        }

    }

    async creat(user: User): Promise<string> {
        const script = `
        INSERT INTO application_user (
            username,
            password
        )
        VALUES ($1, crypt($2, 'my_salt'))
        RETURNING uuid
        `;

        const values = [user.username, user.password];

        const { rows } = await db.query<{ uuid: string }>(script, values);
        const [newUser] = rows;
        return newUser.uuid;
    };

    async update(user: User): Promise<void> {
        const script = `
        UPDATE application_user
        SET
            username = $1,
            password = crypt($2, 'my_salt')
        WHERE uuid = $3
        `;

        const values = [user.username, user.password, user.uuid];
        await db.query(script, values);
    }

    async remove(uuid: string): Promise<void> {
        const cript = `
        DELETE
        FROM application_user
        WHERE uuid = $1
        `;
        const values = [uuid];
        await db.query(cript, values);
    }
}

export default new UserRepository();