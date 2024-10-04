// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { FaTrash, FaEdit } from 'react-icons/fa'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
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

const DocumentList = ({ appName, itemId, refreshList }) => {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editMode, setEditMode] = useState(null)
    const [editData, setEditData] = useState({})

    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])

    useEffect(() => {
        // Fetch categories and tags
        const fetchCategoriesAndTags = async () => {
            try {
                const [categoriesResponse, tagsResponse] = await Promise.all([
                    fetch('/wp-json/do-spaces/v1/document-categories'),
                    fetch('/wp-json/do-spaces/v1/document-tags'),
                ])
                const categoriesData = await categoriesResponse.json()
                const tagsData = await tagsResponse.json()

                setCategories(
                    categoriesData.map((category) => ({
                        value: category.id?.toString() || '', // Ensure category.id exists and fallback to an empty string
                        label: category.name,
                    }))
                )

                setTags(
                    tagsData.map((tag) => ({
                        value: tag.id?.toString() || '', // Ensure tag.id exists and fallback to an empty string
                        label_ar: tag.name,
                        label_en: tag.name,
                    }))
                )
            } catch (error) {
                console.error('Error fetching categories or tags:', error)
            }
        }

        fetchCategoriesAndTags()
    }, [])

    // Fetch documents based on appName and itemId
    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    `/wp-json/do-spaces/v1/documents?app_name=${appName}&item_id=${itemId}`
                )
                const data = await response.json()

                if (response.ok) {
                    setDocuments(data)
                } else {
                    setError(data.message || 'Failed to fetch documents.')
                }
            } catch (err) {
                setError('Error fetching documents.')
            } finally {
                setLoading(false)
            }
        }

        fetchDocuments()
    }, [appName, itemId, refreshList])

    const deleteDocument = async (documentId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const nonce = window?.appLocalizer?.nonce || ''

                const response = await fetch(
                    `/wp-json/do-spaces/v1/document/${documentId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'X-WP-Nonce': nonce,
                        },
                    }
                )
                const data = await response.json()

                if (response.ok) {
                    setDocuments(
                        documents.filter((doc) => doc.id !== documentId)
                    )
                    alert('Document deleted successfully.')
                } else {
                    alert('Failed to delete document.')
                }
            } catch (err) {
                alert('Error deleting document.')
            }
        }
    }

    const editDocument = async (documentId) => {
        try {
            const nonce = window?.appLocalizer?.nonce || ''
            const response = await fetch(
                `/wp-json/do-spaces/v1/document/${documentId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': nonce,
                    },
                    body: JSON.stringify(editData),
                }
            )
            const data = await response.json()

            if (response.ok) {
                setDocuments(
                    documents.map((doc) =>
                        doc.id === documentId ? { ...doc, ...editData } : doc
                    )
                )
                alert('Document updated successfully.')
                setEditMode(null)
            } else {
                alert('Failed to update document.')
            }
        } catch (err) {
            alert('Error updating document.')
        }
    }

    const handleEditClick = (document) => {
        // Extracting meta data
        const meta = document.meta || {}
        setEditMode(document.id)
        setEditData({
            title: document.title || '',
            version: meta.version?.[0] || '',
            document_date: meta.document_date?.[0] || '',
            expiry_date: meta.expiry_date?.[0] || '',
            category: document.categories?.[0]?.id?.toString() || '', // Convert to string
            tags: document.tags?.map((tag) => tag.id.toString()) || [], // Convert IDs to strings
            visibility: meta.visibility?.[0] || '',
        })
    }
    const handleInputChange = (key, value) => {
        setEditData((prevState) => ({
            ...prevState,
            [key]: value, // Update the specific key (e.g., tags, category, etc.) in the editData state
        }))
    }

    const renderField = (label, value, key, type = 'text') => {
        return (
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                    {label}
                </label>
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full rounded-md border-gray-300 p-2"
                />
            </div>
        )
    }

    if (loading) return <div>Loading documents...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="">
            <h2 className="mb-4 text-xl font-bold">Uploaded Documents</h2>
            {documents.length > 0 ? (
                <ul className="space-y-6">
                    {documents.map((doc) => (
                        <li
                            key={doc.id}
                            className="flex flex-col space-y-4 rounded-md bg-white p-6 shadow-md"
                        >
                            {editMode === doc.id ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Title */}
                                    {renderField(
                                        'Title',
                                        editData.title,
                                        'title'
                                    )}
                                    {/* Version */}
                                    {renderField(
                                        'Version',
                                        editData.version,
                                        'version'
                                    )}
                                    {/* Visibility */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Visibility
                                        </label>
                                        <Select
                                            value={editData.visibility}
                                            onValueChange={(value) =>
                                                handleInputChange(
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
                                    </div>
                                    {/* Category */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Category
                                        </label>
                                        <Select
                                            value={editData.category}
                                            onValueChange={(value) =>
                                                handleInputChange(
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
                                    </div>
                                    {/* Tags */}
                                    {/* Tags */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Tags
                                        </label>
                                        <select
                                            multiple
                                            value={editData.tags || []} // Ensure editData.tags is always an array
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'tags',
                                                    Array.from(
                                                        e.target
                                                            .selectedOptions,
                                                        (option) => option.value
                                                    ) // Collect selected values properly
                                                )
                                            }
                                            className="w-full rounded-md border-gray-300 p-2"
                                        >
                                            {tags.map((tag) => (
                                                <option
                                                    key={tag.value}
                                                    value={tag.value}
                                                >
                                                    {tag.label_en}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Document Date */}
                                    {renderField(
                                        'Document Date',
                                        editData.document_date,
                                        'document_date',
                                        'date'
                                    )}
                                    {/* Expiry Date */}
                                    {renderField(
                                        'Expiry Date',
                                        editData.expiry_date,
                                        'expiry_date',
                                        'date'
                                    )}
                                    {/* Save/Cancel Buttons */}
                                    <div className="col-span-2 flex justify-end space-x-4">
                                        <Button
                                            onClick={() => editDocument(doc.id)}
                                            variant="primary"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            onClick={() => setEditMode(null)}
                                            variant="secondary"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-lg font-semibold">
                                            {doc.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Version: {doc.version}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Document Date: {doc.document_date}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Expiry Date: {doc.expiry_date}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Uploaded:{' '}
                                            {new Date(
                                                doc.created_date
                                            ).toLocaleDateString()}
                                        </p>
                                        {/* category */}
                                        <p className="text-sm text-gray-500">
                                            Category:{' '}
                                            {doc.categories?.[0]?.name || 'N/A'}
                                        </p>
                                        {/* tags */}
                                        <p className="text-sm text-gray-500">
                                            Tags:{' '}
                                            {doc.tags
                                                ?.map((tag) => tag.name)
                                                .join(', ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-end space-x-4">
                                        <a
                                            href={doc.url}
                                            className="text-blue-600 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Document
                                        </a>
                                        <button
                                            onClick={() => handleEditClick(doc)}
                                        >
                                            <FaEdit className="text-yellow-500 hover:text-yellow-700" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                deleteDocument(doc.id)
                                            }
                                        >
                                            <FaTrash className="text-red-500 hover:text-red-700" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No documents found.</p>
            )}
        </div>
    )
}

export default DocumentList
