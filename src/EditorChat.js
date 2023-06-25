import React, { useState, useEffect, useCallback } from "react"
import { useDebouncedCallback } from "use-debounce"
function EditorChat() {
  const [socket, setSocket] = useState(null)
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // Get the username from local storage or prompt the user to enter it
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    } else {
      const input = prompt("Enter your username:")
      if (input) {
        setUsername(input)
        localStorage.setItem("username", input)
      }
    }

    // Connect to the WebSocket server with the username as a query parameter
    const newSocket = new WebSocket(`ws://localhost:8000/ws/editor/`)
    setSocket(newSocket)

    newSocket.onopen = () => console.log("WebSocket connected")
    newSocket.onclose = () => console.log("WebSocket disconnected")

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      newSocket.close()
    }
  }, [username])

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setMessage(data)
      }
    }
  }, [socket])
  const onChange = (e) => {
    setMessage(e.target.value)
    debounced()
  }

  const handleSubmit = useCallback(() => {
    if (message && socket) {
      const data = {
        message: message,
        username: username,
      }
      socket.send(JSON.stringify(data))
    }
  }, [message, socket, username])
  const debounced = useDebouncedCallback(() => {
    handleSubmit()
  }, 3000)

  return (
    <div
      className="chat-container"
      style={{ paddingTop: "200px", maxWidth: "600px", margin: "auto" }}
    >
      <div className="chat-header">
        Lets see what others type in this editor. The edits will be merged and
        sychronised from all users.
      </div>
      <br />
      <br />
      <form>
        <textarea
          rows="10"
          style={{ width: "100%" }}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={onChange}
        />
      </form>
    </div>
  )
}
export default EditorChat
