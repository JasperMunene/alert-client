"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Stethoscope, Heart, Users,  PenTool, Activity, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-surface-gradient">
          <div className="absolute inset-0">
            <Image
                src='/aboutalert.jpg'
                alt="Alert Hospital - Caring for our community"
                fill
                className="object-cover opacity-20"
                priority
            />
          </div>
          <div className="relative container mx-auto px-6 py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary-soft text-primary px-6 py-3 rounded-full text-sm font-medium mb-8">
                <Heart className="h-4 w-4" />
                Alert Hospital Blog
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight text-blue-500">
                Health Stories &
                <br />
                <span className="bg-blog-gradient bg-clip-text text-transparent">
                Medical Insights
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
                Stay informed with expert medical insights, patient success stories, and the latest
                healthcare developments from Alert Hospital&apos;s dedicated team of professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/blog">
                  <span className="flex items-center">
                    < PenTool className="h-5 w-5 mr-2" />
                    Start Writing
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/about">
                  <span className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    View posts
                  </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Your trusted source for
              <span className="text-primary"> healthcare information</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert medical content, patient stories, and health education from Alert Hospital&apos;s team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all">
              <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Medical Insights</h3>
              <p className="text-muted-foreground">
                Get the latest medical knowledge from our experienced doctors and specialists,
                explained in clear, accessible language.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all">
              <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Patient Stories</h3>
              <p className="text-muted-foreground">
                Read inspiring stories of recovery, breakthrough treatments, and the compassionate
                care that makes Alert Hospital special.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all">
              <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Health & Wellness</h3>
              <p className="text-muted-foreground">
                Discover preventive care tips, wellness advice, and lifestyle recommendations
                to help you live your healthiest life.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center bg-surface-gradient rounded-2xl p-12 shadow-medium">
            <h2 className="text-4xl font-bold mb-6">
              Stay connected with Alert Hospital
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Subscribe to our blog for the latest health insights, medical breakthroughs,
              and stories from our healthcare community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/blog">
                <span className="flex items-center">
                  Explore Our Blog
                  <ArrowRight className="h-5 w-5 ml-2" />
                </span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">
                <span className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Contact Us
                </span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Home;