"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Download, Edit3, Save, FileText, Mail } from "lucide-react"

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

interface InvoicePreviewProps {
  invoice: InvoiceData
  onClose: () => void
  onEdit: () => void
}

export default function InvoicePreview({ invoice, onClose, onEdit }: InvoicePreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedInvoice, setEditedInvoice] = useState<InvoiceData>(invoice)

  const handleSave = () => {
    setIsEditing(false)
    // In a real app, this would save to a database
  }

  const handleDownloadPDF = () => {
    // Create a printable version
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${editedInvoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .invoice-title { font-size: 32px; font-weight: bold; color: #8b5cf6; }
            .company-info, .client-info { margin-bottom: 20px; }
            .info-label { font-weight: bold; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { font-size: 18px; font-weight: bold; }
            .notes { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="invoice-title">INVOICE</div>
              <div style="margin-top: 10px;">
                <strong>Invoice #:</strong> ${editedInvoice.invoiceNumber}<br>
                <strong>Date:</strong> ${new Date(editedInvoice.date).toLocaleDateString()}<br>
                <strong>Due Date:</strong> ${new Date(editedInvoice.dueDate).toLocaleDateString()}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="company-info">
                <div class="info-label">From:</div>
                <div><strong>${editedInvoice.businessName}</strong></div>
                <div>${editedInvoice.businessEmail}</div>
                <div style="white-space: pre-line;">${editedInvoice.businessAddress}</div>
              </div>
            </div>
          </div>
          
          <div class="client-info">
            <div class="info-label">Bill To:</div>
            <div><strong>${editedInvoice.clientName}</strong></div>
            <div>${editedInvoice.clientEmail}</div>
            <div style="white-space: pre-line;">${editedInvoice.clientAddress}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${editedInvoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.rate.toFixed(2)}</td>
                  <td>$${item.amount.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal: $${editedInvoice.subtotal.toFixed(2)}</div>
            <div>Tax: $${editedInvoice.tax.toFixed(2)}</div>
            <div class="total-row">Total: $${editedInvoice.total.toFixed(2)}</div>
          </div>

          ${
            editedInvoice.notes
              ? `
            <div class="notes">
              <div class="info-label">Notes:</div>
              <div>${editedInvoice.notes}</div>
            </div>
          `
              : ""
          }
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleEmailInvoice = () => {
    const subject = `Invoice ${editedInvoice.invoiceNumber} from ${editedInvoice.businessName}`
    const body = `Hi ${editedInvoice.clientName},

Please find attached your invoice for the amount of $${editedInvoice.total.toFixed(2)}.

Invoice Details:
- Invoice Number: ${editedInvoice.invoiceNumber}
- Due Date: ${new Date(editedInvoice.dueDate).toLocaleDateString()}
- Amount: $${editedInvoice.total.toFixed(2)}

Thank you for your business!

Best regards,
${editedInvoice.businessName}`

    window.open(
      `mailto:${editedInvoice.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="truncate">Invoice Preview</span>
            </CardTitle>
            <Badge variant="secondary" className="mt-2 text-xs">
              {editedInvoice.invoiceNumber}
            </Badge>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm"
            >
              {isEditing ? (
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              ) : (
                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              )}
              <span className="hidden sm:inline">{isEditing ? "Save" : "Edit"}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 sm:h-9 sm:w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Invoice Header */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">INVOICE</h1>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Invoice #:</strong> {editedInvoice.invoiceNumber}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(editedInvoice.date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Due Date:</strong> {new Date(editedInvoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">From:</div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editedInvoice.businessName}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, businessName: e.target.value })}
                      className="font-semibold text-base"
                    />
                    <Input
                      value={editedInvoice.businessEmail}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, businessEmail: e.target.value })}
                      className="text-base"
                    />
                    <Textarea
                      value={editedInvoice.businessAddress}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, businessAddress: e.target.value })}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="font-semibold">{editedInvoice.businessName}</div>
                    <div>{editedInvoice.businessEmail}</div>
                    <div className="whitespace-pre-line">{editedInvoice.businessAddress}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Bill To:</div>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editedInvoice.clientName}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, clientName: e.target.value })}
                  className="font-semibold text-base"
                />
                <Input
                  value={editedInvoice.clientEmail}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, clientEmail: e.target.value })}
                  className="text-base"
                />
                <Textarea
                  value={editedInvoice.clientAddress}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, clientAddress: e.target.value })}
                  rows={3}
                  className="text-base resize-none"
                />
              </div>
            ) : (
              <div className="text-sm">
                <div className="font-semibold">{editedInvoice.clientName}</div>
                <div>{editedInvoice.clientEmail}</div>
                <div className="whitespace-pre-line">{editedInvoice.clientAddress}</div>
              </div>
            )}
          </div>

          <Separator />

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-full px-4 sm:px-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-sm">Description</th>
                    <th className="text-center py-2 font-medium w-16 text-sm">Qty</th>
                    <th className="text-right py-2 font-medium w-20 text-sm">Rate</th>
                    <th className="text-right py-2 font-medium w-24 text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {editedInvoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">
                        {isEditing ? (
                          <Input
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...editedInvoice.items]
                              newItems[index].description = e.target.value
                              setEditedInvoice({ ...editedInvoice, items: newItems })
                            }}
                            className="text-sm"
                          />
                        ) : (
                          <div className="text-sm">{item.description}</div>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...editedInvoice.items]
                              newItems[index].quantity = Number.parseInt(e.target.value) || 0
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate
                              setEditedInvoice({ ...editedInvoice, items: newItems })
                            }}
                            className="w-12 text-center text-sm"
                          />
                        ) : (
                          <div className="text-sm">{item.quantity}</div>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => {
                              const newItems = [...editedInvoice.items]
                              newItems[index].rate = Number.parseFloat(e.target.value) || 0
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate
                              setEditedInvoice({ ...editedInvoice, items: newItems })
                            }}
                            className="w-16 text-right text-sm"
                          />
                        ) : (
                          <div className="text-sm">${item.rate.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="py-3 text-right font-medium">
                        <div className="text-sm">${item.amount.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${editedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${editedInvoice.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Total:</span>
                <span>${editedInvoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(editedInvoice.notes || isEditing) && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Notes:</div>
              {isEditing ? (
                <Textarea
                  value={editedInvoice.notes}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, notes: e.target.value })}
                  placeholder="Add any additional notes or payment terms..."
                  rows={3}
                  className="text-base resize-none"
                />
              ) : (
                <div className="text-sm bg-muted/50 p-3 rounded-lg">{editedInvoice.notes}</div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleDownloadPDF} className="w-full bg-primary hover:bg-primary/90 h-11 sm:h-10">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleEmailInvoice} className="h-11 sm:h-10 bg-transparent">
                <Mail className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="text-sm">Email</span>
              </Button>
              <Button variant="outline" onClick={onEdit} className="h-11 sm:h-10 bg-transparent">
                <Edit3 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="text-sm">New</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
