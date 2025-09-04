"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Sparkles, Send, Loader2 } from "lucide-react"

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

interface InvoiceGeneratorProps {
  onClose: () => void
  onGenerate: (invoice: InvoiceData) => void
}

// Enhanced parsing utilities
class InvoiceParser {
  private input: string
  private normalizedInput: string
  
  constructor(input: string) {
    this.input = input
    this.normalizedInput = input.toLowerCase()
  }

  // Extract emails with context awareness
  extractEmails(): { client: string; business: string } {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
    const emails = [...this.input.matchAll(emailRegex)].map(m => ({
      email: m[0],
      index: m.index || 0
    }))

    let clientEmail = "client@example.com"
    let businessEmail = "business@example.com"

    // Check context around emails
    emails.forEach(({ email, index }) => {
      const context = this.input.slice(Math.max(0, index - 50), index + email.length + 50).toLowerCase()
      
      if (/(?:client|customer|bill to|invoice to|recipient)/.test(context)) {
        clientEmail = email
      } else if (/(?:from|business|company|sender|bill from|my|our)/.test(context)) {
        businessEmail = email
      } else if (clientEmail === "client@example.com") {
        clientEmail = email
      } else if (businessEmail === "business@example.com") {
        businessEmail = email
      }
    })

    return { client: clientEmail, business: businessEmail }
  }

  // Extract names with improved context understanding
  extractNames(): { client: string; business: string } {
    let clientName = ""
    let businessName = ""

    // Enhanced patterns for client name extraction
    const clientPatterns = [
      /(?:to|for|client|customer|recipient|bill to|invoice to|client name)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|LLC|Ltd|Corp|Company|Co|Limited|Corporation|Group|Services|Solutions|Technologies|Consulting|Agency|Studio|Partners))?)/i,
      /invoice for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /services? (?:for|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /work (?:for|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /project (?:for|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:wants?|needs?|requested?|asked?)/i,
    ]

    for (const pattern of clientPatterns) {
      const match = this.input.match(pattern)
      if (match && match[1]) {
        clientName = match[1].trim()
        break
      }
    }

    // Enhanced patterns for business name extraction
    const businessPatterns = [
      /(?:from|by|business|company|sender|bill from|business name|our company|my company)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|LLC|Ltd|Corp|Company|Co|Limited|Corporation|Group|Services|Solutions|Technologies|Consulting|Agency|Studio|Partners))?)/i,
      /issued by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+invoice/im,
    ]

    for (const pattern of businessPatterns) {
      const match = this.input.match(pattern)
      if (match && match[1]) {
        businessName = match[1].trim()
        break
      }
    }

    // Intelligent fallback using proper noun detection
    if (!clientName) {
      const properNouns = this.extractProperNouns()
      clientName = properNouns[0] || "Client Name"
    }

    if (!businessName) {
      businessName = "Your Business"
    }

    return { client: clientName, business: businessName }
  }

  // Extract proper nouns (capitalized words that aren't common words)
  private extractProperNouns(): string[] {
    const commonWords = new Set(['invoice', 'services', 'project', 'work', 'hours', 'days', 'weeks', 'months', 'design', 'development', 'consulting', 'management'])
    const properNounRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g
    const matches = [...this.input.matchAll(properNounRegex)]
      .map(m => m[0])
      .filter(noun => !commonWords.has(noun.toLowerCase()))
    
    return [...new Set(matches)]
  }

  // Extract addresses with improved patterns
  extractAddresses(): { client: string; business: string } {
    const addressPatterns = [
      /(?:address|located at|at|office at)[\s:]+([^\n,.]+(?:,\s*[^\n,.]+)?(?:,\s*\d{5})?)/gi,
      /\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way|Circle|Cir)[^\n]*/gi,
      /(?:[A-Z][a-z]+\s+)+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way|Circle|Cir)[^\n]*/gi,
    ]

    const addresses: string[] = []
    for (const pattern of addressPatterns) {
      const matches = [...this.input.matchAll(pattern)]
      matches.forEach(match => {
        const addr = match[1] || match[0]
        if (addr && !addresses.includes(addr)) {
          addresses.push(addr.trim())
        }
      })
    }

    const clientAddress = addresses[0] || "123 Client Street\nCity, State 12345"
    const businessAddress = addresses[1] || addresses[0] || "456 Business Avenue\nCity, State 67890"

    return { client: clientAddress, business: businessAddress }
  }

  // Extract date with multiple format support
  extractDueDate(): Date {
    const today = new Date()
    let dueDate = new Date(today)
    dueDate.setDate(today.getDate() + 30) // Default 30 days

    // Pattern 1: "due in X days/weeks/months"
    const relativeDateMatch = this.normalizedInput.match(/due (?:in|within)\s+(\d+)\s+(days?|weeks?|months?)/i)
    if (relativeDateMatch) {
      const amount = parseInt(relativeDateMatch[1])
      const unit = relativeDateMatch[2]
      
      if (unit.startsWith('day')) {
        dueDate.setDate(today.getDate() + amount)
      } else if (unit.startsWith('week')) {
        dueDate.setDate(today.getDate() + (amount * 7))
      } else if (unit.startsWith('month')) {
        dueDate.setMonth(today.getMonth() + amount)
      }
    }

    // Pattern 2: "due on [date]"
    const explicitDateMatch = this.input.match(/due (?:on|by|date)[\s:]+([A-Za-z]+\s+\d{1,2}(?:,?\s*\d{4})?|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/i)
    if (explicitDateMatch) {
      const parsed = new Date(explicitDateMatch[1])
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed
      }
    }

    // Pattern 3: "net 30/60/90"
    const netMatch = this.normalizedInput.match(/net\s*(\d+)/i)
    if (netMatch) {
      dueDate.setDate(today.getDate() + parseInt(netMatch[1]))
    }

    // Pattern 4: "due next week/month"
    if (/due next week/i.test(this.normalizedInput)) {
      dueDate.setDate(today.getDate() + 7)
    } else if (/due next month/i.test(this.normalizedInput)) {
      dueDate.setMonth(today.getMonth() + 1)
    } else if (/due today/i.test(this.normalizedInput)) {
      dueDate = new Date(today)
    } else if (/due tomorrow/i.test(this.normalizedInput)) {
      dueDate.setDate(today.getDate() + 1)
    }

    return dueDate
  }

  // Extract items with multiple pattern support
  extractItems(): Array<{ description: string; quantity: number; rate: number; amount: number }> {
    const items: Array<{ description: string; quantity: number; rate: number; amount: number }> = []
    
    // Pattern 1: "X [units] of [service] at/for $Y each/per"
    const pattern1 = /(\d+(?:\.\d+)?)\s*(?:hours?|days?|weeks?|months?|items?|units?|pieces?)?\s*(?:of\s+)?([A-Za-z][A-Za-z\s]+?)\s*(?:at|for|@)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:each|per|\/hour|\/day|\/week|\/month)?/gi
    
    // Pattern 2: "[service] - X [units] @ $Y"
    const pattern2 = /([A-Za-z][A-Za-z\s]+?)\s*[-–—]\s*(\d+(?:\.\d+)?)\s*(?:hours?|days?|weeks?|months?|items?|units?)?\s*[@at]\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    
    // Pattern 3: "$X for [service]"
    const pattern3 = /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:for|worth of)\s+([A-Za-z][A-Za-z\s]+?)(?:\.|,|$)/gi
    
    // Pattern 4: "[service]: $X"
    const pattern4 = /([A-Za-z][A-Za-z\s]+?):\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    
    // Pattern 5: Bullet points or numbered lists
    const pattern5 = /(?:^|\n)\s*[-•*]\s*([A-Za-z][A-Za-z\s]+?)\s*[-–—]\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gim

    // Try pattern 1
    let match
    while ((match = pattern1.exec(this.input)) !== null) {
      const quantity = parseFloat(match[1])
      const description = this.cleanDescription(match[2])
      const rate = parseFloat(match[3].replace(/,/g, ""))
      if (description && !this.isInvalidDescription(description)) {
        items.push({ description, quantity, rate, amount: quantity * rate })
      }
    }

    // Try pattern 2 if no items found
    if (items.length === 0) {
      while ((match = pattern2.exec(this.input)) !== null) {
        const description = this.cleanDescription(match[1])
        const quantity = parseFloat(match[2])
        const rate = parseFloat(match[3].replace(/,/g, ""))
        if (description && !this.isInvalidDescription(description)) {
          items.push({ description, quantity, rate, amount: quantity * rate })
        }
      }
    }

    // Try pattern 3 if no items found
    if (items.length === 0) {
      while ((match = pattern3.exec(this.input)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ""))
        const description = this.cleanDescription(match[2])
        if (description && !this.isInvalidDescription(description)) {
          items.push({ description, quantity: 1, rate: amount, amount })
        }
      }
    }

    // Try pattern 4 if no items found
    if (items.length === 0) {
      while ((match = pattern4.exec(this.input)) !== null) {
        const description = this.cleanDescription(match[1])
        const amount = parseFloat(match[2].replace(/,/g, ""))
        if (description && !this.isInvalidDescription(description)) {
          items.push({ description, quantity: 1, rate: amount, amount })
        }
      }
    }

    // Try pattern 5 if no items found
    if (items.length === 0) {
      while ((match = pattern5.exec(this.input)) !== null) {
        const description = this.cleanDescription(match[1])
        const amount = parseFloat(match[2].replace(/,/g, ""))
        if (description && !this.isInvalidDescription(description)) {
          items.push({ description, quantity: 1, rate: amount, amount })
        }
      }
    }

    // Fallback: extract single amount and service description
    if (items.length === 0) {
      const amountMatch = this.input.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i)
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 1000
      
      const serviceDescription = this.extractServiceDescription()
      items.push({ 
        description: serviceDescription, 
        quantity: 1, 
        rate: amount, 
        amount 
      })
    }

    return items
  }

  // Clean and validate description
  private cleanDescription(description: string): string {
    return description
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^(and|or|with|for|to|at|the)\s+/i, '')
      .replace(/\s+(and|or|with|for|to|at|the)$/i, '')
  }

  // Check if description is invalid
  private isInvalidDescription(description: string): boolean {
    const invalid = ['email', 'mail', 'address', 'phone', 'due', 'client', 'customer', 'invoice', 'bill']
    return invalid.some(word => description.toLowerCase().includes(word))
  }

  // Extract service description intelligently
  private extractServiceDescription(): string {
    const servicePatterns = [
      /(?:for|invoice for|bill for)\s+([A-Za-z][A-Za-z\s]+?)(?:\s+(?:services?|work|project))?(?:\.|,|$|\s+(?:to|for|at))/i,
      /([A-Za-z][A-Za-z\s]+?)\s+(?:services?|work|project|consultation|consulting|development|design|management)/i,
      /(?:services?|work|project|consultation|consulting|development|design|management)\s+(?:for|in|on)\s+([A-Za-z][A-Za-z\s]+)/i,
    ]

    for (const pattern of servicePatterns) {
      const match = this.input.match(pattern)
      if (match && match[1]) {
        const service = this.cleanDescription(match[1])
        if (service && !this.isInvalidDescription(service)) {
          return service
        }
      }
    }

    // Look for common service keywords
    const commonServices = [
      'web design', 'graphic design', 'logo design', 'development', 'consulting',
      'marketing', 'social media', 'content creation', 'photography', 'videography',
      'copywriting', 'SEO', 'maintenance', 'support', 'training', 'analysis'
    ]

    for (const service of commonServices) {
      if (this.normalizedInput.includes(service)) {
        return service.charAt(0).toUpperCase() + service.slice(1)
      }
    }

    return "Professional Services"
  }

  // Extract tax information
  extractTax(): number {
    const taxPatterns = [
      /(?:tax|vat|gst|sales tax)[\s:]+(\d+(?:\.\d+)?)%/i,
      /(\d+(?:\.\d+)?)%\s+(?:tax|vat|gst|sales tax)/i,
      /(?:plus|add|with)\s+(\d+(?:\.\d+)?)%\s+(?:tax|vat|gst)/i,
    ]

    for (const pattern of taxPatterns) {
      const match = this.input.match(pattern)
      if (match) {
        return parseFloat(match[1]) / 100
      }
    }

    return 0
  }

  // Extract discount information
  extractDiscount(): { type: 'percent' | 'flat'; value: number } | null {
    // Percentage discount
    const percentPattern = /(\d+(?:\.\d+)?)%\s+(?:discount|off)/i
    const percentMatch = this.input.match(percentPattern)
    if (percentMatch) {
      return { type: 'percent', value: parseFloat(percentMatch[1]) / 100 }
    }

    // Flat discount
    const flatPattern = /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:discount|off)/i
    const flatMatch = this.input.match(flatPattern)
    if (flatMatch) {
      return { type: 'flat', value: parseFloat(flatMatch[1].replace(/,/g, "")) }
    }

    return null
  }

  // Extract additional information
  extractAdditionalInfo(): { poNumber?: string; paymentTerms?: string; notes?: string } {
    const info: { poNumber?: string; paymentTerms?: string; notes?: string } = {}

    // PO Number
    const poMatch = this.input.match(/(?:PO|P\.O\.|purchase order)[\s#:]+([A-Z0-9-]+)/i)
    if (poMatch) {
      info.poNumber = poMatch[1]
    }

    // Payment terms
    const paymentTermsPatterns = [
      /(?:payment|pay)[\s:]+(?:via|by|through)\s+([A-Za-z\s]+?)(?:\.|,|$)/i,
      /(?:bank transfer|wire transfer|credit card|paypal|check|cheque|cash)/i,
    ]

    for (const pattern of paymentTermsPatterns) {
      const match = this.input.match(pattern)
      if (match) {
        info.paymentTerms = match[1] || match[0]
        break
      }
    }

    // Notes
    const notePatterns = [
      /(?:note|notes|include note|add note)[\s:]+(.+?)(?:\.|$)/i,
      /(?:additional info|additional information|comments?)[\s:]+(.+?)(?:\.|$)/i,
    ]

    for (const pattern of notePatterns) {
      const match = this.input.match(pattern)
      if (match) {
        info.notes = match[1].trim()
        break
      }
    }

    return info
  }
}

export default function InvoiceGenerator({ onClose, onGenerate }: InvoiceGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const parseNaturalLanguage = (input: string): InvoiceData => {
    const parser = new InvoiceParser(input)
    const today = new Date()

    // Extract all components
    const emails = parser.extractEmails()
    const names = parser.extractNames()
    const addresses = parser.extractAddresses()
    const dueDate = parser.extractDueDate()
    const items = parser.extractItems()
    const taxRate = parser.extractTax()
    const discount = parser.extractDiscount()
    const additionalInfo = parser.extractAdditionalInfo()

    // Calculate totals
    let subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    
    // Apply discount if present
    if (discount) {
      if (discount.type === 'percent') {
        subtotal = subtotal * (1 - discount.value)
      } else {
        subtotal = Math.max(0, subtotal - discount.value)
      }
    }

    const tax = subtotal * taxRate
    const total = subtotal + tax

    // Build notes
    let notes = additionalInfo.notes || "Thank you for your business!"
    if (additionalInfo.poNumber) {
      notes = `PO#: ${additionalInfo.poNumber}\n${notes}`
    }
    if (additionalInfo.paymentTerms) {
      notes = `${notes}\nPayment: ${additionalInfo.paymentTerms}`
    }

    return {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      date: today.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      clientName: names.client,
      clientEmail: emails.client,
      clientAddress: addresses.client,
      businessName: names.business,
      businessEmail: emails.business,
      businessAddress: addresses.business,
      items,
      subtotal,
      tax,
      total,
      notes,
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const invoiceData = parseNaturalLanguage(prompt)
      onGenerate(invoiceData)
    } catch (error) {
      console.error('Error generating invoice:', error)
      // Handle error appropriately
    } finally {
      setIsGenerating(false)
    }
  }

  const examplePrompts = [
    "Create an invoice for web design services, $2500, due in 30 days to John Smith at john@email.com",
    "Invoice for Sarah Johnson (sarah@company.com) - 5 hours of consulting at $150/hour, 10% tax, due next week",
    "Bill to: Tech Solutions Inc, 3 days development work @ $500/day, plus 20% VAT, PO# TS-2024-001",
    "Social media management $1200/month for Creative Agency, address: 123 Main St, NYC, pay via bank transfer",
    "Logo design project: $800, client: Mike Wilson (mike@startup.com), 15% discount, due in 14 days",
    "Photography services - Wedding package $3500, Event coverage $1200, Photo editing $500, for Emma Davis"
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="truncate">AI Invoice Generator</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1">
              Describe your invoice in natural language and let AI create it for you
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-2 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Describe your invoice</label>
              <Textarea
                placeholder="Example: Create an invoice for web design services, $2500, due in 30 days to John Smith at Acme Corp..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] bg-input border-border text-base resize-none"
                disabled={isGenerating}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-primary hover:bg-primary/90 h-11 sm:h-10 text-base sm:text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Invoice...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate Invoice
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Example prompts to try:</h4>
            <div className="grid gap-2">
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3 text-wrap bg-transparent hover:bg-muted/50 transition-colors"
                  onClick={() => setPrompt(example)}
                  disabled={isGenerating}
                >
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                    {example}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-muted-foreground">
                <strong className="text-foreground">Pro tip:</strong> Be specific about amounts, dates,
                client names, and services. You can also include tax rates, discounts, PO numbers, and payment terms.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}