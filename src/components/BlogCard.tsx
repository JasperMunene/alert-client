import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    category?: string;
    publishedAt?: string;
    readingTime?: string;
    status: "published" | "draft" | "archived";
    views?: number;
}

interface BlogCardProps {
    post: BlogPost;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
}

export function BlogCard({ post, onEdit, onDelete }: BlogCardProps) {
    return (
        <Card className="group hover:shadow-medium transition-all duration-300 bg-surface-gradient border-border/50">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge
                                variant={post.status === "published" ? "default" : "secondary"}
                                className="text-xs"
                            >
                                {post.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {post.category}
                            </Badge>
                        </div>
                        <Link href={`/blog/${post.id}`}>
                            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                                {post.title}
                            </h3>
                        </Link>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border shadow-medium">
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/blog/${post.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Article
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(post.id)} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(post.id)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>{post.publishedAt}</span>
                        <span>{post.readingTime} read</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}