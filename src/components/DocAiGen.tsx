// @ts-nocheck
import OpenAI from 'openai'
import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import axios from 'axios'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Textarea } from './ui/textarea'

function DocAiGen({
    postData,
    selectedDocAi,
    type,
}: {
    postData: any
    selectedDocAi: any
    type: string
}) {
    const id = postData.id
    const [htmlLang, setHtmlLang] = useState(
        window.document.documentElement.lang
    )

    const [showPrompt, setShowPrompt] = useState(false)
    const [currentContent, setCurrentContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedState, setGeneratedState] = useState({
        starting: false,
        generating: false,
        saving: false,
        finalizing: false,
    })
    const [content, setContent] = useState('')

    useEffect(() => {
        console.log(selectedDocAi, 'selectedDocAi')
        if (selectedDocAi?.prompt) {
            console.log(selectedDocAi.prompt, 'selectedDocAi.prompt')
            setContent(selectedDocAi.prompt)
        } else {
            setContent('')
        }

        if (postData[selectedDocAi?.name]) {
            setCurrentContent(postData[selectedDocAi?.name])
        } else {
            setCurrentContent('')
        }
    }, [selectedDocAi, postData])

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
        setShowPrompt(false)

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

                const updateUrl = `/wp-json/${type}/v1/update/${id}`
                const nonce = window?.appLocalizer?.nonce || ''

                const selectedName = selectedDocAi['name']

                const updateResponse =
                    type === 'staff'
                        ? await axios.post(
                              updateUrl,
                              {
                                  id: postData.id,
                                  [selectedName]: htmlContent,
                                  email: postData.email,
                              },
                              {
                                  headers: {
                                      'X-WP-Nonce': nonce,
                                  },
                              }
                          )
                        : await axios.post(
                              updateUrl,
                              {
                                  id: postData.id,
                                  [selectedName]: htmlContent,
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
        console.log('Saving document', postData)
        const selectedName = selectedDocAi['name']
        const data = {
            id: postData.id,
            [selectedName]:
                editorRef.current!.querySelector('.ql-editor')!.innerHTML,
        }
        if (type === 'staff') {
            console.log(postData, 'postData after save')
            // push postData.email as email
            data['email'] = postData.email
        }

        try {
            const updateUrl = `/wp-json/${type}/v1/update/${id}`
            const nonce = window?.appLocalizer?.nonce || ''

            const response = await axios.post(updateUrl, data, {
                headers: {
                    'X-WP-Nonce': nonce,
                },
            })
            console.log(response)
            await toast.success('Document saved successfully')

            setIsEditing(false)
            setCurrentContent(data[selectedName])
        } catch (error) {
            console.error('Error saving document:', error)
            await toast.error('An error occurred while saving the document')
        }
    }

    return (
        <div className="min-h-[200px] rounded-md bg-[#f1f1f1] p-3">
            <Toaster richColors />

            <>
                <div className="mb-2 flex flex-col gap-1">
                    <h2 className="text-[16px] font-bold">
                        {htmlLang === 'ar'
                            ? selectedDocAi?.label_ar
                            : selectedDocAi?.label_en}
                    </h2>

                    <hr className="mb-1" />

                    <div className="mb-2 flex h-[40px] items-center gap-2">
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <Button
                                    variant={'destructive'}
                                    onClick={() => setIsEditing(false)}
                                    className="my-5"
                                    disabled={loading}
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="my-5 bg-black hover:bg-black/70"
                                        disabled={loading}
                                        size="sm"
                                    >
                                        {' '}
                                        Edit ✏️
                                    </Button>
                                </div>
                            )}
                            {/* Save Document */}
                            {isEditing && (
                                <Button
                                    onClick={saveDocument}
                                    className="my-5 bg-black hover:bg-black/70"
                                    size="sm"
                                >
                                    Save 💾
                                </Button>
                            )}
                        </div>
                        {!isEditing && (
                            <>
                                <Button
                                    onClick={generateDocument}
                                    className="w-fit bg-black hover:bg-black/70"
                                    disabled={loading}
                                    size="sm"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                                    ) : (
                                        <div>
                                            {htmlLang === 'ar'
                                                ? 'توليد بالذكاء الإصطناعي ✨'
                                                : 'AI Generate ✨'}
                                        </div>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setShowPrompt(!showPrompt)}
                                    disabled={loading}
                                    size="sm"
                                    variant={'outline'}
                                >
                                    {htmlLang === 'ar'
                                        ? showPrompt
                                            ? 'إخفاء البرومبت'
                                            : 'إظهار البرومبت'
                                        : showPrompt
                                          ? 'Hide Prompt'
                                          : 'Show Prompt'}
                                </Button>

                                {loading && (
                                    <div>
                                        {/* set emojes for each state */}
                                        {generatedState.starting && (
                                            <div className="animate-pulse text-[14px] text-gray-500">
                                                Starting 🚀 ...
                                            </div>
                                        )}
                                        {generatedState.generating && (
                                            <div className="animate-pulse text-[14px] text-gray-500">
                                                Generating 🧠 ...
                                            </div>
                                        )}
                                        {generatedState.saving && (
                                            <div className="animate-pulse text-[14px] text-gray-500">
                                                Saving 💾 ...
                                            </div>
                                        )}
                                        {generatedState.finalizing && (
                                            <div className="animate-pulse text-[14px] text-gray-500">
                                                Finalizing 🎉 ...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {showPrompt && !isEditing && (
                    <>
                        <Textarea
                            placeholder="Add your prompt here ..."
                            className="mb-5 w-96"
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={loading}
                        />
                    </>
                )}
            </>

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
                    className={`content-ai rounded-md bg-[#f1f1f1] px-10 py-5 ${loading && 'animate-pulse'}`}
                    dangerouslySetInnerHTML={{
                        __html: currentContent,
                    }}
                ></div>
            )}
        </div>
    )
}

export default DocAiGen
