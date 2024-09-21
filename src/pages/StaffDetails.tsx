// @ts-nocheck
import { Button } from '@/components/ui/button'
import { ArrowLeft, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

// WordPress custom API base URL
const isDev = process.env.NODE_ENV === 'development'
const baseUrl = isDev ? 'http://mytest.local' : ''

const WP_API_URL = `${baseUrl}/wp-json/staff/v1/users`

function StaffDetails() {
    const { id } = useParams()
    const [staff, setStaff] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchStaffDetails = async () => {
            try {
                const response = await fetch(`${WP_API_URL}/${id}`)
                if (!response.ok) {
                    throw new Error('Error fetching staff details')
                }
                const data = await response.json()
                setStaff(data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchStaffDetails()
    }, [id])

    if (loading) {
        return <p>Loading staff details...</p>
    }

    if (error) {
        return <p>Error: {error}</p>
    }

    return (
        <div className="container mx-auto p-6">
            {/* back link */}
            <Button asChild className="mb-2">
                <a href="#" onClick={() => window.history.back()}>
                    <ArrowLeft size={16} />
                </a>
            </Button>
            <h2 className="my-4 text-2xl text-foreground">Staff Details</h2>
            {staff && (
                <div className="w-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    {staff.image ? (
                        <img
                            src={staff.image}
                            alt=""
                            srcset=""
                            className="mb-3 size-20 rounded-full"
                        />
                    ) : (
                        <div className="mb-3 flex size-20 items-center justify-center rounded-full border border-gray-400 bg-gray-300 text-white">
                            <User className="size-10 rounded-full" />
                        </div>
                    )}

                    <p>
                        <strong>Full Name:</strong>{' '}
                        {staff.first_name + ' ' + staff.last_name}
                    </p>
                    <p>
                        <strong>Email:</strong> {staff.email}
                    </p>
                    <p>
                        <strong>Role:</strong>{' '}
                        {staff.wp_capabilities.administrator
                            ? 'Administrator'
                            : 'Subscriber'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default StaffDetails
