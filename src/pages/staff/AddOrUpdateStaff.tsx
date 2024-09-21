// @ts-nocheck
import { useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'

import { Toast, ToastProvider } from '@/components/ui/toast'
import { useToast } from './components/ui/use-toast'
import { toast, Toaster } from 'sonner'
import FormViewer from '@/components/FormViewer'
import { useNavigate, useParams } from 'react-router-dom'

function FormBuilderWidget() {
    const navigate = useNavigate() // Initialize useNavigate

    const [formSections, setFormSections] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [siteId, setSiteId] = useState(0)
    const [users, setUsers] = useState([])

    const isDev = process.env.NODE_ENV === 'development'
    const baseUrl = isDev ? 'http://mytest.local' : ''
    const [userId, setUserId] = useState(0)

    const { id } = useParams() // Get user ID from the URL params

    const fetchUrl =
        'https://api.airtable.com/v0/app9i3YvEiYbCo4XN/apps/recdETedrTkAm2BIR'
    const submitUrl = '/wp-json/staff/v1/add'

    const updateUrl = `/wp-json/staff/v1/update/${id}`

    const [formData, setFormData] = useState({})
    const isUpdating = Boolean(id) // Check if this is an update operation

    // get Managers from the API and remap the data
    useEffect(() => {
        async function getManagers() {
            try {
                const response = await fetch(
                    `/wp-json/staff/v1/managers?id=${id}`
                )
                const data = await response.json()
                console.log('managers', data)

                setUsers(data)
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }
        getManagers()
    }, [])

    // useEffect to to fetch staff/v1/site
    useEffect(() => {
        async function getSiteId() {
            const response = await fetch('/wp-json/staff/v1/site')
            const data = await response.json()
            setSiteId(data.site_id)
        }
        getSiteId()
    }, [])

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
                    setFormData(data) // Assuming the user data contains manager information
                    setUserId(data.id)
                } catch (error) {
                    console.error('Error fetching user:', error)
                }
            }

            fetchUserData()
        }
    }, [isUpdating, id])

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            setIsSubmitting(true)
            try {
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: {
                        Authorization:
                            'Bearer pat4Qsb1Mw7JFJFh7.6c8455ef5b19cc8e9fc0f452a62bee582a4e04ac0cb954463b6acad99f72de5d',
                    },
                })
                const data = await response.json()
                const fields = data.fields
                const JSONData = JSON.parse(fields.JSONData)

                // first section
                const sectionIndex = JSONData.sections[1]

                let manager = {
                    name: 'staff_manager',
                    label_en: 'Manager',
                    label_ar: 'المدير',
                    type: 'Select',
                    order: '1',
                    placeholder_en: 'Select Manager',
                    placeholder_ar: 'اختيار المدير',
                    colSpan: '6',
                }

                manager.items = users
                if (sectionIndex) {
                    // Push the manager object into the Fields array of the first section
                    sectionIndex.Fields.push(manager)
                }

                // Set form sections for both add and update modes
                setFormSections(JSONData.sections)
            } catch (error) {
                console.error('Error fetching form data:', error)
            } finally {
                setIsLoading(false)
                setIsSubmitting(false)
            }
        }

        // Fetch data for both add and update modes
        if (fetchUrl) {
            fetchData()
        }
    }, [fetchUrl, isUpdating, users, userId])

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        )
    }

    const handleSubmission = async (formData) => {
        console.log('form data', formData)
        try {
            setIsSubmitting(true)

            const nonce = window?.appLocalizer?.nonce || ''

            // If formData is an instance of FormData, we will not use JSON headers
            const isFormDataInstance = formData instanceof FormData

            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': nonce,
                    ...(isFormDataInstance
                        ? {}
                        : { 'Content-Type': 'application/json' }),
                },
                body: isFormDataInstance ? formData : JSON.stringify(formData),
            })

            const result = await response.json()

            if (result.success) {
                await toast.success('Form submitted successfully!', {
                    description: result.message,
                })
                const id = result.user_id // Extract the ID from the server response

                // Navigate to the update page with the new `id`
                navigate(`/update/${id}`)
            } else {
                toast.error('Form submission failed!', {
                    description: result.message,
                })
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Form submission failed!', {
                description: error.message, // Ensure to show the error message
            })
        } finally {
            setIsSubmitting(false)
        }
    }
    const handleUpdate = async (formData) => {
        try {
            setIsSubmitting(true)

            const nonce = window?.appLocalizer?.nonce || ''
            const isFormDataInstance = formData instanceof FormData

            const url = `${updateUrl}`
            const response = await fetch(url, {
                method: 'POST', // Changed from 'PATCH' to 'POST'
                headers: {
                    'X-WP-Nonce': nonce,
                    // Do not set 'Content-Type' header when sending FormData
                },
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                await toast.success('Form updated successfully!', {
                    description: result.message,
                })
            } else {
                toast.error('Form update failed!', {
                    description: result.message,
                })
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Form submission failed!', {
                description: error.message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <>
                <Toaster richColors />
                <FormViewer
                    data={formSections} // Manager field is now included in both modes
                    handleSubmission={handleSubmission}
                    handleUpdate={handleUpdate}
                    isSubmitting={isSubmitting}
                    updateData={JSON.stringify(formData) || {}} // Prefill form with manager data during update
                    updateUrl={updateUrl}
                    isUpdating={isUpdating}
                />
            </>
        </div>
    )
}

export default FormBuilderWidget
