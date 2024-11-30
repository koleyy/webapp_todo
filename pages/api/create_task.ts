// pages/api/create_task.ts

import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';  // Import the correct types

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { task, category, priority } = req.body;

            // Ensure priority is valid
            if (!['Low', 'Medium', 'High'].includes(priority)) {
                return res.status(400).json({ error: 'Invalid priority value' });
            }

            // Create the new task in the database
            const newTask = await prisma.task.create({
                data: {
                    task,
                    category,
                    priority,
                },
            });

            // Return the new task as the response
            return res.status(200).json(newTask);
        } catch (error) {
            console.error('Error creating task:', error); // Log the error for debugging
            if (error instanceof Error) {
                // If it's a standard error, log its message
                return res.status(500).json({ error: error.message });
            }
            // If it's an unknown error type, return a generic message
            return res.status(500).json({ error: 'Failed to create task' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
