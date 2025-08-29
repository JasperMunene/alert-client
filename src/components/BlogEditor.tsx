import { useState, useRef } from "react";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    Save,
    Eye,
    Send,
    Bold,
    Italic,
    List,
    Link2,
    Image as ImageIcon,
    Type,
    X,
    Upload
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface EditorPostData {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    status: "draft" | "published" | "archived";
    tags: string[];
    images: string[];
    category?: string;
}

interface BlogEditorProps {
    onBack: () => void;
    onSave: (post: EditorPostData) => void;
    onPublish: (post: EditorPostData) => void;
    post?: EditorPostData | null;
}

export  function BlogEditor({ onBack, onSave, onPublish, post }: BlogEditorProps) {
    const [title, setTitle] = useState(post?.title || "");
    const [content, setContent] = useState(post?.content || "");
    const [category, setCategory] = useState(post?.category || "");
    const [tags, setTags] = useState<string[]>(post?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [images, setImages] = useState<string[]>(post?.images || []);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        const postData = {
            id: post?.id,
            title,
            content,
            category,
            tags,
            images,
            status: "draft" as const,
        };
        onSave(postData);
    };

    const handlePublish = () => {
        const postData = {
            id: post?.id,
            title,
            content,
            category,
            tags,
            images,
            status: "published" as const,
        };
        onPublish(postData);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // inside BlogEditor component
    const uploadStagedFile = async (stagedFile: File | Blob): Promise<string> => {
        const form = new FormData();
        form.append("file", stagedFile);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: form,
            });

            if (!res.ok) {
                throw new Error("Failed to upload file.");
            }

            const data = await res.json();
            return data.imgUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            for (const file of Array.from(files)) {
                try {
                    const imageUrl = await uploadStagedFile(file);
                    setImages((prev) => [...prev, imageUrl]);
                } catch (error) {
                    console.error("Upload failed for file:", file.name, error);
                }
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const insertImageAtCursor = (imageUrl: string) => {
        const imageMarkdown = `\n![Image](${imageUrl})\n`;
        setContent(prev => prev + imageMarkdown);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={onBack}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-lg font-semibold">
                                    {post?.id ? "Edit Post" : "New Post"}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {post?.status === "published" ? "Published" : "Draft"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {showPreview ? "Edit" : "Preview"}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button size="sm" onClick={handlePublish}>
                                <Send className="h-4 w-4 mr-2" />
                                Publish
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    {showPreview ? (
                        // Preview Mode
                        <Card className="p-8 bg-surface-gradient shadow-soft">
                            <article className="prose prose-lg max-w-none">
                                <header className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        {category && <Badge>{category}</Badge>}
                                        {tags.map((tag) => (
                                            <Badge key={tag} variant="outline">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <h1 className="text-4xl font-bold mb-4 text-foreground">
                                        {title || "Untitled Post"}
                                    </h1>
                                    <div className="text-muted-foreground text-sm">
                                        {new Date().toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                </header>

                                {/* Preview Images */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {images.map((image, index) => (
                                            <Image
                                                key={index}
                                                src={image}
                                                alt={`Preview ${index + 1}`}
                                                width={500}
                                                height={300}
                                                className="rounded-lg shadow-md w-full h-48 object-cover"
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="prose-content text-foreground leading-relaxed">
                                    {content.split('\n').map((paragraph, index) => (
                                        <p key={index} className="mb-4">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </article>
                        </Card>
                    ) : (
                        // Edit Mode
                        <div className="space-y-6">
                            {/* Title and Category */}
                            <div className="space-y-4">
                                <Input
                                    placeholder="Enter your post title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-2xl font-semibold border-none bg-transparent px-0 py-3 focus-visible:ring-0 placeholder:text-muted-foreground"
                                />

                                <div className="flex gap-4">
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="health-tips">Health Tips</SelectItem>
                                            <SelectItem value="wellness">Wellness</SelectItem>
                                            <SelectItem value="pediatrics">Pediatrics</SelectItem>
                                            <SelectItem value="emergency-care">Emergency Care</SelectItem>
                                            <SelectItem value="surgery">Surgery</SelectItem>
                                            <SelectItem value="hospital-updates">Hospital Updates</SelectItem>
                                            <SelectItem value="patient-stories">Patient Stories</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>

                            {/* Tags */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                            {tag}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Type a tag and press Enter..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="max-w-xs"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Images</label>
                                <div className="flex gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Images
                                    </Button>
                                </div>

                                {/* Image Gallery */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <Image
                                                    src={image}
                                                    alt={`Upload ${index + 1}`}
                                                    width={200}
                                                    height={200}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-white hover:bg-white/20"
                                                        onClick={() => insertImageAtCursor(image)}
                                                    >
                                                        <ImageIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-white hover:bg-white/20"
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Toolbar */}
                            <Card className="p-3 bg-muted/30">
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm">
                                        <Bold className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Italic className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px h-6 bg-border mx-2" />
                                    <Button variant="ghost" size="sm">
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Link2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px h-6 bg-border mx-2" />
                                    <Button variant="ghost" size="sm">
                                        <Type className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>

                            {/* Content Editor */}
                            <Card className="overflow-hidden">
                                <Textarea
                                    placeholder="Start writing your post...

You can write in markdown or plain text. The editor supports:
- **Bold text**
- *Italic text*
- Lists and links
- Images (upload above or use ![alt](url) syntax)
- And much more!

Focus on your content, we'll handle the rest."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[500px] border-none bg-transparent p-6 text-base leading-relaxed resize-none focus-visible:ring-0"
                                />
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}