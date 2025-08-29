'use client'

import { useState, useEffect } from "react";
import { BlogCard } from "@/components/BlogCard";
import { BlogEditor } from "@/components/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Heart, Stethoscope } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Define the Tag interface
interface Tag {
    id: number;
    name: string;
    slug: string;
}

// Define the Author interface
interface Author {
    id: string;
    name: string;
    email: string;
    bio?: string;
    created_at: string;
    updated_at: string;
}

// Define the Post interface based on your backend response
interface Post {
    id: string;
    title: string;
    excerpt: string;
    body: string;
    body_html?: string;
    status: 'published' | 'draft' | 'archived';
    slug: string;
    cover_image?: string;
    author_id: string;
    author?: Author;
    created_at: string;
    updated_at: string;
    published_at?: string;
    tags?: Tag[];
    views?: number;
    // Computed fields for frontend compatibility
    category?: string;
    readingTime?: string;
    publishedAt?: string;
}

interface EditorPostData {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    status: 'published' | 'draft' | 'archived';
    tags: string[];
    images: string[];
}


const API_BASE_URL = 'https://vp-hood-lighting-trials.trycloudflare.com/api/v1';

export default function Blog() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentView, setCurrentView] = useState<"dashboard" | "editor">("dashboard");
    const [editingPost, setEditingPost] = useState<EditorPostData | null>(null);

    // Fetch posts from backend
    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/posts`);

            if (!response.ok) {
                throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Process posts to add computed fields
            const processedPosts = (data.posts || []).map((post: Post) => ({
                ...post,
                category: post.tags && post.tags.length > 0 ? post.tags[0].name : 'General',
                readingTime: `${Math.ceil((post.body || '').split(' ').length / 200)} min`,
                publishedAt: post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : 'Draft',
                views: post.views || 0
            }));

            setPosts(processedPosts);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch articles';
            setError(errorMessage);
            console.error('Error fetching posts:', err);
            // Set empty array on error to prevent UI issues
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

        // Use the first tag name as category if available
        const postCategory = post.tags && post.tags.length > 0 ? post.tags[0].name : 'General';
        const matchesCategory = categoryFilter === "all" ||
            postCategory.toLowerCase() === categoryFilter.toLowerCase();

        const matchesStatus = statusFilter === "all" || post.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleNewPost = () => {
        setEditingPost(null);
        setCurrentView("editor");
    };

    const handleEditPost = async (id: string) => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/posts/${id}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
            }

            const postData = await response.json();

            // Format the post data for the editor
            const editorPost = {
                id: postData.id,
                title: postData.title,
                content: postData.body, // Map body to content
                category: postData.tags && postData.tags.length > 0 ? postData.tags[0].name : 'General',
                status: postData.status,
                tags: postData.tags ? postData.tags.map((tag: Tag) => tag.name) : [],
                images: postData.cover_image ? [postData.cover_image] : []
            };

            setEditingPost(editorPost);
            setCurrentView("editor");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch article';
            setError(errorMessage);
            console.error('Error fetching post:', err);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Failed to delete article: ${response.status} ${response.statusText}`);
            }

            // Refresh the posts list
            await fetchPosts();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete article';
            setError(errorMessage);
            console.error('Error deleting post:', err);
        }
    };

    // Removed handleViewPost - now using direct links in BlogCard component

    const handleSavePost = async (postData: EditorPostData) => {
        try {
            setError(null);
            const method = postData.id ? 'PUT' : 'POST';
            const url = postData.id
                ? `${API_BASE_URL}/posts/${postData.id}`
                : `${API_BASE_URL}/posts`;

            // Format the data for the backend
            const formattedPostData = {
                title: postData.title,
                body: postData.content, // Map content to body
                excerpt: postData.excerpt || '',
                status: postData.status,
                cover_image: postData.images && postData.images.length > 0 ? postData.images[0] : '',
                tags: postData.tags || [],
                author_id: "09764df6-0217-44bd-ad68-929943796677" // You'll need to replace this with actual user ID
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedPostData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Refresh the posts list
            await fetchPosts();
            setCurrentView("dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save article';
            setError(errorMessage);
            console.error('Error saving post:', err);
        }
    };

    const handlePublishPost = async (postData: EditorPostData) => {
        try {
            setError(null);
            const method = postData.id ? 'PUT' : 'POST';
            const url = postData.id
                ? `${API_BASE_URL}/posts/${postData.id}`
                : `${API_BASE_URL}/posts`;

            // Format the data for the backend
            const formattedPostData = {
                title: postData.title,
                body: postData.content, // Map content to body
                excerpt: postData.excerpt || '',
                status: "published",
                published_at: new Date().toISOString(),
                cover_image: postData.images && postData.images.length > 0 ? postData.images[0] : '',
                tags: postData.tags || [],
                author_id: "09764df6-0217-44bd-ad68-929943796677" // You'll need to replace this with actual user ID
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedPostData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to publish article: ${response.status}`);
            }

            // Refresh the posts list
            await fetchPosts();
            setCurrentView("dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to publish article';
            setError(errorMessage);
            console.error('Error publishing post:', err);
        }
    };

    // Get unique categories from all posts
    const getUniqueCategories = () => {
        const categories = new Set<string>();
        posts.forEach(post => {
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => categories.add(tag.name));
            } else {
                categories.add('General');
            }
        });
        return Array.from(categories);
    };

    if (currentView === "editor") {
        return (
            <BlogEditor
                post={editingPost}
                onBack={() => setCurrentView("dashboard")}
                onSave={handleSavePost}
                onPublish={handlePublishPost}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-surface-gradient">
                <div className="absolute inset-0">
                    <Image
                        src='/aboutalert.jpg'
                        alt="Alert Hospital Blog Management"
                        className="w-full h-full object-cover opacity-10"
                        fill
                        priority
                    />
                </div>
                <div className="relative container mx-auto px-6 py-16">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-primary-soft text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Heart className="h-4 w-4" />
                            Alert Hospital Blog
                        </div>
                        <h1 className="text-5xl font-bold mb-6 bg-blog-gradient bg-clip-text text-blue-500">
                            Health Stories &
                            <br />
                            Medical Insights
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                            Create and publish expert medical content, patient success stories, and health education
                            articles for our hospital community.
                        </p>
                        <Button size="lg" onClick={handleNewPost}>
                            <Plus className="h-4 w-4 mr-2" />
                            Write New Article
                        </Button>
                    </div>
                </div>
            </section>

            {/* Dashboard */}
            <section className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Medical Articles</h2>
                        <p className="text-muted-foreground">
                            Manage and organize your published medical articles, patient stories, and health education content
                        </p>
                    </div>
                    <Button variant="default" onClick={handleNewPost}>
                        <Stethoscope className="h-4 w-4 mr-2" />
                        New Article
                    </Button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p>Error: {error}</p>
                        <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
                            Dismiss
                        </Button>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search medical articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {/* Generate categories from tag names */}
                                {getUniqueCategories().map((category: string) => (
                                    <SelectItem key={category} value={category.toLowerCase()}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Drafts</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Loading medical articles...
                        </div>
                    </div>
                )}

                {/* Posts Grid */}
                {!loading && filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <BlogCard
                                key={post.id}
                                post={post}
                                onEdit={handleEditPost}
                                onDelete={handleDeletePost}
                                onView={() => {}} // No longer needed - using direct links
                            />
                        ))}
                    </div>
                ) : (
                    !loading && (
                        <div className="text-center py-12">
                            <div className="text-muted-foreground mb-4">
                                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                                    ? "No articles match your filters"
                                    : "No medical articles yet"}
                            </div>
                            <Button variant="outline" onClick={handleNewPost}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Medical Article
                            </Button>
                        </div>
                    )
                )}

                {/* Retry button when there's an error and no posts */}
                {!loading && error && posts.length === 0 && (
                    <div className="text-center py-6">
                        <Button variant="outline" onClick={fetchPosts}>
                            Try Again
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}