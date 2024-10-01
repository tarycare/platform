// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'

const DocumentManager = ({
    appName,
    itemId,
    setRefreshList,
    refreshList,
    onClose, // Receive the onClose prop
}: {
    appName: string
    itemId: string
    setRefreshList: (value: boolean) => void
    refreshList: boolean
    onClose: () => void
}) => {
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)

    // State for categories and tags
    const [categories, setCategories] = useState([])

    const [tags, setTags] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    '/wp-json/do-spaces/v1/document-categories'
                )
                const data = await response.json()
                if (response.ok) {
                    setCategories(
                        data.map((category) => ({
                            value: category.id,
                            label: category.name,
                        }))
                    )
                } else {
                    console.error('Failed to fetch categories:', data.message)
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(
                    '/wp-json/do-spaces/v1/document-tags'
                )
                const data = await response.json()
                if (response.ok) {
                    setTags(
                        data.map((tag) => ({
                            value: tag.id,
                            label_en: tag.name, // Map the label field to label_en
                            label_ar: tag.name, // Since you don't need multiple languages, use the same value for label_ar
                        }))
                    )
                } else {
                    console.error('Failed to fetch tags:', data.message)
                }
            } catch (error) {
                console.error('Error fetching tags:', error)
            }
        }
        fetchTags()
    }, [])

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
        setIsSubmitting(true)
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
                    // toast.success('Document uploaded successfully!')
                    setRefreshList((prev) => !prev)

                    onClose() // Close the form after success
                } else {
                    console.error('Upload failed:', result.message)
                }
            } catch (error) {
                console.error('Error during upload:', error)
            } finally {
                setIsSubmitting(false)
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
                className="mb-4 flex h-[200px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-400 p-6 text-center"
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
                                <td className="truncate border-b px-4 py-2">
                                    {file.file.name}
                                </td>
                                <td className="border-b px-4 py-2">
                                    {getReadableFileType(file.file.type)}
                                </td>
                                <td className="border-b px-4 py-2">
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
                                <td className="w-[200px] border-b px-4 py-2">
                                    {/* <Select
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
                                    </Select> */}

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="justify-between text-muted-foreground hover:bg-background"
                                            >
                                                {files[index].category.length >
                                                0
                                                    ? categories.find(
                                                          (cat) =>
                                                              cat.value ===
                                                              files[index]
                                                                  .category
                                                      )?.label || placeholder
                                                    : 'Select Category'}
                                                <CaretSortIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0 text-muted-foreground">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search categories"
                                                    className="h-9"
                                                />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        No items found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map(
                                                            (category) => (
                                                                <CommandItem
                                                                    key={
                                                                        category.value
                                                                    }
                                                                    value={
                                                                        category.value
                                                                    }
                                                                    onSelect={() =>
                                                                        handleFileChange(
                                                                            index,
                                                                            'category',
                                                                            category.value
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        category.label
                                                                    }
                                                                    <CheckIcon
                                                                        className={`ms-auto h-4 w-4 ${
                                                                            files[
                                                                                index
                                                                            ]
                                                                                .category ===
                                                                            category.value
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        }`}
                                                                    />
                                                                </CommandItem>
                                                            )
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
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

            <Button
                className="mt-4"
                onClick={handleSubmit}
                disabled={files.length === 0 || isSubmitting}
            >
                {isSubmitting ? 'Uploading...' : 'Submit'}
            </Button>
        </div>
    )
}

export default DocumentManager
