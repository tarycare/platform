// @ts-nocheck
import React, { useState } from 'react'
import axios from 'axios'
import { marked } from 'marked'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
// import '@mdxeditor/editor/style.css'
import {
    MDXEditor,
    UndoRedo,
    BoldItalicUnderlineToggles,
    toolbarPlugin,
} from '@mdxeditor/editor'

const ChatApp = () => {
    const [message, setMessage] =
        useState(`Write cleaning and maintenance department purpose only in details
Focus on the purpose and mention staff while writing for officers and workers
add points and title and group it together
no introduction no Policy Header no Signature Sections please just the response`)
    const [temperature, setTemperature] = useState(0.1)
    const [response, setResponse] = useState('')
    const [loading, setLoading] = useState(false)

    const [markdown, setMarkdown] = useState('')

    const API_URL = 'https://pa002.abacus.ai/api/v0/getChatResponse'
    const TOKEN = '50f6326590094b07a6b3dc9cf04430c7'
    const DEPLOYMENT_ID = '1f0d076f8'

    const sendMessage = async () => {
        if (!message.trim()) {
            alert('Please enter a message')
            return
        }

        if (isNaN(temperature) || temperature < 0 || temperature > 1) {
            alert('Please enter a valid temperature between 0 and 1')
            return
        }

        // setResponse('Loading...')

        try {
            setLoading(true)
            const response = await axios.post(API_URL, {
                deploymentToken: TOKEN,
                deploymentId: DEPLOYMENT_ID,
                messages: [{ is_user: true, text: message }],
                temperature: temperature,
            })

            console.log('Full API Response:', response)
            const chatResponse = response.data.result.messages[1].text
            setMarkdown(chatResponse)
            // Convert Markdown to HTML

            const htmlResponse = marked(chatResponse)
            setResponse(htmlResponse)
        } catch (error) {
            console.error('Error details:', error)
            setResponse(`An error occurred: ${error.message}`)
            if (error.response) {
                console.error('Error response:', error.response.data)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="temperature-control hidden">
                <label htmlFor="temperature">Temperature:</label>
                <input
                    type="number"
                    id="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
            </div>
            <textarea
                id="message"
                placeholder="Enter your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="hidden"
            />

            <br />
            <Button
                onClick={sendMessage}
                className="bg-black hover:bg-black/70"
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                    <div>Genarate Document ✨</div>
                )}
            </Button>
            <div id="response" dangerouslySetInnerHTML={{ __html: response }} />

            {response && (
                <Button
                    onClick={sendMessage}
                    className="mt-5 bg-black hover:bg-black/70"
                >
                    Save Document
                </Button>
            )}
        </div>
    )
}

export default ChatApp
