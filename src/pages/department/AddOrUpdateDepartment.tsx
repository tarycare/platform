// @ts-nocheck
import { useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'

import { Toast, ToastProvider } from '@/components/ui/toast'
import { useToast } from './components/ui/use-toast'
import { toast, Toaster } from 'sonner'
import FormViewer from '@/components/FormViewer'
import { useNavigate, useParams } from 'react-router-dom'

function CRUD_Department() {
    const navigate = useNavigate() // Initialize useNavigate

    const [formSections, setFormSections] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [siteId, setSiteId] = useState(0)
    const [users, setUsers] = useState([])

    const isDev = process.env.NODE_ENV === 'development'
    const baseUrl = isDev ? 'http://mytest.local' : ''
    const [postId, setPostId] = useState(0)

    const { id } = useParams() // Get user ID from the URL params

    const fetchUrl =
        'https://api.airtable.com/v0/app9i3YvEiYbCo4XN/apps/recQfOAi80T3ZOy4A'
    const submitUrl = '/wp-json/department/v1/add'

    const updateUrl = `/wp-json/department/v1/update/${id}`

    const [formData, setFormData] = useState({})
    const isUpdating = Boolean(id) // Check if this is an update operation

    // get departments from the API and remap the data
    useEffect(() => {
        async function getDepartments() {
            try {
                const response = await fetch('/wp-json/department/v1/all')
                const data = await response.json()

                console.log('users all', data)
                const mappedUsers = data.map((user) => ({
                    value: user.id.toString(),
                    label_en:
                        user.meta?.staff_first_name +
                        ' ' +
                        user.meta?.staff_last_name,
                    label_ar:
                        user.meta?.staff_first_name +
                        ' ' +
                        user.meta?.staff_last_name,
                }))
                setUsers(mappedUsers)
                console.log(mappedUsers, 'mapped users')
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }
        getDepartments()
    }, [])

    // useEffect to to fetch department/v1/site
    useEffect(() => {
        async function getSiteId() {
            const response = await fetch('/wp-json/department/v1/site')
            const data = await response.json()
            setSiteId(data.site_id)
            console.log(data, 'site data')
        }
        getSiteId()
    }, [])

    useEffect(() => {
        console.log(isUpdating ? 'Updating user' : 'Creating new user')
        if (isUpdating) {
            // Fetch the user data to prefill the form
            const fetchUserData = async () => {
                try {
                    const response = await fetch(
                        `${baseUrl}/wp-json/department/v1/get/${id}`
                    )
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data')
                    }
                    const data = await response.json()
                    setFormData(data) // Assuming the user data contains manager information
                    setPostId(data.id)
                    console.log(data.id, 'user id')

                    console.log('User data fetched:', data)
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
                const sectionIndex = JSONData.sections[0]

                let title = {
                    name: 'department_title',
                    label_en: 'Title',
                    label_ar: 'العنوان',
                    type: 'Text',
                    order: '-1',
                    placeholder_en: 'Enter Title',
                    placeholder_ar: 'ادخل العنوان',
                    help_ar: 'ادخل العنوان باللغة العربية',
                    help_en: 'Enter the title in English',
                    required: true,
                    colSpan: '4',
                    min: '3',
                    max: '50',
                }

                let description = {
                    name: 'department_description',
                    label_en: 'Description',
                    label_ar: 'الوصف',
                    type: 'Textarea',
                    order: '-1',
                    placeholder_en: 'Enter Description',
                    placeholder_ar: 'ادخل الوصف',
                    help_ar: 'ادخل الوصف باللغة العربية',
                    help_en: 'Enter the description in English',
                    required: true,
                    colSpan: '4',
                    min: '3',
                    max: '50',
                }

                sectionIndex.Fields.push(title)
                sectionIndex.Fields.push(description)
                // remove the value of same user from id

                setFormSections(JSONData.sections)
                console.log(JSONData, 'JSONData')
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
    }, [fetchUrl, isUpdating, users, postId])

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        )
    }

    const handleSubmission = async (data) => {
        try {
            setIsSubmitting(true)

            const nonce = window?.appLocalizer?.nonce || ''
            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': nonce,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()
            console.log('Form submitted!', result)

            if (result.success) {
                await toast.success('Form submitted successfully!', {
                    description: result.message,
                })
                const id = result.post_id // Extract the ID from the server response

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

    const handleUpdate = async (data) => {
        try {
            setIsSubmitting(true)

            const nonce = window?.appLocalizer?.nonce || ''

            console.log('data', data)
            const url = `${updateUrl}`
            console.log('url', url)
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'X-WP-Nonce': nonce,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()
            console.log('Form updated!', result)
            console.log(JSON.stringify(data), 'data')

            if (result.success) {
                await toast.success('Form updated successfully!', {
                    description: result.message,
                })
                // setTimeout(() => {
                //     window.history.back()
                // }, 100)
            } else {
                toast.error('Form update failed!', {
                    description: result.message,
                })
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Form submission failed!', {
                description: result.message,
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
