// @ts-nocheck
import { useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'

import { Toast, ToastProvider } from '@/components/ui/toast'
import { useToast } from './components/ui/use-toast'
import { toast, Toaster } from 'sonner'
import FormViewer from '@/components/FormViewer'
import { useNavigate, useParams } from 'react-router-dom'

function CRUD_Submission() {
    const navigate = useNavigate() // Initialize useNavigate

    const [formSections, setFormSections] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [siteId, setSiteId] = useState(0)

    const isDev = process.env.NODE_ENV === 'development'
    const baseUrl = isDev ? 'http://mytest.local' : ''
    const [postId, setPostId] = useState(0)

    const { formid, id } = useParams() // Get user ID from the URL params
    console.log(useParams(), 'useParams()')
    const fetchUrl = '/wp-json/form/v1/get/' + formid

    const submitUrl = '/wp-json/submission/v1/add'

    const updateUrl = `/wp-json/submission/v1/update/${id}`

    const [formData, setFormData] = useState({})
    const isUpdating = Boolean(id) // Check if this is an update operation
    console.log(isUpdating, 'isUpdating')

    // useEffect to to fetch submission/v1/site
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
                console.error('Error fetching submission data:', error)
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
            // Fetch the user data to prefill the submission
            const fetchSubmissionData = async () => {
                try {
                    const response = await fetch(
                        `${baseUrl}/wp-json/submission/v1/get/${id}`
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

            fetchSubmissionData()
        }
    }, [isUpdating, id])

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        )
    }

    // Handle submission submission (add mode)
    const handleSubmission = async (formData) => {
        try {
            setIsSubmitting(true)
            const nonce = window?.appLocalizer?.nonce || ''
            const isFormDataInstance = formData instanceof FormData
            // append formId to formData
            formData.append('form_id', formid)

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
                navigate(`/${formid}/update/${result.post_id}`)
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

    // Handle submission update (update mode)
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
                    updateData={JSON.stringify(formData) || {}} // Prefill submission with manager data during update
                    updateUrl={updateUrl}
                    isUpdating={isUpdating}
                />
            </>
        </div>
    )
}

export default CRUD_Submission
