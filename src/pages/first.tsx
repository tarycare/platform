// @ts-nocheck
import React, { useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FaFileImage, FaFileVideo, FaFileAlt, FaTrash } from "react-icons/fa"; // Import trash icon

const DragAndDropFileUpload = () => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection through input or drag-and-drop
  const handleFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    const updatedFiles = newFiles.map((file, index) => ({
      id: files.length + index + 1,
      file,
      visibility: "public",
      module: "Type 1",
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null, // Generate object URL for image preview only
    }));
    setFiles([...files, ...updatedFiles]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleFileChange = (index, key, value) => {
    const updatedFiles = files.map((file, i) =>
      i === index ? { ...file, [key]: value } : file
    );
    setFiles(updatedFiles);
  };

  const handleDelete = (id) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
  };

  const handleSubmit = () => {
    console.log("Files Submitted:", files);
  };

  // Function to convert MIME types into human-readable names
  const getReadableFileType = (fileType) => {
    if (fileType.startsWith("image/")) {
      return "Image File";
    } else if (fileType.startsWith("video/")) {
      return "Video File";
    } else if (fileType === "application/pdf") {
      return "PDF File";
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "Word Document";
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return "Excel Spreadsheet";
    } else {
      return "Unknown File";
    }
  };

  // Determine the file type icon based on the MIME type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <FaFileImage className="text-blue-500 w-8 h-8" />;
    } else if (fileType.startsWith("video/")) {
      return <FaFileVideo className="text-red-500 w-8 h-8" />;
    } else {
      return <FaFileAlt className="text-gray-500 w-8 h-8" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Clickable Drag-and-Drop Area */}
      <div
        className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center mb-4 cursor-pointer"
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
          style={{ display: "none" }} // Hide the file input
          multiple
          onChange={(e) => handleFiles(e.target.files)} // Handle file selection
        />
      </div>

      {files.length > 0 && (
        <table className="min-w-full bg-white border border-gray-200 shadow rounded-lg">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 text-left text-gray-700">ID</th>
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
                Module
              </th>
              <th className="border-b px-4 py-2 text-left text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={file.id}>
                <td className="border-b px-4 py-2">{file.id}</td>
                <td className="border-b px-4 py-2">
                  {file.file.type.startsWith("image/") ? (
                    <img
                      src={file.preview}
                      alt="thumbnail"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file.file.type)
                  )}
                </td>
                <td className="border-b px-4 py-2">{file.file.name}</td>
                <td className="border-b px-4 py-2">
                  {getReadableFileType(file.file.type)}
                </td>
                <td className="border-b px-4 py-2">
                  <RadioGroup
                    defaultValue={file.visibility}
                    onValueChange={(value) =>
                      handleFileChange(index, "visibility", value)
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id={`public-${file.id}`} />
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
                  </RadioGroup>
                </td>
                <td className="border-b px-4 py-2">
                  <Select
                    value={file.module}
                    onValueChange={(value) =>
                      handleFileChange(index, "module", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Type 1">Type 1</SelectItem>
                      <SelectItem value="Type 2">Type 2</SelectItem>
                      <SelectItem value="Type 3">Type 3</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="border-b px-4 py-2">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(file.id)}
                  >
                    <FaTrash className="w-5 h-5" />
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
  );
};

export default DragAndDropFileUpload;
