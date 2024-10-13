// @ts-nocheck
import OpenAI from 'openai'
import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import axios from 'axios'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Textarea } from './ui/textarea'

function TextOpenAi({ postData }: { postData: any }) {
    const id = postData.id
    const [currentContent, setCurrentContent] = useState(postData.content)
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedState, setGeneratedState] = useState({
        starting: false,
        generating: false,
        saving: false,
        finalizing: false,
    })
    const [content, setContent] =
        useState(`Write cleaning and maintenance department be as details as you can do not hold back:
1.⁠Purpose and goals.
2.⁠ ⁠Definitions
3.⁠ ⁠applicable Scope.
4.⁠ ⁠Policy standard.
5.⁠ ⁠Procedures details.
6.⁠ ⁠Responsibility and staff roles.
7.⁠ ⁠References.
add points and title and group it together in headers and descriptions. at least 2000 words
    `)

    const editorRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (isEditing && editorRef.current) {
            const script = document.createElement('script')
            script.src =
                'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js'
            script.onload = () => {
                new Quill(editorRef.current!, {
                    theme: 'snow',
                })
            }
            document.body.appendChild(script)

            return () => {
                document.body.removeChild(script)
            }
        }
    }, [isEditing])

    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = []

        if (isGenerating) {
            timeouts.push(
                setTimeout(() => {
                    setGeneratedState({
                        starting: true,
                        generating: false,
                        saving: false,
                        finalizing: false,
                    })
                }, 100)
            )

            timeouts.push(
                setTimeout(() => {
                    setGeneratedState({
                        starting: false,
                        generating: true,
                        saving: false,
                        finalizing: false,
                    })
                }, 5000)
            )

            timeouts.push(
                setTimeout(() => {
                    setGeneratedState({
                        starting: false,
                        generating: false,
                        saving: true,
                        finalizing: false,
                    })
                }, 10000)
            )

            timeouts.push(
                setTimeout(() => {
                    setGeneratedState({
                        starting: false,
                        generating: false,
                        saving: false,
                        finalizing: true,
                    })
                }, 150000)
            )
        }

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [isGenerating])

    const generateDocument = async () => {
        setLoading(true)
        setIsGenerating(true)

        try {
            const response = await fetch('/wp-json/openai/v1/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: content,
                        },
                    ],
                    temperature: 0.2,
                }),
            })

            const data = await response.json() // Parse the JSON response

            // Log the entire response to understand its structure
            console.log('API Response:', data)

            // Check if the response contains the expected structure
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const chatResponse = data.choices[0].message.content
                const htmlContent = marked(chatResponse)

                const updateUrl = `/wp-json/department/v1/update/${id}`
                const nonce = window?.appLocalizer?.nonce || ''

                const updateResponse = await axios.post(
                    updateUrl,
                    {
                        id: postData.id,
                        content: htmlContent,
                    },
                    {
                        headers: {
                            'X-WP-Nonce': nonce,
                        },
                    }
                )

                console.log(updateResponse)
                await toast.success('Document generated successfully!')
                setIsEditing(false)
                setCurrentContent(htmlContent)
            } else {
                console.error('Unexpected response structure:', data)
                await toast.error('Unexpected response structure from API')
            }
        } catch (error) {
            console.error('Error generating document:', error)
            await toast.error('An error occurred while generating the document')
        } finally {
            setLoading(false)
            setIsGenerating(false)
        }
    }

    const saveDocument = async () => {
        const data = {
            id: postData.id,
            content: editorRef.current!.querySelector('.ql-editor')!.innerHTML,
        }

        try {
            const updateUrl = `/wp-json/department/v1/update/${id}`
            const nonce = window?.appLocalizer?.nonce || ''

            const response = await axios.post(updateUrl, data, {
                headers: {
                    'X-WP-Nonce': nonce,
                },
            })
            console.log(response)
            await toast.success('Document saved successfully')

            setIsEditing(false)
            setCurrentContent(data.content)
        } catch (error) {
            console.error('Error saving document:', error)
            await toast.error('An error occurred while saving the document')
        }
    }

    return (
        <div>
            <Toaster richColors />

            <div>
                <div className="flex items-center gap-3">
                    <div>
                        <Textarea
                            placeholder="Add a role"
                            className="w-96"
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            onClick={generateDocument}
                            className="my-5 bg-black hover:bg-black/70"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                            ) : (
                                <div>Generate Document ✨</div>
                            )}
                        </Button>
                        <hr />
                    </div>
                    {loading && (
                        <div>
                            {/* set emojes for each state */}
                            {generatedState.starting && (
                                <div className="animate-pulse text-[16px] text-gray-500">
                                    Starting 🚀 ...
                                </div>
                            )}
                            {generatedState.generating && (
                                <div className="animate-pulse text-[16px] text-gray-500">
                                    Generating 🧠 ...
                                </div>
                            )}
                            {generatedState.saving && (
                                <div className="animate-pulse text-[16px] text-gray-500">
                                    Saving 💾 ...
                                </div>
                            )}
                            {generatedState.finalizing && (
                                <div className="animate-pulse text-[16px] text-gray-500">
                                    Finalizing 🎉 ...
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <Button
                            variant={'destructive'}
                            onClick={() => setIsEditing(false)}
                            className="my-5"
                            disabled={loading}
                        >
                            Cancel Editing
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="my-5 bg-black hover:bg-black/70"
                            disabled={loading}
                        >
                            Edit Document
                        </Button>
                    )}
                    {/* Save Document */}
                    {isEditing && (
                        <Button
                            onClick={saveDocument}
                            className="my-5 bg-black hover:bg-black/70"
                        >
                            Save Document
                        </Button>
                    )}
                </div>
            </div>

            {isEditing && (
                <div>
                    <link
                        href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css"
                        rel="stylesheet"
                    />
                    <div id="editor" ref={editorRef}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: currentContent,
                            }}
                        ></div>
                    </div>
                </div>
            )}
            {!isEditing && currentContent && (
                <div
                    className="content-ai rounded-md bg-[#f1f1f1] px-10 py-5"
                    dangerouslySetInnerHTML={{
                        __html: currentContent,
                    }}
                ></div>
            )}
        </div>
    )
}

export default TextOpenAi
