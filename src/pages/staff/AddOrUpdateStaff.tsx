// @ts-nocheck
import { useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'

import { Toast, ToastProvider } from '@/components/ui/toast'
import { useToast } from './components/ui/use-toast'
import { toast, Toaster } from 'sonner'
import FormViewer from '@/components/FormViewer'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

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
    const [departments, setDepartments] = useState([])
    const [facilities, setFacilities] = useState([])
    const [formId, setFormId] = useState(0)

    const { id } = useParams() // Get user ID from the URL params

    const fetchUrl =
        '/wp-json/form/v1/get?title=Staff&site_id=' + siteId + '&id=' + id
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

    // get Departments from the API
    useEffect(() => {
        async function getDepartments() {
            try {
                const response = await fetch(`/wp-json/department/v1/select`)
                const data = await response.json()

                setDepartments(data)
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }
        getDepartments()
    }, [])
    // get Facilites from the API
    useEffect(() => {
        async function getFacilities() {
            try {
                const response = await fetch(`/wp-json/facility/v1/select`)
                const data = await response.json()

                setFacilities(data)
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }
        getFacilities()
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
                })
                const data = await response.json()
                setFormId(data.id)

                // first section
                const sectionIndex = data.sections[1]

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

                let department = {
                    name: 'department',
                    label_en: 'Department',
                    label_ar: 'القسم',
                    type: 'Select',
                    order: '1',
                    placeholder_en: 'Select Department',
                    placeholder_ar: 'اختيار القسم',
                    colSpan: '6',
                }

                department.items = departments
                if (sectionIndex) {
                    // Push the department object into the Fields array of the first section
                    sectionIndex.Fields.push(department)
                }

                let facility = {
                    name: 'facility',
                    label_en: 'Facility',
                    label_ar: 'المرفق',
                    type: 'Select',
                    order: '1',
                    placeholder_en: 'Select Facility',
                    placeholder_ar: 'اختيار المرفق',
                    colSpan: '6',
                }

                facility.items = facilities
                if (sectionIndex) {
                    // Push the facility object into the Fields array of the first section
                    sectionIndex.Fields.push(facility)
                }

                // Set form sections for both add and update modes
                setFormSections(data.sections)
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
    const handleNavigation = () => {
        window.location.href = `./admin.php?page=forms#/update/${formId}`
    }

    return (
        <div>
            <>
                <Button onClick={() => handleNavigation()} className="mb-4">
                    Customize Form
                </Button>
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
