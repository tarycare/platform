// @ts-nocheck
import { useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'

import { Toast, ToastProvider } from '@/components/ui/toast'
import { useToast } from './components/ui/use-toast'
import { toast, Toaster } from 'sonner'
import FormViewer from '@/components/FormViewer'
import { useNavigate, useParams } from 'react-router-dom'

function CRUD_Department({ type }: { type: string }) {
    const navigate = useNavigate() // Initialize useNavigate

    const [formSections, setFormSections] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [siteId, setSiteId] = useState(0)

    const [postId, setPostId] = useState(0)

    const { id } = useParams() // Get user ID from the URL params

    const fetchUrl = '/wp-json/form/v1/get?title=Department + &id=' + id

    const submitUrl = '/wp-json/department/v1/add'

    const updateUrl = `/wp-json/department/v1/update/${id}`

    const [formData, setFormData] = useState({})
    const isUpdating = Boolean(id) // Check if this is an update operation

    // useEffect to to fetch department/v1/site
    useEffect(() => {
        async function getSiteId() {
            const response = await fetch('/wp-json/staff/v1/site')
            const data = await response.json()
            setSiteId(data.site_id)
            console.log(data, 'site data')
        }
        getSiteId()
    }, [])

    useEffect(() => {
        async function fetchForm() {
            setIsLoading(true)
            setIsSubmitting(true)
            try {
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                })
                const data = await response.json()

                setFormSections(data.sections)
            } catch (error) {
                console.error('Error fetching form data:', error)
            } finally {
                setIsLoading(false)
                setIsSubmitting(false)
            }
        }

        fetchForm()
    }, [])

    useEffect(() => {
        console.log(isUpdating ? 'Updating dep' : 'Creating new dep')
        if (isUpdating) {
            // Fetch the user data to prefill the form
            const fetchDepartmentData = async () => {
                try {
                    const response = await fetch(
                        `/wp-json/department/v1/get/${id}`
                    )
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data')
                    }
                    const data = await response.json()
                    setFormData(data) // Assuming the user data contains manager information
                    setPostId(data.id)
                } catch (error) {
                    console.error('Error fetching user:', error)
                }
            }

            fetchDepartmentData()
        }
    }, [isUpdating, id])

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        )
    }

    // Handle form submission (add mode)
    const handleSubmission = async (formData) => {
        try {
            setIsSubmitting(true)
            const nonce = window?.appLocalizer?.nonce || ''
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
                navigate(`/update/${result.post_id}`)
            } else {
                toast.error('Form submission failed!', {
                    description: result.message,
                })
            }
        } catch (error) {
            toast.error('Form submission failed!', {
                description: error.message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle form update (update mode)
    const handleUpdate = async (formData) => {
        try {
            setIsSubmitting(true)
            const nonce = window?.appLocalizer?.nonce || ''
            const isFormDataInstance = formData instanceof FormData

            const response = await fetch(updateUrl, {
                method: 'POST', // Changed from 'PATCH' to 'POST'
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
                await toast.success('Form updated successfully!', {
                    description: result.message,
                })
            } else {
                toast.error('Form update failed!', {
                    description: result.message,
                })
            }
        } catch (error) {
            toast.error('Form update failed!', {
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

export default CRUD_Department
