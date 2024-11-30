import { Inter } from 'next/font/google';
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Button, Form, Input, message, Modal, Select, Space, Table } from "antd";
import { faker } from '@faker-js/faker';
import { Task } from ".prisma/client"; // Use the updated model
const inter = Inter({ subsets: ['latin'] });

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 8, span: 12 },
};

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        console.log(values);
        setIsModalOpen(false);
        fetch('/api/create_task', { // Update API endpoint
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values)
        }).then(async response => {
            if (response.status === 200) {
                const task = await response.json();
                message.success('Created task: ' + task.task);
                setTasks([...tasks, task]);
            } else message.error(
                `Failed to create task:\n ${JSON.stringify(await response.json())}`);
        }).catch(res => { message.error(res) });
    };

    const onDelete = async (task: any) => {
        const { id } = task;
        setIsModalOpen(false);
        fetch('/api/delete_task', { // Update API endpoint
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        }).then(async response => {
            if (response.status === 200) {
                await response.json();
                message.success('Deleted task: ' + task.task);
                setTasks(tasks.filter(t => t.id !== id));
            } else message.error(
                `Failed to delete task:\n ${task.task}`);
        }).catch(res => { message.error(res) });
    };

    const columns: ColumnsType<Task> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Task',
            dataIndex: 'task',
            key: 'task',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            // Add the sorter functionality to enable sorting on click
            sorter: (a, b) => {
                const priorityOrder = ["Low", "Medium", "High"];
                return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
            },
            // Disable the default sort arrows in the top left
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => onDelete(record)}>Delete</a>
                </Space>
            ),
        },
    ];

    const onReset = () => {
        form.resetFields();
    };

    const predefinedPairs = [
        { task: "Clean your room", category: "Home" },
        { task: "Submit project report", category: "Work" },
        { task: "Buy groceries", category: "Shopping" },
        { task: "Prepare dinner", category: "Home" },
        { task: "Attend team meeting", category: "Work" },
        { task: "Read a book", category: "Leisure" },
        { task: "Go for a walk", category: "Health" },
    ];

    // Inside your `onFill` function
    const onFill = () => {
        const randomPair = faker.helpers.arrayElement(predefinedPairs); // Pick a random task-category pair
        const priority = faker.helpers.arrayElement(["Low", "Medium", "High"]); // Randomize priority

        form.setFieldsValue({
            task: randomPair.task,
            category: randomPair.category,
            priority: priority,
        });
    };


    const showModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    useEffect(() => {
        fetch('/api/all_tasks', { method: "GET" }) // Update API endpoint
            .then(res => {
                res.json().then(
                    (json => { setTasks(json) })
                )
            })
    }, []);

    if (!tasks) return "Loading...";

    return <>
        <Button type="primary" onClick={showModal}>
            Add Task
        </Button>
        <Modal title="Add Task" onCancel={handleCancel}
            open={isModalOpen} footer={null} width={800}>
            <Form
                {...layout}
                form={form}
                name="control-hooks"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item name="task" label="Task" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                    <Select>
                        <Select.Option value="Low">Low</Select.Option>
                        <Select.Option value="Medium">Medium</Select.Option>
                        <Select.Option value="High">High</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                    <Button htmlType="button" onClick={onReset}>
                        Reset
                    </Button>
                    <Button htmlType="button" onClick={onFill}>
                        Fill form
                    </Button>
                    <Button htmlType="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
        <Table
            columns={columns}
            dataSource={tasks}
            onChange={(pagination, filters, sorter) => {
                if (sorter && 'field' in sorter && sorter.field === 'priority') {
                    // Handle the sorting if necessary
                }
            }}
            showSorterTooltip={false} // Disable the sorter tooltip in the top left
        />
    </>;
}
