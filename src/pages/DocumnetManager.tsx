// @ts-nocheck
import React, { useState, useRef } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FaFileImage, FaFileVideo, FaFileAlt, FaTrash } from 'react-icons/fa'
import { MultiSelect } from '@/components/ui/multi-select'

const DocumentManager = ({
    appName,
    itemId,
}: {
    appName: string
    itemId: string
}) => {
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)

    // State for categories and tags
    const [categories, setCategories] = useState([
        { value: 'finance', label: 'Finance' },
        { value: 'legal', label: 'Legal' },
        { value: 'marketing', label: 'Marketing' },
    ])

    const [tags, setTags] = useState([
        { value: 'urgent', label: 'Urgent' },
        { value: 'review', label: 'Review' },
        { value: 'archive', label: 'Archive' },
    ])

    // Handle file selection through input or drag-and-drop
    const handleFiles = (selectedFiles) => {
        const newFiles = Array.from(selectedFiles)
        const updatedFiles = newFiles.map((file, index) => ({
            id: files.length + index + 1,
            file,
            visibility: 'public',
            version: '1.0',
            document_date: '',
            expiry_date: '',
            category: [],
            tags: [],
            preview: file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : null, // Generate object URL for image preview only
        }))
        setFiles([...files, ...updatedFiles])
    }

    const handleDrop = (event) => {
        event.preventDefault()
        handleFiles(event.dataTransfer.files)
    }

    const handleFileChange = (index, key, value) => {
        const updatedFiles = files.map((file, i) =>
            i === index ? { ...file, [key]: value } : file
        )
        setFiles(updatedFiles)
    }

    const handleDelete = (id) => {
        const updatedFiles = files.filter((file) => file.id !== id)
        setFiles(updatedFiles)
    }

    // Handle file upload via API request
    const handleSubmit = async () => {
        for (let file of files) {
            const formData = new FormData()
            formData.append('file', file.file)
            formData.append('visibility', file.visibility)
            formData.append('version', file.version)
            formData.append('document_date', file.document_date)
            formData.append('expiry_date', file.expiry_date)
            // append catergory as array
            formData.append('category', file.category)
            formData.append('tags', file.tags)
            formData.append('app_name', appName)
            formData.append('item_id', itemId)
            formData.append('file_type', file.file.type)

            try {
                const nonce = window?.appLocalizer?.nonce || ''
                const response = await fetch(
                    '/wp-json/do-spaces/v1/upload-document',
                    {
                        method: 'POST',
                        body: formData,
                        headers: {
                            Accept: 'application/json',
                            'X-WP-Nonce': nonce,
                        },
                    }
                )

                const result = await response.json()

                if (response.ok) {
                    console.log('Document created successfully:', result)
                } else {
                    console.error('Upload failed:', result.message)
                }
            } catch (error) {
                console.error('Error during upload:', error)
            }
        }
    }

    // Function to convert MIME types into human-readable names
    const getReadableFileType = (fileType) => {
        if (fileType.startsWith('image/')) {
            return 'Image File'
        } else if (fileType.startsWith('video/')) {
            return 'Video File'
        } else if (fileType === 'application/pdf') {
            return 'PDF File'
        } else if (
            fileType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            return 'Word Document'
        } else if (
            fileType === 'application/vnd.ms-excel' ||
            fileType ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            return 'Excel Spreadsheet'
        } else {
            return 'Unknown File'
        }
    }

    // Determine the file type icon based on the MIME type
    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) {
            return <FaFileImage className="h-8 w-8 text-blue-500" />
        } else if (fileType.startsWith('video/')) {
            return <FaFileVideo className="h-8 w-8 text-red-500" />
        } else {
            return <FaFileAlt className="h-8 w-8 text-gray-500" />
        }
    }

    return (
        <div className="container mx-auto p-4">
            {/* Clickable Drag-and-Drop Area */}
            <div
                className="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-gray-400 p-6 text-center"
                onClick={() => fileInputRef.current.click()} // Trigger file input on click
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <p className="text-gray-500">
                    Drag and Drop Files Here or Click to Upload
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }} // Hide the file input
                    multiple
                    onChange={(e) => handleFiles(e.target.files)} // Handle file selection
                />
            </div>

            {files.length > 0 && (
                <table className="min-w-full rounded-lg border border-gray-200 bg-white shadow">
                    <thead>
                        <tr>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                ID
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Thumbnail / Icon
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                File Name
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Type
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Public/Private
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Category
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Tags
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Version
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Doc Date
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Expiry Date
                            </th>
                            <th className="border-b px-4 py-2 text-left text-gray-700">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => (
                            <tr key={file.id}>
                                <td className="border-b px-4 py-2">
                                    {file.id}
                                </td>
                                <td className="border-b px-4 py-2">
                                    {file.file.type.startsWith('image/') ? (
                                        <img
                                            src={file.preview}
                                            alt="thumbnail"
                                            className="h-16 w-16 rounded object-cover"
                                        />
                                    ) : (
                                        getFileIcon(file.file.type)
                                    )}
                                </td>
                                <td className="border-b px-4 py-2">
                                    {file.file.name}
                                </td>
                                <td className="border-b px-4 py-2">
                                    {getReadableFileType(file.file.type)}
                                </td>
                                <td className="border-b px-4 py-2">
                                    {/* <RadioGroup
                                        defaultValue={file.visibility}
                                        onValueChange={(value) =>
                                            handleFileChange(
                                                index,
                                                'visibility',
                                                value
                                            )
                                        }
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="public"
                                                id={`public-${file.id}`}
                                            />
                                            <label
                                                htmlFor={`public-${file.id}`}
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                Public
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="private"
                                                id={`private-${file.id}`}
                                            />
                                            <label
                                                htmlFor={`private-${file.id}`}
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                Private
                                            </label>
                                        </div>
                                    </RadioGroup> */}
                                    <Select
                                        value={file.visibility}
                                        onValueChange={(value) =>
                                            handleFileChange(
                                                index,
                                                'visibility',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">
                                                Public
                                            </SelectItem>
                                            <SelectItem value="all-staff">
                                                All Staff
                                            </SelectItem>
                                            <SelectItem value="members">
                                                Members
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="border-b px-4 py-2">
                                    <Select
                                        value={file.category}
                                        onValueChange={(value) =>
                                            handleFileChange(
                                                index,
                                                'category',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.value}
                                                    value={category.value}
                                                >
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="border-b px-4 py-2">
                                    <MultiSelect
                                        options={tags}
                                        onValueChange={(values) =>
                                            handleFileChange(
                                                index,
                                                'tags',
                                                values
                                            )
                                        }
                                        defaultValue={file.tags}
                                    />
                                </td>
                                <td className="border-b px-4 py-2">
                                    <input
                                        type="text"
                                        className="w-20 rounded-md border border-gray-300 p-2"
                                        value={file.version}
                                        onChange={(e) =>
                                            handleFileChange(
                                                index,
                                                'version',
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                                <td className="border-b px-4 py-2">
                                    <input
                                        type="date"
                                        className="rounded-md border border-gray-300 p-2"
                                        value={file.document_date}
                                        onChange={(e) =>
                                            handleFileChange(
                                                index,
                                                'document_date',
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                                <td className="border-b px-4 py-2">
                                    <input
                                        type="date"
                                        className="rounded-md border border-gray-300 p-2"
                                        value={file.expiry_date}
                                        onChange={(e) =>
                                            handleFileChange(
                                                index,
                                                'expiry_date',
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                                <td className="border-b px-4 py-2">
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete(file.id)}
                                    >
                                        <FaTrash className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Button className="mt-4" onClick={handleSubmit}>
                Submit
            </Button>
        </div>
    )
}

export default DocumentManager
