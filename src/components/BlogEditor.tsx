// components/BlogEditor.tsx
import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
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
    X,
    Upload,
    Calendar,
    Clock,
    User
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface EditorPostData {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    status: "draft" | "published" | "archived";
    tags: string[];
    images: string[];
    category?: string;
    author?: string;
    readTime?: number;
    publishedAt?: string;
    featured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
}

interface BlogEditorProps {
    onBack: () => void;
    onSave: (post: EditorPostData) => void;
    onPublish: (post: EditorPostData) => void;
    post?: EditorPostData | null;
    authors?: { id: string; name: string }[];
}

const Tiptap = dynamic(() => import("./Tiptap"), { ssr: false });

export function BlogEditor({ onBack, onSave, onPublish, post, authors = [] }: BlogEditorProps) {
    const [title, setTitle] = useState(post?.title || "");
    const [content, setContent] = useState(post?.content || "");
    const [excerpt, setExcerpt] = useState(post?.excerpt || "");
    const [category, setCategory] = useState(post?.category || "");
    const [tags, setTags] = useState<string[]>(post?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [images, setImages] = useState<string[]>(post?.images || []);
    const [author, setAuthor] = useState(post?.author || "");
    const [readTime, setReadTime] = useState(post?.readTime || 5);
    const [featured, setFeatured] = useState(post?.featured || false);
    const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
    const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
    const [slug, setSlug] = useState(post?.slug || "");
    const [showPreview, setShowPreview] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateSlug = useCallback((title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }, []);

    const handleTitleChange = (value: string) => {
        setTitle(value);
        if (!slug || slug === generateSlug(title)) {
            setSlug(generateSlug(value));
        }
    };

    const handleSave = () => {
        const postData: EditorPostData = {
            id: post?.id,
            title,
            content,
            excerpt,
            category,
            tags,
            images,
            status: "draft",
            author,
            readTime,
            featured,
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || excerpt.substring(0, 160),
            slug: slug || generateSlug(title),
        };
        onSave(postData);
    };

    const handlePublish = () => {
        const postData: EditorPostData = {
            id: post?.id,
            title,
            content,
            excerpt,
            category,
            tags,
            images,
            status: "published",
            author,
            readTime,
            featured,
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || excerpt.substring(0, 160),
            slug: slug || generateSlug(title),
            publishedAt: new Date().toISOString(),
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
        if (files && files.length > 0) {
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

    const calculateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).length;
        return Math.max(1, Math.round(wordCount / wordsPerMinute));
    };

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        setReadTime(calculateReadTime(newContent));
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
                            <article className="prose prose-lg max-w-none dark:prose-invert">
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
                                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                                        {author && (
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                <span>{author}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date().toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{readTime} min read</span>
                                        </div>
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

                                <div
                                    className="prose-content text-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            </article>
                        </Card>
                    ) : (
                        // Edit Mode
                        <div className="space-y-6">
                            {/* Title and Basic Info */}
                            <div className="space-y-4">
                                <Input
                                    placeholder="Enter your post title..."
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="text-2xl font-semibold border-none bg-transparent px-0 py-3 focus-visible:ring-0 placeholder:text-muted-foreground"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Category</label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger>
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

                                    {authors.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Author</label>
                                            <Select value={author} onValueChange={setAuthor}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select author" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {authors.map((authorObj) => (
                                                        <SelectItem key={authorObj.id} value={authorObj.name}>
                                                            {authorObj.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Excerpt</label>
                                    <Textarea
                                        placeholder="Brief description of your post..."
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        className="min-h-[80px]"
                                    />
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
                                <label className="text-sm font-medium text-foreground">Featured Images</label>
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
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
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

                            {/* Content Editor */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Content</label>
                                <Tiptap
                                    content={content}
                                    onChange={handleContentChange}
                                    onImageUpload={() => fileInputRef.current?.click()}
                                    placeholder="Start writing your post..."
                                />
                            </div>

                            {/* Advanced Settings */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Advanced Settings</h3>
                                    <Button variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
                                        {showAdvanced ? "Hide" : "Show"} Advanced
                                    </Button>
                                </div>

                                {showAdvanced && (
                                    <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Slug</label>
                                                <Input
                                                    value={slug}
                                                    onChange={(e) => setSlug(e.target.value)}
                                                    placeholder="Post URL slug"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Read Time (minutes)</label>
                                                <Input
                                                    type="number"
                                                    value={readTime}
                                                    onChange={(e) => setReadTime(parseInt(e.target.value) || 5)}
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Meta Title</label>
                                            <Input
                                                value={metaTitle}
                                                onChange={(e) => setMetaTitle(e.target.value)}
                                                placeholder="SEO meta title"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Meta Description</label>
                                            <Textarea
                                                value={metaDescription}
                                                onChange={(e) => setMetaDescription(e.target.value)}
                                                placeholder="SEO meta description"
                                                className="min-h-[80px]"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="featured"
                                                checked={featured}
                                                onCheckedChange={setFeatured}
                                            />
                                            <Label htmlFor="featured">Feature this post</Label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}