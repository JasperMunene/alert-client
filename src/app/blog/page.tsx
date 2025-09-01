'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import { BlogCard } from "@/components/BlogCard";
import { BlogEditor } from "@/components/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Heart, Stethoscope, RefreshCw } from "lucide-react";
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

// Define the Post interface
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

const API_BASE_URL = 'https://alert-server-xzlx.onrender.com/api/v1';

// Enhanced API service with retry logic and caching
class ApiService {
    private static cache = new Map<string, { data: any; timestamp: number }>();
    private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    static async fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
            const fetchOptions = {
                ...options,
                signal: controller.signal,
            };

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const response = await fetch(url, fetchOptions);
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        return response;
                    }

                    // If it's the last attempt or a non-retryable error, throw
                    if (attempt === maxRetries || response.status < 500) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    // Wait before retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));

                } catch (error) {
                    clearTimeout(timeoutId);

                    if (attempt === maxRetries) {
                        throw error;
                    }

                    // Only retry on network errors, not abort errors
                    if (error instanceof Error && error.name === 'AbortError') {
                        throw error;
                    }

                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }

            throw new Error('Max retries exceeded');
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    static getCachedData(key: string) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    static setCachedData(key: string, data: any) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    static async fetchPosts(): Promise<Post[]> {
        const cacheKey = 'posts';
        const cachedData = this.getCachedData(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const response = await this.fetchWithRetry(`${API_BASE_URL}/posts`);
        const data = await response.json();

        const processedPosts = (data.posts || []).map((post: Post) => ({
            ...post,
            category: post.tags && post.tags.length > 0 ? post.tags[0].name : 'General',
            readingTime: `${Math.ceil((post.body || '').split(' ').length / 200)} min`,
            publishedAt: post.published_at
                ? new Date(post.published_at).toLocaleDateString()
                : 'Draft',
            views: post.views || 0
        }));

        this.setCachedData(cacheKey, processedPosts);
        return processedPosts;
    }

    static async fetchPost(id: string): Promise<Post> {
        const cacheKey = `post-${id}`;
        const cachedData = this.getCachedData(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const response = await this.fetchWithRetry(`${API_BASE_URL}/posts/${id}`);
        const data = await response.json();

        this.setCachedData(cacheKey, data);
        return data;
    }

    static async deletePost(id: string): Promise<void> {
        await this.fetchWithRetry(`${API_BASE_URL}/posts/${id}`, { method: 'DELETE' });
        // Invalidate cache
        this.cache.delete('posts');
        this.cache.delete(`post-${id}`);
    }

    static async savePost(postData: any, id?: string): Promise<Post> {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/posts/${id}` : `${API_BASE_URL}/posts`;

        const response = await this.fetchWithRetry(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        });

        const result = await response.json();

        // Invalidate cache
        this.cache.delete('posts');
        if (id) {
            this.cache.delete(`post-${id}`);
        }

        return result;
    }
}

export default function Blog() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retrying, setRetrying] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentView, setCurrentView] = useState<"dashboard" | "editor">("dashboard");
    const [editingPost, setEditingPost] = useState<EditorPostData | null>(null);

    // Optimized fetch function with better error handling
    const fetchPosts = useCallback(async (showRetryState = false) => {
        try {
            if (showRetryState) {
                setRetrying(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const processedPosts = await ApiService.fetchPosts();
            setPosts(processedPosts);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch articles';
            setError(errorMessage);
            console.error('Error fetching posts:', err);
            // Don't clear posts on error if we have cached data
            if (posts.length === 0) {
                setPosts([]);
            }
        } finally {
            setLoading(false);
            setRetrying(false);
        }
    }, [posts.length]);

    // Initial load with retry logic
    useEffect(() => {
        let isMounted = true;

        const initialFetch = async () => {
            try {
                await fetchPosts();
            } catch (error) {
                // If initial fetch fails, try once more after a short delay
                if (isMounted) {
                    setTimeout(() => {
                        if (isMounted) {
                            fetchPosts();
                        }
                    }, 2000);
                }
            }
        };

        initialFetch();

        return () => {
            isMounted = false;
        };
    }, [fetchPosts]);

    // Memoized filtered posts for performance
    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

            const postCategory = post.tags && post.tags.length > 0 ? post.tags[0].name : 'General';
            const matchesCategory = categoryFilter === "all" ||
                postCategory.toLowerCase() === categoryFilter.toLowerCase();

            const matchesStatus = statusFilter === "all" || post.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [posts, searchQuery, categoryFilter, statusFilter]);

    // Memoized categories
    const uniqueCategories = useMemo(() => {
        const categories = new Set<string>();
        posts.forEach(post => {
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => categories.add(tag.name));
            } else {
                categories.add('General');
            }
        });
        return Array.from(categories);
    }, [posts]);

    const handleNewPost = useCallback(() => {
        setEditingPost(null);
        setCurrentView("editor");
    }, []);

    const handleEditPost = useCallback(async (id: string) => {
        try {
            setError(null);
            const postData = await ApiService.fetchPost(id);

            const editorPost: EditorPostData = {
                id: postData.id,
                title: postData.title,
                content: postData.body,
                excerpt: postData.excerpt,
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
    }, []);

    const handleDeletePost = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            setError(null);
            await ApiService.deletePost(id);
            // Optimistically update UI
            setPosts(prev => prev.filter(post => post.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete article';
            setError(errorMessage);
            console.error('Error deleting post:', err);
            // Refresh on error to ensure consistency
            fetchPosts();
        }
    }, [fetchPosts]);

    const handleSavePost = useCallback(async (postData: EditorPostData) => {
        try {
            setError(null);

            const formattedPostData = {
                title: postData.title,
                body: postData.content,
                excerpt: postData.excerpt || '',
                status: postData.status,
                cover_image: postData.images && postData.images.length > 0 ? postData.images[0] : '',
                tags: postData.tags || [],
                author_id: "09764df6-0217-44bd-ad68-929943796677"
            };

            await ApiService.savePost(formattedPostData, postData.id);

            // Refresh posts and return to dashboard
            await fetchPosts();
            setCurrentView("dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save article';
            setError(errorMessage);
            console.error('Error saving post:', err);
        }
    }, [fetchPosts]);

    const handlePublishPost = useCallback(async (postData: EditorPostData) => {
        try {
            setError(null);

            const formattedPostData = {
                title: postData.title,
                body: postData.content,
                excerpt: postData.excerpt || '',
                status: "published" as const,
                published_at: new Date().toISOString(),
                cover_image: postData.images && postData.images.length > 0 ? postData.images[0] : '',
                tags: postData.tags || [],
                author_id: "09764df6-0217-44bd-ad68-929943796677"
            };

            await ApiService.savePost(formattedPostData, postData.id);

            // Refresh posts and return to dashboard
            await fetchPosts();
            setCurrentView("dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to publish article';
            setError(errorMessage);
            console.error('Error publishing post:', err);
        }
    }, [fetchPosts]);

    const handleRetry = useCallback(() => {
        fetchPosts(true);
    }, [fetchPosts]);

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
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX7sAg"
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
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRetry}
                            disabled={loading || retrying}
                            size="sm"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="default" onClick={handleNewPost}>
                            <Stethoscope className="h-4 w-4 mr-2" />
                            New Article
                        </Button>
                    </div>
                </div>

                {/* Enhanced Error message with retry */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Connection Error</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRetry}
                                    disabled={retrying}
                                >
                                    {retrying ? (
                                        <>
                                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                            Retrying...
                                        </>
                                    ) : (
                                        'Retry'
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setError(null)}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </div>
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
                                {uniqueCategories.map((category: string) => (
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

                {/* Retrying state */}
                {retrying && !loading && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Retrying connection...
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
                                onView={() => {}}
                            />
                        ))}
                    </div>
                ) : (
                    !loading && !retrying && (
                        <div className="text-center py-12">
                            <div className="text-muted-foreground mb-4">
                                {error ? (
                                    "Unable to load articles. Please check your connection and try again."
                                ) : searchQuery || categoryFilter !== "all" || statusFilter !== "all" ? (
                                    "No articles match your filters"
                                ) : (
                                    "No medical articles yet"
                                )}
                            </div>
                            {error ? (
                                <Button variant="outline" onClick={handleRetry} disabled={retrying}>
                                    <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                                    Try Again
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={handleNewPost}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Medical Article
                                </Button>
                            )}
                        </div>
                    )
                )}
            </section>
        </div>
    );
}