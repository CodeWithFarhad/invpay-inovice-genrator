  "use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background"
import InvoiceGenerator from "@/components/invoice-generator"
import InvoicePreview from "@/components/invoice-preview"
import { Sparkles, Zap, FileText, Download, Clock, Shield, Menu } from "lucide-react"

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  clientName: string
  clientEmail: string
  clientAddress: string
  businessName: string
  businessEmail: string
  businessAddress: string
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  subtotal: number
  tax: number
  total: number
  notes: string
}

export default function InvPayLandingPage() {
  const [prompt, setPrompt] = useState("")
  const [showGenerator, setShowGenerator] = useState(false)
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleInvoiceGenerated = (invoice: InvoiceData) => {
    setGeneratedInvoice(invoice)
    setShowGenerator(false)
    setShowPreview(true)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setGeneratedInvoice(null)
  }

  const handleEditInvoice = () => {
    setShowPreview(false)
    setShowGenerator(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation inside Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <AnimatedGradientBackground
          Breathing={true}
          gradientColors={[
            "#080808", // Deep black
            "#1f1f23", // Dark gray
            "#8b5cf6", // Violet
            "#a855f7", // Purple
            "#c084fc", // Light purple
            "#e879f9", // Pink
            "#f0abfc", // Light pink
          ]}
          gradientStops={[20, 35, 50, 65, 75, 85, 95]}
          animationSpeed={0.015}
          breathingRange={8}
        />

        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 bg-transparent">
          <span className="text-xl font-bold text-white">InvPAy</span>
          <Button onClick={() => setShowGenerator(true)} className="hover:bg-primary/90 bg-purple-900">
            Get Started
          </Button>
        </nav>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <Badge variant="secondary" className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Invoice Generation
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-balance leading-tight text-white">
            Create Professional
            <span className="text-primary"> Invoices </span>
            in Seconds
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-pretty leading-relaxed text-white">
            The free AI alternative that transforms simple natural language into beautiful, professional invoices. No
            complex forms, no learning curve - just describe what you need.
          </p>

          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <div className="relative w-full max-w-md">
              <Input
                placeholder="Create an invoice for web design services, $2500, due in 30 days..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="pr-12 h-11 sm:h-12 bg-card/50 backdrop-blur-sm border-border/50 text-base"
              />
              <Zap className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
            </div>
            <Button
              size="lg"
              onClick={() => setShowGenerator(true)}
              className="w-full max-w-md hover:bg-primary/90 h-11 sm:h-12 px-8 text-base bg-purple-800"
            >
              Generate Invoice
            </Button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl font-bold text-center">Why Choose InvPAy?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for freelancers and small businesses who value simplicity without sacrificing professionalism.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">AI-Powered Generation</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Simply describe your invoice in plain English. Our AI understands context and creates professional
                  invoices instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Lightning Fast</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  No more tedious form filling. Generate complete invoices in under 30 seconds with natural language
                  prompts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 md:col-span-1">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Always Free</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  No hidden fees, no premium tiers. Professional invoice generation that's completely free for everyone,
                  forever.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-card/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Invoicing?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            Join thousands of freelancers and small businesses who've simplified their invoicing process.
          </p>
          <Button
            size="lg"
            onClick={() => setShowGenerator(true)}
            className="bg-primary hover:bg-primary/90 h-11 sm:h-12 px-6 sm:px-8 text-base"
          >
            Start Creating Invoices
          </Button>
        </div>
      </section>

      {/* Footer */}

      {/* Invoice Generator and Preview Modals */}
      {showGenerator && (
        <InvoiceGenerator onClose={() => setShowGenerator(false)} onGenerate={handleInvoiceGenerated} />
      )}

      {showPreview && generatedInvoice && (
        <InvoicePreview invoice={generatedInvoice} onClose={handleClosePreview} onEdit={handleEditInvoice} />
      )}
    </div>
  )
}

