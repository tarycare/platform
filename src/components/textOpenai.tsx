// @ts-nocheck
import OpenAI from 'openai'
import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import axios from 'axios'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'

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
                }, 5000)
            )

            timeouts.push(
                setTimeout(() => {
                    setGeneratedState({
                        starting: false,
                        generating: true,
                        saving: false,
                        finalizing: false,
                    })
                }, 10000)
            )

            timeouts.push(
                setTimeout(() => {
                    setGeneratedState({
                        starting: false,
                        generating: false,
                        saving: true,
                        finalizing: false,
                    })
                }, 15000)
            )

            timeouts.push(
                setTimeout(() => {
                    setGeneratedState({
                        starting: false,
                        generating: false,
                        saving: false,
                        finalizing: true,
                    })
                }, 20000)
            )
        }

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [isGenerating])

    const generateDocument = async () => {
        setLoading(true)
        setIsGenerating(true)
        // set your openai api key
        const client = new OpenAI({
            apiKey: '', // Replace with your actual API key
            dangerouslyAllowBrowser: true,
        })

        const response = await client.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `Write cleaning and maintenance department be as details as you can do not hold back:
1.⁠ ⁠Purpose and goals.
2.⁠ ⁠Definitions
3.⁠ ⁠applicable Scope.
4.⁠ ⁠Policy standard.
5.⁠ ⁠Procedures details.
6.⁠ ⁠Responsibility and staff roles.
7.⁠ ⁠References. 
add points and title and group it together in headers and descriptions.
at least 2000 words`,
                    assistant_id: 'asst_ocNVk2FQVnDz5jTRYzFD0J6H',
                },
            ],
            model: 'gpt-4o-mini',
        })
        console.log(response.choices[0].message.content)
        const chatResponse = response.choices[0].message.content
        const htmlContent = marked(chatResponse)

        try {
            const updateUrl = `/wp-json/department/v1/update/${id}`
            const nonce = window?.appLocalizer?.nonce || ''

            const response = await axios.post(
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
            console.log(response)
            await toast.success('Document generated successfully!')
            setIsEditing(false)
        } catch (error) {
            console.error('Error saving document:', error)
            await toast.error('An error occurred while saving the document')
        } finally {
            setLoading(false)
            setIsGenerating(false)
        }

        setCurrentContent(htmlContent)
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

            {!currentContent ? (
                <div className="flex items-center gap-3">
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

                    <div>
                        {/* set emojes for each state */}
                        {generatedState.starting && (
                            <div className="animate-pulse text-[18px] text-gray-600">
                                Starting 🚀 ...
                            </div>
                        )}
                        {generatedState.generating && (
                            <div className="animate-pulse text-[18px] text-gray-600">
                                Generating 🧠 ...
                            </div>
                        )}
                        {generatedState.saving && (
                            <div className="animate-pulse text-[18px] text-gray-600">
                                Saving 💾 ...
                            </div>
                        )}
                        {generatedState.finalizing && (
                            <div className="animate-pulse text-[18px] text-gray-600">
                                Finalizing 🎉 ...
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <Button
                            variant={'destructive'}
                            onClick={() => setIsEditing(false)}
                            className="my-5"
                        >
                            Cancel Editing
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="my-5 bg-black hover:bg-black/70"
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
            )}
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
