// components/TiptapEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold,
    Italic,
    List,
    Link2,
    Image as ImageIcon,
    Type,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Quote,
    Code,
    ListOrdered,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    onImageUpload?: () => void;
    placeholder?: string;
}

export default function Tiptap({
                                   content,
                                   onChange,
                                   onImageUpload,
                                   placeholder = "Write something...",
                               }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: "text-blue-500 underline",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto",
                },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-lg max-w-none focus:outline-none dark:prose-invert prose-headings:font-bold prose-blockquote:border-l-primary",
            },
        },
    });

    const [linkUrl, setLinkUrl] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (editor) {
            const prevUrl = editor.getAttributes("link").href || "";
            setLinkUrl(prevUrl);
        }
    }, [editor, open]);

    if (!editor) return null;

    const addImage = (url: string) => {
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const handleSetLink = () => {
        if (linkUrl === "") {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().setLink({ href: linkUrl }).run();
        }
        setOpen(false);
    };

    return (
        <Card className="overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30">
                {/* Text formatting */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "bg-muted" : ""}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-muted" : ""}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive("underline") ? "bg-muted" : ""}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive("highlight") ? "bg-muted" : ""}
                >
                    <Highlighter className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Headings */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Type className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().setParagraph().run()}
                        >
                            Paragraph
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor.chain().focus().toggleHeading({ level: 1 }).run()
                            }
                        >
                            <Heading1 className="h-4 w-4 mr-2" /> Heading 1
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor.chain().focus().toggleHeading({ level: 2 }).run()
                            }
                        >
                            <Heading2 className="h-4 w-4 mr-2" /> Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor.chain().focus().toggleHeading({ level: 3 }).run()
                            }
                        >
                            <Heading3 className="h-4 w-4 mr-2" /> Heading 3
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Lists */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "bg-muted" : ""}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "bg-muted" : ""}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Alignment */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className={
                        editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""
                    }
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className={
                        editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""
                    }
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className={
                        editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""
                    }
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    className={
                        editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""
                    }
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Special blocks */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive("blockquote") ? "bg-muted" : ""}
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={editor.isActive("codeBlock") ? "bg-muted" : ""}
                >
                    <Code className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Links & Media */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={editor.isActive("link") ? "bg-muted" : ""}
                        >
                            <Link2 className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 space-y-2">
                        <Input
                            placeholder="Enter URL..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            {editor.isActive("link") && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        editor.chain().focus().unsetLink().run();
                                        setLinkUrl("");
                                        setOpen(false);
                                    }}
                                >
                                    Remove
                                </Button>
                            )}
                            <Button size="sm" onClick={handleSetLink}>
                                Apply
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" onClick={onImageUpload}>
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* History */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="min-h-[500px] p-6 focus:outline-none"
            />
        </Card>
    );
}
