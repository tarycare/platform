// @ts-nocheck
import { useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'

import { Toast, ToastProvider } from '@/components/ui/toast'
import { useToast } from './components/ui/use-toast'
import { toast, Toaster } from 'sonner'
import FormViewer from '@/components/FormViewer'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function AddUpdate({ type }: { type: string }) {
    const navigate = useNavigate() // Initialize useNavigate

    const [formSections, setFormSections] = useState([])
    const [formIdU, setFormIdU] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [htmlLang, setHtmlLang] = useState(
        window.document.documentElement.lang
    )
    const [siteId, setSiteId] = useState(0)

    const [postId, setPostId] = useState(0)

    const { id, formId } = useParams() // Get user ID from the URL params

    const fetchUrl =
        type === 'submission'
            ? `/wp-json/form/v1/get/${formId}`
            : `/wp-json/form/v1/get?title=${type}`

    const submitUrl = `/wp-json/${type}/v1/add`

    const updateUrl = `/wp-json/${type}/v1/update/${id}`

    const [formData, setFormData] = useState({})
    const isUpdating = Boolean(id) // Check if this is an update operation

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
                setFormIdU(data.id)
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
            const fetchData = async () => {
                try {
                    const response = await fetch(
                        `/wp-json/${type}/v1/get/${id}`
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

            fetchData()
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
            // push formId as form_id to FormData
            formData.append('form_id', formId)

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
                console.log(result, 'result')
                if (type === 'staff') {
                    navigate(`/update/${result.user_id}`)
                } else if (type === 'submission') {
                    navigate(`/${formId}/view-submission/${result.post_id}`)
                } else {
                    navigate(`/view/${result.post_id}`)
                }
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
    const handleNavigation = () => {
        window.location.href = `./admin.php?page=forms#/update/${formIdU}`
    }
    if (isUpdating && !postId) {
        return (
            <div className="flex w-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div>
            <>
                <Toaster richColors />
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => handleNavigation()}
                        className="mb-4"
                        variant="outline"
                    >
                        {htmlLang !== 'ar' ? 'Customize Form' : 'تخصيص النموذج'}
                    </Button>

                    {isUpdating && (
                        <Button
                            onClick={() => navigate(`/view/${id}`)}
                            className="mb-4"
                            variant="outline"
                        >
                            {htmlLang !== 'ar' ? 'View' : 'عرض'}
                        </Button>
                    )}
                    {/* All */}
                    <Button
                        onClick={() =>
                            navigate(
                                type === 'submission'
                                    ? `/list-submissions/${formId}`
                                    : '/'
                            )
                        }
                        className="mb-4"
                        variant="outline"
                    >
                        {htmlLang !== 'ar' ? 'All' : 'الكل'}
                    </Button>
                </div>

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

export default AddUpdate
