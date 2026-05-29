"use client";

import { useEffect, useRef } from "react";

export default function CKEditorField({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const isSettingData = useRef(false);

  useEffect(() => {
    let active = true;
    let editorInstance = null;

    const initEditor = () => {
      if (!window.ClassicEditor || !textareaRef.current || editorRef.current) return;

      window.ClassicEditor.create(textareaRef.current, {
        placeholder: placeholder || "Write your blog content here...",
        toolbar: [
          'heading', '|',
          'bold', 'italic', 'underline', 'strikethrough', 'link', '|',
          'bulletedList', 'numberedList', 'blockQuote', '|',
          'insertTable', 'undo', 'redo'
        ]
      })
      .then(editor => {
        if (!active) {
          editor.destroy();
          return;
        }
        editorInstance = editor;
        editorRef.current = editor;

        // Set initial data
        editor.setData(value || "");

        // Listen for editor changes
        editor.model.document.on("change:data", () => {
          if (isSettingData.current) return;
          const data = editor.getData();
          if (onChange) {
            onChange(data);
          }
        });
      })
      .catch(error => {
        console.error("Error initializing CKEditor:", error);
      });
    };

    if (typeof window !== "undefined") {
      if (!window.ClassicEditor) {
        const scriptId = "ckeditor-cdn-script";
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js";
          script.async = true;
          script.onload = () => {
            if (active) initEditor();
          };
          document.body.appendChild(script);
        } else {
          // If script is already loading/loaded but ClassicEditor is not yet available
          const interval = setInterval(() => {
            if (window.ClassicEditor) {
              clearInterval(interval);
              if (active) initEditor();
            }
          }, 100);
          return () => {
            clearInterval(interval);
            active = false;
            if (editorInstance) {
              editorInstance.destroy().then(() => {
                editorRef.current = null;
              });
            }
          };
        }
      } else {
        initEditor();
      }
    }

    return () => {
      active = false;
      if (editorInstance) {
        editorInstance.destroy().then(() => {
          editorRef.current = null;
        });
      }
    };
  }, []);

  // Update editor value if changed externally (e.g., when loaded from API)
  useEffect(() => {
    if (editorRef.current) {
      const currentData = editorRef.current.getData();
      if (currentData !== value) {
        isSettingData.current = true;
        editorRef.current.setData(value || "");
        isSettingData.current = false;
      }
    }
  }, [value]);

  return (
    <div className="ckeditor-wrapper w-full">
      <textarea ref={textareaRef} style={{ display: "none" }} />
    </div>
  );
}
