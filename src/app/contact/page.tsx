"use client"

import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We&apos;re here to help 24/7
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Email Support</h3>
                    <p className="text-muted-foreground mb-3">
                      Send us an email and we&apos;ll respond within 24 hours
                    </p>
                    <a 
                      href="mailto:support@atlasboost.com" 
                      className="text-primary hover:underline font-medium"
                    >
                      support@atlasboost.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start">
                  <MessageCircle className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Chat</h3>
                    <p className="text-muted-foreground mb-3">
                      Get instant help from our support team
                    </p>
                    <button 
                      className="text-primary hover:underline font-medium"
                      onClick={() => alert('Live chat coming soon!')}
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Support Hours</h3>
                    <p className="text-muted-foreground">
                      24/7 - We&apos;re always here to help
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Location</h3>
                    <p className="text-muted-foreground">
                      Global service, local support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for your message! We will get back to you soon.');
              }}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    placeholder="Your message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Looking for quick answers?
            </h2>
            <p className="text-muted-foreground mb-6">
              Check out our FAQ page for answers to common questions
            </p>
            <a
              href="/faq"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              View FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

