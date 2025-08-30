'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    Eye, 
    User,
    Heart,
    Share2,
    Bookmark
} from "lucide-react";
import Image from "next/image";

// Define interfaces matching your API response
interface Author {
    id: string;
    name: string;
    email: string;
    bio?: string;
    created_at: string;
    updated_at: string;
}

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface BlogPost {
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
}

const API_BASE_URL = 'https://alert-server-xzlx.onrender.com/api/v1';

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const postId = params.id as string;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/posts/${postId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
                }

                const postData = await response.json();
                setPost(postData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch article';
                setError(errorMessage);
                console.error('Error fetching post:', err);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(' ').length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    const renderMarkdownContent = (content: string) => {
        // Simple markdown rendering - you might want to use a proper markdown library
        return content
            .split('\n')
            .map((line, index) => {
                // Headers
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold mb-6 mt-8 text-foreground">{line.substring(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-semibold mb-4 mt-6 text-foreground">{line.substring(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold mb-3 mt-5 text-foreground">{line.substring(4)}</h3>;
                }
                
                // Bold text
                const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                // Lists
                if (line.startsWith('- ')) {
                    return <li key={index} className="mb-2 ml-4 text-muted-foreground" dangerouslySetInnerHTML={{ __html: boldText.substring(2) }} />;
                }
                
                // Empty lines
                if (line.trim() === '') {
                    return <br key={index} />;
                }
                
                // Regular paragraphs
                return <p key={index} className="mb-4 leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: boldText }} />;
            });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-12">
                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                Loading article...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8 text-center">
                            <h1 className="text-2xl font-bold mb-4 text-foreground">Article Not Found</h1>
                            <p className="text-muted-foreground mb-6">
                                {error || "The article you're looking for doesn't exist or has been removed."}
                            </p>
                            <Button onClick={() => router.push('/blog')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Articles
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-surface-gradient">
                <div className="absolute inset-0">
                    <Image
                        src='/aboutalert.jpg'
                        alt="Alert Hospital Medical Article"
                        fill
                        className="object-cover opacity-10"
                        priority
                    />
                </div>
                <div className="relative container mx-auto px-6 py-16">
                    <div className="max-w-4xl mx-auto">
                        {/* Navigation */}
                        <Button 
                            variant="ghost" 
                            className="mb-8"
                            onClick={() => router.push('/blog')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Medical Articles
                        </Button>

                        {/* Article Header */}
                        <div className="space-y-6">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-primary-soft text-primary">
                                    <Heart className="h-3 w-3 mr-1" />
                                    Alert Hospital
                                </Badge>
                                {post.tags?.map((tag) => (
                                    <Badge key={tag.id} variant="outline">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-blue-500">
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {post.excerpt}
                            </p>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                {post.author && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{post.author.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(post.published_at || post.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{calculateReadingTime(post.body)} min read</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    <span>{post.views || 0} views</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <Card className="p-8 shadow-soft">
                                {/* Cover Image */}
                                {post.cover_image && (
                                    <div className="mb-8">
                                        <Image
                                            src={post.cover_image}
                                            alt={post.title}
                                            width={800}
                                            height={400}
                                            className="rounded-lg shadow-medium w-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Article Body */}
                                <article className="prose prose-lg max-w-none">
                                    <div className="space-y-4">
                                        {renderMarkdownContent(post.body)}
                                    </div>
                                </article>

                                {/* Article Footer */}
                                <div className="mt-12 pt-8 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" size="sm">
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Share Article
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Bookmark className="h-4 w-4 mr-2" />
                                                Save for Later
                                            </Button>
                                        </div>
                                        <Badge variant="secondary">
                                            {post.status === 'published' ? 'Published' : 'Draft'}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-6">
                                {/* Author Info */}
                                {post.author && (
                                    <Card className="p-6">
                                        <h3 className="font-semibold mb-3 text-foreground">About the Author</h3>
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-primary">{post.author.name}</h4>
                                            {post.author.bio && (
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {post.author.bio}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {post.author.email}
                                            </p>
                                        </div>
                                    </Card>
                                )}

                                {/* Article Stats */}
                                <Card className="p-6">
                                    <h3 className="font-semibold mb-3 text-foreground">Article Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Published:</span>
                                            <span className="text-foreground">
                                                {formatDate(post.published_at || post.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Reading Time:</span>
                                            <span className="text-foreground">{calculateReadingTime(post.body)} min</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Views:</span>
                                            <span className="text-foreground">{post.views || 0}</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Alert Hospital Info */}
                                <Card className="p-6 bg-primary-soft">
                                    <div className="text-center">
                                        <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                                        <h3 className="font-semibold text-primary mb-2">Alert Hospital</h3>
                                        <p className="text-sm text-primary/80 leading-relaxed">
                                            Providing quality healthcare and medical education to our community.
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-4">
                                            Learn More About Us
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
