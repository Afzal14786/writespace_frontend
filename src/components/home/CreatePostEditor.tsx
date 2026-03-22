import React, { useState, useEffect } from "react";
import { User, Image as ImageIcon, CodeXml, X, Send, Bold, Italic, Link as LinkIcon, CheckCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { githubLight } from '@uiw/codemirror-theme-github';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';

interface CreatePostEditorProps { onPostCreated?: () => void; }
interface DraftState { content: string; media: string[]; codeSnippets: { id: string; language: string; code: string }[]; }

const CreatePostEditor: React.FC<CreatePostEditorProps> = ({ onPostCreated }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState<boolean>(false);
  const [draftStatus, setDraftStatus] = useState<"Saving..." | "Saved" | "">("");
  
  const [media, setMedia] = useState<string[]>([]);
  const [codeSnippets, setCodeSnippets] = useState<{ id: string; language: string; code: string }[]>([]);

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";
  const linkColor = "#3b82f6";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { style: `color: ${linkColor}; font-weight: bold; text-decoration: underline; cursor: pointer;` } }),
      Placeholder.configure({ placeholder: 'What do you want to talk about?' }),
    ],
    content: '',
    editorProps: { attributes: { class: 'focus:outline-none min-h-[120px]', style: `color: ${textColor}; min-height: 120px; outline: none; font-size: 1rem; line-height: 1.6;` } },
  });

  useEffect(() => {
    if (editor && !isDraftLoaded) {
      const savedDraft = localStorage.getItem("writespace_draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft) as Partial<DraftState>;
          if (parsed) {
            setMedia(parsed.media || []);
            setCodeSnippets(parsed.codeSnippets || []);
            editor.commands.setContent(parsed.content || "");
            if (parsed.content || (parsed.media && parsed.media.length > 0) || (parsed.codeSnippets && parsed.codeSnippets.length > 0)) {
              setDraftStatus("Saved");
              toast.info("Draft loaded", { autoClose: 1500 });
            }
          }
        } catch (error) { console.error("Failed to parse draft", error); }
      }
      setIsDraftLoaded(true);
    }
  }, [editor, isDraftLoaded]);

  const currentHtml = editor?.getHTML() || "";
  const currentText = editor?.getText() || "";

  useEffect(() => {
    if (!isExpanded || !isDraftLoaded) return; 
    const hasMeaningfulContent = currentText.trim() !== "" || media.length > 0 || codeSnippets.length > 0;
    if (hasMeaningfulContent) {
      setDraftStatus("Saving...");
      const saveTimer = setTimeout(() => {
        localStorage.setItem("writespace_draft", JSON.stringify({ content: currentHtml, media, codeSnippets }));
        setDraftStatus("Saved");
      }, 1000);
      return () => clearTimeout(saveTimer);
    } else {
      localStorage.removeItem("writespace_draft");
      setDraftStatus("");
    }
  }, [currentHtml, currentText, media, codeSnippets, isExpanded, isDraftLoaded]);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isExpanded]);

  const handleDiscard = () => {
    if (currentText.trim() !== "" || media.length > 0 || codeSnippets.length > 0) {
      if (!window.confirm("Discard draft?")) return;
    }
    localStorage.removeItem("writespace_draft");
    setMedia([]); setCodeSnippets([]); editor?.commands.setContent(""); setDraftStatus(""); setIsExpanded(false);
  };

  const handleSubmit = () => {
    toast.success("Post published!");
    localStorage.removeItem("writespace_draft"); 
    setMedia([]); setCodeSnippets([]); editor?.commands.setContent(""); setDraftStatus(""); setIsExpanded(false);
    if (onPostCreated) onPostCreated();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newMedia = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      if (media.length + newMedia.length <= 15) setMedia([...media, ...newMedia]);
      else toast.error("Max 15 media files.");
    }
  };

  const getLanguageExtension = (lang: string) => {
    switch (lang) { case "python": return [python()]; case "rust": return [rust()]; case "go": return [go()]; case "cpp": return [cpp()]; case "java": return [java()]; case "sql": return [sql()]; case "typescript": return [javascript({ typescript: true })]; default: return [javascript()]; }
  };

  const isPostEmpty = !currentText.trim() && media.length === 0 && codeSnippets.length === 0;

  if (!isExpanded) {
    return (
      <div style={{ backgroundColor: cardBg, borderRadius: "12px", border: `1px solid ${borderColor}`, padding: "1rem", boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0, backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={20} color={mutedText} />
          </div>
          <button onClick={() => setIsExpanded(true)} style={{ flex: 1, padding: "10px 16px", borderRadius: "24px", textAlign: "left", border: `1px solid ${borderColor}`, backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc", color: mutedText, outline: "none", fontSize: "0.9rem", cursor: "pointer" }}>
            Start a post...
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "5vh", paddingLeft: "10px", paddingRight: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(4px)" }}>
      <div style={{ backgroundColor: cardBg, borderRadius: "12px", width: "100%", maxWidth: "650px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={18} color={mutedText} /></div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: textColor }}>Afzal</span>
              <span style={{ fontSize: "0.7rem", color: draftStatus === "Saved" ? "#10b981" : mutedText, display: "flex", alignItems: "center", gap: "4px" }}>{draftStatus === "Saved" && <CheckCircle size={10} />}{draftStatus || "Draft"}</span>
            </div>
          </div>
          <button onClick={handleDiscard} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer" }}><X size={22} /></button>
        </div>

        <div style={{ padding: "1rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ minHeight: "100px", cursor: "text" }} onClick={() => editor?.commands.focus()}>{editor && <EditorContent editor={editor} />}</div>

          {codeSnippets.map((snippet) => (
            <div key={snippet.id} style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${borderColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: isDark ? "#0f172a" : "#f1f5f9", padding: "6px 10px", borderBottom: `1px solid ${borderColor}` }}>
                <select value={snippet.language} onChange={(e) => setCodeSnippets(codeSnippets.map(s => s.id === snippet.id ? { ...s, language: e.target.value } : s))} style={{ backgroundColor: cardBg, color: textColor, border: `1px solid ${borderColor}`, borderRadius: "4px", padding: "2px 6px", outline: "none", fontSize: "0.8rem", fontWeight: 600 }}>
                  <option value="python">Python</option><option value="typescript">TypeScript</option><option value="javascript">JavaScript</option><option value="rust">Rust</option><option value="go">Go</option><option value="cpp">C / C++</option><option value="java">Java</option><option value="sql">SQL</option>
                </select>
                <button onClick={() => setCodeSnippets(codeSnippets.filter(s => s.id !== snippet.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={14} /></button>
              </div>
              <CodeMirror value={snippet.code} height="auto" minHeight="80px" theme={isDark ? vscodeDark : githubLight} extensions={getLanguageExtension(snippet.language)} onChange={(value) => setCodeSnippets(codeSnippets.map(s => s.id === snippet.id ? { ...s, code: value } : s))} style={{ fontSize: "0.85rem" }} />
            </div>
          ))}

          {media.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
              {media.map((src, idx) => (
                <div key={idx} style={{ position: "relative", paddingTop: "100%", borderRadius: "8px", overflow: "hidden", border: `1px solid ${borderColor}` }}>
                  <img src={src} alt="preview" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => setMedia(media.filter((_, i) => i !== idx))} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar - Flex wrap added for mobile */}
        <div style={{ padding: "1rem", borderTop: `1px solid ${borderColor}`, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => editor?.chain().focus().toggleBold().run()} style={{ background: "none", border: "none", color: editor?.isActive('bold') ? accentColor : mutedText, cursor: "pointer" }}><Bold size={18} /></button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} style={{ background: "none", border: "none", color: editor?.isActive('italic') ? accentColor : mutedText, cursor: "pointer" }}><Italic size={18} /></button>
            <button onClick={() => { const url = window.prompt('Enter URL:'); if (url && editor) { editor.chain().focus().setLink({ href: url }).run(); } else if (url === "") { editor?.chain().focus().unsetLink().run(); } }} style={{ background: "none", border: "none", color: editor?.isActive('link') ? linkColor : mutedText, cursor: "pointer" }}><LinkIcon size={18} /></button>
            
            <div style={{ width: "1px", height: "20px", backgroundColor: borderColor, margin: "0 4px" }} />
            
            <input type="file" id="modal-image-upload" multiple accept="image/*" style={{ display: "none" }} onChange={handleMediaUpload} />
            <label htmlFor="modal-image-upload" style={{ cursor: "pointer", color: mutedText, display: "flex", alignItems: "center" }}><ImageIcon size={20} /></label>
            <button onClick={() => setCodeSnippets([...codeSnippets, { id: Date.now().toString(), language: "python", code: "" }])} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer", display: "flex", alignItems: "center" }}><CodeXml size={20} /></button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSubmit} disabled={isPostEmpty} style={{ backgroundColor: accentColor, color: "#fff", border: "none", padding: "8px 24px", borderRadius: "24px", fontWeight: 600, cursor: isPostEmpty ? "not-allowed" : "pointer", opacity: isPostEmpty ? 0.5 : 1, display: "flex", alignItems: "center", gap: "8px" }}>Post <Send size={16} /></button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreatePostEditor;