// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Button } from './components/ui/button'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import AddOrUpdateStaff from '@/pages/AddOrUpdateStaff'
import StaffDetails from '@/pages/StaffDetails'
import { useToast } from '@/components/ui/use-toast'

const isDev = process.env.NODE_ENV === 'development'

const WP_API_URL = isDev
    ? `http://mytest.local/wp-json/doc/v1/users`
    : `/wp-json/doc/v1/users`
const DELETE_API_URL = isDev
    ? `http://mytest.local/wp-json/doc/v1/delete-staff`
    : `/wp-json/doc/v1/delete-staff`

export default function App() {
    return <Content />
}

function Content() {
    const { toast } = useToast() // Initialize the toast hook
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const navigate = useNavigate()

    const fetchUsers = async () => {
        try {
            const response = await fetch(WP_API_URL)
            if (!response.ok) {
                throw new Error('Error fetching users')
            }
            const data = await response.json()
            setUsers(data)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [refresh])

    const handleDelete = async (userId, role) => {
        // Prevent deletion if the user is an admin ///
        if (role === 'admin') {
            toast({
                title: 'Action Denied',
                description: 'You cannot delete an admin user.',
                variant: 'destructive',
            })
            return
        }

        try {
            const response = await fetch(`${DELETE_API_URL}/${userId}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setRefresh(!refresh) // Refresh after delete
                toast({
                    title: 'Success',
                    description: 'User has been deleted successfully.',
                    variant: 'default',
                })
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete user.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'Error',
                description: 'An error occurred while deleting the user.',
                variant: 'destructive',
            })
        }
    }

    const handleEdit = (userId) => {
        navigate(`/add/${userId}`) // Navigate to edit page
    }

    const handleRowClick = (userId) => {
        navigate(`/view/${userId}`) // Navigate to staff details page
    }

    return (
        <div className="container mx-auto p-6">
            <h2 className="mb-4 text-2xl text-foreground">
                Staff Management System kkkkk
            </h2>
            <p className="mb-6">
                Manage your staff with ease. Add, edit, delete, and view staff
                members.
            </p>

            <div className="mb-4 flex items-center justify-between">
                <div className="ms-auto">
                    <Button variant="default" asChild>
                        <Link to="/add">Add Staff</Link>
                    </Button>
                </div>
            </div>

            {loading && <p>Loading users...</p>}
            {error && <p>Error: {error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-background">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-background">
                                <th className="px-4 py-3 text-left font-medium">
                                    User Name
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="cursor-pointer border-t border-gray-200"
                                    onClick={() => handleRowClick(user.id)} // Navigate to staff details on row click
                                >
                                    <td className="px-4 py-3">
                                        {user.username}
                                    </td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">{user.role}</td>
                                    <td className="space-x-3 px-4 py-3">
                                        <button
                                            className="text-blue-500 hover:underline"
                                            onClick={(e) => {
                                                e.stopPropagation() // Prevent row click when clicking edit
                                                handleEdit(user.id) // Navigate to edit page
                                            }}
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            className="text-red-500 hover:underline"
                                            onClick={(e) => {
                                                e.stopPropagation() // Prevent row click when clicking delete
                                                handleDelete(user.id, user.role) // Pass user role to prevent admin deletion
                                            }}
                                        >
                                            <FiTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Routes>
                <Route
                    path="/add"
                    element={
                        <AddOrUpdateStaff
                            onSuccess={() => setRefresh(!refresh)}
                        />
                    }
                />
                <Route
                    path="/update/:id"
                    element={
                        <AddOrUpdateStaff
                            onSuccess={() => setRefresh(!refresh)}
                        />
                    }
                />
                <Route path="/view/:id" element={<StaffDetails />} />
            </Routes>
        </div>
    )
}
