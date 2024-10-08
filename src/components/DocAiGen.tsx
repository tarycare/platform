// @ts-nocheck
import { useEffect } from 'react'

export default function DocAiGen() {
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js'
        script.onload = () => {
            new Quill('#editor', {
                theme: 'snow',
            })
        }
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    return (
        <div>
            <link
                href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css"
                rel="stylesheet"
            />
            <div id="editor"></div>
        </div>
    )
}
