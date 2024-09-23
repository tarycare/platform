// PreviewForm.tsx
import React from 'react'

import { Section } from './types'
import FormViewer from '../../components/FormViewer'

interface PreviewFormProps {
    data: Section[]
}

const PreviewForm: React.FC<PreviewFormProps> = ({ data }) => {
    const handleSubmission = (formData: any) => {
        // Handle form submission
        console.log('Form submitted:', formData)
    }

    return (
        <FormViewer
            data={data}
            languge={document.documentElement.lang}
            handleSubmission={console.log('Form submitted:', data)}
        />
    )
}

export default PreviewForm
