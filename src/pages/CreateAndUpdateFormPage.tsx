import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'form-viewer': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                'submit-url'?: string
                'fetch-url'?: string
                'update-url'?: string
                'update-data'?: string
                'is-updating'?: boolean
            }
        }
    }
}

function CreateAndUpdateFormPage() {
    const isDev = process.env.NODE_ENV === 'development'
    const baseUrl = isDev ? 'http://mytest.local' : ''

    const { id } = useParams() // Get user ID from the URL params

    const [formData, setFormData] = useState({})
    const isUpdating = Boolean(id) // Check if this is an update operation

    useEffect(() => {
        if (isUpdating) {
            // Fetch the user data to prefill the form

            const fetchUserData = async () => {
                try {
                    const response = await fetch(
                        `${baseUrl}/wp-json/staff/v1/users/${id}`
                    )
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data')
                    }
                    const data = await response.json()
                    setFormData(data)
                } catch (error) {
                    console.error('Error fetching user:', error)
                }
            }

            fetchUserData()
        }
    }, [isUpdating, id])

    useEffect(() => {
        if (!customElements.get('form-viewer')) {
            const script = document.createElement('script')
            script.src = '../wp-content/plugins/tary-core/dist/widget.umd.js'
            script.async = true

            document.body.appendChild(script)

            return () => {
                document.body.removeChild(script)
            }
        }
    }, [])

    return (
        <div>
            <div style={{ width: '800px' }}>
                {/* Using dangerouslySetInnerHTML to bypass React handling */}
                <div
                    dangerouslySetInnerHTML={{
                        __html: `<form-viewer 
           submit-url="/wp-json/staff/v1/add"
           fetch-url="https://api.airtable.com/v0/app9i3YvEiYbCo4XN/apps/recdETedrTkAm2BIR"
           update-url="/wp-json/staff/v1/update/${id}"
           update-data='${JSON.stringify(formData)}'
           is-updating="${isUpdating}"
           >
           </form-viewer>`,
                    }}
                />
            </div>
        </div>
    )
}

export default CreateAndUpdateFormPage
